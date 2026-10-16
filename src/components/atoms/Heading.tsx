import type { ReactNode } from 'react'

const SIZE_CLASSES = {
  lg: 'text-2xl font-semibold',
  md: 'text-xl font-semibold',
  sm: 'font-semibold',
}

interface HeadingProps {
  level: 1 | 2
  size: keyof typeof SIZE_CLASSES
  children: ReactNode
}

export function Heading({ level, size, children }: HeadingProps) {
  const Tag = `h${level}` as const
  return <Tag className={SIZE_CLASSES[size]}>{children}</Tag>
}
