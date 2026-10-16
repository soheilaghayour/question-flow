import { Text } from '@/components/atoms/Text'

export function RequiredMark() {
  return (
    <Text as="span" tone="error" aria-hidden="true">
      *
    </Text>
  )
}
