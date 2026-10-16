import { useNavigate, useParams } from 'react-router'
import { normalizeJob } from '@/domain/normalize'
import { profile, rawJobConfigsById } from '@/data'
import { Button } from '@/components/atoms/Button'
import { JobSummary } from '@/components/molecules/JobSummary'
import { ProfileCard } from '@/components/molecules/ProfileCard'
import { useI18n } from '@/i18n/useI18n'
import { pathInLanguage } from '@/i18n/languagePath'
import { getAppliedJobIdsFromStorage } from '@/utils/appliedJobs'

// Normalized here only for the list and summary; ApplyFlow re-normalizes and
// owns the error state for a config that can't be displayed.
const jobs = [...rawJobConfigsById].map(([id, config]) => ({ id, result: normalizeJob(config) }))

export function JobPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { t, language } = useI18n()
  const selected = jobs.find((job) => job.id === jobId)
  const applied = jobId !== undefined && getAppliedJobIdsFromStorage().includes(jobId)

  return (
    <div className="grid gap-6 md:grid-cols-[14rem_1fr_16rem]">
      <nav aria-label={t('jobs_heading')} className="flex flex-col gap-2">
        <h2 className="font-semibold">{t('jobs_heading')}</h2>
        {jobs.map((job) => (
          <Button
            key={job.id}
            aria-pressed={job.id === jobId}
            onClick={() => navigate(pathInLanguage(language, `/jobs/${job.id}`))}
          >
            {'job' in job.result ? job.result.job.title : t('invalid_job')}
          </Button>
        ))}
      </nav>
      {selected && 'job' in selected.result ? (
        <section className="flex flex-col gap-4">
          <JobSummary title={selected.result.job.title} company={selected.result.job.company} />
          <p>{t('job_description')}</p>
          {applied && <p className="text-muted">{t('applied_note')}</p>}
          <div>
            <Button disabled={applied} onClick={() => navigate(pathInLanguage(language, `/jobs/${selected.id}/apply?step=1`))}>
              {t('apply')}
            </Button>
          </div>
        </section>
      ) : (
        <p role="alert" className="text-error">
          {t('error_job_invalid')}
        </p>
      )}
      <ProfileCard profile={profile} />
    </div>
  )
}
