import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router'
import { normalizeJob } from '@/domain/normalize'
import { buildPrefillAnswers } from '@/domain/prefill'
import { evaluateScreening } from '@/domain/screening'
import { buildPayload } from '@/domain/payload'
import {
  answerChanged,
  createFormState,
  missingRequired,
  submitAttempted,
} from '@/domain/formState'
import { buildSteps } from '@/domain/wizard'
import { answerText } from '@/domain/answerText'
import { profile, rawJobConfigsById } from '@/data'
import { QuestionField } from '@/components/questions/QuestionField'
import { Button } from '@/components/atoms/Button'
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/atoms/Icons'
import { AnswerReview } from '@/components/molecules/AnswerReview'
import { JobSummary } from '@/components/molecules/JobSummary'
import { ProgressBar } from '@/components/molecules/ProgressBar'
import { useI18n } from '@/i18n/useI18n'
import { addAppliedJobIdToStorage, getAppliedJobIdsFromStorage } from '@/utils/appliedJobs'

export function ApplyFlow() {
  const { jobId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const result = useMemo(() => normalizeJob(rawJobConfigsById.get(jobId)), [jobId])
  const initialAnswers = useMemo(
    () => ('job' in result ? buildPrefillAnswers(result.job.questions, profile) : {}),
    [result],
  )
  const [state, setState] = useState(() => createFormState(initialAnswers))
  // The wizard shape (#36): prefilled questions lead as one confirm step,
  // the rest follows in chunks, and the summary screen closes the flow.
  const steps = useMemo(
    () => ('job' in result ? buildSteps(result.job.questions, initialAnswers) : []),
    [result, initialAnswers],
  )
  const stepIndex = Number(searchParams.get('step')) - 1
  // Answers live only in memory: a step past the furthest one reached in this
  // mount (refresh, shared link) would be empty and skip the Next gates.
  const [reachedStepIndex, setReachedStepIndex] = useState(0)
  // The step whose Next failed: it validates live from then on, while a
  // freshly entered step never opens pre-littered with error text.
  const [attemptedStepIndex, setAttemptedStepIndex] = useState<number | null>(null)
  // Checked once on mount: Back into a submitted form remounts it, while the
  // submit itself must not redirect before /applied is reached.
  const [alreadyApplied] = useState(() => getAppliedJobIdsFromStorage().includes(jobId))
  const { t, language } = useI18n()

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

  if (alreadyApplied) {
    return <Navigate to={`/jobs/${job.id}`} replace />
  }
  if (!Number.isInteger(stepIndex) || stepIndex < 0 || stepIndex > reachedStepIndex) {
    return <Navigate to="?step=1" replace />
  }

  const totalSteps = steps.length + 1 // the summary screen is the last step
  const onSummary = stepIndex === steps.length
  const step = steps[stepIndex]

  // The full-form re-check runs only on the summary — a safety net, not a
  // gate. It is reachable: browser Forward restores a previously reached step
  // without passing handleNext, so a required answer cleared after advancing
  // arrives here as a gap the net must catch (visibly, via the alert below).
  const missing = onSummary ? missingRequired(job.questions, state.answers) : []
  // Hard gate (DECISIONS #5): Next never advances past an unanswered required
  // question on the current step — the errors appear on the fields in view.
  // Back and typing are never gated.
  const stepMissing = step ? missingRequired(step.questions, state.answers) : []

  const handleNext = () => {
    if (stepMissing.length > 0) {
      setAttemptedStepIndex(stepIndex)
      return
    }
    setAttemptedStepIndex(null)
    setReachedStepIndex(Math.max(reachedStepIndex, stepIndex + 1))
    setSearchParams({ step: String(stepIndex + 2) })
  }

  const handleBack = () => {
    if (stepIndex === 0) navigate(`/jobs/${job.id}`)
    else navigate(-1)
  }

  const submitApplication = () => {
    setState(submitAttempted)
    if (missing.length > 0) return
    const screening = evaluateScreening(job.questions, state.answers)
    const nextPayload = buildPayload(job, state.answers, screening)
    console.log(nextPayload)
    addAppliedJobIdToStorage(job.id)
    navigate(`/jobs/${job.id}/applied`, {
      replace: true,
      state: { screeningPassed: screening.passed },
    })
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
      {/* One submit path for click and Enter alike: on question steps it IS
          the Next action (same gate), on the summary it sends — so the
          button's type never has to swap under a click. */}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          if (onSummary) submitApplication()
          else handleNext()
        }}
        className="flex flex-col gap-6"
      >
        {/* Inactive steps hide, they never unmount: a widget holding raw
            not-yet-valid typing (DECISIONS #21) must survive Back/Next, not
            be reset by a remount. */}
        {steps.map((wizardStep, index) => (
          <div key={index} hidden={index !== stepIndex} className="flex flex-col gap-6">
            {wizardStep.prefilled && <h2 className="font-medium">{t('from_profile')}</h2>}
            {wizardStep.questions.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                value={state.answers[question.id] ?? null}
                onChange={(value) => setState((s) => answerChanged(s, question.id, value))}
                error={
                  index === attemptedStepIndex && stepMissing.includes(question.id)
                    ? t('error_required')
                    : undefined
                }
              />
            ))}
          </div>
        ))}
        {onSummary && (
          <>
            <h2 className="font-medium">{t('review_title')}</h2>
            {/* The safety net behind the per-step gates must never be a
                silent no-op: a blocked Submit says so, audibly (role=alert). */}
            {state.submitAttempted && missing.length > 0 && (
              <p role="alert" className="text-sm text-error">
                {t('error_review_missing')}
              </p>
            )}
            <AnswerReview
              items={job.questions.map((question) => ({
                id: question.id,
                question: question.question,
                answer: answerText(question, state.answers[question.id], {
                  yes: t('yes'),
                  no: t('no'),
                  missing: t('no_answer'),
                  locale: language,
                }),
              }))}
            />
          </>
        )}
        <div className="flex justify-between gap-4">
          <Button type="button" aria-label={t('back')} title={t('back')} onClick={handleBack}>
            <ArrowLeftIcon />
          </Button>
          {onSummary ? (
            <Button type="submit">{t('submit')}</Button>
          ) : (
            <Button type="submit" aria-label={t('next')} title={t('next')}>
              <ArrowRightIcon />
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
