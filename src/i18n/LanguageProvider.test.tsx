import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider } from './LanguageProvider'
import { useI18n } from './useI18n'

const RECRUITER_TEXT = 'Bitte ausschließlich als PDF einreichen.'

function Probe() {
  const { t, toggleLanguage } = useI18n()
  return (
    <div>
      <p>{t('submit')}</p>
      {/* Recruiter-authored text renders verbatim, never through t(). */}
      <p>{RECRUITER_TEXT}</p>
      <button onClick={toggleLanguage}>toggle</button>
    </div>
  )
}

function mockBrowserLanguage(language: string) {
  vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(language)
}

function renderProbe() {
  render(
    <LanguageProvider>
      <Probe />
    </LanguageProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('LanguageProvider — initial language (DECISIONS #3)', () => {
  it.each([
    ['de-DE', 'Bewerbung absenden'],
    ['de', 'Bewerbung absenden'],
    ['en-US', 'Submit application'],
    ['fr-FR', 'Submit application'],
  ])('browser language %s → "%s"', (browserLanguage, uiString) => {
    mockBrowserLanguage(browserLanguage)
    renderProbe()
    expect(screen.getByText(uiString)).toBeInTheDocument()
  })

  it('a persisted choice wins over the browser language', () => {
    mockBrowserLanguage('de-DE')
    localStorage.setItem('ui-language', 'en')
    renderProbe()
    expect(screen.getByText('Submit application')).toBeInTheDocument()
  })
})

// Blocked storage (cross-origin iframe, cookies off) throws on access.
// Persistence is a nice-to-have: it degrades silently, never crashes the form.
describe('LanguageProvider — storage failures', () => {
  it('falls back to the browser language when reading storage throws', () => {
    mockBrowserLanguage('de-DE')
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError')
    })
    renderProbe()
    expect(screen.getByText('Bewerbung absenden')).toBeInTheDocument()
  })

  it('still toggles the language when writing storage throws', async () => {
    const user = userEvent.setup()
    mockBrowserLanguage('en-US')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    renderProbe()
    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByText('Bewerbung absenden')).toBeInTheDocument()
  })
})

describe('LanguageProvider — document language (WCAG 3.1.1)', () => {
  it('keeps documentElement.lang in sync with the UI language', async () => {
    const user = userEvent.setup()
    mockBrowserLanguage('de-DE')
    renderProbe()
    expect(document.documentElement.lang).toBe('de')
    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(document.documentElement.lang).toBe('en')
  })
})

describe('LanguageProvider — toggle', () => {
  it('switches UI strings, leaves recruiter text verbatim, persists the choice', async () => {
    const user = userEvent.setup()
    mockBrowserLanguage('en-US')
    renderProbe()

    await user.click(screen.getByRole('button', { name: 'toggle' }))

    expect(screen.getByText('Bewerbung absenden')).toBeInTheDocument()
    expect(screen.getByText(RECRUITER_TEXT)).toBeInTheDocument()
    expect(localStorage.getItem('ui-language')).toBe('de')

    await user.click(screen.getByRole('button', { name: 'toggle' }))

    expect(screen.getByText('Submit application')).toBeInTheDocument()
    expect(localStorage.getItem('ui-language')).toBe('en')
  })
})
