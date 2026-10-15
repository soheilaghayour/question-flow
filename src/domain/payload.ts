import type { Job, Question } from './schema'
import type { ScreeningResult } from './screening'

/** A file already converted for the contract: plain base64 `data`, no data-URL prefix (bite #2). */
export interface FileAnswerValue {
  content_type: string
  data: string
  file_name: string
}

export type AnswerValue = string | number | boolean | string[] | FileAnswerValue

/** Form state at submit: question id → answer value. */
export type Answers = Record<string, AnswerValue | undefined>

export type PayloadAnswer =
  | { id: string; value: string | number | boolean | FileAnswerValue }
  | { id: string; values: string[] }

export interface AnswerPayload {
  job_id: string
  answers: PayloadAnswer[]
  screening: ScreeningResult
}

function toPayloadAnswer(
  question: Question,
  value: AnswerValue,
): PayloadAnswer | undefined {
  switch (question.type) {
    case 'select':
      // Shape follows max_choices, never the picked count (bite #1).
      if (question.max_choices > 1)
        return Array.isArray(value) && value.length > 0
          ? { id: question.id, values: value }
          : undefined
      return typeof value === 'string' ? { id: question.id, value } : undefined
    case 'text':
    case 'date':
      // Whitespace-only is "no answer" (README: leave out unanswered optionals).
      return typeof value === 'string' && value.trim() !== ''
        ? { id: question.id, value }
        : undefined
    case 'numeric':
    case 'boolean':
      return typeof value === 'number' || typeof value === 'boolean'
        ? { id: question.id, value }
        : undefined
    case 'file':
      return typeof value === 'object' && !Array.isArray(value)
        ? { id: question.id, value }
        : undefined
  }
}

/** Builds the exact README contract payload from the normalized job and submitted answers. */
export function buildPayload(
  job: Job,
  answers: Answers,
  screening: ScreeningResult,
): AnswerPayload {
  const payloadAnswers: PayloadAnswer[] = []
  for (const question of job.questions) {
    const value = answers[question.id]
    if (value === undefined) continue
    const answer = toPayloadAnswer(question, value)
    if (answer !== undefined) payloadAnswers.push(answer)
  }
  return { job_id: job.id, answers: payloadAnswers, screening }
}
