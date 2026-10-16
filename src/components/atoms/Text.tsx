import type { ComponentProps } from 'react'

const TONE_CLASSES = {
  default: '',
  muted: 'text-muted',
}

const SIZE_CLASSES = {
  md: '',
  sm: 'text-sm',
}

interface TextProps extends ComponentProps<'p'> {
  tone?: keyof typeof TONE_CLASSES
  size?: keyof typeof SIZE_CLASSES
}

export function Text({ tone = 'default', size = 'md', className = '', ...props }: TextProps) {
  return <p {...props} className={`${TONE_CLASSES[tone]} ${SIZE_CLASSES[size]} ${className}`} />
}
