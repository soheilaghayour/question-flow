import type { ComponentProps } from 'react'

export function Radio({ className = '', ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  return (
    <input
      {...props}
      type="radio"
      className={`size-4 accent-primary focus-ring ${className}`}
    />
  )
}
