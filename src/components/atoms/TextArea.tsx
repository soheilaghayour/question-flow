import type { ComponentProps } from 'react'
import { FOCUS_RING } from './focusRing'

export function TextArea({ className = '', ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      {...props}
      className={`min-h-28 w-full rounded border border-muted bg-surface px-3 py-2 aria-invalid:border-error ${FOCUS_RING} ${className}`}
    />
  )
}
