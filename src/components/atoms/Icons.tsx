import type { ComponentProps } from 'react'

/** Decorative icons: always aria-hidden — the wrapping control carries the
 * accessible name (aria-label or visible text). */
function Icon({ children, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      {...props}
    >
      {children}
    </svg>
  )
}

export function ArrowLeftIcon() {
  return (
    <Icon>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </Icon>
  )
}

export function ArrowRightIcon() {
  return (
    <Icon>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Icon>
  )
}

export function CheckCircleIcon() {
  return (
    <Icon className="size-12">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </Icon>
  )
}
