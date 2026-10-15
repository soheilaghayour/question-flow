import { useMemo, useState, type ReactNode } from 'react'
import { LanguageContext, type UiLanguage } from './context'
import { de } from './de'
import { en } from './en'

const STORAGE_KEY = 'ui-language'
const dictionaries = { en, de }

// Persisted manual choice wins; otherwise browser language, English fallback
// (DECISIONS #3). Job `language` never feeds this — it describes the recruiter.
function initialLanguage(): UiLanguage {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'de') return stored
  return navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<UiLanguage>(initialLanguage)

  const value = useMemo(
    () => ({
      language,
      toggleLanguage: () => {
        setLanguage((previous) => {
          const next: UiLanguage = previous === 'en' ? 'de' : 'en'
          localStorage.setItem(STORAGE_KEY, next)
          return next
        })
      },
      t: (key: keyof typeof en) => dictionaries[language][key],
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
