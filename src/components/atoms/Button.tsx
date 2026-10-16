import type { ComponentProps } from 'react'

const VARIANT_CLASSES = {
  primary:
    'border-transparent bg-primary px-4 py-2 text-surface hover:opacity-90 aria-[pressed=false]:border-primary aria-[pressed=false]:bg-surface aria-[pressed=false]:text-primary',
  secondary: 'border-primary bg-surface px-4 py-2 text-primary hover:opacity-90',
  ghost: 'border-transparent px-2 py-1 text-sm text-muted hover:text-primary aria-pressed:font-bold aria-pressed:text-primary',
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: keyof typeof VARIANT_CLASSES
}

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded border font-medium disabled:cursor-default disabled:opacity-50 focus-ring ${VARIANT_CLASSES[variant]} ${className}`}
    />
  )
}
