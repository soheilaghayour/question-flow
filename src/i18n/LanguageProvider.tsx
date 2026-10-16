import { useEffect, useMemo, type ReactNode } from 'react'
import { LanguageContext, type Language } from './context'
import { de } from './de'
import { en, type TranslationKey } from './en'
import { pathInLanguage } from './languagePath'

const DICTIONARIES = { en, de }

export function LanguageProvider({ language = 'en', children }: { language?: Language; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(
    () => ({
      language,
      t: (key: TranslationKey) => DICTIONARIES[language][key],
      localizedPath: (path: string) => pathInLanguage(language, path),
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
