import { useNavigate, useParams } from 'react-router'
import { normalizeJob } from '@/data/normalize'
import { profile, rawJobConfigsById } from '@/data'
import { Button } from '@/components/ui/Button'
import { Heading } from '@/components/ui/Heading'
import { NavItem } from '@/components/ui/NavItem'
import { AppliedBadge } from './AppliedBadge'
import { Card } from '@/components/ui/Card'
import { ErrorText } from '@/components/ui/ErrorText'
import { JobSummary } from '@/components/JobSummary'
import { ProfileCard } from './ProfileCard'
import { useI18n } from '@/i18n/useI18n'
import { getAppliedJobIdsFromStorage } from '@/utils/appliedJobs'

const jobs = [...rawJobConfigsById].map(([id, config]) => ({ id, result: normalizeJob(config) }))

export function JobOverviewPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { t } = useI18n()
  const selected = jobs.find((job) => job.id === jobId)
  const appliedJobIds = getAppliedJobIdsFromStorage()

  return (
    <div className="grid gap-6 md:grid-cols-[14rem_1fr_16rem]">
      <nav aria-label={t('jobs_heading')} className="flex flex-col gap-2">
        <Heading level={2}>{t('jobs_heading')}</Heading>
        <ul className="flex flex-col gap-1">
          {jobs.map((job) => (
            <li key={job.id}>
              <NavItem to={`/jobs/${job.id}`}>
                {'job' in job.result ? job.result.job.title : t('invalid_job')}
                {appliedJobIds.includes(job.id) && <AppliedBadge />}
              </NavItem>
            </li>
          ))}
        </ul>
      </nav>
      {selected && 'job' in selected.result ? (
        <Card>
          <JobSummary title={selected.result.job.title} company={selected.result.job.company} />
          <p>{t('job_description')}</p>
          <div>
            {appliedJobIds.includes(selected.id) ? (
              <AppliedBadge />
            ) : (
              <Button onClick={() => navigate(`/jobs/${selected.id}/apply?step=1`)}>
                {t('apply')}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <ErrorText>{t('error_job_invalid')}</ErrorText>
        </Card>
      )}
      <ProfileCard profile={profile} />
    </div>
  )
}
