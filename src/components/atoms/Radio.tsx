import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

export function Radio({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  return (
    <input
      {...props}
      type="radio"
      className={cn('size-4 cursor-pointer accent-primary focus-ring', className)}
    />
  )
}
