import type { HTMLAttributes } from 'react'

const TONES = {
  muted: 'text-muted',
  error: 'text-error',
} as const

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'dt' | 'dd'
  tone?: keyof typeof TONES | 'default'
  size?: 'sm' | 'md'
  weight?: 'normal' | 'medium'
}

export function Text({
  as: Tag = 'p',
  tone = 'default',
  size = 'md',
  weight = 'normal',
  className,
  ...props
}: TextProps) {
  const classes = [
    tone !== 'default' && TONES[tone],
    size === 'sm' && 'text-sm',
    weight === 'medium' && 'font-medium',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <Tag {...props} className={classes || undefined} />
}
