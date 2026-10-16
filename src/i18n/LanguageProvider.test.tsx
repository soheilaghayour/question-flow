import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LanguageProvider } from './LanguageProvider'
import { useI18n } from './useI18n'

function Probe() {
  const { t } = useI18n()
  return <p>{t('submit')}</p>
}

describe('LanguageProvider', () => {
  it.each([
    ['en', 'Submit application'],
    ['de', 'Bewerbung absenden'],
  ] as const)('translates into %s', (language, uiString) => {
    render(
      <LanguageProvider language={language}>
        <Probe />
      </LanguageProvider>,
    )
    expect(screen.getByText(uiString)).toBeInTheDocument()
  })

  it('keeps documentElement.lang in sync with the UI language (WCAG 3.1.1)', () => {
    const { rerender } = render(
      <LanguageProvider language="de">
        <Probe />
      </LanguageProvider>,
    )
    expect(document.documentElement.lang).toBe('de')
    rerender(
      <LanguageProvider language="en">
        <Probe />
      </LanguageProvider>,
    )
    expect(document.documentElement.lang).toBe('en')
  })
})
