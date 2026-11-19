import { Heading } from '@/components/ui/Heading'
import { CheckCircleIcon } from '@/components/ui/Icons'
import { Text } from '@/components/ui/Text'

interface SubmissionResultProps {
  title: string
  body: string
}

export function SubmissionResult({ title, body }: SubmissionResultProps) {
  return (
    <output className="flex flex-col items-center gap-3">
      <Text as="span" tone="primary">
        <CheckCircleIcon />
      </Text>
      <Heading level={2} size="lg" align="center">
        {title}
      </Heading>
      <Text align="center">{body}</Text>
    </output>
  )
}
