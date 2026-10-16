import { Heading } from '@/components/atoms/Heading'
import { CheckCircleIcon } from '@/components/atoms/Icons'

interface SubmissionResultProps {
  title: string
  body: string
}

export function SubmissionResult({ title, body }: SubmissionResultProps) {
  return (
    <output className="flex flex-col items-center gap-3 text-center">
      <span className="text-primary">
        <CheckCircleIcon />
      </span>
      <Heading level={2} size="lg">
        {title}
      </Heading>
      <p>{body}</p>
    </output>
  )
}
