import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'

describe('App', () => {
  it('renders the app heading', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'Instaffo Question Flow' }),
    ).toBeInTheDocument()
  })

  it('lets the user switch between the three job configs', async () => {
    const user = userEvent.setup()
    render(<App />)
    // First config selected by default.
    expect(screen.getByText('Kranich Health GmbH')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Senior Frontend Engineer' }))
    expect(screen.getByText('Nordlicht Software GmbH')).toBeInTheDocument()
  })

  it('opens the apply flow for the selected job', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Senior Frontend Developer (m/w/d)' }))
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    // bad.json's first normalized question renders; the job switcher is gone.
    expect(screen.getByRole('group', { name: 'Kündigungsfrist' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Apply' }),
    ).not.toBeInTheDocument()
  })

  it('navigates back to the job overview from the form and after submitting', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    render(<App />)

    // From the form without submitting: nothing is lost but the way back exists.
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    expect(screen.getByText('Fields marked with * are required')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back to jobs' }))
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()

    // After submitting (short.json: prefill step → optional step → summary):
    // the header back button disappears, the centered result button leads back
    // to the overview, and the applied job cannot be applied to again.
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Submit application' }))
    expect(screen.getByText('Application submitted')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Back to jobs' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back to the main page' }))
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(screen.getByText('You have already applied to this job.')).toBeInTheDocument()
  })

  it('shows the profile that feeds prefill on the job page', () => {
    render(<App />)
    expect(screen.getByText('Your profile')).toBeInTheDocument()
    expect(screen.getByText('Mateo Rossi')).toBeInTheDocument()
  })

  it('shows which job the form belongs to', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    // Title and company from the job overview carry over to the form.
    expect(screen.getByRole('heading', { name: 'Frontend Developer (React)' })).toBeInTheDocument()
    expect(screen.getByText('Kranich Health GmbH')).toBeInTheDocument()
  })

  it('toggles the UI language and persists chrome text in German', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Deutsch' }))
    expect(screen.getByRole('button', { name: 'Bewerben' })).toBeInTheDocument()
  })
})
