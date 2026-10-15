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
import type { Profile } from '@/domain/schema'
import { QuestionField } from '@/components/questions/QuestionField'
import { Button } from '@/components/atoms/Button'
import { SubmissionResult } from '@/components/molecules/SubmissionResult'
import { useI18n } from '@/i18n/useI18n'

interface ApplyFlowProps {
  rawJob: unknown
  profile: Profile
}

export function ApplyFlow({ rawJob, profile }: ApplyFlowProps) {
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
      <SubmissionResult
        title={t('submitted_title')}
        body={t('submitted_body')}
        note={payload.screening.passed ? undefined : t('submitted_screening_note')}
      />
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
  }

  return (
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
  )
}
