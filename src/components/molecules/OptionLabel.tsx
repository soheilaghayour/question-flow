import type { ReactNode } from 'react'

/** One radio/checkbox row: the control and its text, clickable as one. */
export function OptionLabel({ children }: { children: ReactNode }) {
  return <label className="flex cursor-pointer items-center gap-2">{children}</label>
}
