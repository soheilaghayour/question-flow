import type { ComponentProps } from 'react'

const VARIANT_CLASSES = {
  primary:
    'border-transparent bg-primary px-4 py-2 text-surface hover:opacity-90',
  secondary: 'border-primary bg-surface px-4 py-2 text-primary hover:opacity-90',
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: keyof typeof VARIANT_CLASSES
  /** Shows the error state. */
  invalid?: boolean
}

export function Button({ variant = 'primary', invalid, className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      // Not aria-invalid: buttons don't support it; the error is linked via aria-describedby.
      data-invalid={invalid || undefined}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded border font-medium disabled:cursor-default disabled:opacity-50 focus-ring data-invalid:border-error data-invalid:text-error ${VARIANT_CLASSES[variant]} ${className}`}
    />
  )
}
