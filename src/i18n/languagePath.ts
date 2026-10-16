import type { Language } from './context'

/** English pages live at the bare path; every other language under its own prefix (DECISIONS D3). */
export const LANGUAGE_PREFIXES: Record<Language, string> = { en: '', de: '/de' }

export function pathInLanguage(language: Language, path: string) {
  return LANGUAGE_PREFIXES[language] + path
}
