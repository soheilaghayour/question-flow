import type { ComponentProps } from 'react'

export function Radio({ className = '', ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  return (
    <input
      {...props}
      type="radio"
      className={`size-4 cursor-pointer accent-primary focus-ring ${className}`}
    />
  )
}
