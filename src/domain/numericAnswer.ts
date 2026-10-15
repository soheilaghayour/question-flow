import { parseLocaleNumber } from '@/utils/parseLocaleNumber'

/** The single owner of "integer within the question's bounds" — the widget
 * (NumericQuestion) and prefill must never disagree on what a valid numeric
 * answer is. */
export function isValidNumericAnswer(
  value: number,
  question: { min: number; max: number },
): boolean {
  return Number.isInteger(value) && value >= question.min && value <= question.max
}

/** `empty` and `not_integer` are distinct from `out_of_range`: a parse failure
 * must not surface the question's bounds — they may be schema defaults the
 * recruiter never set (DECISIONS #5 names the range only for range errors). */
export type NumericInputResult =
  | { kind: 'valid'; value: number }
  | { kind: 'empty' }
  | { kind: 'not_integer' }
  | { kind: 'out_of_range' }

export function classifyNumericInput(
  text: string,
  question: { min: number; max: number },
): NumericInputResult {
  if (text.trim() === '') return { kind: 'empty' }
  const parsed = parseLocaleNumber(text)
  if ('error' in parsed) return { kind: 'not_integer' }
  return isValidNumericAnswer(parsed.value, question)
    ? { kind: 'valid', value: parsed.value }
    : { kind: 'out_of_range' }
}
