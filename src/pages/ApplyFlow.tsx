import { useEffect, useMemo, useState } from 'react'
import { normalizeJob } from '@/domain/normalize'
import { buildPrefillAnswers } from '@/domain/prefill'
import { evaluateScreening } from '@/domain/screening'
import { buildPayload, type ApplicationPayload } from '@/domain/payload'
import {
  answerChanged,
  createFormState,
  hasAnswer,
  missingRequired,
  submitAttempted,
} from '@/domain/formState'
import type { Profile } from '@/domain/schema'
import { QuestionField } from '@/components/questions/QuestionField'
import { Button } from '@/components/atoms/Button'
import { JobSummary } from '@/components/molecules/JobSummary'
import { ProgressBar } from '@/components/molecules/ProgressBar'
import { SubmissionResult } from '@/components/molecules/SubmissionResult'
import { useI18n } from '@/i18n/useI18n'

interface ApplyFlowProps {
  rawJob: unknown
  profile: Profile
  /** Navigates back to the job overview; without it no back control renders. */
  onBack?: () => void
  /** Fires once on successful submit so the shell can mark the job applied. */
  onSubmitted?: (jobId: string) => void
}

export function ApplyFlow({ rawJob, profile, onBack, onSubmitted }: ApplyFlowProps) {
  const result = useMemo(() => normalizeJob(rawJob), [rawJob])
  const [state, setState] = useState(() =>
    createFormState('job' in result ? buildPrefillAnswers(result.job.questions, profile) : {}),
  )
  const [payload, setPayload] = useState<ApplicationPayload | null>(null)
  const { t } = useI18n()

  // Config problems are the recruiter's bug to hear about (DECISIONS #10) —
  // once per config, not per render.
  useEffect(() => {
    if ('job' in result)
      for (const warning of result.warnings)
        console.warn(`[${warning.questionId}] ${warning.reason}`)
  }, [result])

  if ('error' in result) {
    return (
      <p role="alert" className="text-error">
        {t('error_job_invalid')}
      </p>
    )
  }
  const { job } = result

  // Candidate-facing confirmation; the payload itself is dev-only via
  // console.log. A failed screening adds one generic sentence — never the
  // rule, threshold, or question (DECISIONS #24).
  if (payload) {
    return (
      <div className="flex flex-col items-center gap-6 py-10">
        <SubmissionResult
          title={t('submitted_title')}
          body={t('submitted_body')}
          note={payload.screening.passed ? undefined : t('submitted_screening_note')}
        />
        {onBack && <Button onClick={onBack}>{t('back_to_main')}</Button>}
      </div>
    )
  }

  const missing = missingRequired(job.questions, state.answers)

  const handleSubmit = () => {
    setState(submitAttempted)
    if (missing.length > 0) return
    const screening = evaluateScreening(job.questions, state.answers)
    const nextPayload = buildPayload(job, state.answers, screening)
    console.log(nextPayload)
    setPayload(nextPayload)
    onSubmitted?.(job.id)
  }

  const answeredCount = job.questions.filter((q) => hasAnswer(state.answers[q.id])).length
  const progressLabel = t('progress_label')
    .replace('{answered}', String(answeredCount))
    .replace('{total}', String(job.questions.length))

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <JobSummary title={job.title} company={job.company} />
      <ProgressBar label={progressLabel} fraction={answeredCount / job.questions.length} />
      {job.questions.some((q) => q.required) && (
        <p className="text-sm text-muted">{t('required_hint')}</p>
      )}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit()
        }}
        className="flex flex-col gap-6"
      >
        {job.questions.map((question) => (
        <QuestionField
          key={question.id}
          question={question}
          value={state.answers[question.id] ?? null}
          onChange={(value) => setState((s) => answerChanged(s, question.id, value))}
          error={
            state.submitAttempted && missing.includes(question.id)
              ? t('error_required')
              : undefined
          }
        />
        ))}
        <Button type="submit">{t('submit')}</Button>
      </form>
    </div>
  )
}
