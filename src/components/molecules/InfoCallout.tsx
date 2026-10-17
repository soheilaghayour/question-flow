import { Heading } from '@/components/atoms/Heading'
import { InfoIcon } from '@/components/atoms/Icons'
import { Text } from '@/components/atoms/Text'

export function InfoCallout({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-lg bg-primary/10 p-4 text-primary">
      <InfoIcon />
      <div className="flex flex-col gap-1">
        <Heading level={2}>{title}</Heading>
        <Text size="sm">{text}</Text>
      </div>
    </div>
  )
}
