import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded border border-muted bg-surface px-3 py-2 aria-invalid:border-error focus-ring',
        className,
      )}
    />
  )
}
