import type { ComponentProps } from 'react'

export function Checkbox({ className = '', ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  return (
    <input
      {...props}
      type="checkbox"
      className={`size-4 accent-primary focus-ring ${className}`}
    />
  )
}
