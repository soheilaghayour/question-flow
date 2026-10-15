import type { ComponentProps } from 'react'
import { FOCUS_RING } from './focusRing'

export function Radio({ className = '', ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  return (
    <input
      {...props}
      type="radio"
      className={`size-4 accent-primary ${FOCUS_RING} ${className}`}
    />
  )
}
