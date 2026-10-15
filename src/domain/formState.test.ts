import { describe, expect, it } from 'vitest'
import * as build from './testBuilders'
import {
  answerChanged,
  createFormState,
  missingRequired,
  submitAttempted,
} from './formState'

describe('form state transitions', () => {
  it('starts from the initial answers without a submit attempt', () => {
    const state = createFormState({ salary: 95000 })
    expect(state.answers).toEqual({ salary: 95000 })
    expect(state.submitAttempted).toBe(false)
  })

  it('answerChanged stores the new value without touching other answers', () => {
    const state = createFormState({ salary: 95000 })
    const next = answerChanged(state, 'city', 'Berlin')
    expect(next.answers).toEqual({ salary: 95000, city: 'Berlin' })
  })

  it('answerChanged stores null as "answer cleared"', () => {
    const state = createFormState({ salary: 95000 })
    expect(answerChanged(state, 'salary', null).answers.salary).toBeNull()
  })

  it('transitions are pure — the previous state is untouched', () => {
    const state = createFormState({ salary: 95000 })
    answerChanged(state, 'salary', 1)
    submitAttempted(state)
    expect(state.answers.salary).toBe(95000)
    expect(state.submitAttempted).toBe(false)
  })

  it('submitAttempted flips the flag and keeps the answers', () => {
    const next = submitAttempted(createFormState({ salary: 95000 }))
    expect(next.submitAttempted).toBe(true)
    expect(next.answers).toEqual({ salary: 95000 })
  })
})

describe('missingRequired', () => {
  const questions = [
    build.text({ id: 'why', required: true }),
    build.boolean({ id: 'permit', required: true }),
    build.text({ id: 'extra', required: false }),
  ]

  it('lists required questions without an answer, in question order', () => {
    expect(missingRequired(questions, {})).toEqual(['why', 'permit'])
  })

  it('never lists optional questions, answered or not', () => {
    expect(missingRequired(questions, { why: 'x', permit: true })).toEqual([])
  })

  it('treats false as a real answer — a required boolean has no default', () => {
    expect(missingRequired(questions, { why: 'x', permit: false })).toEqual([])
  })

  it('treats null, whitespace-only text and an empty pick list as missing', () => {
    const multi = [
      build.text({ id: 'why', required: true }),
      build.select({ id: 'areas', required: true, max_choices: 2 }),
    ]
    expect(missingRequired(multi, { why: '   ', areas: [] })).toEqual(['why', 'areas'])
    expect(missingRequired(multi, { why: null, areas: null })).toEqual(['why', 'areas'])
  })
})
