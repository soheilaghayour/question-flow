import { describe, expect, it } from 'vitest'
import * as build from './testBuilders'
import { buildSteps } from './wizard'

describe('buildSteps', () => {
  const questions = [
    build.select({ id: 'notice' }),
    build.boolean({ id: 'permit' }),
    build.numeric({ id: 'salary' }),
    build.date({ id: 'start' }),
    build.text({ id: 'why' }),
    build.select({ id: 'areas', max_choices: 2 }),
  ]

  it('pulls prefilled questions into one leading step, then chunks the rest by 3', () => {
    // Prefill answered notice and salary — non-adjacent, pulled together up front.
    const steps = buildSteps(questions, { notice: '3_months', salary: 95000 })
    expect(steps.map((s) => ({ prefilled: s.prefilled, ids: s.questions.map((q) => q.id) }))).toEqual([
      { prefilled: true, ids: ['notice', 'salary'] },
      { prefilled: false, ids: ['permit', 'start', 'why'] },
      { prefilled: false, ids: ['areas'] },
    ])
  })

  it('has no prefill step when nothing is prefilled', () => {
    const steps = buildSteps(questions, {})
    expect(steps.map((s) => s.questions.map((q) => q.id))).toEqual([
      ['notice', 'permit', 'salary'],
      ['start', 'why', 'areas'],
    ])
    expect(steps.every((s) => !s.prefilled)).toBe(true)
  })

  it('is a single prefill step when everything is prefilled', () => {
    const answers = {
      notice: '3_months',
      permit: false, // false is an answer (bite #4)
      salary: 95000,
      start: '2027-01-01',
      why: 'x',
      areas: ['a'],
    }
    expect(buildSteps(questions, answers)).toEqual([{ prefilled: true, questions }])
  })

  it('treats whitespace-only text and an empty pick list as not prefilled', () => {
    const steps = buildSteps(questions, { why: '   ', areas: [] })
    expect(steps[0].prefilled).toBe(false)
    expect(steps[0].questions.map((q) => q.id)).toEqual(['notice', 'permit', 'salary'])
  })
})
