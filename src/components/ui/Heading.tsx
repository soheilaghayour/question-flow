import type { ComponentPropsWithoutRef } from 'react'

const SIZE_CLASSES = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
}

interface HeadingProps extends ComponentPropsWithoutRef<'h1'> {
  level: 1 | 2 | 3 | 4 | 5 | 6
  size?: keyof typeof SIZE_CLASSES
  align?: 'center'
}

export function Heading({ level, size = 'sm', align, className = '', ...props }: HeadingProps) {
  const Tag = `h${level}` as const
  const alignClass = align === 'center' ? 'text-center' : ''
  return <Tag {...props} className={`font-semibold ${SIZE_CLASSES[size]} ${alignClass} ${className}`} />
}
