import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

export function Checkbox({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  return (
    <input
      {...props}
      type="checkbox"
      className={cn(
        'size-4 cursor-pointer accent-primary focus-ring disabled:cursor-default',
        className,
      )}
    />
  )
}
