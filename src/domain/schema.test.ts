import { describe, expect, it } from 'vitest'
import longJob from '@jobs/long.json'
import shortJob from '@jobs/short.json'
import badJob from '@jobs/bad.json'
import profile from '@profile'
import {
  jobSchema,
  profileSchema,
  questionSchema,
  type Question,
  type QuestionType,
} from './schema'

// Parses or throws, and throws on a type mismatch instead of letting a stale
// narrowing guard skip assertions silently.
function parseQuestionAs<T extends QuestionType>(
  type: T,
  input: unknown,
): Extract<Question, { type: T }> {
  const result = questionSchema.safeParse(input)
  if (!result.success) {
    throw new Error(`expected ${type} to parse: ${result.error.message}`)
  }
  if (result.data.type !== type) {
    throw new Error(`expected type ${type}, got ${result.data.type}`)
  }
  return result.data as Extract<Question, { type: T }>
}

describe('jobSchema', () => {
  it('parses long.json fully', () => {
    const result = jobSchema.safeParse(longJob)
    expect(result.success).toBe(true)
    if (!result.success) throw new Error(result.error.message)
    expect(result.data.id).toBe('job-long')
    expect(result.data.questions).toHaveLength(8)
  })

  it('parses short.json fully', () => {
    const result = jobSchema.safeParse(shortJob)
    expect(result.success).toBe(true)
    if (!result.success) throw new Error(result.error.message)
    expect(result.data.language).toBe('en')
    expect(result.data.questions).toHaveLength(3)
  })

  it('rejects a language outside de/en', () => {
    const result = jobSchema.safeParse({
      id: 'job-x',
      title: 'T',
      company: 'C',
      language: 'fr',
      questions: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects bad.json as a whole — recovering from it is normalize.ts, not the schema', () => {
    expect(jobSchema.safeParse(badJob).success).toBe(false)
  })
})

describe('questionSchema defaults', () => {
  it('defaults required to false and multiline to false on text', () => {
    const q = parseQuestionAs('text', {
      type: 'text',
      id: 'q1',
      question: 'Why us?',
    })
    expect(q.required).toBe(false)
    expect(q.multiline).toBe(false)
  })

  it('defaults min to 0 and max to 100000000 on numeric', () => {
    const q = parseQuestionAs('numeric', {
      type: 'numeric',
      id: 'q1',
      question: 'Salary?',
    })
    expect(q.min).toBe(0)
    expect(q.max).toBe(100000000)
  })

  it('defaults max_choices to 1 on select', () => {
    const q = parseQuestionAs('select', {
      type: 'select',
      id: 'q1',
      question: 'Pick one',
      options: [{ label: 'A', value: 'a' }],
    })
    expect(q.max_choices).toBe(1)
  })

  it('keeps explicit values over defaults', () => {
    const q = parseQuestionAs('numeric', {
      type: 'numeric',
      id: 'q1',
      question: 'Years of React?',
      required: true,
      min: 5,
      max: 50,
    })
    expect(q.required).toBe(true)
    expect(q.min).toBe(5)
    expect(q.max).toBe(50)
  })

  it('allows max_choices equal to or higher than the number of options', () => {
    const q = parseQuestionAs('select', {
      type: 'select',
      id: 'tech_stack',
      question: 'Which technologies have you used?',
      max_choices: 10,
      options: [
        { label: 'React', value: 'react' },
        { label: 'Vue', value: 'vue' },
      ],
    })
    expect(q.max_choices).toBe(10)
  })
})

describe('questionSchema rules', () => {
  it('parses must_be_true: false — rule-off semantics live in screening, not schema', () => {
    const q = parseQuestionAs('boolean', {
      type: 'boolean',
      id: 'q1',
      question: 'Remote ok?',
      must_be_true: false,
    })
    expect(q.must_be_true).toBe(false)
  })

  it('strips a rule from a type it is not allowed on (must_be_true on text)', () => {
    const q = parseQuestionAs('text', {
      type: 'text',
      id: 'country',
      question: 'Aktueller Wohnsitz (Land)',
      must_be_true: true,
    })
    expect(q).not.toHaveProperty('must_be_true')
  })

  it('rejects a malformed rule value on its allowed type — normalize pre-strips it via SCREENING_RULES before parsing', () => {
    const result = questionSchema.safeParse({
      type: 'numeric',
      id: 'q1',
      question: 'Years?',
      must_be_at_least: 'five',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an inverted numeric range (min > max)', () => {
    const result = questionSchema.safeParse({
      type: 'numeric',
      id: 'q1',
      question: 'Salary?',
      min: 50,
      max: 5,
    })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown question type (rating)', () => {
    const result = questionSchema.safeParse({
      type: 'rating',
      id: 'typescript_level',
      question: 'Rate your TypeScript.',
    })
    expect(result.success).toBe(false)
  })
})

describe('profileSchema', () => {
  it('parses profile.json', () => {
    const result = profileSchema.safeParse(profile)
    expect(result.success).toBe(true)
    if (!result.success) throw new Error(result.error.message)
    expect(result.data.salary_expectation.amount).toBe(95000)
    expect(result.data.notice_period).toBe('3_months')
    expect(result.data.languages).toContainEqual({
      language: 'de',
      level: 'B1',
    })
  })
})
