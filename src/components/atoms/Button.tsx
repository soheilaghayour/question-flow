import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

const VARIANT_CLASSES = {
  primary:
    'border-transparent bg-primary px-4 py-2 text-surface hover:opacity-90 aria-[pressed=false]:border-primary aria-[pressed=false]:bg-surface aria-[pressed=false]:text-primary',
  secondary: 'border-primary bg-surface px-4 py-2 text-primary hover:opacity-90',
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: keyof typeof VARIANT_CLASSES
}

export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded border font-medium disabled:cursor-default disabled:opacity-50 focus-ring',
        VARIANT_CLASSES[variant],
        className,
      )}
    />
  )
}
