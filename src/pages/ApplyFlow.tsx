import { useEffect, useMemo, useRef, useState } from 'react'
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
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/atoms/Icons'
import { AnswerReview } from '@/components/molecules/AnswerReview'
import { JobSummary } from '@/components/molecules/JobSummary'
import { ProgressBar } from '@/components/molecules/ProgressBar'
import { SubmissionResult } from '@/components/molecules/SubmissionResult'
import { useI18n } from '@/i18n/useI18n'
import {
  endFormSession,
  entryOf,
  isLiveFormEntry,
  pushEntry,
  startFormSession,
} from '@/utils/appHistory'
import { addAppliedJobIdToStorage } from '@/utils/appliedJobs'

interface ApplyFlowProps {
  rawJob: unknown
  profile: Profile
  /** Navigates back to the job overview; without it no back control renders. */
  onBack?: () => void
  /** Fires once on successful submit so the shell can switch to result-screen chrome. */
  onSubmitted?: () => void
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
  // Latches on a failed Next and resets only on navigation: after one failed
  // attempt the step validates live (a re-emptied field errors immediately),
  // but a freshly entered step never opens pre-littered with error text.
  const [stepAttempted, setStepAttempted] = useState(false)
  const [payload, setPayload] = useState<ApplicationPayload | null>(null)
  const { t, language } = useI18n()

  // Config problems are the recruiter's bug to hear about (DECISIONS #10) —
  // once per config, not per render.
  useEffect(() => {
    if ('job' in result)
      for (const warning of result.warnings)
        console.warn(`[${warning.questionId}] ${warning.reason}`)
  }, [result])

  // Every step is one browser-history entry, so the browser button, the
  // header icon and the wizard's own Back are the same control (DECISIONS
  // #31): forward navigation pushes, every back flavor is history.back().
  // Entries are stamped with this mount's session so stale history from a
  // submitted or abandoned application — possibly a different job with a
  // different step count — can never drive this form (DECISIONS #33).
  const sessionRef = useRef(0)
  // Ref, not a dependency: the popstate listener must see the current step
  // count without re-subscribing (and re-stamping a session) when it changes.
  const stepCountRef = useRef(0)
  useEffect(() => {
    stepCountRef.current = steps.length
  }, [steps])
  useEffect(() => {
    sessionRef.current = startFormSession()
    pushEntry({ screen: 'form', session: sessionRef.current, step: 0 })
    const onPopState = (event: PopStateEvent) => {
      const entry = entryOf(event)
      if (entry?.screen !== 'form' || !isLiveFormEntry(entry)) return // shell's job
      setStepAttempted(false)
      // Clamp as a belt: the session check already rejects foreign entries.
      setStepIndex(Math.min(entry.step, stepCountRef.current))
    }
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
      endFormSession()
    }
  }, [])

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
      setStepAttempted(true)
      return
    }
    pushEntry({ screen: 'form', session: sessionRef.current, step: stepIndex + 1 })
    setStepAttempted(false)
    setStepIndex(stepIndex + 1)
  }

  const submitApplication = () => {
    setState(submitAttempted)
    if (missing.length > 0) return
    // The application is sent: its history entries are stale from here on, so
    // browser Back on the result screen exits to the overview, never into the
    // submitted form.
    endFormSession()
    const screening = evaluateScreening(job.questions, state.answers)
    const nextPayload = buildPayload(job, state.answers, screening)
    console.log(nextPayload)
    setPayload(nextPayload)
    addAppliedJobIdToStorage(job.id)
    onSubmitted?.()
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
                  index === stepIndex && stepAttempted && stepMissing.includes(question.id)
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
          {stepIndex > 0 ? (
            <Button
              type="button"
              aria-label={t('back')}
              title={t('back')}
              onClick={() => history.back()}
            >
              <ArrowLeftIcon />
            </Button>
          ) : (
            <span />
          )}
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
