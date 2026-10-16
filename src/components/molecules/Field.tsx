import type { ReactNode } from 'react'
import { Text } from '@/components/atoms/Text'
import { ErrorText } from './ErrorText'
import { RequiredMark } from './RequiredMark'

/** Props the caller spreads onto the rendered input. */
export interface FieldInputProps {
  id: string
  'aria-invalid': true | undefined
  'aria-describedby': string | undefined
  'aria-required': true | undefined
}

interface FieldProps {
  id: string
  label: string
  required?: boolean
  description?: string
  error?: string
  children: (inputProps: FieldInputProps) => ReactNode
}

export function Field({ id, label, required, description, error, children }: FieldProps) {
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`
  const describedBy =
    [description && descriptionId, error && errorId].filter(Boolean).join(' ') || undefined
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <label htmlFor={id}>
          <Text as="span" weight="medium">
            {label}
          </Text>
        </label>
        {required && <RequiredMark />}
      </div>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        'aria-required': required ? true : undefined,
      })}
      {description && (
        <Text tone="muted" size="sm" id={descriptionId}>
          {description}
        </Text>
      )}
      {error && <ErrorText id={errorId}>{error}</ErrorText>}
    </div>
  )
}
