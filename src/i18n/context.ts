import { createContext } from 'react'
import type { TranslationKey } from './en'

export type UiLanguage = 'en' | 'de'

export interface LanguageContextValue {
  language: UiLanguage
  toggleLanguage: () => void
  t: (key: TranslationKey) => string
}

/** null until a LanguageProvider mounts — useI18n turns that into a loud error. */
export const LanguageContext = createContext<LanguageContextValue | null>(null)
