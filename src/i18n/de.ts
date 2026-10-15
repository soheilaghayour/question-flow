import type { TranslationKey } from './en'

// Record<TranslationKey, string> makes a missing or extra key a compile error.
export const de: Record<TranslationKey, string> = {
  apply: 'Bewerben',
  submit: 'Bewerbung absenden',
  optional: 'optional',
  yes: 'Ja',
  no: 'Nein',
  invalid_job: 'Ungültige Stelle',
  error_required: 'Dieses Feld ist erforderlich',
  error_number_invalid: 'Geben Sie eine ganze Zahl ein',
  error_number_range: 'Geben Sie eine ganze Zahl zwischen {min} und {max} ein',
  error_file_type: 'Nur PDF-, DOCX-, PNG- oder JPG-Dateien sind erlaubt',
  error_file_size: 'Die Datei ist größer als {max} MB',
  error_file_read: 'Die Datei konnte nicht gelesen werden. Bitte versuchen Sie es erneut',
  error_job_invalid: 'Diese Stellenanzeige kann nicht angezeigt werden.',
  submitted_title: 'Bewerbung abgeschickt',
  submitted_body:
    'Vielen Dank für Ihre Bewerbung. Das Unternehmen wird sie prüfen und sich bei Ihnen melden.',
  submitted_screening_note:
    'Hinweis: Ihr Profil erfüllt möglicherweise nicht alle Anforderungen dieser Stelle.',
}
