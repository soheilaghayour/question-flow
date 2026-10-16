import type { ComponentProps } from 'react'
import { NavLink } from 'react-router'

const SIZE_CLASSES = {
  row: 'flex flex-col items-start gap-1 px-3 py-2 text-left aria-[current=page]:font-medium',
  compact: 'px-2 py-1 text-sm font-medium text-muted',
}

interface NavItemProps extends Omit<ComponentProps<typeof NavLink>, 'className'> {
  size?: keyof typeof SIZE_CLASSES
}

export function NavItem({ size = 'row', ...props }: NavItemProps) {
  return (
    <NavLink
      end
      {...props}
      className={`rounded border border-transparent hover:bg-primary/5 aria-[current=page]:border-primary/30 aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary focus-ring ${SIZE_CLASSES[size]}`}
    />
  )
}
