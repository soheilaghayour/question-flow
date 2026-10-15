import type { ComponentProps } from 'react'

export function Button({ className = '', type = 'button', ...props }: ComponentProps<'button'>) {
  // Unselected toggles (aria-pressed=false) are an OUTLINE at full opacity,
  // never a faded fill: faded is the disabled affordance (opacity-50), and an
  // enabled option must not wear it. The transparent base border keeps every
  // button the same size whether or not the outline shows.
  return (
    <button
      {...props}
      type={type}
      className={`cursor-pointer rounded border border-transparent bg-primary px-4 py-2 font-medium text-surface hover:opacity-90 disabled:cursor-default disabled:opacity-50 aria-[pressed=false]:border-primary aria-[pressed=false]:bg-surface aria-[pressed=false]:text-primary focus-ring ${className}`}
    />
  )
}
