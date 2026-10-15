import type { BooleanQuestion as BooleanQuestionConfig } from '@/domain/schema'
import { Radio } from '@/components/atoms/Radio'
import { OptionGroup } from '@/components/molecules/OptionGroup'
import { useI18n } from '@/i18n/useI18n'

interface BooleanQuestionProps {
  question: BooleanQuestionConfig
  value: boolean | null
  onChange: (value: boolean | null) => void
  error?: string
}

export function BooleanQuestion({ question, value, onChange, error }: BooleanQuestionProps) {
  const { t } = useI18n()
  // Explicit Yes/No, no default: value === null leaves both unchecked, and
  // false checks No — unanswered ≠ false (bite #4).
  return (
    <OptionGroup id={question.id} label={question.question} error={error}>
      {[true, false].map((option) => (
        <label key={String(option)} className="flex items-center gap-2">
          <Radio
            name={question.id}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          {t(option ? 'yes' : 'no')}
        </label>
      ))}
    </OptionGroup>
  )
}
