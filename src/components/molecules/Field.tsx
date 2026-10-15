import type { ReactNode } from 'react'

/** Props the caller must spread onto the rendered input so the label, hint and
 * error text stay associated with it (DECISIONS #12: a11y baseline). */
export interface FieldInputProps {
  id: string
  'aria-invalid': true | undefined
  'aria-describedby': string | undefined
}

interface FieldProps {
  id: string
  label: string
  description?: string
  error?: string
  children: (inputProps: FieldInputProps) => ReactNode
}

export function Field({ id, label, description, error, children }: FieldProps) {
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
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })}
      {description && (
        <p id={descriptionId} className="text-sm text-muted">
          {description}
        </p>
      )}
      {/* role="alert": errors appear at submit while focus stays on the submit
          button, so they must be announced, not only referenced. */}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  )
}
