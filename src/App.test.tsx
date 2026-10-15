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

  it('toggles the UI language and persists chrome text in German', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Deutsch' }))
    expect(screen.getByRole('button', { name: 'Bewerben' })).toBeInTheDocument()
  })
})
