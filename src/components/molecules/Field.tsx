import type { ReactNode } from 'react'
import { ErrorText } from '@/components/atoms/ErrorText'
import { Text } from '@/components/atoms/Text'

/** Props the caller must spread onto the rendered input so the label, hint and
 * error text stay associated with it (DECISIONS #12: a11y baseline). */
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
  // Field owns the describedby token list so a hint and an error can coexist —
  // callers must never set aria-describedby themselves (a later spread would
  // silently drop one association).
  const describedBy =
    [description ? descriptionId : '', error ? errorId : ''].filter(Boolean).join(' ') ||
    undefined
  return (
    <div className="flex flex-col gap-1">
      {/* The star lives OUTSIDE the label element: label text is what accessible
          queries (and screen readers) read — they get aria-required instead. */}
      <div className="flex gap-1">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        {required && (
          <span aria-hidden="true" className="text-error">
            *
          </span>
        )}
      </div>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        'aria-required': required ? true : undefined,
      })}
      {description && <Text tone="muted" size="sm" id={descriptionId}>{description}</Text>}
      {error && <ErrorText id={errorId}>{error}</ErrorText>}
    </div>
  )
}
