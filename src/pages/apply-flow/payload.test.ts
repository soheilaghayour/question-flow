import { describe, expect, it } from 'vitest'
import { buildPayload } from './payload'
import type { Question } from '@/data/schema'
import { boolean, date, file, job, numeric, select, text } from '@/test/testBuilders'

const focusAreas = (max_choices: number): Question =>
  select({
    id: 'focus_areas',
    max_choices,
    options: [
      { label: 'Frontend', value: 'frontend' },
      { label: 'Design Systems', value: 'design_systems' },
    ],
  })

const SCREENING_OK = { passed: true, failed: [] }

describe('buildPayload — envelope and scalar values (contract example)', () => {
  it('emits job_id, one answer object per answered question, and screening verbatim', () => {
    const screening = { passed: false, failed: ['salary_expectation'] }
    const payload = buildPayload(
      job([text({ id: 'notice_period' }), numeric({ id: 'salary_expectation' })]),
      { notice_period: '3_months', salary_expectation: 85000 },
      screening,
    )
    expect(payload).toEqual({
      job_id: 'job-long',
      answers: [
        { id: 'notice_period', value: '3_months' },
        { id: 'salary_expectation', value: 85000 },
      ],
      screening,
    })
  })

  // false is an answer, not an absence.
  it.each([true, false])('includes a boolean %s as a JSON boolean', (answer) => {
    const payload = buildPayload(
      job([boolean({ id: 'eu_work_permit' })]),
      { eu_work_permit: answer },
      SCREENING_OK,
    )
    expect(payload.answers).toEqual([{ id: 'eu_work_permit', value: answer }])
  })
})

describe('buildPayload — value vs values follows max_choices (bite #1)', () => {
  it('multi-select with ONE selection still uses values: ["x"]', () => {
    const payload = buildPayload(
      job([focusAreas(3)]),
      { focus_areas: ['frontend'] },
      SCREENING_OK,
    )
    expect(payload.answers).toEqual([{ id: 'focus_areas', values: ['frontend'] }])
  })

  it('multi-select with several selections lists them all under values', () => {
    const payload = buildPayload(
      job([focusAreas(3)]),
      { focus_areas: ['frontend', 'design_systems'] },
      SCREENING_OK,
    )
    expect(payload.answers).toEqual([
      { id: 'focus_areas', values: ['frontend', 'design_systems'] },
    ])
  })

  it('single-select uses value, not values', () => {
    const payload = buildPayload(
      job([focusAreas(1)]),
      { focus_areas: 'frontend' },
      SCREENING_OK,
    )
    expect(payload.answers).toEqual([{ id: 'focus_areas', value: 'frontend' }])
  })
})

describe('buildPayload — unanswered questions are left out (contract)', () => {
  it.each<[string, Question, Record<string, string | string[] | null>]>([
    ['no entry in answers', text({ id: 'cover_note' }), {}],
    ['empty text', text({ id: 'cover_note' }), { cover_note: '' }],
    ['whitespace-only text', text({ id: 'cover_note' }), { cover_note: '   \n\t' }],
    ['multi-select with nothing picked', focusAreas(3), { focus_areas: [] }],
    ['single-select stored as empty string', focusAreas(1), { focus_areas: '' }],
    // typeof null === 'object': a cleared file input must not ship "value": null.
    ['file input cleared to null', file({ id: 'cover_letter' }), { cover_letter: null }],
  ])('omits an optional question with %s', (_name, question, answers) => {
    const payload = buildPayload(job([question]), answers, SCREENING_OK)
    expect(payload.answers).toEqual([])
  })
})

describe('buildPayload — wrong-shape answers are omitted, never coerced (DECISIONS #19)', () => {
  // Each arm accepts only its own value type: a wiring bug must not put a
  // boolean on the wire for a numeric question, or vice versa.
  it.each<[string, Question, Record<string, number | boolean>]>([
    ['a boolean under a numeric question', numeric({ id: 'salary_expectation' }), { salary_expectation: true }],
    ['a number under a boolean question', boolean({ id: 'eu_work_permit' }), { eu_work_permit: 42 }],
  ])('omits %s', (_name, question, answers) => {
    const payload = buildPayload(job([question]), answers, SCREENING_OK)
    expect(payload.answers).toEqual([])
  })

  // contract: numbers are JSON numbers, integers only — a failed parse (NaN) or a
  // float is a wrong shape, and NaN would serialize to "value": null.
  it.each([[NaN], [85.5]])('omits a numeric answer of %s', (answer) => {
    const payload = buildPayload(
      job([numeric({ id: 'salary_expectation' })]),
      { salary_expectation: answer },
      SCREENING_OK,
    )
    expect(payload.answers).toEqual([])
  })
})

describe('buildPayload — text, date and file values', () => {
  it('emits text and date answers trimmed — padding never reaches the wire', () => {
    const payload = buildPayload(
      job([text({ id: 'cover_note' }), date({ id: 'starting_date' })]),
      { cover_note: '  Hello  ', starting_date: '2026-11-01 ' },
      SCREENING_OK,
    )
    expect(payload.answers).toEqual([
      { id: 'cover_note', value: 'Hello' },
      { id: 'starting_date', value: '2026-11-01' },
    ])
  })

  it('emits a date answer as its YYYY-MM-DD string', () => {
    const payload = buildPayload(
      job([date({ id: 'starting_date' })]),
      { starting_date: '2026-11-01' },
      SCREENING_OK,
    )
    expect(payload.answers).toEqual([{ id: 'starting_date', value: '2026-11-01' }])
  })

  // contract example: file answers nest { content_type, data, file_name } under value,
  // with data already plain base64 (fileToBase64 strips the data-URL prefix).
  it('emits a file answer under value with the contract keys', () => {
    const fileValue = {
      content_type: 'application/pdf',
      data: 'JVBERi0xLjcK',
      file_name: 'cover_letter.pdf',
    }
    const payload = buildPayload(
      job([file({ id: 'cover_letter' })]),
      { cover_letter: fileValue },
      SCREENING_OK,
    )
    expect(payload.answers).toEqual([{ id: 'cover_letter', value: fileValue }])
  })
})
