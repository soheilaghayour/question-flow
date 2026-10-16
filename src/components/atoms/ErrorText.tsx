import type { ComponentProps } from 'react'

export function ErrorText({ className = '', ...props }: ComponentProps<'p'>) {
  // role="alert": errors appear at submit while focus stays on the submit
  // button, so they must be announced, not only referenced.
  return <p {...props} role="alert" className={`text-sm text-error ${className}`} />
}
