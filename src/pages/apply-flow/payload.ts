import { assertNever } from './assertNever'
import { hasAnswer } from './answers'
import type { Job, Question } from '@/data/schema'
import type { ScreeningResult } from './screening'

/** A file already converted for the contract: plain base64 `data`, no data-URL prefix (bite #2). */
export interface FileAnswerValue {
  content_type: string
  data: string
  file_name: string
}

export type AnswerValue = string | number | boolean | string[] | FileAnswerValue

/** Form state at submit: question id → answer value. A cleared input may
 * legitimately hold null; both nullish values mean "no answer". */
export type Answers = Record<string, AnswerValue | null | undefined>

/** One item in the payload's `answers` array. */
export type PayloadEntry =
  | { id: string; value: string | number | boolean | FileAnswerValue }
  | { id: string; values: string[] }

/** The whole submitted payload (contract). */
export interface ApplicationPayload {
  job_id: string
  answers: PayloadEntry[]
  screening: ScreeningResult
}

// Each arm accepts only its own value type: payload is the last line before
// the wire, so a wrong-shape value is omitted, never coerced.
function toPayloadEntry(question: Question, value: AnswerValue): PayloadEntry | undefined {
  switch (question.type) {
    case 'select':
      // Shape follows max_choices, never the picked count (bite #1).
      if (question.max_choices > 1)
        return Array.isArray(value) && hasAnswer(value)
          ? { id: question.id, values: value }
          : undefined
      return typeof value === 'string' && hasAnswer(value)
        ? { id: question.id, value }
        : undefined
    case 'text':
    case 'date':
      // Padding never reaches the wire — dates must be exactly YYYY-MM-DD.
      return typeof value === 'string' && hasAnswer(value)
        ? { id: question.id, value: value.trim() }
        : undefined
    case 'numeric':
      // Integers only (contract) — and NaN would serialize to "value": null.
      return typeof value === 'number' && Number.isInteger(value)
        ? { id: question.id, value }
        : undefined
    case 'boolean':
      return typeof value === 'boolean' ? { id: question.id, value } : undefined
    case 'file':
      return typeof value === 'object' && !Array.isArray(value)
        ? { id: question.id, value }
        : undefined
    default:
      // A question type added to the schema but not handled here must fail to
      // compile, not silently drop every answer of that type.
      return assertNever(question)
  }
}

/** Builds the exact contract payload from the normalized job and submitted answers. */
export function buildPayload(
  job: Job,
  answers: Answers,
  screening: ScreeningResult,
): ApplicationPayload {
  const payloadAnswers = job.questions.flatMap((question) => {
    const value = answers[question.id]
    const entry = value == null ? undefined : toPayloadEntry(question, value)
    return entry ? [entry] : []
  })
  return { job_id: job.id, answers: payloadAnswers, screening }
}
