import type { TranslationKey } from './en'

// Record<TranslationKey, string> makes a missing or extra key a compile error.
export const de: Record<TranslationKey, string> = {
  apply: 'Bewerben',
  submit: 'Bewerbung absenden',
  optional: 'optional',
  error_required: 'Dieses Feld ist erforderlich',
  language_name: 'Deutsch',
}
