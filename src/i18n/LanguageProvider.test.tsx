import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider } from './LanguageProvider'
import { useI18n } from './useI18n'

function Probe() {
  const { t, setLanguage } = useI18n()
  return (
    <div>
      <p>{t('submit')}</p>
      <button onClick={() => setLanguage('en')}>en</button>
      <button onClick={() => setLanguage('de')}>de</button>
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

  it('still switches the language when writing storage throws', async () => {
    const user = userEvent.setup()
    mockBrowserLanguage('en-US')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    renderProbe()
    await user.click(screen.getByRole('button', { name: 'de' }))
    expect(screen.getByText('Bewerbung absenden')).toBeInTheDocument()
  })
})

describe('LanguageProvider — document language (WCAG 3.1.1)', () => {
  it('keeps documentElement.lang in sync with the UI language', async () => {
    const user = userEvent.setup()
    mockBrowserLanguage('de-DE')
    renderProbe()
    expect(document.documentElement.lang).toBe('de')
    await user.click(screen.getByRole('button', { name: 'en' }))
    expect(document.documentElement.lang).toBe('en')
  })
})

describe('LanguageProvider — setLanguage', () => {
  it('switches UI strings and persists the choice', async () => {
    const user = userEvent.setup()
    mockBrowserLanguage('en-US')
    renderProbe()

    await user.click(screen.getByRole('button', { name: 'de' }))

    expect(screen.getByText('Bewerbung absenden')).toBeInTheDocument()
    expect(localStorage.getItem('ui-language')).toBe('de')

    await user.click(screen.getByRole('button', { name: 'en' }))

    expect(screen.getByText('Submit application')).toBeInTheDocument()
    expect(localStorage.getItem('ui-language')).toBe('en')
  })

  it('keeps the language when the active one is chosen again', async () => {
    const user = userEvent.setup()
    mockBrowserLanguage('de-DE')
    renderProbe()
    await user.click(screen.getByRole('button', { name: 'de' }))
    expect(screen.getByText('Bewerbung absenden')).toBeInTheDocument()
  })
})
