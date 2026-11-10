import type { Question } from '@/data/schema'
import type { Answers } from './payload'

/** Whether a stored value counts as an answer. */
// false is an answer.
export function hasAnswer(value: Answers[string]) {
  if (value == null) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (Array.isArray(value)) return value.length > 0
  return true
}

/** Required questions that still block submission, in question order. */
export function missingRequired(questions: Question[], answers: Answers) {
  return questions
    .filter((question) => question.required && !hasAnswer(answers[question.id]))
    .map((question) => question.id)
}
