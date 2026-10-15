import type { Question } from './schema'
import type { Answers } from './payload'
import { hasAnswer } from './formState'

/** UI-language words the text needs; injected so this stays i18n-free. */
export interface AnswerTextLabels {
  yes: string
  no: string
  missing: string
}

/** The candidate-readable text for one answer on the review step. */
// Shows what the candidate SAID, not what the wire carries: option labels
// instead of values, Yes/No instead of true/false, the file's name instead of
// its base64. Cross-type values fall back to String — payload.ts (#19) is the
// layer that drops them; the review must never crash on one.
export function answerText(
  question: Question,
  value: Answers[string],
  labels: AnswerTextLabels,
): string {
  if (value == null || !hasAnswer(value)) return labels.missing
  if (question.type === 'boolean') return value === false ? labels.no : labels.yes
  if (question.type === 'select') {
    const label = (v: unknown) =>
      question.options.find((option) => option.value === v)?.label ?? String(v)
    return Array.isArray(value) ? value.map(label).join(', ') : label(value)
  }
  if (question.type === 'file')
    return typeof value === 'object' && !Array.isArray(value) ? value.file_name : String(value)
  return String(value)
}
