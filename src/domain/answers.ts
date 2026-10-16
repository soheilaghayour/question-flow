import type { Question } from './schema'
import type { Answers } from './payload'

/** Whether a stored value counts as an answer. */
// Mirrors payload's "no substance" rule (#19): whitespace-only text and a
// zero-pick list would be omitted from the payload, so a required question
// holding one is unanswered. false is an answer (bite #4). Exported so the
// progress bar counts exactly what the submit gate and payload count.
export function hasAnswer(value: Answers[string]): boolean {
  if (value == null) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (Array.isArray(value)) return value.length > 0
  return true
}

/** Required questions that still block submission, in question order. */
export function missingRequired(questions: Question[], answers: Answers): string[] {
  return questions
    .filter((question) => question.required && !hasAnswer(answers[question.id]))
    .map((question) => question.id)
}
