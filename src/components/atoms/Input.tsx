import type { ComponentProps } from 'react'
import { FOCUS_RING } from './focusRing'

export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return (
    <input
      {...props}
      className={`w-full rounded border border-muted bg-surface px-3 py-2 aria-invalid:border-error ${FOCUS_RING} ${className}`}
    />
  )
}
