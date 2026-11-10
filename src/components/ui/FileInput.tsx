import type { ComponentProps } from 'react'

/** The native file input, visually hidden: a visible control opens the picker via its ref. */
export function FileInput(props: Omit<ComponentProps<'input'>, 'type' | 'className' | 'tabIndex'>) {
  return <input {...props} type="file" tabIndex={-1} className="sr-only" />
}
