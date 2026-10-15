import type { Question } from '@/domain/schema'
import type { AnswerValue } from '@/domain/payload'
import { questionRegistry, type QuestionComponent } from './registry'

interface QuestionFieldProps {
  question: Question
  value: AnswerValue | null
  onChange: (value: AnswerValue | null) => void
  error?: string
}

/** The flow's single entry point: renders the registry component for any
 * Question, so callers never switch on type and never cast. */
export function QuestionField({ question, value, onChange, error }: QuestionFieldProps) {
  // TypeScript cannot type correlated-union lookups (microsoft/TypeScript#30581),
  // so this cast is the one place the registry is widened. It is sound as long
  // as answers[question.id] only ever holds what that same question's component
  // emitted — which the controlled seam guarantees (DECISIONS #21) and
  // payload.ts re-checks per type before the wire (#19).
  const Component = questionRegistry[question.type] as QuestionComponent<Question, AnswerValue>
  return <Component question={question} value={value} onChange={onChange} error={error} />
}
