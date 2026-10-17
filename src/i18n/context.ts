import { createContext } from 'react'
import type { TranslationKey } from './en'

/** Single owner of the supported UI languages — the switch and storage derive from it. */
export const LANGUAGES = ['en', 'de'] as const

export type Language = (typeof LANGUAGES)[number]

export interface LanguageContextValue {
  language: Language
  t: (key: TranslationKey) => string
  setLanguage: (language: Language) => void
}

/** null until a LanguageProvider mounts — useI18n turns that into a loud error. */
export const LanguageContext = createContext<LanguageContextValue | null>(null)
