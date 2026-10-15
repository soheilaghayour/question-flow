/** UI chrome only — recruiter-authored text renders verbatim (DECISIONS #3). */
export const en = {
  apply: 'Apply',
  submit: 'Submit application',
  optional: 'optional',
  yes: 'Yes',
  no: 'No',
  invalid_job: 'Invalid job',
  error_required: 'This field is required',
  error_number_invalid: 'Enter a whole number',
  error_number_range: 'Enter a whole number between {min} and {max}',
  error_file_type: 'Only PDF, DOCX, PNG or JPG files are accepted',
  error_file_size: 'The file is larger than {max} MB',
  error_file_read: 'The file could not be read. Please try again',
  error_job_invalid: 'This job posting cannot be displayed.',
  submitted_title: 'Application submitted',
  submitted_body:
    'Thank you for applying. The company will review your application and get back to you.',
  submitted_screening_note:
    'Please note: your profile may not match some of the requirements for this position.',
  back_to_jobs: 'Back to jobs',
  choose_file: 'Choose file',
  required_hint: 'Fields marked with * are required',
}

export type TranslationKey = keyof typeof en
