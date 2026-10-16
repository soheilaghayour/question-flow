import { CheckCircleIcon } from '@/components/atoms/Icons'

interface SubmissionResultProps {
  title: string
  body: string
}

/** Post-submit confirmation. <output> keeps the implicit status role: the
 * result is announced to screen readers without focus management (#22). */
export function SubmissionResult({ title, body }: SubmissionResultProps) {
  return (
    <output className="flex flex-col items-center gap-3 text-center">
      <span className="text-primary">
        <CheckCircleIcon />
      </span>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p>{body}</p>
    </output>
  )
}
