import type { HTMLAttributes } from 'react'

const TONES = {
  muted: 'text-muted',
  error: 'text-error',
  primary: 'text-primary',
} as const

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'dt' | 'dd'
  tone?: keyof typeof TONES
  size?: 'sm'
  weight?: 'medium'
  align?: 'center'
  wrap?: 'break-words'
}

export function Text({
  as: Tag = 'p',
  tone,
  size,
  weight,
  align,
  wrap,
  className,
  ...props
}: TextProps) {
  const classes = [
    tone && TONES[tone],
    size === 'sm' && 'text-sm',
    weight === 'medium' && 'font-medium',
    align === 'center' && 'text-center',
    wrap === 'break-words' && 'break-words',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <Tag {...props} className={classes || undefined} />
}
