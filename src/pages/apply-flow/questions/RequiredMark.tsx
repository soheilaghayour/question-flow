import { Text } from '@/components/ui/Text'

export function RequiredMark() {
  return (
    <Text as="span" tone="error" aria-hidden="true">
      *
    </Text>
  )
}
