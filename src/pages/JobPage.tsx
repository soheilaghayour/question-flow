import { useMemo, useState } from 'react'
import { normalizeJob } from '@/domain/normalize'
import { Button } from '@/components/atoms/Button'
import { JobSummary } from '@/components/molecules/JobSummary'
import { useI18n } from '@/i18n/useI18n'

interface JobPageProps {
  configs: readonly unknown[]
  onApply: (config: unknown) => void
}

export function JobPage({ configs, onApply }: JobPageProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { t } = useI18n()
  // Normalized here only for the shell (title/company); ApplyFlow re-normalizes
  // and owns the error state for a config that can't be displayed.
  const jobs = useMemo(
    () => configs.map((config) => ({ config, result: normalizeJob(config) })),
    [configs],
  )
  const selected = jobs[selectedIndex]

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex flex-wrap gap-2">
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
          <section className="flex flex-col gap-2">
            <JobSummary
              title={selected.result.job.title}
              company={selected.result.job.company}
            />
            <div>
              <Button onClick={() => onApply(selected.config)}>{t('apply')}</Button>
            </div>
          </section>
        ) : (
          <p role="alert" className="text-error">
            {t('error_job_invalid')}
          </p>
        ))}
    </div>
  )
}
