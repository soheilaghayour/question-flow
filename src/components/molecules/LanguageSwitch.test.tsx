import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import { LanguageSwitch } from './LanguageSwitch'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('LanguageSwitch', () => {
  it('marks the current language and switches on click', async () => {
    const user = userEvent.setup()
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('en-US')
    render(
      <LanguageProvider>
        <LanguageSwitch />
      </LanguageProvider>,
    )
    const languages = within(screen.getByRole('group', { name: 'Language' }))
    expect(languages.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true')
    expect(languages.getByRole('button', { name: 'DE' })).toHaveAttribute('aria-pressed', 'false')

    await user.click(languages.getByRole('button', { name: 'DE' }))
    const germanLanguages = within(screen.getByRole('group', { name: 'Sprache' }))
    expect(germanLanguages.getByRole('button', { name: 'DE' })).toHaveAttribute('aria-pressed', 'true')
    expect(germanLanguages.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'false')
  })
})
