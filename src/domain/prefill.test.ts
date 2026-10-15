import { describe, expect, it } from 'vitest'
import longJob from '@jobs/long.json'
import profileJson from '@profile'
import { normalizeJob } from './normalize'
import { buildPrefillAnswers } from './prefill'
import {
  profileSchema,
  type NumericQuestion,
  type Question,
  type SelectQuestion,
} from './schema'

const profile = profileSchema.parse(profileJson)

function longJobQuestions(): Question[] {
  const result = normalizeJob(longJob)
  if ('error' in result) throw new Error(result.error)
  return result.job.questions
}

const select = (overrides: Partial<SelectQuestion> = {}): SelectQuestion => ({
  type: 'select',
  id: 'q',
  question: 'Q?',
  required: false,
  max_choices: 1,
  options: [{ label: 'B1', value: 'B1' }],
  profile_field: 'german_level',
  ...overrides,
})

const numeric = (overrides: Partial<NumericQuestion> = {}): NumericQuestion => ({
  type: 'numeric',
  id: 'q',
  question: 'Q?',
  required: false,
  min: 0,
  max: 100000000,
  profile_field: 'salary_expectation',
  ...overrides,
})

describe('buildPrefillAnswers — real fixtures (long.json + profile.json)', () => {
  it('prefills salary 95000 despite must_be_below 90000 — screening never gates prefill', () => {
    const answers = buildPrefillAnswers(longJobQuestions(), profile)
    expect(answers.salary_expectation).toBe(95000)
  })

  it('prefills selects whose profile value matches an option value', () => {
    const answers = buildPrefillAnswers(longJobQuestions(), profile)
    expect(answers.german_level).toBe('B1')
    expect(answers.notice_period).toBe('3_months')
  })

  it('prefills years_of_experience within the question range', () => {
    const answers = buildPrefillAnswers(longJobQuestions(), profile)
    expect(answers.years_of_experience).toBe(6)
  })

  // Catches a de/en swap in the languages lookup: the profile has de=B1,
  // en=C1, and both are valid options here, so only 'C1' is the right answer.
  it('looks up english_level by the en language entry', () => {
    const question = select({
      profile_field: 'english_level',
      options: [
        { label: 'B1', value: 'B1' },
        { label: 'C1', value: 'C1' },
      ],
    })
    expect(buildPrefillAnswers([question], profile)).toEqual({ q: 'C1' })
  })
})

describe('buildPrefillAnswers — input validation gates prefill', () => {
  it.each<[string, Question]>([
    [
      'profile value not among the select options',
      select({ options: [{ label: 'Native', value: 'native' }] }),
    ],
    ['numeric value above max', numeric({ max: 90000 })],
    ['numeric value below min', numeric({ min: 100000 })],
    [
      'value of the wrong type for the question',
      { type: 'text', id: 'q', question: 'Q?', required: false, multiline: false, profile_field: 'salary_expectation' },
    ],
  ])('does not prefill: %s', (_name, question) => {
    expect(buildPrefillAnswers([question], profile)).toEqual({})
  })

  it('prefills a text question with a string profile value', () => {
    const question: Question = {
      type: 'text', id: 'city', question: 'Where do you live?',
      required: false, multiline: false, profile_field: 'city',
    }
    expect(buildPrefillAnswers([question], profile)).toEqual({ city: 'Berlin' })
  })

  it('wraps the value in an array when max_choices > 1 — shape follows max_choices, not count', () => {
    expect(buildPrefillAnswers([select({ max_choices: 3 })], profile)).toEqual({
      q: ['B1'],
    })
  })
})

describe('buildPrefillAnswers — missing data is silent, never an error', () => {
  it.each<[string, Question, typeof profile]>([
    ['question has no profile_field', select({ profile_field: undefined }), profile],
    ['unknown profile_field', select({ profile_field: 'shoe_size' }), profile],
    [
      'profile has no entry for the looked-up language',
      select(),
      { ...profile, languages: [{ language: 'en', level: 'C1' }] },
    ],
  ])('%s → no prefill', (_name, question, profileVariant) => {
    expect(buildPrefillAnswers([question], profileVariant)).toEqual({})
  })
})
