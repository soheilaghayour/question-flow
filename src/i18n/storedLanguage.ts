import { LANGUAGES, type Language } from './context'

const STORAGE_KEY = 'ui-language'

/** The language chosen in this browser; English when nothing valid is stored. */
export function getStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return LANGUAGES.find((language) => language === stored) ?? 'en'
  } catch {
    return 'en'
  }
}

export function storeLanguage(language: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {
    // storage blocked: the switch still applies for this visit
  }
}
