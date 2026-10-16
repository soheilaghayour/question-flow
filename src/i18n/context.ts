import { createContext } from 'react'
import type { TranslationKey } from './en'

/** Single owner of the supported UI languages — URL prefixes and the language
 * switch derive from it, so a new language can't be half-added. */
export const LANGUAGES = ['en', 'de'] as const

export type Language = (typeof LANGUAGES)[number]

export interface LanguageContextValue {
  language: Language
  t: (key: TranslationKey) => string
  /** `path` under the current language's URL prefix — for every absolute navigation. */
  localizedPath: (path: string) => string
}

/** null until a LanguageProvider mounts — useI18n turns that into a loud error. */
export const LanguageContext = createContext<LanguageContextValue | null>(null)
