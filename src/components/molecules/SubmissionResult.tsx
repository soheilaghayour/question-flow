import CheckCircleIcon from '@/components/atoms/icons/check-circle.svg?react'

interface SubmissionResultProps {
  title: string
  body: string
  /** Generic screening note — rendered only when the caller passes one. */
  note?: string
}

/** Post-submit confirmation. <output> keeps the implicit status role: the
 * result is announced to screen readers without focus management (#22). */
export function SubmissionResult({ title, body, note }: SubmissionResultProps) {
  return (
    <output className="flex flex-col items-center gap-3 text-center">
      <span className="text-primary">
        <CheckCircleIcon />
      </span>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p>{body}</p>
      {note !== undefined && <p className="text-muted">{note}</p>}
    </output>
  )
}
