import { describe, expect, it } from 'vitest'
import { normalizeJob } from './normalize'
import { evaluateScreening } from './screening'
import type { BooleanQuestion, NumericQuestion } from './schema'

const boolean = (overrides: Partial<BooleanQuestion> = {}): BooleanQuestion => ({
  type: 'boolean',
  id: 'q',
  question: 'Q?',
  required: false,
  ...overrides,
})

const numeric = (overrides: Partial<NumericQuestion> = {}): NumericQuestion => ({
  type: 'numeric',
  id: 'q',
  question: 'Q?',
  required: false,
  min: 0,
  max: 100000000,
  ...overrides,
})

describe('evaluateScreening — numeric boundaries', () => {
  // README: must_be_at_least passes on >= (bite #5: at_least is inclusive).
  it.each([
    [3, true],
    [2, false],
  ])('must_be_at_least: 3 — answer %d → passed %s', (answer, passed) => {
    const result = evaluateScreening([numeric({ must_be_at_least: 3 })], { q: answer })
    expect(result).toEqual({ passed, failed: passed ? [] : ['q'] })
  })

  // README: must_be_below is strict < (bite #5: the threshold itself fails).
  it.each([
    [89999, true],
    [90000, false],
    [95000, false],
  ])('must_be_below: 90000 — answer %d → passed %s', (answer, passed) => {
    const result = evaluateScreening([numeric({ must_be_below: 90000 })], { q: answer })
    expect(result).toEqual({ passed, failed: passed ? [] : ['q'] })
  })
})

describe('evaluateScreening — must_be_true', () => {
  it.each<[string, Record<string, unknown>, boolean]>([
    ['true passes', { q: true }, true],
    ['false fails — false is an answer, not a default (bite #4)', { q: false }, false],
    ['missing fails', {}, false],
  ])('must_be_true: true — %s', (_name, answers, passed) => {
    const result = evaluateScreening([boolean({ must_be_true: true })], answers)
    expect(result).toEqual({ passed, failed: passed ? [] : ['q'] })
  })

  // DECISIONS #10: a configured value of false means "rule off", not "must be false".
  it.each<[Record<string, unknown>]>([[{ q: true }], [{ q: false }]])(
    'must_be_true: false — rule not evaluated, %o passes',
    (answers) => {
      expect(evaluateScreening([boolean({ must_be_true: false })], answers)).toEqual({
        passed: true,
        failed: [],
      })
    },
  )
})

describe('evaluateScreening — missing answers (bite #6)', () => {
  it('optional question with a rule and no answer → rule fails', () => {
    const question = numeric({ required: false, must_be_at_least: 3 })
    expect(evaluateScreening([question], {})).toEqual({ passed: false, failed: ['q'] })
  })

  it('a question without rules passes even unanswered', () => {
    expect(evaluateScreening([numeric(), boolean()], {})).toEqual({
      passed: true,
      failed: [],
    })
  })
})

describe('evaluateScreening — normalize is the gate for misplaced rules', () => {
  // README: a rule on a type it is not allowed on is ignored. normalize strips it,
  // so this unanswered text question must not fail screening.
  it('a rule on a disallowed type never reaches screening', () => {
    const result = normalizeJob({
      id: 'job-guard',
      title: 'T',
      company: 'C',
      language: 'en',
      questions: [{ id: 'q', question: 'Q?', type: 'text', must_be_at_least: 3 }],
    })
    if ('error' in result) throw new Error(result.error)
    expect(evaluateScreening(result.job.questions, {})).toEqual({
      passed: true,
      failed: [],
    })
  })
})
