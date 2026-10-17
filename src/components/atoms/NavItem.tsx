import type { ComponentProps } from 'react'
import { NavLink } from 'react-router'

export function NavItem(props: Omit<ComponentProps<typeof NavLink>, 'className'>) {
  return (
    <NavLink
      end
      {...props}
      className="flex flex-col items-start gap-1 rounded border border-transparent px-3 py-2 text-left hover:bg-primary/5 aria-[current=page]:border-primary/30 aria-[current=page]:bg-primary/10 aria-[current=page]:font-medium aria-[current=page]:text-primary focus-ring"
    />
  )
}
