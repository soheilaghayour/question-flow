import type { ComponentProps } from 'react'

/** role="alert": errors appear at submit while focus stays on the submit
 * button, so they must be announced, not only referenced. */
export function ErrorText(props: ComponentProps<'p'>) {
  return <p {...props} role="alert" className="text-sm text-error" />
}
