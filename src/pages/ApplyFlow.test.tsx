import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import { profile } from '@/data'
import shortJson from '@jobs/short.json'
import longJson from '@jobs/long.json'
import { ApplyFlow } from './ApplyFlow'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

afterEach(() => {
  vi.restoreAllMocks()
})

function submittedPayload(): unknown {
  return JSON.parse(screen.getByRole('status').textContent ?? 'null')
}

function answerBoolean(groupName: string, option: 'Yes' | 'No') {
  return userEvent
    .setup()
    .click(within(screen.getByRole('group', { name: groupName })).getByRole('radio', { name: option }))
}

describe('ApplyFlow with long.json', () => {
  it('runs every question type and reports failed screening in the payload', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    render(<ApplyFlow rawJob={longJson} profile={profile} />, { wrapper })

    // Prefilled: notice_period 3_months, german_level B1 (profile de level),
    // salary 95000 — against must_be_below 90000, prefilled anyway (DECISIONS
    // #7) — and years_of_experience 6. Left untouched on purpose.
    expect(screen.getByRole('radio', { name: '3 months' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'B1' })).toBeChecked()

    await answerBoolean('Are you allowed to work in the EU?', 'Yes')
    fireEvent.change(screen.getByLabelText('Ab wann könnten Sie bei uns starten?'), {
      target: { value: '2027-01-01' },
    })
    await user.click(screen.getByRole('checkbox', { name: 'Frontend architecture' }))
    await user.click(screen.getByRole('checkbox', { name: 'Performance' }))
    // Optional boolean answered No: false is an answer and must land in the
    // payload — unanswered ≠ false (bite #4).
    await answerBoolean('Are you willing to relocate to Hamburg?', 'No')

    await user.click(screen.getByRole('button', { name: 'Submit application' }))

    expect(submittedPayload()).toEqual({
      job_id: 'job-long',
      answers: [
        { id: 'notice_period', value: '3_months' },
        { id: 'german_level', value: 'B1' },
        { id: 'salary_expectation', value: 95000 },
        { id: 'eu_work_permit', value: true },
        { id: 'starting_date', value: '2027-01-01' },
        { id: 'years_of_experience', value: 6 },
        { id: 'focus_areas', values: ['frontend', 'performance'] },
        { id: 'willing_to_relocate', value: false },
      ],
      // 95000 >= must_be_below 90000 fails; submission still goes through
      // (DECISIONS #8: screening never blocks anything).
      screening: { passed: false, failed: ['salary_expectation'] },
    })
  })
})

describe('ApplyFlow with short.json', () => {
  it('prefills from the profile, keeps it editable, and submits the contract payload', async () => {
    const user = userEvent.setup()
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    render(<ApplyFlow rawJob={shortJson} profile={profile} />, { wrapper })

    // Prefill: profile notice_period "3_months" is a valid option, salary 95000
    // is within bounds (DECISIONS #7: the must-rules never gate prefill).
    expect(screen.getByRole('radio', { name: '3 months' })).toBeChecked()
    const salary = screen.getByLabelText('What is your yearly salary expectation in EUR?')
    expect(salary).toHaveValue('95000')

    // Prefilled values stay editable (acceptance criterion).
    await user.clear(salary)
    await user.type(salary, '100.000')

    await user.click(screen.getByRole('button', { name: 'Submit application' }))

    // Expected payload is a literal from the README contract, not recomputed:
    // the optional unanswered question is left out, select shape is `value`
    // (max_choices 1), screening passes with no rules configured.
    const expected = {
      job_id: 'job-short',
      answers: [
        { id: 'notice_period', value: '3_months' },
        { id: 'salary_expectation', value: 100000 },
      ],
      screening: { passed: true, failed: [] },
    }
    expect(submittedPayload()).toEqual(expected)
    expect(log).toHaveBeenCalledWith(expected)
  })

  it('blocks submission accessibly while a required answer is missing', async () => {
    const user = userEvent.setup()
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    render(<ApplyFlow rawJob={shortJson} profile={profile} />, { wrapper })

    const salary = screen.getByLabelText('What is your yearly salary expectation in EUR?')
    await user.clear(salary)
    await user.click(screen.getByRole('button', { name: 'Submit application' }))

    // No payload view, no log — the form stays up with the error tied to the field.
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(log).not.toHaveBeenCalled()
    expect(salary).toHaveAccessibleDescription('This field is required')
    expect(salary).toHaveAttribute('aria-invalid', 'true')

    // Answering clears the error and unblocks the submit.
    await user.type(salary, '90000')
    await user.click(screen.getByRole('button', { name: 'Submit application' }))
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders an error state for a config that cannot be normalized, never a crash', () => {
    render(<ApplyFlow rawJob={{ id: '', questions: 'nope' }} profile={profile} />, { wrapper })
    expect(screen.getByRole('alert')).toHaveTextContent('This job posting cannot be displayed.')
    expect(
      screen.queryByRole('button', { name: 'Submit application' }),
    ).not.toBeInTheDocument()
  })

  it('submits the untouched prefill as-is', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    render(<ApplyFlow rawJob={shortJson} profile={profile} />, { wrapper })
    await user.click(screen.getByRole('button', { name: 'Submit application' }))
    expect(submittedPayload()).toEqual({
      job_id: 'job-short',
      answers: [
        { id: 'notice_period', value: '3_months' },
        { id: 'salary_expectation', value: 95000 },
      ],
      screening: { passed: true, failed: [] },
    })
  })
})
