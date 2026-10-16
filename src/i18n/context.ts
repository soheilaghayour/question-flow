import { createContext } from 'react'
import type { TranslationKey } from './en'

/** Single owner of the supported UI languages — storage validation and the
 * language switch derive from it, so a new language can't be half-added. */
export const LANGUAGES = ['en', 'de'] as const

export type Language = (typeof LANGUAGES)[number]

export interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

/** null until a LanguageProvider mounts — useI18n turns that into a loud error. */
export const LanguageContext = createContext<LanguageContextValue | null>(null)
