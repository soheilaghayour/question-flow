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
  back_to_jobs: 'Zurück zu den Stellen',
  back_to_main: 'Zurück zur Hauptseite',
  choose_file: 'Datei auswählen',
  required_hint: 'Mit * markierte Felder sind Pflichtfelder',
  jobs_heading: 'Offene Stellen',
  profile_heading: 'Ihr Profil',
  profile_location: 'Standort',
  profile_salary: 'Gehaltsvorstellung',
  profile_notice: 'Kündigungsfrist',
  profile_experience: 'Jahre Berufserfahrung',
  profile_languages: 'Sprachen',
  job_description:
    'Wir suchen Verstärkung für unser Team. Die Bewerbung dauert nur wenige Minuten — viele Antworten sind bereits aus Ihrem Profil vorausgefüllt, Sie müssen sie meist nur bestätigen.',
  applied_note: 'Sie haben sich auf diese Stelle bereits beworben.',
  progress_label: '{answered} von {total} Fragen beantwortet',
}
