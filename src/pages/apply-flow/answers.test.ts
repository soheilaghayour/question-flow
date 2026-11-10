import { describe, expect, it } from 'vitest'
import * as build from '@/test/testBuilders'
import { missingRequired } from './answers'

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
