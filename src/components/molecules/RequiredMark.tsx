import { Text } from '@/components/atoms/Text'

export function RequiredMark() {
  // aria-hidden: the accessible name must stay the plain label text; the
  // required state reaches screen readers via aria-required instead.
  return (
    <Text as="span" tone="error" aria-hidden="true">
      *
    </Text>
  )
}
