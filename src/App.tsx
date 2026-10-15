import { useState } from 'react'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import { useI18n } from '@/i18n/useI18n'
import { profile, rawJobConfigs } from '@/data'
import { JobPage } from '@/pages/JobPage'
import { ApplyFlow } from '@/pages/ApplyFlow'
import { Button } from '@/components/atoms/Button'

function LanguageToggle() {
  const { language, toggleLanguage } = useI18n()
  // The toggle names the language it switches TO, in that language, so it is
  // readable precisely when the current UI language is the wrong one.
  return (
    <Button onClick={toggleLanguage}>{language === 'en' ? 'Deutsch' : 'English'}</Button>
  )
}

// Two screens via plain state — no router in V1 (DECISIONS #4). The wrapper
// object is the screen sentinel: `null` means "job page", independent of what
// the raw config itself is (unknown | null would collapse to unknown).
function Screens() {
  const [applying, setApplying] = useState<{ config: unknown } | null>(null)
  return applying === null ? (
    <JobPage configs={rawJobConfigs} onApply={(config) => setApplying({ config })} />
  ) : (
    <ApplyFlow rawJob={applying.config} profile={profile} />
  )
}

export function App() {
  return (
    <LanguageProvider>
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
        <header className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold text-primary">Instaffo Question Flow</h1>
          <LanguageToggle />
        </header>
        <Screens />
      </main>
    </LanguageProvider>
  )
}
