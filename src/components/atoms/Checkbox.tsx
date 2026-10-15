import type { ComponentProps } from 'react'
import { FOCUS_RING } from './focusRing'

export function Checkbox({ className = '', ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  return (
    <input
      {...props}
      type="checkbox"
      className={`size-4 accent-primary ${FOCUS_RING} ${className}`}
    />
  )
}
