import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { LanguageContext, type Language } from './context'
import { de } from './de'
import { en, type TranslationKey } from './en'
import { getStoredLanguage, storeLanguage } from './storedLanguage'

const DICTIONARIES = { en, de }

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState(getStoredLanguage)

  // Layout effect: lang must match the text before the first paint.
  useLayoutEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(
    () => ({
      language,
      t: (key: TranslationKey) => DICTIONARIES[language][key],
      setLanguage: (next: Language) => {
        storeLanguage(next)
        setLanguageState(next)
      },
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
