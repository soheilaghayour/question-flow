import type { z } from 'zod'
import {
  booleanQuestionSchema,
  dateQuestionSchema,
  fileQuestionSchema,
  jobSchema,
  numericQuestionSchema,
  QUESTION_TEXT_MAX_LENGTH,
  SCREENING_RULES,
  selectOptionSchema,
  selectQuestionSchema,
  textQuestionSchema,
  type Job,
  type Question,
  type SelectOption,
  type QuestionType,
} from './schema'

export type NormalizeWarning = { questionId: string; reason: string }

export type NormalizeResult = { job: Job; warnings: NormalizeWarning[] } | { error: string }

/** `satisfies` keeps this registry in lockstep with the QuestionType union. */
const QUESTION_SCHEMAS = {
  text: textQuestionSchema,
  date: dateQuestionSchema,
  boolean: booleanQuestionSchema,
  numeric: numericQuestionSchema,
  select: selectQuestionSchema,
  file: fileQuestionSchema,
} satisfies Record<QuestionType, z.ZodType<Question>>

const jobFieldsSchema = jobSchema.omit({ questions: true })

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

type AddWarning = (questionId: string, reason: string) => void

/** Returns a copy of the question without misplaced or invalid screening rules, warning for each. */
function sanitizeScreeningRules(
  rawQuestion: Record<string, unknown>,
  type: QuestionType,
  questionId: string,
  addWarning: AddWarning,
) {
  // Shallow copy: cleaning deletes keys, and the input is an imported JSON module.
  const candidateQuestion = { ...rawQuestion }
  for (const [name, rule] of Object.entries(SCREENING_RULES)) {
    if (!(name in candidateQuestion)) continue
    if (rule.allowedOn !== type) {
      delete candidateQuestion[name]
      addWarning(questionId, `rule "${name}" is not allowed on type "${type}" — ignored`)
    } else if (!rule.valueSchema.safeParse(candidateQuestion[name]).success) {
      delete candidateQuestion[name]
      addWarning(questionId, `rule "${name}" has an invalid value — ignored`)
    }
  }
  return candidateQuestion
}

/** Returns the valid select options with duplicate values removed, warning for each drop. */
function sanitizeSelectOptions(
  rawOptions: unknown[],
  questionId: string,
  addWarning: AddWarning,
) {
  const seenValues = new Set<string>()
  const options: SelectOption[] = []
  for (const rawOption of rawOptions) {
    const option = selectOptionSchema.safeParse(rawOption)
    if (!option.success) {
      addWarning(questionId, 'malformed option dropped')
      continue
    }
    if (seenValues.has(option.data.value)) {
      addWarning(questionId, `duplicate option value "${option.data.value}" — first wins`)
      continue
    }
    seenValues.add(option.data.value)
    options.push(option.data)
  }
  return options
}

/** Validates one raw question, returning null when it is dropped. */
function normalizeQuestion(
  rawQuestion: unknown,
  index: number,
  addWarning: AddWarning,
): Question | null {
  const fallbackId = `questions[${index}]`

  if (!isRecord(rawQuestion)) {
    addWarning(fallbackId, 'question is not an object')
    return null
  }

  const questionId = isNonEmptyString(rawQuestion.id) ? rawQuestion.id : fallbackId

  if (
    !isNonEmptyString(rawQuestion.id) ||
    !isNonEmptyString(rawQuestion.question) ||
    !isNonEmptyString(rawQuestion.type)
  ) {
    addWarning(questionId, 'missing id, question or type')
    return null
  }

  if (!(rawQuestion.type in QUESTION_SCHEMAS)) {
    addWarning(questionId, `unknown question type "${rawQuestion.type}"`)
    return null
  }
  const type = rawQuestion.type as QuestionType

  // Clean rules before the strict parse: zod would silently strip a misplaced rule or reject the whole question over one bad value (D10).
  const candidateQuestion = sanitizeScreeningRules(rawQuestion, type, questionId, addWarning)

  if (type === 'select' && Array.isArray(candidateQuestion.options)) {
    const options = sanitizeSelectOptions(candidateQuestion.options, questionId, addWarning)
    if (options.length === 0) {
      addWarning(questionId, 'no valid options left — question dropped')
      return null
    }
    candidateQuestion.options = options
  }

  if (rawQuestion.question.length > QUESTION_TEXT_MAX_LENGTH) {
    addWarning(questionId, `question text exceeds ${QUESTION_TEXT_MAX_LENGTH} characters`)
  }

  const parsed = QUESTION_SCHEMAS[type].safeParse(candidateQuestion)
  if (!parsed.success) {
    addWarning(
      questionId,
      `invalid question: ${parsed.error.issues.map((i) => i.message).join('; ')}`,
    )
    return null
  }
  return parsed.data
}

/** Keeps the first question per ID, warning for each later duplicate. */
function dedupeQuestions(questions: Question[], addWarning: AddWarning) {
  const seenIds = new Set<string>()
  return questions.filter((question) => {
    if (seenIds.has(question.id)) {
      addWarning(question.id, 'duplicate question id — first wins')
      return false
    }
    seenIds.add(question.id)
    return true
  })
}

/**
 * Validates a raw job config question by question, so one broken question
 * never rejects the whole job.
 */
export function normalizeJob(rawJob: unknown): NormalizeResult {
  if (!isRecord(rawJob)) return { error: 'job config is not an object' }

  const parsedJobFields = jobFieldsSchema.safeParse(rawJob)
  if (!parsedJobFields.success) return { error: `invalid job: ${parsedJobFields.error.message}` }
  if (!Array.isArray(rawJob.questions)) return { error: 'job has no questions array' }

  const warnings: NormalizeWarning[] = []
  const addWarning: AddWarning = (questionId, reason) => {
    warnings.push({ questionId, reason })
  }

  const questions = rawJob.questions
    .map((rawQuestion: unknown, index) => normalizeQuestion(rawQuestion, index, addWarning))
    .filter((question) => question !== null)

  // Dedupe after dropping invalid questions, so an ignored question never shadows a valid one (D10).
  const deduped = dedupeQuestions(questions, addWarning)

  if (deduped.length === 0) return { error: 'job has no valid questions' }

  return { job: { ...parsedJobFields.data, questions: deduped }, warnings }
}
