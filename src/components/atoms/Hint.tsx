import type { ComponentProps } from 'react'

export function Hint(props: ComponentProps<'p'>) {
  return <p {...props} className="text-sm text-muted" />
}
