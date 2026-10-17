import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoute } from '@/test/renderRoute'

function goBack(router: ReturnType<typeof renderRoute>) {
  return act(() => router.navigate(-1))
}

// short.json: prefill step → optional step → summary.
async function submitShortJob() {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: 'Submit application' }))
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('App', () => {
  it('opens the first job at the root URL', async () => {
    const router = renderRoute('/')
    expect(await screen.findByText('Kranich Health GmbH')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/jobs/job-short')
  })

  it('puts the selected job id in the URL', async () => {
    const user = userEvent.setup()
    const router = renderRoute('/jobs/job-short')
    await user.click(screen.getByRole('link', { name: 'Senior Frontend Engineer' }))
    expect(router.state.location.pathname).toBe('/jobs/job-long')
    expect(screen.getByText('Nordlicht Software GmbH')).toBeInTheDocument()
  })

  it('shows an error for an unknown job id', () => {
    renderRoute('/jobs/job-missing')
    expect(screen.getByRole('alert')).toHaveTextContent('This job posting cannot be displayed.')
  })

  it('opens the apply flow at step 1 of the selected job', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const router = renderRoute('/jobs/job-bad')
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    expect(router.state.location.pathname).toBe('/jobs/job-bad/apply')
    expect(router.state.location.search).toBe('?step=1')
    expect(screen.getByRole('group', { name: 'Kündigungsfrist' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Apply' })).not.toBeInTheDocument()
  })

  it('moves between steps with browser Back and the wizard Back alike', async () => {
    const user = userEvent.setup()
    const router = renderRoute('/jobs/job-short')
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(router.state.location.search).toBe('?step=2')
    expect(screen.getByRole('progressbar', { name: 'Step 2 of 3' })).toBeInTheDocument()

    await goBack(router)
    expect(screen.getByRole('progressbar', { name: 'Step 1 of 3' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('progressbar', { name: 'Step 1 of 3' })).toBeInTheDocument()

    await goBack(router)
    expect(router.state.location.pathname).toBe('/jobs/job-short')
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
  })

  it('leaves the form from step 1 by going back, not by adding a job page entry', async () => {
    const user = userEvent.setup()
    const router = renderRoute('/jobs/job-short')
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(router.state.location.pathname).toBe('/jobs/job-short')
    expect(router.state.historyAction).toBe('POP')
  })

  it('shows the confirmation even when storage is blocked', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError')
    })
    renderRoute('/jobs/job-short/apply?step=1')
    await submitShortJob()
    expect(await screen.findByText('Application submitted')).toBeInTheDocument()
  })

  // short.json's earlier steps hold nothing required, so the reset can't come from a missing answer.
  it('restarts a refreshed form at step 1 with the prefill intact', async () => {
    const router = renderRoute('/jobs/job-short/apply?step=3')
    expect(await screen.findByRole('progressbar', { name: 'Step 1 of 3' })).toBeInTheDocument()
    expect(router.state.location.search).toBe('?step=1')
    expect(screen.getByRole('radio', { name: '3 months' })).toBeChecked()
  })

  it('never shows the submitted form again on browser Back', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const router = renderRoute('/jobs/job-short')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Apply' }))
    await submitShortJob()
    expect(router.state.location.pathname).toBe('/jobs/job-short/confirmation')
    expect(screen.getByText('Application submitted')).toBeInTheDocument()

    await goBack(router)
    expect(within(await screen.findByRole('link', { name: /^Frontend Developer \(React\)/ })).getByText('Applied')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Apply' })).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/jobs/job-short')
    expect(screen.queryByText('Fields marked with * are required')).not.toBeInTheDocument()
  })

  it('returns to the job page from the result screen', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const router = renderRoute('/jobs/job-short/apply?step=1')
    await submitShortJob()
    await user.click(screen.getByRole('button', { name: 'Back to the main page' }))
    expect(router.state.location.pathname).toBe('/jobs/job-short')
    expect(screen.queryByRole('button', { name: 'Apply' })).not.toBeInTheDocument()
    expect(within(screen.getByRole('main')).getAllByText('Applied')).toHaveLength(2)
  })

  it('remembers an applied job across a page refresh', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    renderRoute('/jobs/job-short/apply?step=1')
    await submitShortJob()
    document.body.innerHTML = ''

    renderRoute('/jobs/job-short')
    expect(screen.queryByRole('button', { name: 'Apply' })).not.toBeInTheDocument()
  })

  it('marks the selected job as the current page in the job list', () => {
    renderRoute('/jobs/job-short')
    expect(screen.getByRole('link', { name: 'Frontend Developer (React)' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Senior Frontend Engineer' })).not.toHaveAttribute('aria-current')
  })

  it('shows the Applied badge only on applied jobs, in the stored language', () => {
    localStorage.setItem('applied-job-ids', '["job-short"]')
    localStorage.setItem('ui-language', 'de')
    renderRoute('/jobs/job-long')
    expect(within(screen.getByRole('link', { name: /^Frontend Developer \(React\)/ })).getByText('Beworben')).toBeInTheDocument()
    expect(within(screen.getByRole('link', { name: 'Senior Frontend Engineer' })).queryByText('Beworben')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bewerben' })).toBeEnabled()
  })

  it('shows the profile that feeds prefill on the job page', () => {
    renderRoute('/jobs/job-short')
    expect(screen.getByText('Your profile')).toBeInTheDocument()
    expect(screen.getByText('Mateo Rossi')).toBeInTheDocument()
  })

  it('shows which job the form belongs to', () => {
    renderRoute('/jobs/job-short/apply?step=1')
    expect(screen.getByRole('heading', { name: 'Frontend Developer (React)' })).toBeInTheDocument()
    expect(screen.getByText('Kranich Health GmbH')).toBeInTheDocument()
  })

  it('translates the UI but never the recruiter text', async () => {
    const user = userEvent.setup()
    renderRoute('/jobs/job-short/apply?step=1')
    await user.click(screen.getByRole('button', { name: 'DE' }))
    expect(screen.getByRole('button', { name: 'Weiter' })).toBeInTheDocument()
    expect(screen.getByText('What is your notice period?')).toBeInTheDocument()
  })

  it('labels the wizard buttons with visible text', async () => {
    const user = userEvent.setup()
    renderRoute('/jobs/job-short/apply?step=1')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('button', { name: 'Next' })).toHaveTextContent('Next')
    expect(screen.getByRole('button', { name: 'Back' })).toHaveTextContent('Back')
  })
})

describe('UI language (#66)', () => {
  it('starts in English with nothing stored and keeps a switch across a refresh', async () => {
    renderRoute('/jobs/job-short')
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')

    await userEvent.setup().click(screen.getByRole('button', { name: 'DE' }))
    document.body.innerHTML = ''
    renderRoute('/jobs/job-short')
    expect(screen.getByRole('button', { name: 'Bewerben' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('de')
  })

  it('marks the active language as pressed', async () => {
    renderRoute('/jobs/job-short')
    const languages = within(screen.getByRole('group', { name: 'Language' }))
    expect(languages.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true')
    expect(languages.getByRole('button', { name: 'DE' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches without a history entry, keeping the step and the answers', async () => {
    const user = userEvent.setup()
    const router = renderRoute('/jobs/job-short')
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    const salary = screen.getByLabelText('What is your yearly salary expectation in EUR?')
    await user.clear(salary)
    await user.type(salary, '70000')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    const entry = router.state.location.key

    await user.click(screen.getByRole('button', { name: 'DE' }))
    expect(router.state.location.key).toBe(entry)
    expect(screen.getByRole('progressbar', { name: 'Schritt 2 von 3' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Zurück' }))
    expect(screen.getByLabelText('What is your yearly salary expectation in EUR?')).toHaveValue('70000')
  })

  // The #49 bug: with the language in the URL, Back restored the entry's old language.
  async function switchToGermanOnStep2() {
    const user = userEvent.setup()
    const router = renderRoute('/jobs/job-short')
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'DE' }))
    return { user, router }
  }

  it('keeps the switched language on the wizard Back', async () => {
    const { user } = await switchToGermanOnStep2()
    await user.click(screen.getByRole('button', { name: 'Zurück' }))
    expect(screen.getByRole('progressbar', { name: 'Schritt 1 von 3' })).toBeInTheDocument()
  })

  it('keeps the switched language on browser Back', async () => {
    const { router } = await switchToGermanOnStep2()
    await goBack(router)
    expect(screen.getByRole('progressbar', { name: 'Schritt 1 von 3' })).toBeInTheDocument()
  })
})
