import type { ComponentProps } from 'react'

/** A button in a choose-one set; the chosen one is `aria-current`, not a toggle. */
export function CurrentButton({ current, ...props }: Omit<ComponentProps<'button'>, 'className' | 'type' | 'aria-current'> & { current: boolean }) {
  return (
    <button
      {...props}
      type="button"
      aria-current={current || undefined}
      className="cursor-pointer rounded border border-transparent px-2 py-1 text-sm font-medium text-muted hover:bg-primary/5 aria-[current=true]:border-primary/30 aria-[current=true]:bg-primary/10 aria-[current=true]:text-primary focus-ring"
    />
  )
}
