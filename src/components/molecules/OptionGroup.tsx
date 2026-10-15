import type { ReactNode } from 'react'

interface OptionGroupProps {
  id: string
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}

/** Group counterpart of Field: radios/checkboxes have no single input a label
 * could point at, so association runs fieldset/legend + aria-describedby
 * (DECISIONS #12: a11y baseline). */
export function OptionGroup({ id, label, required, error, children }: OptionGroupProps) {
  const errorId = `${id}-error`
  // No aria-required on the fieldset: the `group` role doesn't support it —
  // the star plus the submit-time error are the affordances here.
  return (
    <fieldset aria-describedby={error ? errorId : undefined} className="flex flex-col gap-1">
      <legend className="font-medium">
        {label}
        {/* aria-hidden for the same reason as Field: the group's accessible
            name must not change under existing role queries. */}
        {required && (
          <span aria-hidden="true" className="text-error">
            {' *'}
          </span>
        )}
      </legend>
      <div className="flex flex-col gap-2">{children}</div>
      {/* role="alert": same reasoning as Field — errors appear at submit while
          focus stays on the submit button. */}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
    </fieldset>
  )
}
