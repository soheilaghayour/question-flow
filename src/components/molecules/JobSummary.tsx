interface JobSummaryProps {
  title: string
  company: string
}

/** Recruiter-authored shell text, rendered verbatim (DECISIONS #3). */
export function JobSummary({ title, company }: JobSummaryProps) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted">{company}</p>
    </div>
  )
}
