import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

const TONE_CLASSES = {
  muted: 'text-muted',
  error: 'text-error',
}

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'dt' | 'dd'
  tone?: keyof typeof TONE_CLASSES | 'default'
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
  return (
    <Tag
      {...props}
      className={cn(
        tone !== 'default' && TONE_CLASSES[tone],
        size === 'sm' && 'text-sm',
        weight === 'medium' && 'font-medium',
        className,
      )}
    />
  )
}
