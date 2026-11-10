import { describe, expect, it } from 'vitest'
import badJob from '@jobs/bad.json'
import edgeCasesJob from '@jobs/edge-cases.json'
import { normalizeJob, type NormalizeResult } from './normalize'
import type { Job } from './schema'

const jobFields = { id: 'job-x', title: 'T', company: 'C', language: 'en' }

function rawJob(questions: unknown[]): unknown {
  return { ...jobFields, questions }
}

// Throws on the error branch so each test asserts against the job directly.
function expectJob(result: NormalizeResult): {
  job: Job
  warnings: { questionId: string; reason: string }[]
} {
  if ('error' in result) throw new Error(`expected job, got error: ${result.error}`)
  return result
}

describe('normalizeJob — valid input passes through', () => {
  it('returns the job with schema defaults applied and no warnings', () => {
    const result = expectJob(
      normalizeJob(
        rawJob([{ type: 'text', id: 'q1', question: 'Why us?' }]),
      ),
    )
    expect(result.warnings).toEqual([])
    expect(result.job.id).toBe('job-x')
    expect(result.job.questions).toEqual([
      { type: 'text', id: 'q1', question: 'Why us?', required: false, multiline: false },
    ])
  })
})

describe('normalizeJob — question-level drops', () => {
  const valid = { type: 'text', id: 'keep', question: 'Keep me' }

  it.each([
    ['missing id', { type: 'text', question: 'No id' }],
    ['missing question', { type: 'text', id: 'broken' }],
    ['missing type', { id: 'broken', question: 'No type' }],
    ['unknown type', { type: 'rating', id: 'broken', question: 'Rate us' }],
    ['not an object', 'just a string'],
  ])('drops a question with %s, keeps the rest, warns', (_name, broken) => {
    const result = expectJob(normalizeJob(rawJob([broken, valid])))
    expect(result.job.questions.map((q) => q.id)).toEqual(['keep'])
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0].reason).toBeTruthy()
  })

  it('drops a select whose options all turn out malformed', () => {
    const result = expectJob(
      normalizeJob(
        rawJob([
          {
            type: 'select',
            id: 'empty_select',
            question: 'Pick one',
            options: [{ label: 'No value' }, { value: '' }],
          },
          valid,
        ]),
      ),
    )
    expect(result.job.questions.map((q) => q.id)).toEqual(['keep'])
    // two malformed options + the resulting empty select
    expect(result.warnings).toHaveLength(3)
    expect(result.warnings.every((w) => w.questionId === 'empty_select')).toBe(true)
  })

  it('drops a question that fails its type schema (inverted min/max)', () => {
    const result = expectJob(
      normalizeJob(
        rawJob([
          { type: 'numeric', id: 'inverted', question: 'Years?', min: 10, max: 5 },
          valid,
        ]),
      ),
    )
    expect(result.job.questions.map((q) => q.id)).toEqual(['keep'])
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0].questionId).toBe('inverted')
  })
})

describe('normalizeJob — option cleaning (keeps the question)', () => {
  it('drops a malformed option and keeps the valid ones, with a warning', () => {
    const result = expectJob(
      normalizeJob(
        rawJob([
          {
            type: 'select',
            id: 'city',
            question: 'City?',
            options: [
              { label: 'Berlin', value: 'berlin' },
              { label: 'Broken' },
              { label: 'Hamburg', value: 'hamburg' },
            ],
          },
        ]),
      ),
    )
    const question = result.job.questions[0]
    if (question.type !== 'select') throw new Error('expected select')
    expect(question.options.map((o) => o.value)).toEqual(['berlin', 'hamburg'])
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0].questionId).toBe('city')
  })

  it('keeps the first option on duplicate values and warns', () => {
    const result = expectJob(
      normalizeJob(
        rawJob([
          {
            type: 'select',
            id: 'city',
            question: 'City?',
            options: [
              { label: 'Berlin', value: 'berlin' },
              { label: 'Berlin (Mitte)', value: 'berlin' },
            ],
          },
        ]),
      ),
    )
    const question = result.job.questions[0]
    if (question.type !== 'select') throw new Error('expected select')
    expect(question.options).toEqual([{ label: 'Berlin', value: 'berlin' }])
    expect(result.warnings).toHaveLength(1)
  })
})

describe('normalizeJob — screening rule cleaning (keeps the question)', () => {
  it('strips a rule sitting on a disallowed type and warns (must_be_true on text)', () => {
    const result = expectJob(
      normalizeJob(
        rawJob([
          { type: 'text', id: 'country', question: 'Country?', must_be_true: true },
        ]),
      ),
    )
    expect(result.job.questions.map((q) => q.id)).toEqual(['country'])
    expect(result.job.questions[0]).not.toHaveProperty('must_be_true')
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0].questionId).toBe('country')
  })

  it('drops a rule whose value fails its documented type, keeps the question', () => {
    const result = expectJob(
      normalizeJob(
        rawJob([
          {
            type: 'numeric',
            id: 'salary',
            question: 'Salary?',
            must_be_at_least: 'five',
            must_be_below: 90000,
          },
        ]),
      ),
    )
    const question = result.job.questions[0]
    if (question.type !== 'numeric') throw new Error('expected numeric')
    expect(question.must_be_at_least).toBeUndefined()
    expect(question.must_be_below).toBe(90000)
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0].questionId).toBe('salary')
  })

  it('treats must_be_true: false as rule-off — no warning (DECISIONS #10)', () => {
    const result = expectJob(
      normalizeJob(
        rawJob([
          { type: 'boolean', id: 'remote', question: 'Remote ok?', must_be_true: false },
        ]),
      ),
    )
    expect(result.job.questions.map((q) => q.id)).toEqual(['remote'])
    expect(result.warnings).toEqual([])
  })
})

describe('normalizeJob — duplicate IDs (drop invalid first, then dedupe)', () => {
  it('keeps the first survivor on duplicate IDs and warns', () => {
    const result = expectJob(
      normalizeJob(
        rawJob([
          { type: 'text', id: 'dup', question: 'First' },
          { type: 'text', id: 'dup', question: 'Second' },
        ]),
      ),
    )
    expect(result.job.questions).toHaveLength(1)
    expect(result.job.questions[0].question).toBe('First')
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0].questionId).toBe('dup')
  })

  it('an invalid first occurrence does not shadow a valid later one', () => {
    const result = expectJob(
      normalizeJob(
        rawJob([
          { type: 'rating', id: 'dup', question: 'Invalid first' },
          { type: 'text', id: 'dup', question: 'Valid second' },
        ]),
      ),
    )
    expect(result.job.questions).toHaveLength(1)
    expect(result.job.questions[0].question).toBe('Valid second')
    // only the unknown-type drop warns; the survivor is not a "duplicate"
    expect(result.warnings).toHaveLength(1)
  })
})

describe('normalizeJob — job-level errors', () => {
  it.each([
    ['not an object', null],
    ['missing id', { title: 'T', company: 'C', language: 'en', questions: [] }],
    ['no questions array', { ...jobFields }],
  ])('returns an error result for a job with %s', (_name, raw) => {
    const result = normalizeJob(raw)
    expect('error' in result && result.error.length > 0).toBe(true)
  })

  it('returns an error result when zero questions survive', () => {
    const result = normalizeJob(
      rawJob([{ type: 'rating', id: 'q1', question: 'Unknown type' }]),
    )
    expect('error' in result && result.error.length > 0).toBe(true)
  })
})

describe('normalizeJob — question text over 255 chars', () => {
  it('keeps the question and only warns', () => {
    const longText = 'x'.repeat(256)
    const result = expectJob(
      normalizeJob(rawJob([{ type: 'text', id: 'long', question: longText }])),
    )
    expect(result.job.questions.map((q) => q.id)).toEqual(['long'])
    expect(result.job.questions[0].question).toBe(longText)
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0].questionId).toBe('long')
  })
})

describe('normalizeJob — bad.json acceptance (issue V1-03)', () => {
  const result = expectJob(normalizeJob(badJob))

  it('duplicate notice_period: the first (select) wins', () => {
    const noticePeriods = result.job.questions.filter((q) => q.id === 'notice_period')
    expect(noticePeriods).toHaveLength(1)
    expect(noticePeriods[0].type).toBe('select')
  })

  it('drops the unknown rating type', () => {
    expect(result.job.questions.find((q) => q.id === 'typescript_level')).toBeUndefined()
  })

  it('ignores must_be_true on the text question but keeps it', () => {
    const country = result.job.questions.find((q) => q.id === 'country')
    expect(country?.type).toBe('text')
    expect(country).not.toHaveProperty('must_be_true')
  })

  it('emits exactly the three expected warnings', () => {
    expect(result.warnings.map((w) => w.questionId).sort()).toEqual([
      'country',
      'notice_period',
      'typescript_level',
    ])
  })

  it('keeps the 12 valid questions', () => {
    expect(result.job.questions).toHaveLength(12)
  })
})

describe('normalizeJob — edge-cases.json covers every policy rule', () => {
  const result = expectJob(normalizeJob(edgeCasesJob))

  it('exactly the survivors survive, in config order', () => {
    expect(result.job.questions.map((q) => q.id)).toEqual([
      'shadowed',
      'plain_dup',
      'messy_options',
      'misplaced_rule',
      'bad_rule_value',
      'rule_off',
      'long_text',
    ])
  })

  it('order matters: the valid later "shadowed" survives, not the invalid first', () => {
    const shadowed = result.job.questions.find((q) => q.id === 'shadowed')
    expect(shadowed?.question).toBe('Valid later occurrence — must survive')
  })

  it('plain duplicate: the first valid occurrence wins', () => {
    const dup = result.job.questions.find((q) => q.id === 'plain_dup')
    expect(dup?.question).toBe('First valid occurrence wins')
  })

  it('cleans options: malformed and duplicate values gone, first wins', () => {
    const messy = result.job.questions.find((q) => q.id === 'messy_options')
    if (messy?.type !== 'select') throw new Error('expected select')
    expect(messy.options.map((o) => o.value)).toEqual(['berlin', 'hamburg'])
  })

  it('keeps the valid rule next to the dropped one', () => {
    const question = result.job.questions.find((q) => q.id === 'bad_rule_value')
    if (question?.type !== 'numeric') throw new Error('expected numeric')
    expect(question.must_be_at_least).toBeUndefined()
    expect(question.must_be_below).toBe(90000)
  })

  it('must_be_true: false stays rule-off without a warning', () => {
    expect(result.warnings.find((w) => w.questionId === 'rule_off')).toBeUndefined()
  })

  it('every drop and cleanup left a warning (14 total)', () => {
    expect(result.warnings).toHaveLength(14)
  })
})
