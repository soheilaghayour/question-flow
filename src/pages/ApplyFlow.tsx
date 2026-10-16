import { useLayoutEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { evaluateScreening } from '@/domain/screening'
import { buildPayload, type Answers } from '@/domain/payload'
import { missingRequired } from '@/domain/answers'
import { answerText } from '@/domain/answerText'
import { useJobWizard } from '@/hooks/useJobWizard'
import { QuestionField } from '@/components/questions/QuestionField'
import { Button } from '@/components/atoms/Button'
import { Heading } from '@/components/atoms/Heading'
import { Text } from '@/components/atoms/Text'
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/atoms/Icons'
import { AnswerReview } from '@/components/molecules/AnswerReview'
import { ErrorText } from '@/components/molecules/ErrorText'
import { JobSummary } from '@/components/molecules/JobSummary'
import { ProgressBar } from '@/components/molecules/ProgressBar'
import { useI18n } from '@/i18n/useI18n'
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
  const [failedStepIndex, setFailedStepIndex] = useState<number | null>(null)
  const [openedOnStep] = useState(() => searchParams.get('step'))
  useLayoutEffect(() => {
    if (openedOnStep !== '1') navigate('?step=1', { replace: true })
  }, [openedOnStep, navigate])
  const { t, language, localizedPath } = useI18n()

  if ('error' in wizard) {
    return <ErrorText>{t('error_job_invalid')}</ErrorText>
  }
  const { job, steps } = wizard

  if (getAppliedJobIdsFromStorage().includes(job.id)) {
    return <Navigate to={localizedPath(`/jobs/${job.id}`)} replace />
  }
  const stepIndex = Number(searchParams.get('step')) - 1

  const totalSteps = steps.length + 1 // the summary screen is the last step
  const onSummary = stepIndex === steps.length
  const step = steps[stepIndex]

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
    if (stepIndex === 0 && location.key === 'default') navigate(localizedPath(`/jobs/${job.id}`), { replace: true })
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
    navigate(localizedPath(`/jobs/${job.id}/confirmation`), { replace: true })
  }

  const progressLabel = t('step_label')
    .replace('{current}', String(stepIndex + 1))
    .replace('{total}', String(totalSteps))

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <JobSummary title={job.title} company={job.company} />
      <ProgressBar label={progressLabel} fraction={(stepIndex + 1) / totalSteps} />
      {step && step.questions.some((q) => q.required) && (
        <Text tone="muted" size="sm">
          {t('required_hint')}
        </Text>
      )}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          if (onSummary) submitApplication()
          else handleNext()
        }}
        className="flex flex-col gap-6"
      >
        {/* Hidden, not unmounted, so half-typed answers survive Back/Next. */}
        {steps.map((wizardStep, index) => (
          <div key={wizardStep.questions[0].id} hidden={index !== stepIndex} className="flex flex-col gap-6">
            {wizardStep.prefilled && (
              <Heading level={2} size="sm">
                {t('from_profile')}
              </Heading>
            )}
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
            <Heading level={2} size="sm">
              {t('review_title')}
            </Heading>
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
