import type {
  BooleanQuestion,
  DateQuestion,
  FileQuestion,
  Job,
  NumericQuestion,
  Question,
  SelectQuestion,
  TextQuestion,
} from '@/data/schema'

/** Test-only builders: one fully-normalized value per type, override what the test
 * cares about. Single owner of the full question shape — when a schema default
 * changes, it changes here, not in every test file. */

const base = { id: 'q', question: 'Q?', required: false }

export const text = (overrides: Partial<TextQuestion> = {}): TextQuestion => ({
  ...base,
  type: 'text',
  multiline: false,
  ...overrides,
})

export const date = (overrides: Partial<DateQuestion> = {}): DateQuestion => ({
  ...base,
  type: 'date',
  ...overrides,
})

export const boolean = (overrides: Partial<BooleanQuestion> = {}): BooleanQuestion => ({
  ...base,
  type: 'boolean',
  ...overrides,
})

export const numeric = (overrides: Partial<NumericQuestion> = {}): NumericQuestion => ({
  ...base,
  type: 'numeric',
  min: 0,
  max: 100000000,
  ...overrides,
})

export const select = (overrides: Partial<SelectQuestion> = {}): SelectQuestion => ({
  ...base,
  type: 'select',
  max_choices: 1,
  options: [{ label: 'B1', value: 'B1' }],
  ...overrides,
})

export const file = (overrides: Partial<FileQuestion> = {}): FileQuestion => ({
  ...base,
  type: 'file',
  ...overrides,
})

export const job = (questions: Question[], overrides: Partial<Job> = {}): Job => ({
  id: 'job-long',
  title: 'T',
  company: 'C',
  language: 'en',
  questions,
  ...overrides,
})
