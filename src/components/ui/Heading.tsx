import type { ComponentPropsWithoutRef } from 'react'

const SIZE_CLASSES = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
}

interface HeadingProps extends ComponentPropsWithoutRef<'h1'> {
  level: 1 | 2 | 3 | 4 | 5 | 6
  size?: keyof typeof SIZE_CLASSES
}

export function Heading({ level, size = 'sm', className = '', ...props }: HeadingProps) {
  const Tag = `h${level}` as const
  return <Tag {...props} className={`font-semibold ${SIZE_CLASSES[size]} ${className}`} />
}
