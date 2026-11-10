import type { BooleanQuestion as BooleanQuestionConfig } from '@/data/schema'
import { Radio } from '@/components/ui/Radio'
import { OptionGroup } from './OptionGroup'
import { OptionLabel } from './OptionLabel'
import { useI18n } from '@/i18n/useI18n'

interface BooleanQuestionProps {
  question: BooleanQuestionConfig
  value: boolean | null
  onChange: (value: boolean | null) => void
  error?: string
}

export function BooleanQuestion({ question, value, onChange, error }: BooleanQuestionProps) {
  const { t } = useI18n()
  // null leaves both unchecked: unanswered ≠ false.
  return (
    <OptionGroup
      id={question.id}
      label={question.question}
      required={question.required}
      error={error}
    >
      {[true, false].map((option) => (
        <OptionLabel key={String(option)}>
          <Radio
            name={question.id}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          {t(option ? 'yes' : 'no')}
        </OptionLabel>
      ))}
    </OptionGroup>
  )
}
