import { useState } from 'react'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import { useI18n } from '@/i18n/useI18n'
import { profile, rawJobConfigs } from '@/data'
import { JobPage } from '@/pages/JobPage'
import { ApplyFlow } from '@/pages/ApplyFlow'
import { Button } from '@/components/atoms/Button'
import { ArrowLeftIcon, GlobeIcon } from '@/components/atoms/Icons'

function LanguageToggle() {
  const { language, toggleLanguage } = useI18n()
  // The toggle names the language it switches TO, in that language, so it is
  // readable precisely when the current UI language is the wrong one. The
  // globe only signals "this is the language control" — icon-only would hide
  // WHICH language you switch to, so the text stays.
  return (
    <Button className="flex items-center gap-2" onClick={toggleLanguage}>
      <GlobeIcon />
      {language === 'en' ? 'Deutsch' : 'English'}
    </Button>
  )
}

// One shell owns navigation: which screen shows, the header back button, and
// which jobs were applied to (session-only — not persisted until drafts, V2-01).
// The wrapper object is the screen sentinel: `null` means "job page",
// independent of what the raw config itself is (DECISIONS #4: no router).
function AppShell() {
  const { t } = useI18n()
  const [applying, setApplying] = useState<{ config: unknown } | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [appliedJobIds, setAppliedJobIds] = useState<readonly string[]>([])
  const goHome = () => {
    setApplying(null)
    setSubmitted(false)
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Only while filling the form: the result screen navigates via its
              own centered button, and re-submitting is a closed door anyway. */}
          {applying !== null && !submitted && (
            <Button aria-label={t('back_to_jobs')} title={t('back_to_jobs')} onClick={goHome}>
              <ArrowLeftIcon />
            </Button>
          )}
          <h1 className="text-2xl font-semibold text-primary">Question Flow</h1>
        </div>
        <LanguageToggle />
      </header>
      {applying === null ? (
        <JobPage
          configs={rawJobConfigs}
          profile={profile}
          appliedJobIds={appliedJobIds}
          onApply={(config) => setApplying({ config })}
        />
      ) : (
        <ApplyFlow
          rawJob={applying.config}
          profile={profile}
          onBack={goHome}
          onSubmitted={(jobId) => {
            setSubmitted(true)
            setAppliedJobIds((ids) => (ids.includes(jobId) ? ids : [...ids, jobId]))
          }}
        />
      )}
    </main>
  )
}

export function App() {
  return (
    <LanguageProvider>
      <AppShell />
    </LanguageProvider>
  )
}
