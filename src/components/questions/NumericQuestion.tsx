import { useState } from 'react'
import type { NumericQuestion as NumericQuestionConfig } from '@/domain/schema'
import { parseLocaleNumber } from '@/utils/parseLocaleNumber'
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
  const { t } = useI18n()

  const parsed = parseLocaleNumber(raw)
  const inRange = 'value' in parsed && parsed.value >= question.min && parsed.value <= question.max
  const localError =
    raw !== '' && !inRange
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
            const next = parseLocaleNumber(text)
            onChange(
              'value' in next && next.value >= question.min && next.value <= question.max
                ? next.value
                : null,
            )
          }}
        />
      )}
    </Field>
  )
}
