import type { ReactNode } from 'react'

interface OptionGroupProps {
  id: string
  label: string
  error?: string
  children: ReactNode
}

/** Group counterpart of Field: radios/checkboxes have no single input a label
 * could point at, so association runs fieldset/legend + aria-describedby
 * (DECISIONS #12: a11y baseline). */
export function OptionGroup({ id, label, error, children }: OptionGroupProps) {
  const errorId = `${id}-error`
  return (
    <fieldset aria-describedby={error ? errorId : undefined} className="flex flex-col gap-1">
      <legend className="font-medium">{label}</legend>
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
