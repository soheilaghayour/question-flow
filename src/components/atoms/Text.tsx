import type { HTMLAttributes } from 'react'

const TONE_CLASSES = {
  default: '',
  muted: 'text-muted',
}

const SIZE_CLASSES = {
  md: '',
  sm: 'text-sm',
}

const WEIGHT_CLASSES = {
  normal: '',
  medium: 'font-medium',
}

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'dt' | 'dd'
  tone?: keyof typeof TONE_CLASSES
  size?: keyof typeof SIZE_CLASSES
  weight?: keyof typeof WEIGHT_CLASSES
}

export function Text({
  as: Tag = 'p',
  tone = 'default',
  size = 'md',
  weight = 'normal',
  className = '',
  ...props
}: TextProps) {
  const roleClasses = `${TONE_CLASSES[tone]} ${SIZE_CLASSES[size]} ${WEIGHT_CLASSES[weight]}`
  return <Tag {...props} className={`${roleClasses} ${className}`} />
}
