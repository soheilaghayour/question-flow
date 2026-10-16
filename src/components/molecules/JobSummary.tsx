import { Heading } from '@/components/atoms/Heading'
import { Text } from '@/components/atoms/Text'

interface JobSummaryProps {
  title: string
  company: string
}

export function JobSummary({ title, company }: JobSummaryProps) {
  return (
    <div className="flex flex-col gap-1">
      <Heading level={2} size="md">
        {title}
      </Heading>
      <Text tone="muted">{company}</Text>
    </div>
  )
}
