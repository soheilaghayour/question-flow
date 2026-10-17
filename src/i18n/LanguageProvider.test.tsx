import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider } from './LanguageProvider'
import { useI18n } from './useI18n'

function Probe() {
  const { t, setLanguage } = useI18n()
  return (
    <>
      <p>{t('submit')}</p>
      <button onClick={() => setLanguage('de')}>de</button>
    </>
  )
}

describe('LanguageProvider', () => {
  it('translates and keeps documentElement.lang in sync with the UI language (WCAG 3.1.1)', async () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    )
    expect(screen.getByText('Submit application')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')

    await userEvent.setup().click(screen.getByRole('button', { name: 'de' }))
    expect(screen.getByText('Bewerbung absenden')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('de')
  })
})
