import type { ReactNode } from 'react'

/** Props the caller must spread onto the rendered input so the label and
 * error text stay associated with it (DECISIONS #12: a11y baseline). */
export interface FieldInputProps {
  id: string
  'aria-invalid': true | undefined
  'aria-describedby': string | undefined
}

interface FieldProps {
  id: string
  label: string
  error?: string
  children: (inputProps: FieldInputProps) => ReactNode
}

export function Field({ id, label, error, children }: FieldProps) {
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  )
}
