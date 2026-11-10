import type { HTMLAttributes } from 'react'
import { Text } from './Text'

export function ErrorText(props: HTMLAttributes<HTMLElement>) {
  return <Text {...props} role="alert" tone="error" size="sm" />
}
