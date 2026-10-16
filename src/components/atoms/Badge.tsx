import type { ReactNode } from 'react'

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full border border-primary/30 bg-surface px-2 py-0.5 text-xs font-medium text-primary">
      {children}
    </span>
  )
}
