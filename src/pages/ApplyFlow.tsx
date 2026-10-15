import { useEffect, useMemo, useState } from 'react'
import { normalizeJob } from '@/domain/normalize'
import { buildPrefillAnswers } from '@/domain/prefill'
import { evaluateScreening } from '@/domain/screening'
import { buildPayload, type ApplicationPayload } from '@/domain/payload'
import {
  answerChanged,
  createFormState,
  missingRequired,
  submitAttempted,
} from '@/domain/formState'
import { buildSteps } from '@/domain/wizard'
import { answerText } from '@/domain/answerText'
import type { Profile } from '@/domain/schema'
import { QuestionField } from '@/components/questions/QuestionField'
import { Button } from '@/components/atoms/Button'
import { AnswerReview } from '@/components/molecules/AnswerReview'
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
  const initialAnswers = useMemo(
    () => ('job' in result ? buildPrefillAnswers(result.job.questions, profile) : {}),
    [result, profile],
  )
  const [state, setState] = useState(() => createFormState(initialAnswers))
  // The wizard shape (#36): prefilled questions lead as one confirm step,
  // the rest follows in chunks, and the summary screen closes the flow.
  const steps = useMemo(
    () => ('job' in result ? buildSteps(result.job.questions, initialAnswers) : []),
    [result, initialAnswers],
  )
  const [stepIndex, setStepIndex] = useState(0)
  // Next-gate errors are per step and per attempt: answering or navigating
  // clears them, so a step never opens pre-littered with error text.
  const [stepAttempted, setStepAttempted] = useState(false)
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

  const totalSteps = steps.length + 1 // the summary screen is the last step
  const onSummary = stepIndex === steps.length
  const step = steps[stepIndex]

  const missing = missingRequired(job.questions, state.answers)
  // Hard gate (DECISIONS #5): Next never advances past an unanswered required
  // question on the current step — the errors appear on the fields in view.
  // Back and typing are never gated.
  const stepMissing = step ? missingRequired(step.questions, state.answers) : []

  const goToStep = (index: number) => {
    setStepAttempted(false)
    setStepIndex(index)
  }

  const handleNext = () => {
    if (stepMissing.length > 0) {
      setStepAttempted(true)
      return
    }
    goToStep(stepIndex + 1)
  }

  const handleSubmit = () => {
    setState(submitAttempted)
    if (missing.length > 0) return
    const screening = evaluateScreening(job.questions, state.answers)
    const nextPayload = buildPayload(job, state.answers, screening)
    console.log(nextPayload)
    setPayload(nextPayload)
    onSubmitted?.(job.id)
  }

  const progressLabel = t('step_label')
    .replace('{current}', String(stepIndex + 1))
    .replace('{total}', String(totalSteps))

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <JobSummary title={job.title} company={job.company} />
      <ProgressBar label={progressLabel} fraction={(stepIndex + 1) / totalSteps} />
      {step && step.questions.some((q) => q.required) && (
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
        {step && (
          <>
            {step.prefilled && <h2 className="font-medium">{t('from_profile')}</h2>}
            {step.questions.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                value={state.answers[question.id] ?? null}
                onChange={(value) => setState((s) => answerChanged(s, question.id, value))}
                error={
                  stepAttempted && stepMissing.includes(question.id)
                    ? t('error_required')
                    : undefined
                }
              />
            ))}
          </>
        )}
        {onSummary && (
          <>
            <h2 className="font-medium">{t('review_title')}</h2>
            <AnswerReview
              items={job.questions.map((question) => ({
                id: question.id,
                question: question.question,
                answer: answerText(question, state.answers[question.id], {
                  yes: t('yes'),
                  no: t('no'),
                  missing: t('no_answer'),
                }),
              }))}
            />
          </>
        )}
        <div className="flex justify-between gap-4">
          {stepIndex > 0 ? (
            <Button type="button" onClick={() => goToStep(stepIndex - 1)}>
              {t('back')}
            </Button>
          ) : (
            <span />
          )}
          {onSummary ? (
            <Button type="submit">{t('submit')}</Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              {t('next')}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
