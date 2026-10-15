import type { ComponentProps } from 'react'

export function Button({ className = '', type = 'button', ...props }: ComponentProps<'button'>) {
  return (
    <button
      {...props}
      type={type}
      className={`rounded bg-primary px-4 py-2 font-medium text-surface hover:opacity-90 disabled:opacity-50 aria-[pressed=false]:opacity-60 focus-ring ${className}`}
    />
  )
}
