import type { ComponentProps } from 'react'

export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return (
    <input
      {...props}
      className={`w-full rounded border border-muted bg-surface px-3 py-2 focus:outline-2 focus:outline-primary aria-invalid:border-error ${className}`}
    />
  )
}
