import { Heading } from '@/components/atoms/Heading'

interface JobSummaryProps {
  title: string
  company: string
}

/** Recruiter-authored shell text, rendered verbatim (DECISIONS #3). */
export function JobSummary({ title, company }: JobSummaryProps) {
  return (
    <div className="flex flex-col gap-1">
      <Heading level={2} size="md">
        {title}
      </Heading>
      <p className="text-muted">{company}</p>
    </div>
  )
}
