import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import { profile } from '@/data'
import shortJson from '@jobs/short.json'
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
