import { createContext } from 'react'
import type { TranslationKey } from './en'

/** Single owner of the supported UI languages — storage validation and the
 * toggle derive from it, so a new language can't be half-added. */
export const UI_LANGUAGES = ['en', 'de'] as const

export type UiLanguage = (typeof UI_LANGUAGES)[number]

export interface LanguageContextValue {
  language: UiLanguage
  toggleLanguage: () => void
  t: (key: TranslationKey) => string
}

/** null until a LanguageProvider mounts — useI18n turns that into a loud error. */
export const LanguageContext = createContext<LanguageContextValue | null>(null)
