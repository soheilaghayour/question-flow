import type { ComponentProps } from 'react'

export function TextArea({ className = '', ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      {...props}
      className={`min-h-28 w-full rounded border border-muted bg-surface px-3 py-2 focus:outline-2 focus:outline-primary aria-invalid:border-error ${className}`}
    />
  )
}
