import type { ComponentProps } from 'react'

export function Button({ className = '', type = 'button', ...props }: ComponentProps<'button'>) {
  return (
    <button
      {...props}
      type={type}
      className={`rounded bg-primary px-4 py-2 font-medium text-surface hover:opacity-90 focus:outline-2 focus:outline-offset-2 focus:outline-primary disabled:opacity-50 ${className}`}
    />
  )
}
