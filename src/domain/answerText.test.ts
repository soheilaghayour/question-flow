import { describe, expect, it } from 'vitest'
import * as build from './testBuilders'
import { answerText } from './answerText'

const labels = { yes: 'Yes', no: 'No', missing: 'Not answered', locale: 'en' }

describe('answerText', () => {
  it('renders booleans as words — false is an answer, not a gap', () => {
    const question = build.boolean()
    expect(answerText(question, true, labels)).toBe('Yes')
    expect(answerText(question, false, labels)).toBe('No')
  })

  it('falls back to String for a cross-typed boolean instead of inventing a Yes', () => {
    // payload.ts drops a non-boolean from the wire; the review must not show
    // a confirmed "Yes" for an answer that will never be submitted.
    expect(answerText(build.boolean(), 'x', labels)).toBe('x')
  })

  it('shows option labels, never wire values, joining multi-select picks', () => {
    const question = build.select({
      max_choices: 2,
      options: [
        { label: '3 months', value: '3_months' },
        { label: 'Immediately', value: 'immediately' },
      ],
    })
    expect(answerText(question, '3_months', labels)).toBe('3 months')
    expect(answerText(question, ['3_months', 'immediately'], labels)).toBe('3 months, Immediately')
    expect(answerText(question, 'unknown', labels)).toBe('unknown')
  })

  it('formats dates for the UI locale, not the YYYY-MM-DD wire format', () => {
    const question = build.date()
    expect(answerText(question, '2027-01-01', labels)).toBe('1/1/2027')
    expect(answerText(question, '2027-01-01', { ...labels, locale: 'de' })).toBe('1.1.2027')
  })

  it('shows the file name for file answers', () => {
    const value = { file_name: 'cv.pdf', content_type: 'application/pdf', data: 'aGk=' }
    expect(answerText(build.file(), value, labels)).toBe('cv.pdf')
  })

  it('labels null, whitespace-only text and empty pick lists as missing', () => {
    expect(answerText(build.text(), null, labels)).toBe('Not answered')
    expect(answerText(build.text(), '   ', labels)).toBe('Not answered')
    expect(answerText(build.select({ max_choices: 2 }), [], labels)).toBe('Not answered')
  })
})
