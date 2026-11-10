import { useState } from 'react'
import type { NumericQuestion as NumericQuestionConfig } from '@/data/schema'
import { classifyNumericInput } from '@/pages/apply-flow/numericAnswer'
import { Input } from '@/components/ui/Input'
import { Field } from './Field'
import { useI18n } from '@/i18n/useI18n'

interface NumericQuestionProps {
  question: NumericQuestionConfig
  value: number | null
  onChange: (value: number | null) => void
  error?: string
}

export function NumericQuestion({ question, value, onChange, error }: NumericQuestionProps) {
  // Raw text stays local: "85." or "abc" has no number value.
  const [raw, setRaw] = useState(value === null ? '' : String(value))
  // Replace the text only when the value prop changes to something we didn't emit.
  const [lastEmitted, setLastEmitted] = useState(value)
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    if (value !== lastEmitted) setRaw(value === null ? '' : String(value))
    setLastEmitted(value)
  }
  const { t } = useI18n()

  const result = classifyNumericInput(raw, question)
  const localError =
    result.kind === 'not_integer'
      ? t('error_number_invalid')
      : result.kind === 'out_of_range'
        ? t('error_number_range')
            .replace('{min}', String(question.min))
            .replace('{max}', String(question.max))
        : undefined

  return (
    <Field
      id={question.id}
      label={question.question}
      required={question.required}
      error={localError ?? error}
    >
      {(inputProps) => (
        <Input
          {...inputProps}
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={(event) => {
            const text = event.target.value
            setRaw(text)
            const next = classifyNumericInput(text, question)
            const answer = next.kind === 'valid' ? next.value : null
            setLastEmitted(answer)
            onChange(answer)
          }}
        />
      )}
    </Field>
  )
}
