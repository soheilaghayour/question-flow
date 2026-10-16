import type { Question } from '@/domain/schema'
import type { AnswerValue } from '@/domain/payload'
import { questionRegistry, type QuestionComponent } from './registry'

interface QuestionFieldProps {
  question: Question
  value: AnswerValue | null
  onChange: (value: AnswerValue | null) => void
  error?: string
}

/** Renders the registry component for any question. */
export function QuestionField({ question, value, onChange, error }: QuestionFieldProps) {
  // TypeScript can't type correlated-union lookups (microsoft/TypeScript#30581).
  const Component = questionRegistry[question.type] as QuestionComponent<Question, AnswerValue>
  return <Component question={question} value={value} onChange={onChange} error={error} />
}
