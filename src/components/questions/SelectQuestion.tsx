import type { SelectQuestion as SelectQuestionConfig } from '@/domain/schema'
import { Checkbox } from '@/components/atoms/Checkbox'
import { Radio } from '@/components/atoms/Radio'
import { OptionGroup } from '@/components/molecules/OptionGroup'

interface SelectQuestionProps {
  question: SelectQuestionConfig
  // string when max_choices === 1, string[] when > 1 — the shape follows
  // max_choices, never the picked count (bite #1).
  value: string | string[] | null
  onChange: (value: string | string[] | null) => void
  error?: string
}

export function SelectQuestion({ question, value, onChange, error }: SelectQuestionProps) {
  const multi = question.max_choices > 1
  const picked = Array.isArray(value) ? value : []
  const capReached = picked.length >= question.max_choices

  const toggle = (option: string, checked: boolean) => {
    const next = checked ? [...picked, option] : picked.filter((v) => v !== option)
    onChange(next.length > 0 ? next : null)
  }

  return (
    <OptionGroup
      id={question.id}
      label={question.question}
      required={question.required}
      error={error}
    >
      {question.options.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-center gap-2">
          {multi ? (
            <Checkbox
              checked={picked.includes(option.value)}
              disabled={capReached && !picked.includes(option.value)}
              onChange={(event) => toggle(option.value, event.target.checked)}
            />
          ) : (
            <Radio
              name={question.id}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
          )}
          {option.label}
        </label>
      ))}
    </OptionGroup>
  )
}
