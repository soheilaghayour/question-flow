import { useNavigate, useParams } from 'react-router'
import { Button } from '@/components/atoms/Button'
import { SubmissionResult } from '@/components/molecules/SubmissionResult'
import { useI18n } from '@/i18n/useI18n'
import { pathInLanguage } from '@/i18n/languagePath'

export function SubmitConfirmation() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { t, language } = useI18n()

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <SubmissionResult title={t('submitted_title')} body={t('submitted_body')} />
      <Button onClick={() => navigate(pathInLanguage(language, `/jobs/${jobId}`))}>{t('back_to_main')}</Button>
    </div>
  )
}
