import type { ComponentProps } from 'react'

export function CodeBlock({ className = '', ...props }: ComponentProps<'pre'>) {
  return (
    <pre
      {...props}
      className={`overflow-x-auto rounded border border-muted bg-surface p-4 text-sm ${className}`}
    />
  )
}
