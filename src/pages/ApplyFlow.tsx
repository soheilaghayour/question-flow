import { useLayoutEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { evaluateScreening } from '@/domain/screening'
import { buildPayload, type Answers } from '@/domain/payload'
import { missingRequired } from '@/domain/answers'
import { answerText } from '@/domain/answerText'
import { useJobWizard } from '@/hooks/useJobWizard'
import { QuestionField } from '@/components/questions/QuestionField'
import { Button } from '@/components/atoms/Button'
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/atoms/Icons'
import { AnswerReview } from '@/components/molecules/AnswerReview'
import { JobSummary } from '@/components/molecules/JobSummary'
import { ProgressBar } from '@/components/molecules/ProgressBar'
import { useI18n } from '@/i18n/useI18n'
import { pathInLanguage } from '@/i18n/languagePath'
import { addAppliedJobIdToStorage, getAppliedJobIdsFromStorage } from '@/utils/appliedJobs'

export function ApplyFlow() {
  const { jobId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const wizard = useJobWizard(jobId)
  const [answers, setAnswers] = useState<Answers>(() =>
    'job' in wizard ? wizard.initialAnswers : {},
  )
  // The step whose Next failed shows its errors; a freshly entered step never
  // opens pre-littered with error text.
  const [failedStepIndex, setFailedStepIndex] = useState<number | null>(null)
  const [openedOnStep] = useState(() => searchParams.get('step'))
  useLayoutEffect(() => {
    if (openedOnStep !== '1') navigate('?step=1', { replace: true })
  }, [openedOnStep, navigate])
  const { t, language } = useI18n()

  if ('error' in wizard) {
    return (
      <p role="alert" className="text-error">
        {t('error_job_invalid')}
      </p>
    )
  }
  const { job, steps } = wizard

  // Back after submitting walks into this form's old steps.
  if (getAppliedJobIdsFromStorage().includes(job.id)) {
    return <Navigate to={pathInLanguage(language, `/jobs/${job.id}`)} replace />
  }
  const stepIndex = Number(searchParams.get('step')) - 1

  const totalSteps = steps.length + 1 // the summary screen is the last step
  const onSummary = stepIndex === steps.length
  const step = steps[stepIndex]

  // Hard gate (DECISIONS #5): Next never advances past an unanswered required
  // question on the current step — the errors appear on the fields in view.
  // Back and typing are never gated.
  const stepMissing = step ? missingRequired(step.questions, answers) : []

  const handleNext = () => {
    if (stepMissing.length > 0) {
      setFailedStepIndex(stepIndex)
      return
    }
    setFailedStepIndex(null)
    setSearchParams({ step: String(stepIndex + 2) })
  }

  const handleBack = () => {
    // A form opened directly (shared link) has no app entry behind it to go back to.
    if (stepIndex === 0 && location.key === 'default') navigate(pathInLanguage(language, `/jobs/${job.id}`), { replace: true })
    else navigate(-1)
  }

  const submitApplication = () => {
    // Back, clearing an answer, then browser Forward skips that step's Next gate.
    const unfinishedStepIndex = steps.findIndex(
      (s) => missingRequired(s.questions, answers).length > 0,
    )
    if (unfinishedStepIndex !== -1) {
      setFailedStepIndex(unfinishedStepIndex)
      setSearchParams({ step: String(unfinishedStepIndex + 1) })
      return
    }
    const screening = evaluateScreening(job.questions, answers)
    console.log(buildPayload(job, answers, screening))
    addAppliedJobIdToStorage(job.id)
    navigate(pathInLanguage(language, `/jobs/${job.id}/confirmation`), { replace: true })
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
          <div key={wizardStep.questions[0].id} hidden={index !== stepIndex} className="flex flex-col gap-6">
            {wizardStep.prefilled && <h2 className="font-medium">{t('from_profile')}</h2>}
            {wizardStep.questions.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                value={answers[question.id] ?? null}
                onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
                error={
                  index === failedStepIndex && stepMissing.includes(question.id)
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
            <AnswerReview
              items={job.questions.map((question) => ({
                id: question.id,
                question: question.question,
                answer: answerText(question, answers[question.id], {
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
          <Button variant="secondary" onClick={handleBack}>
            <ArrowLeftIcon />
            {t('back')}
          </Button>
          <Button type="submit">
            {onSummary ? t('submit') : t('next')}
            {!onSummary && <ArrowRightIcon />}
          </Button>
        </div>
      </form>
    </div>
  )
}
