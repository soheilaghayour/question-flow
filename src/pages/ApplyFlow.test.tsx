import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import { profile } from '@/data'
import shortJson from '@jobs/short.json'
import longJson from '@jobs/long.json'
import badJson from '@jobs/bad.json'
import expectedShortPayload from '@/pages/apply-flow-fixtures/payload-short.json'
import expectedLongPayload from '@/pages/apply-flow-fixtures/payload-long.json'
import expectedBadPayload from '@/pages/apply-flow-fixtures/payload-bad.json'
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

    // The fixture carries the contract expectations: value false for the No
    // answer (bite #4) and failed screening on the untouched 95000 prefill
    // (DECISIONS #8: screening never blocks submission).
    expect(submittedPayload()).toEqual(expectedLongPayload)
  })
})

describe('ApplyFlow with bad.json', () => {
  it('renders only the normalized questions and logs the warnings', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<ApplyFlow rawJob={badJson} profile={profile} />, { wrapper })

    // Dropped by normalize: the duplicate-id text question and the unknown
    // rating type (bite #8). The kept select under the same id still renders.
    expect(
      screen.queryByText('Wie lange ist Ihre aktuelle Kündigungsfrist (in Wochen/Monaten)?'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Bitte bewerten Sie Ihre TypeScript-Kenntnisse/),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Kündigungsfrist' })).toBeInTheDocument()

    // The misplaced must_be_true on a text question renders the question, rule stripped.
    expect(screen.getByLabelText('Aktueller Wohnsitz (Land)')).toBeInTheDocument()

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('rating'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('duplicate question id'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('must_be_true'))
  })

  it('submits the full flow including the uploaded file as plain base64', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
    render(<ApplyFlow rawJob={badJson} profile={profile} />, { wrapper })

    await user.click(screen.getByRole('radio', { name: 'Herr' }))
    await user.type(screen.getByLabelText('Aktueller Wohnsitz (Land)'), 'Deutschland')
    await answerBoolean(
      'Haben Sie keine Einwände gegen eine Tätigkeit, die überwiegend nicht remote stattfindet?',
      'Yes',
    )
    await answerBoolean('Führerschein Klasse B vorhanden?', 'Yes')
    await user.upload(
      screen.getByLabelText('Anschreiben (bitte ausschließlich als PDF)'),
      new File(['%PDF'], 'anschreiben.pdf', { type: 'application/pdf' }),
    )
    // The shown file name confirms the async base64 conversion landed in form
    // state — submitting earlier would race it.
    await screen.findByText('anschreiben.pdf')
    await user.type(screen.getByLabelText('Erfahrung mit SAFe?'), 'Ja, 2 Jahre')
    await user.type(
      screen.getByLabelText('Beschreiben Sie Ihre Stärken und Schwächen.'),
      'Stärken: Testen.',
    )
    await user.type(
      screen.getByLabelText(/Wie viele Jahre Berufserfahrung haben Sie mit React/),
      '7',
    )
    await user.click(screen.getByRole('checkbox', { name: 'React' }))
    await answerBoolean(
      'Wären Sie grundsätzlich bereit, bei Bedarf gelegentlich auch außerhalb der regulären Arbeitszeiten zur Verfügung zu stehen?',
      'No',
    )

    await user.click(screen.getByRole('button', { name: 'Submit application' }))

    // The fixture pins the contract: base64 without the data-URL prefix
    // (bite #2, data is btoa('%PDF') — a worked example), one tech_stack pick
    // still travelling as values (bite #1), and screening failing only on
    // salary — the stripped must_be_true on the text question must NOT screen.
    expect(submittedPayload()).toEqual(expectedBadPayload)
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
    expect(submittedPayload()).toEqual(expectedShortPayload)
  })

  // The "invalid" half of the submit gate: unparseable input in a REQUIRED
  // field is held as null by the widget (DECISIONS #21/#22), so it blocks
  // exactly like an empty one — with the widget's own error visible.
  it('blocks submission while a required field holds invalid input', async () => {
    const user = userEvent.setup()
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    render(<ApplyFlow rawJob={shortJson} profile={profile} />, { wrapper })

    const salary = screen.getByLabelText('What is your yearly salary expectation in EUR?')
    await user.clear(salary)
    await user.type(salary, 'abc')
    await user.click(screen.getByRole('button', { name: 'Submit application' }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(log).not.toHaveBeenCalled()
    expect(salary).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a whole number')
  })
})
