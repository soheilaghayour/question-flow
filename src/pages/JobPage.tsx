import { useMemo, useState } from 'react'
import { normalizeJob } from '@/domain/normalize'
import type { Profile } from '@/domain/schema'
import { Button } from '@/components/atoms/Button'
import { JobSummary } from '@/components/molecules/JobSummary'
import { ProfileCard } from '@/components/molecules/ProfileCard'
import { useI18n } from '@/i18n/useI18n'

interface JobPageProps {
  configs: readonly unknown[]
  profile: Profile
  /** Jobs already applied to in this session — their Apply button is disabled. */
  appliedJobIds: readonly string[]
  onApply: (config: unknown) => void
}

export function JobPage({ configs, profile, appliedJobIds, onApply }: JobPageProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { t } = useI18n()
  // Normalized here only for the shell (title/company); ApplyFlow re-normalizes
  // and owns the error state for a config that can't be displayed.
  const jobs = useMemo(
    () => configs.map((config) => ({ config, result: normalizeJob(config) })),
    [configs],
  )
  const selected = jobs[selectedIndex]
  const applied =
    selected !== undefined &&
    'job' in selected.result &&
    appliedJobIds.includes(selected.result.job.id)

  return (
    <div className="grid gap-6 md:grid-cols-[14rem_1fr_16rem]">
      <nav aria-label={t('jobs_heading')} className="flex flex-col gap-2">
        <h2 className="font-semibold">{t('jobs_heading')}</h2>
        {jobs.map((job, index) => (
          <Button
            key={index}
            aria-pressed={index === selectedIndex}
            onClick={() => setSelectedIndex(index)}
          >
            {'job' in job.result ? job.result.job.title : t('invalid_job')}
          </Button>
        ))}
      </nav>
      {selected &&
        ('job' in selected.result ? (
          <section className="flex flex-col gap-4">
            <JobSummary
              title={selected.result.job.title}
              company={selected.result.job.company}
            />
            <p>{t('job_description')}</p>
            {applied && <p className="text-muted">{t('applied_note')}</p>}
            <div>
              <Button disabled={applied} onClick={() => onApply(selected.config)}>
                {t('apply')}
              </Button>
            </div>
          </section>
        ) : (
          <p role="alert" className="text-error">
            {t('error_job_invalid')}
          </p>
        ))}
      <ProfileCard profile={profile} />
    </div>
  )
}
