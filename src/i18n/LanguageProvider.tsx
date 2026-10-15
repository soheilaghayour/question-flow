import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { LanguageContext, UI_LANGUAGES, type UiLanguage } from './context'
import { de } from './de'
import { en } from './en'

const STORAGE_KEY = 'ui-language'
const DICTIONARIES = { en, de }

// Blocked storage (cross-origin iframe, cookies off) throws on access.
// Persistence is a nice-to-have: it degrades silently, never crashes the form.
function readStoredLanguage(): UiLanguage | undefined {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return UI_LANGUAGES.find((language) => language === stored)
  } catch {
    return undefined
  }
}

function storeLanguage(language: UiLanguage) {
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {
    // Losing persistence is acceptable; losing the toggle is not.
  }
}

// Persisted manual choice wins; otherwise browser language, English fallback
// (DECISIONS #3). Job `language` never feeds this — it describes the recruiter.
function initialLanguage(): UiLanguage {
  return (
    readStoredLanguage() ??
    (navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en')
  )
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<UiLanguage>(initialLanguage)

  // Screen readers take pronunciation from the document language (WCAG 3.1.1);
  // index.html's hardcoded lang="en" must follow the UI language.
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(
    () => ({
      language,
      toggleLanguage: () => {
        // Persist outside the state updater: updaters must stay pure, and a
        // throwing setItem must not abort the switch itself.
        const next: UiLanguage = language === 'en' ? 'de' : 'en'
        storeLanguage(next)
        setLanguage(next)
      },
      t: (key: keyof typeof en) => DICTIONARIES[language][key],
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
