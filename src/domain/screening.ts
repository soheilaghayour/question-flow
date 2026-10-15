import type { Question } from './schema'

export interface ScreeningResult {
  passed: boolean
  failed: string[]
}

// Answers stay `unknown`: screening runs at submit on whatever the form holds,
// and a wrong-shape value must fail the rule exactly like a missing one.
function failsRules(question: Question, answer: unknown): boolean {
  switch (question.type) {
    case 'numeric': {
      const { must_be_at_least, must_be_below } = question
      if (must_be_at_least === undefined && must_be_below === undefined) return false
      if (typeof answer !== 'number') return true
      return (
        (must_be_at_least !== undefined && answer < must_be_at_least) ||
        (must_be_below !== undefined && answer >= must_be_below)
      )
    }
    case 'boolean':
      // Configured false means "rule off" (DECISIONS #10), so only === true evaluates.
      return question.must_be_true === true && answer !== true
    default:
      return false
  }
}

/** Evaluates screening rules at submit (DECISIONS #8: never blocks anything). */
export function evaluateScreening(
  questions: Question[],
  answers: Record<string, unknown>,
): ScreeningResult {
  const failed = questions
    .filter((question) => failsRules(question, answers[question.id]))
    .map((question) => question.id)
  return { passed: failed.length === 0, failed }
}
