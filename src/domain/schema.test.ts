import { describe, expect, it } from 'vitest'
import longJob from '../../jobs/long.json'
import shortJob from '../../jobs/short.json'
import badJob from '../../jobs/bad.json'
import profile from '../../profile.json'
import {
  jobSchema,
  profileSchema,
  questionSchema,
} from './schema'

describe('jobSchema', () => {
  it('parses long.json fully', () => {
    const result = jobSchema.safeParse(longJob)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe('job-long')
      expect(result.data.questions).toHaveLength(8)
    }
  })

  it('parses short.json fully', () => {
    const result = jobSchema.safeParse(shortJob)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.language).toBe('en')
      expect(result.data.questions).toHaveLength(3)
    }
  })

  it('rejects bad.json as a whole — recovering from it is normalize.ts, not the schema', () => {
    expect(jobSchema.safeParse(badJob).success).toBe(false)
  })
})

describe('questionSchema defaults', () => {
  it('defaults required to false and multiline to false on text', () => {
    const result = questionSchema.safeParse({
      type: 'text',
      id: 'q1',
      question: 'Why us?',
    })
    expect(result.success).toBe(true)
    if (result.success && result.data.type === 'text') {
      expect(result.data.required).toBe(false)
      expect(result.data.multiline).toBe(false)
    }
  })

  it('defaults min to 0 and max to 100000000 on numeric', () => {
    const result = questionSchema.safeParse({
      type: 'numeric',
      id: 'q1',
      question: 'Salary?',
    })
    expect(result.success).toBe(true)
    if (result.success && result.data.type === 'numeric') {
      expect(result.data.min).toBe(0)
      expect(result.data.max).toBe(100000000)
    }
  })

  it('defaults max_choices to 1 on select', () => {
    const result = questionSchema.safeParse({
      type: 'select',
      id: 'q1',
      question: 'Pick one',
      options: [{ label: 'A', value: 'a' }],
    })
    expect(result.success).toBe(true)
    if (result.success && result.data.type === 'select') {
      expect(result.data.max_choices).toBe(1)
    }
  })

  it('keeps explicit values over defaults', () => {
    const result = questionSchema.safeParse({
      type: 'numeric',
      id: 'q1',
      question: 'Years of React?',
      required: true,
      min: 5,
      max: 50,
    })
    expect(result.success).toBe(true)
    if (result.success && result.data.type === 'numeric') {
      expect(result.data.required).toBe(true)
      expect(result.data.min).toBe(5)
      expect(result.data.max).toBe(50)
    }
  })
})

describe('questionSchema rules', () => {
  it('parses must_be_true: false — rule-off semantics live in screening, not schema', () => {
    const result = questionSchema.safeParse({
      type: 'boolean',
      id: 'q1',
      question: 'Remote ok?',
      must_be_true: false,
    })
    expect(result.success).toBe(true)
    if (result.success && result.data.type === 'boolean') {
      expect(result.data.must_be_true).toBe(false)
    }
  })

  it('strips a rule from a type it is not allowed on (must_be_true on text)', () => {
    const result = questionSchema.safeParse({
      type: 'text',
      id: 'country',
      question: 'Aktueller Wohnsitz (Land)',
      must_be_true: true,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty('must_be_true')
    }
  })

  it('rejects a numeric rule whose value is not an integer', () => {
    const result = questionSchema.safeParse({
      type: 'numeric',
      id: 'q1',
      question: 'Years?',
      must_be_at_least: 'five',
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
    if (result.success) {
      expect(result.data.salary_expectation.amount).toBe(95000)
      expect(result.data.notice_period).toBe('3_months')
      expect(result.data.languages).toContainEqual({
        language: 'de',
        level: 'B1',
      })
    }
  })
})
