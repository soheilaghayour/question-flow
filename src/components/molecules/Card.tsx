import type { ComponentProps } from 'react'

export function Card({ as: Tag = 'section', ...props }: Omit<ComponentProps<'section'>, 'className'> & { as?: 'section' | 'aside' }) {
  return <Tag {...props} className="flex h-fit flex-col gap-4 rounded-lg border border-muted bg-surface p-6" />
}
