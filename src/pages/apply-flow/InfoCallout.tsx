import { Heading } from '@/components/ui/Heading'
import { InfoIcon } from '@/components/ui/Icons'
import { Text } from '@/components/ui/Text'

export function InfoCallout({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-lg bg-primary/10 p-4">
      <span className="text-primary">
        <InfoIcon />
      </span>
      <div className="flex flex-col gap-1">
        <Heading level={2}>{title}</Heading>
        <Text size="sm">{text}</Text>
      </div>
    </div>
  )
}
