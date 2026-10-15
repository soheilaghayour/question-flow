import { describe, expect, it } from 'vitest'
import { buildPayload } from './payload'
import type { Job, Question } from './schema'

const job = (questions: Question[], overrides: Partial<Job> = {}): Job => ({
  id: 'job-long',
  title: 'T',
  company: 'C',
  language: 'en',
  questions,
  ...overrides,
})

const base = { required: false as const }

const text = (id: string): Question => ({
  ...base, type: 'text', id, question: 'Q?', multiline: false,
})
const numeric = (id: string): Question => ({
  ...base, type: 'numeric', id, question: 'Q?', min: 0, max: 100000000,
})
const boolean = (id: string): Question => ({
  ...base, type: 'boolean', id, question: 'Q?',
})
const select = (id: string, max_choices: number): Question => ({
  ...base, type: 'select', id, question: 'Q?', max_choices,
  options: [
    { label: 'Frontend', value: 'frontend' },
    { label: 'Design Systems', value: 'design_systems' },
  ],
})

const SCREENING_OK = { passed: true, failed: [] }

describe('buildPayload — envelope and scalar values (README example)', () => {
  it('emits job_id, one answer object per answered question, and screening verbatim', () => {
    const screening = { passed: false, failed: ['salary_expectation'] }
    const payload = buildPayload(
      job([text('notice_period'), numeric('salary_expectation')]),
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

  // Bite #1: shape follows max_choices, never the picked count.
  it('multi-select with ONE selection still uses values: ["x"]', () => {
    const payload = buildPayload(
      job([select('focus_areas', 3)]),
      { focus_areas: ['frontend'] },
      SCREENING_OK,
    )
    expect(payload.answers).toEqual([{ id: 'focus_areas', values: ['frontend'] }])
  })

  it('multi-select with several selections lists them all under values', () => {
    const payload = buildPayload(
      job([select('focus_areas', 3)]),
      { focus_areas: ['frontend', 'design_systems'] },
      SCREENING_OK,
    )
    expect(payload.answers).toEqual([
      { id: 'focus_areas', values: ['frontend', 'design_systems'] },
    ])
  })

  it('single-select uses value, not values', () => {
    const payload = buildPayload(
      job([select('focus_areas', 1)]),
      { focus_areas: 'frontend' },
      SCREENING_OK,
    )
    expect(payload.answers).toEqual([{ id: 'focus_areas', value: 'frontend' }])
  })

  // README: leave out optional questions that have no answer.
  it.each<[string, Question, Record<string, string | string[]>]>([
    ['no entry in answers', text('cover_note'), {}],
    ['empty text', text('cover_note'), { cover_note: '' }],
    ['whitespace-only text', text('cover_note'), { cover_note: '   \n\t' }],
    ['multi-select with nothing picked', select('focus_areas', 3), { focus_areas: [] }],
  ])('omits an optional question with %s', (_name, question, answers) => {
    const payload = buildPayload(job([question]), answers, SCREENING_OK)
    expect(payload.answers).toEqual([])
  })

  // README example: file answers nest { content_type, data, file_name } under value,
  // with data already plain base64 (fileToBase64 strips the data-URL prefix, bite #2).
  it('emits a file answer under value with the contract keys', () => {
    const file = {
      content_type: 'application/pdf',
      data: 'JVBERi0xLjcK',
      file_name: 'cover_letter.pdf',
    }
    const payload = buildPayload(
      job([{ ...base, type: 'file', id: 'cover_letter', question: 'Q?' }]),
      { cover_letter: file },
      SCREENING_OK,
    )
    expect(payload.answers).toEqual([{ id: 'cover_letter', value: file }])
  })

  it('emits a date answer as its YYYY-MM-DD string', () => {
    const payload = buildPayload(
      job([{ ...base, type: 'date', id: 'starting_date', question: 'Q?' }]),
      { starting_date: '2026-11-01' },
      SCREENING_OK,
    )
    expect(payload.answers).toEqual([{ id: 'starting_date', value: '2026-11-01' }])
  })

  // Bite #4: false is an answer, not an absence.
  it.each([true, false])('includes a boolean %s as a JSON boolean', (answer) => {
    const payload = buildPayload(
      job([boolean('eu_work_permit')]),
      { eu_work_permit: answer },
      SCREENING_OK,
    )
    expect(payload.answers).toEqual([{ id: 'eu_work_permit', value: answer }])
  })
})
