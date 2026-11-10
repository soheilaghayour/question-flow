import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'

interface JobSummaryProps {
  title: string
  company: string
}

export function JobSummary({ title, company }: JobSummaryProps) {
  return (
    <div className="flex flex-col gap-1">
      <Heading level={2} size="lg">
        {title}
      </Heading>
      <Text tone="muted">{company}</Text>
    </div>
  )
}
