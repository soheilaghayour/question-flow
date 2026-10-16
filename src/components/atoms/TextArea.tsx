import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

export function TextArea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      {...props}
      className={cn(
        'min-h-28 w-full rounded border border-muted bg-surface px-3 py-2 aria-invalid:border-error focus-ring',
        className,
      )}
    />
  )
}
