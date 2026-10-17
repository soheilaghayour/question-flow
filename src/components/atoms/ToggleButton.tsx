import type { ComponentProps } from 'react'

export function ToggleButton({ pressed, ...props }: Omit<ComponentProps<'button'>, 'className' | 'type' | 'aria-pressed'> & { pressed: boolean }) {
  return (
    <button
      {...props}
      type="button"
      aria-pressed={pressed}
      className="cursor-pointer rounded border border-transparent px-2 py-1 text-sm font-medium text-muted hover:bg-primary/5 aria-pressed:border-primary/30 aria-pressed:bg-primary/10 aria-pressed:text-primary focus-ring"
    />
  )
}
