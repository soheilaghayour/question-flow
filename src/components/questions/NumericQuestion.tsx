import { useState } from 'react'
import type { NumericQuestion as NumericQuestionConfig } from '@/domain/schema'
import { classifyNumericInput } from '@/domain/numericAnswer'
import { Input } from '@/components/atoms/Input'
import { Field } from '@/components/molecules/Field'
import { useI18n } from '@/i18n/useI18n'

interface NumericQuestionProps {
  question: NumericQuestionConfig
  value: number | null
  onChange: (value: number | null) => void
  error?: string
}

export function NumericQuestion({ question, value, onChange, error }: NumericQuestionProps) {
  // The raw text lives here, not in form state: "85." or "abc" has no number
  // representation, and typing is never blocked (DECISIONS #5). Form state only
  // ever receives a valid in-range integer, or null.
  const [raw, setRaw] = useState(value === null ? '' : String(value))
  // Render-time re-sync keeps the seam controlled: when the value prop CHANGES
  // to something that is not the echo of our own last emit (external reset,
  // post-mount prefill), it replaces the text. Both conditions matter — "not
  // the echo" alone wipes half-typed text under parents that don't echo, and
  // "changed" alone wipes it under parents that do.
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
    <Field id={question.id} label={question.question} error={localError ?? error}>
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
