import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as DataModule from '@/data'
import { renderRoute } from '@/renderRoute'
import shortJson from '@jobs/short.json'
import longJson from '@jobs/long.json'
import badJson from '@jobs/bad.json'
import expectedShortPayload from '@/pages/apply-flow-fixtures/payload-short.json'
import expectedLongPayload from '@/pages/apply-flow-fixtures/payload-long.json'
import expectedBadPayload from '@/pages/apply-flow-fixtures/payload-bad.json'

// Inline test configs are reached by id, like the fixtures.
const testJobs = vi.hoisted(() => new Map<string, unknown>())
vi.mock('@/data', async (importOriginal) => ({
  ...(await importOriginal<typeof DataModule>()),
  rawJobConfigsById: testJobs,
}))

function renderApplyFlow(job: { id: string; [key: string]: unknown }) {
  testJobs.set(job.id, job)
  return renderRoute(`/jobs/${job.id}/apply?step=1`)
}

afterEach(() => {
  vi.restoreAllMocks()
})

// The payload left the screen with #16 — console.log is the dev channel now,
// so the contract fixtures are checked against the last logged payload.
function submittedPayload(log: MockInstance): unknown {
  return log.mock.calls.at(-1)?.[0]
}

function answerBoolean(groupName: string, option: 'Yes' | 'No') {
  return userEvent
    .setup()
    .click(within(screen.getByRole('group', { name: groupName })).getByRole('radio', { name: option }))
}

function clickNext() {
  return userEvent.setup().click(screen.getByRole('button', { name: 'Next' }))
}

describe('ApplyFlow wizard steps (#36)', () => {
  it('opens on the prefill confirm step and renders only its questions', () => {
    renderApplyFlow(longJson)

    // long.json: 4 prefilled + 4 open questions → prefill step, 3+1, summary.
    expect(screen.getByText('Already filled from your profile')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Step 1 of 4' })).toBeInTheDocument()

    // The prefilled questions are here, filled in and editable.
    expect(screen.getByRole('radio', { name: '3 months' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'B1' })).toBeChecked()
    expect(
      screen.getByLabelText('What is your yearly salary expectation in EUR?'),
    ).toHaveValue('95000')

    // Open questions belong to later steps; submitting is the summary's job.
    expect(
      screen.queryByRole('group', { name: 'Are you allowed to work in the EU?' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Submit application' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
  })

  it('keeps typed-but-invalid input alive across step navigation', async () => {
    // New test data: the optional numeric lands alone on step 2, after three
    // required texts fill step 1.
    const job = {
      id: 'job-wizard-roundtrip',
      title: 'T',
      company: 'C',
      language: 'en',
      questions: [
        { type: 'text', id: 'a', question: 'A?', required: true },
        { type: 'text', id: 'b', question: 'B?', required: true },
        { type: 'text', id: 'c', question: 'C?', required: true },
        { type: 'numeric', id: 'n', question: 'N?' },
      ],
    }
    const user = userEvent.setup()
    renderApplyFlow(job)

    for (const label of ['A?', 'B?', 'C?']) await user.type(screen.getByLabelText(label), 'x')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    // 'abc' is held by the widget as raw text (form state stays null, the
    // widget shows its own error). The optional gate lets Next pass — but the
    // candidate's typing must survive the round trip, not be reset by a
    // remount (steps hide, they never unmount).
    await user.type(screen.getByLabelText('N?'), 'abc')
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await screen.findByRole('progressbar', { name: 'Step 1 of 3' })
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByLabelText('N?')).toHaveValue('abc')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a whole number')
  })

  it('sends a step URL past an unfinished step back to step 1', async () => {
    const user = userEvent.setup()
    const router = renderApplyFlow(longJson)
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('progressbar', { name: 'Step 2 of 4' })).toBeInTheDocument()

    await act(() => router.navigate('/jobs/job-long/apply?step=4'))
    expect(await screen.findByRole('progressbar', { name: 'Step 1 of 4' })).toBeInTheDocument()
  })

  it('gates Next on the step’s required answers and keeps answers across Back', async () => {
    const user = userEvent.setup()
    renderApplyFlow(longJson)

    // Prefill confirm step → step 2: eu_work_permit, starting_date (required),
    // focus_areas (optional).
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('progressbar', { name: 'Step 2 of 4' })).toBeInTheDocument()

    // Next with the step's required questions unanswered stays put and shows
    // the errors in place; the optional focus_areas never gates.
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('progressbar', { name: 'Step 2 of 4' })).toBeInTheDocument()
    expect(screen.getAllByText('This field is required')).toHaveLength(2)

    await answerBoolean('Are you allowed to work in the EU?', 'Yes')
    fireEvent.change(screen.getByLabelText('Ab wann könnten Sie bei uns starten?'), {
      target: { value: '2027-01-01' },
    })
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('progressbar', { name: 'Step 3 of 4' })).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Are you willing to relocate to Hamburg?' }),
    ).toBeInTheDocument()

    // Back is never gated, answers survive the round trip, and the old
    // errors are gone.
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('progressbar', { name: 'Step 2 of 4' })).toBeInTheDocument()
    expect(
      within(screen.getByRole('group', { name: 'Are you allowed to work in the EU?' })).getByRole(
        'radio',
        { name: 'Yes' },
      ),
    ).toBeChecked()
    expect(screen.getByLabelText('Ab wann könnten Sie bei uns starten?')).toHaveValue('2027-01-01')
    expect(screen.queryByText('This field is required')).not.toBeInTheDocument()
  })
})

describe('ApplyFlow with long.json', () => {
  it('walks every question type through the wizard, reviews, and submits the contract payload', async () => {
    const user = userEvent.setup()
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    renderApplyFlow(longJson)

    // Step 1 is the prefill confirm step (notice_period 3_months, german_level
    // B1, salary 95000 against must_be_below 90000 — prefilled anyway, DECISIONS
    // #7 — and years_of_experience 6). Left untouched on purpose.
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await answerBoolean('Are you allowed to work in the EU?', 'Yes')
    fireEvent.change(screen.getByLabelText('Ab wann könnten Sie bei uns starten?'), {
      target: { value: '2027-01-01' },
    })
    await user.click(screen.getByRole('checkbox', { name: 'Frontend architecture' }))
    await user.click(screen.getByRole('checkbox', { name: 'Performance' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    // Optional boolean answered No: false is an answer and must land in the
    // payload — unanswered ≠ false (bite #4).
    await answerBoolean('Are you willing to relocate to Hamburg?', 'No')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    // The summary shows candidate-readable answers: option labels, never raw
    // values; a multi-select joins its labels.
    expect(screen.getByText('Review your answers')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Step 4 of 4' })).toBeInTheDocument()
    const answers = screen.getAllByRole('definition').map((d) => d.textContent)
    expect(answers).toContain('3 months')
    expect(answers).toContain('Frontend architecture, Performance')
    // The date renders for the UI locale, not in the YYYY-MM-DD wire format.
    expect(answers).toContain('1/1/2027')

    await user.click(screen.getByRole('button', { name: 'Submit application' }))

    // The fixture carries the contract expectations: value false for the No
    // answer (bite #4) and failed screening on the untouched 95000 prefill
    // (DECISIONS #8: screening never blocks submission).
    expect(submittedPayload(log)).toEqual(expectedLongPayload)
  })
})

describe('ApplyFlow with bad.json', () => {
  it('renders only the normalized questions and logs the warnings', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderApplyFlow(badJson)

    // Dropped by normalize: the duplicate-id text question and the unknown
    // rating type (bite #8). The kept select under the same id still renders —
    // prefilled from the profile's notice period, so it leads on step 1.
    expect(
      screen.queryByText('Wie lange ist Ihre aktuelle Kündigungsfrist (in Wochen/Monaten)?'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Bitte bewerten Sie Ihre TypeScript-Kenntnisse/),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Kündigungsfrist' })).toBeInTheDocument()

    // The misplaced must_be_true on a text question renders the question, rule
    // stripped — it lives on the first open-questions step.
    await clickNext()
    expect(screen.getByLabelText('Aktueller Wohnsitz (Land)')).toBeInTheDocument()

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('rating'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('duplicate question id'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('must_be_true'))
  })

  it('submits the full flow including the uploaded file as plain base64', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    renderApplyFlow(badJson)

    // Step 1: prefill confirm (Kündigungsfrist select + salary), untouched.
    await clickNext()
    await user.click(screen.getByRole('radio', { name: 'Herr' }))
    await user.type(screen.getByLabelText('Aktueller Wohnsitz (Land)'), 'Deutschland')
    await answerBoolean(
      'Haben Sie keine Einwände gegen eine Tätigkeit, die überwiegend nicht remote stattfindet?',
      'Yes',
    )
    await clickNext()
    await answerBoolean('Führerschein Klasse B vorhanden?', 'Yes')
    await user.upload(
      screen.getByLabelText('Anschreiben (bitte ausschließlich als PDF)'),
      new File(['%PDF'], 'anschreiben.pdf', { type: 'application/pdf' }),
    )
    // The shown file name confirms the async base64 conversion landed in form
    // state — advancing earlier would race it.
    await screen.findByText('anschreiben.pdf')
    await user.type(screen.getByLabelText('Erfahrung mit SAFe?'), 'Ja, 2 Jahre')
    await clickNext()
    await user.type(
      screen.getByLabelText('Beschreiben Sie Ihre Stärken und Schwächen.'),
      'Stärken: Testen.',
    )
    await user.type(
      screen.getByLabelText(/Wie viele Jahre Berufserfahrung haben Sie mit React/),
      '7',
    )
    await user.click(screen.getByRole('checkbox', { name: 'React' }))
    await clickNext()
    await answerBoolean(
      'Wären Sie grundsätzlich bereit, bei Bedarf gelegentlich auch außerhalb der regulären Arbeitszeiten zur Verfügung zu stehen?',
      'No',
    )
    await clickNext()

    await user.click(screen.getByRole('button', { name: 'Submit application' }))

    // The fixture pins the contract: base64 without the data-URL prefix
    // (bite #2, data is btoa('%PDF') — a worked example), one tech_stack pick
    // still travelling as values (bite #1), and screening failing only on
    // salary — the stripped must_be_true on the text question must NOT screen.
    expect(submittedPayload(log)).toEqual(expectedBadPayload)
  })
})

describe('ApplyFlow result screen on failed screening (#16)', () => {
  // New test data, not a frozen fixture: one prefilled numeric whose untouched
  // profile value (95000) fails must_be_below 90000 at submit (DECISIONS #7/#8).
  const failingJob = {
    id: 'job-screening-fail',
    title: 'Backend Engineer',
    company: 'Testing GmbH',
    language: 'en',
    questions: [
      {
        type: 'numeric',
        id: 'salary_expectation',
        question: 'What is your yearly salary expectation in EUR?',
        required: true,
        profile_field: 'salary_expectation',
        must_be_below: 90000,
      },
    ],
  }

  it('shows the same confirmation as a passed screening — no screening detail at all', async () => {
    const user = userEvent.setup()
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    renderApplyFlow(failingJob)

    // Prefill confirm step → summary → submit.
    await clickNext()
    await user.click(screen.getByRole('button', { name: 'Submit application' }))

    // Submission is never blocked by screening; the payload records the failure.
    expect(submittedPayload(log)).toEqual({
      job_id: 'job-screening-fail',
      answers: [{ id: 'salary_expectation', value: 95000 }],
      screening: { passed: false, failed: ['salary_expectation'] },
    })

    expect(screen.getByRole('status')).toHaveTextContent('Application submitted')
    const page = document.body.textContent ?? ''
    expect(page).not.toContain('90000')
    expect(page).not.toContain('95000')
    expect(page).not.toContain('must_be_below')
    expect(page).not.toContain('salary')
    expect(page).not.toContain('failed')
    expect(page).not.toContain('may not match')
  })
})

describe('ApplyFlow with short.json', () => {
  it('prefills from the profile, keeps it editable, and submits the contract payload', async () => {
    const user = userEvent.setup()
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    renderApplyFlow(shortJson)

    // Prefill: profile notice_period "3_months" is a valid option, salary 95000
    // is within bounds (DECISIONS #7: the must-rules never gate prefill).
    expect(screen.getByRole('radio', { name: '3 months' })).toBeChecked()
    const salary = screen.getByLabelText('What is your yearly salary expectation in EUR?')
    expect(salary).toHaveValue('95000')

    // Prefilled values stay editable on the confirm step (acceptance criterion).
    await user.clear(salary)
    await user.type(salary, '100.000')

    // Confirm step → optional question step (skipped) → summary → submit.
    await clickNext()
    await clickNext()
    await user.click(screen.getByRole('button', { name: 'Submit application' }))

    // Expected payload is a literal from the contract (docs/task-contract.md), not recomputed:
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
    expect(submittedPayload(log)).toEqual(expected)
    expect(log).toHaveBeenCalledWith(expected)
  })

  it('blocks advancing accessibly while a required answer is missing', async () => {
    const user = userEvent.setup()
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    renderApplyFlow(shortJson)

    const salary = screen.getByLabelText('What is your yearly salary expectation in EUR?')
    await user.clear(salary)
    await clickNext()

    // The step gate holds: still step 1, no payload, the error tied to the field.
    expect(screen.getByRole('progressbar', { name: 'Step 1 of 3' })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(log).not.toHaveBeenCalled()
    expect(salary).toHaveAccessibleDescription('This field is required')
    expect(salary).toHaveAttribute('aria-invalid', 'true')

    // Answering clears the error and unblocks the step — through to submit.
    await user.type(salary, '90000')
    await clickNext()
    await clickNext()
    await user.click(screen.getByRole('button', { name: 'Submit application' }))
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders an error state for a config that cannot be normalized, never a crash', () => {
    renderApplyFlow({ id: 'job-unnormalizable', questions: 'nope' })
    expect(screen.getByRole('alert')).toHaveTextContent('This job posting cannot be displayed.')
    expect(
      screen.queryByRole('button', { name: 'Submit application' }),
    ).not.toBeInTheDocument()
  })

  it('treats a form submission on a question step as Next, never as submit', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    renderApplyFlow(shortJson)

    // Enter in an input (implicit submission) dispatches through the same
    // step gate as the Next button — it advances, it never sends the
    // application. Only the summary's Submit button may.
    fireEvent.submit(screen.getByRole('button', { name: 'Next' }).closest('form')!)

    expect(screen.getByRole('progressbar', { name: 'Step 2 of 3' })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(log).not.toHaveBeenCalled()
  })

  it('sends the summary back to step 1 when an earlier required answer goes missing', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    renderApplyFlow(shortJson)
    await clickNext()
    await clickNext()

    // Clearing the (hidden but mounted) required salary leaves step 1 unfinished.
    fireEvent.change(screen.getByLabelText('What is your yearly salary expectation in EUR?'), {
      target: { value: '' },
    })

    expect(await screen.findByRole('progressbar', { name: 'Step 1 of 3' })).toBeInTheDocument()
    expect(log).not.toHaveBeenCalled()
  })

  it('submits the untouched prefill as-is', async () => {
    const user = userEvent.setup()
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    renderApplyFlow(shortJson)
    await clickNext()
    await clickNext()
    await user.click(screen.getByRole('button', { name: 'Submit application' }))
    expect(submittedPayload(log)).toEqual(expectedShortPayload)
  })

  it('omits the required-fields legend when no question is required', () => {
    const noRequired = {
      id: 'job-optional-only',
      title: 'T',
      company: 'C',
      language: 'en',
      questions: [{ type: 'text', id: 'anything', question: 'Anything to add?' }],
    }
    renderApplyFlow(noRequired)
    expect(screen.queryByText('Fields marked with * are required')).not.toBeInTheDocument()
  })

  // #16: the result screen is for candidates — the payload is dev-only (console).
  it('shows a human confirmation instead of the raw payload after submitting', async () => {
    const user = userEvent.setup()
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    renderApplyFlow(shortJson)

    await clickNext()
    await clickNext()
    await user.click(screen.getByRole('button', { name: 'Submit application' }))

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Application submitted')
    expect(status.textContent).not.toContain('job_id')
    expect(submittedPayload(log)).toEqual(expectedShortPayload)
  })

  // The "invalid" half of the step gate: unparseable input in a REQUIRED
  // field is held as null by the widget (DECISIONS #21/#22), so Next blocks
  // exactly like on an empty one — with the widget's own error visible.
  it('blocks advancing while a required field holds invalid input', async () => {
    const user = userEvent.setup()
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    renderApplyFlow(shortJson)

    const salary = screen.getByLabelText('What is your yearly salary expectation in EUR?')
    await user.clear(salary)
    await user.type(salary, 'abc')
    await clickNext()

    expect(screen.getByRole('progressbar', { name: 'Step 1 of 3' })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(log).not.toHaveBeenCalled()
    expect(salary).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a whole number')
  })
})
