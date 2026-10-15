import type { TextQuestion as TextQuestionConfig } from '@/domain/schema'
import { Input } from '@/components/atoms/Input'
import { TextArea } from '@/components/atoms/TextArea'
import { Field } from '@/components/molecules/Field'

interface TextQuestionProps {
  question: TextQuestionConfig
  value: string | null
  onChange: (value: string | null) => void
  error?: string
}

export function TextQuestion({ question, value, onChange, error }: TextQuestionProps) {
  // '' means "no answer" in form state (DECISIONS #19) — emit null, not ''.
  const emit = (text: string) => onChange(text === '' ? null : text)
  return (
    <Field id={question.id} label={question.question} error={error}>
      {(inputProps) =>
        question.multiline ? (
          <TextArea
            {...inputProps}
            value={value ?? ''}
            onChange={(event) => emit(event.target.value)}
          />
        ) : (
          <Input
            {...inputProps}
            value={value ?? ''}
            onChange={(event) => emit(event.target.value)}
          />
        )
      }
    </Field>
  )
}
