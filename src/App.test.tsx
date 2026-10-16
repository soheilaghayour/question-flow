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
  it('renders the app heading', () => {
    renderRoute('/')
    expect(screen.getByRole('heading', { name: 'Question Flow' })).toBeInTheDocument()
  })

  it('opens the first job at the root URL', async () => {
    const router = renderRoute('/')
    expect(await screen.findByText('Kranich Health GmbH')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/jobs/job-short')
  })

  it('puts the selected job id in the URL', async () => {
    const user = userEvent.setup()
    const router = renderRoute('/jobs/job-short')
    await user.click(screen.getByRole('button', { name: 'Senior Frontend Engineer' }))
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

  it('leaves the form from step 1 with the wizard Back', async () => {
    const user = userEvent.setup()
    const router = renderRoute('/jobs/job-short/apply?step=1')
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(router.state.location.pathname).toBe('/jobs/job-short')
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

  it('has no back button in the header', async () => {
    renderRoute('/jobs/job-short/apply?step=1')
    expect(
      within(screen.getByRole('banner')).queryByRole('button', { name: 'Back' }),
    ).not.toBeInTheDocument()
  })

  // short.json's earlier steps hold nothing required that a refresh could lose.
  it('restarts a refreshed form at step 1 even when no required answer is missing', async () => {
    const router = renderRoute('/jobs/job-short/apply?step=3')
    expect(await screen.findByRole('progressbar', { name: 'Step 1 of 3' })).toBeInTheDocument()
    expect(router.state.location.search).toBe('?step=1')
  })

  it('restarts a refreshed form at step 1 with the prefill intact', async () => {
    const router = renderRoute('/jobs/job-long/apply?step=3')
    expect(await screen.findByRole('progressbar', { name: 'Step 1 of 4' })).toBeInTheDocument()
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
    expect(await screen.findByRole('button', { name: 'Apply' })).toBeDisabled()
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
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(screen.getByText('You have already applied to this job.')).toBeInTheDocument()
  })

  it('remembers an applied job across a page refresh', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    renderRoute('/jobs/job-short/apply?step=1')
    await submitShortJob()
    document.body.innerHTML = ''

    renderRoute('/jobs/job-short')
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
  })

  it.each(['{not json', '"job-short"', '{"job-short":true}'])(
    'treats malformed stored applications (%s) as nothing applied',
    (stored) => {
      localStorage.setItem('applied-job-ids', stored)
      renderRoute('/jobs/job-short')
      expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
    },
  )

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

  it('switches the UI language with an EN | DE control that marks the current one', async () => {
    const user = userEvent.setup()
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('en-US')
    renderRoute('/jobs/job-short')
    const languages = within(screen.getByRole('group', { name: 'Language' }))
    expect(languages.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true')
    expect(languages.getByRole('button', { name: 'DE' })).toHaveAttribute('aria-pressed', 'false')

    await user.click(languages.getByRole('button', { name: 'DE' }))
    expect(screen.getByRole('button', { name: 'Bewerben' })).toBeInTheDocument()
    expect(
      within(screen.getByRole('group', { name: 'Sprache' })).getByRole('button', { name: 'DE' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('labels the wizard buttons with visible text', async () => {
    const user = userEvent.setup()
    renderRoute('/jobs/job-short/apply?step=1')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('button', { name: 'Next' })).toHaveTextContent('Next')
    expect(screen.getByRole('button', { name: 'Back' })).toHaveTextContent('Back')
  })
})
