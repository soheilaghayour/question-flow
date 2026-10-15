import { useMemo, useState } from 'react'
import { normalizeJob } from '@/domain/normalize'
import { Button } from '@/components/atoms/Button'
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
            className={index === selectedIndex ? '' : 'opacity-60'}
            onClick={() => setSelectedIndex(index)}
          >
            {'job' in job.result ? job.result.job.title : 'Invalid job config'}
          </Button>
        ))}
      </nav>
      {selected &&
        ('job' in selected.result ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">{selected.result.job.title}</h2>
            <p className="text-muted">{selected.result.job.company}</p>
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
