import { Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { Button } from '@/components/atoms/Button'
import { SubmissionResult } from '@/components/molecules/SubmissionResult'
import { useI18n } from '@/i18n/useI18n'
import { getAppliedJobIdsFromStorage } from '@/utils/appliedJobs'

export function AppliedPage() {
  const { jobId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useI18n()

  const state: unknown = location.state
  // The submit's navigation state counts too: blocked storage must not hide the confirmation.
  const fromSubmit = typeof state === 'object' && state !== null && 'screeningPassed' in state
  if (!fromSubmit && !getAppliedJobIdsFromStorage().includes(jobId)) {
    return <Navigate to={`/jobs/${jobId}`} replace />
  }
  // A failed screening adds one generic sentence — never the rule, threshold,
  // or question (DECISIONS #24).
  const screeningFailed = fromSubmit && !state.screeningPassed

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <SubmissionResult
        title={t('submitted_title')}
        body={t('submitted_body')}
        note={screeningFailed ? t('submitted_screening_note') : undefined}
      />
      <Button onClick={() => navigate(`/jobs/${jobId}`)}>{t('back_to_main')}</Button>
    </div>
  )
}
