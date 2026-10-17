import type { ReactNode } from 'react'

/** One radio/checkbox pill: the control and its text, clickable as one. */
export function OptionLabel({ children }: { children: ReactNode }) {
  return <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-muted/40 px-3 py-2 hover:border-primary has-checked:border-primary has-checked:bg-primary/10 has-disabled:cursor-default has-disabled:opacity-50 has-disabled:hover:border-muted/40">{children}</label>
}
