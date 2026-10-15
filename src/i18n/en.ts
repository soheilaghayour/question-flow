/** UI chrome only — recruiter-authored text renders verbatim (DECISIONS #3). */
export const en = {
  apply: 'Apply',
  submit: 'Submit application',
  optional: 'optional',
  yes: 'Yes',
  no: 'No',
  error_required: 'This field is required',
  error_number_range: 'Enter a whole number between {min} and {max}',
  error_file_type: 'Only PDF, DOCX, PNG or JPG files are accepted',
  error_file_size: 'The file is larger than {max} MB',
}

export type TranslationKey = keyof typeof en
