import type { DateQuestion as DateQuestionConfig } from '@/data/schema'
import { Input } from '@/components/ui/Input'
import { Field } from './Field'

interface DateQuestionProps {
  question: DateQuestionConfig
  value: string | null
  onChange: (value: string | null) => void
  error?: string
}

// Not toISOString: near midnight the UTC date is a different day.
function todayLocal(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function DateQuestion({ question, value, onChange, error }: DateQuestionProps) {
  return (
    <Field id={question.id} label={question.question} required={question.required} error={error}>
      {(inputProps) => (
        <Input
          {...inputProps}
          type="date"
          min={todayLocal()}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value === '' ? null : event.target.value)}
        />
      )}
    </Field>
  )
}
