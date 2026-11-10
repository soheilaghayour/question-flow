import {
  PROFILE_FIELDS,
  type Profile,
  type ProfileField,
  type Question,
} from '@/data/schema'
import { isValidNumericAnswer } from './numericAnswer'

export type PrefillValue = string | number | string[]
export type PrefillAnswers = Record<string, PrefillValue>

function isProfileField(field: string): field is ProfileField {
  return (PROFILE_FIELDS as readonly string[]).includes(field)
}

/** Resolves a profile_field to its location in the profile (contract table). */
function profileValue(field: ProfileField, profile: Profile) {
  switch (field) {
    case 'notice_period':
      return profile.notice_period
    case 'salary_expectation':
      return profile.salary_expectation.amount
    case 'city':
      return profile.location.city
    case 'german_level':
      return profile.languages.find((l) => l.language === 'de')?.level
    case 'english_level':
      return profile.languages.find((l) => l.language === 'en')?.level
    case 'years_of_experience':
      return profile.years_of_experience
  }
}

// Input validation only: type, option membership, min/max. Screening rules
// never gate prefill — profile's 95000 IS prefilled against
// must_be_below: 90000 (DECISIONS #7).
function validPrefill(question: Question, value: unknown): PrefillValue | undefined {
  switch (question.type) {
    case 'numeric':
      return typeof value === 'number' && isValidNumericAnswer(value, question)
        ? value
        : undefined
    case 'select': {
      if (
        typeof value !== 'string' ||
        !question.options.some((option) => option.value === value)
      )
        return undefined
      // Shape follows max_choices, not how many values are set.
      return question.max_choices > 1 ? [value] : value
    }
    case 'text':
      return typeof value === 'string' ? value : undefined
    default:
      return undefined
  }
}

/** Maps each question's profile_field to an initial answer, if valid for the question. */
export function buildPrefillAnswers(questions: Question[], profile: Profile) {
  const answers: PrefillAnswers = {}
  for (const question of questions) {
    if (!question.profile_field || !isProfileField(question.profile_field)) continue
    const value = validPrefill(question, profileValue(question.profile_field, profile))
    if (value !== undefined) answers[question.id] = value
  }
  return answers
}
