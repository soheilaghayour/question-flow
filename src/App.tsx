import { Outlet } from 'react-router'
import { useI18n } from '@/i18n/useI18n'
import { Button } from '@/components/atoms/Button'
import { GlobeIcon } from '@/components/atoms/Icons'

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

/** The shell around every route: header with the language toggle, then the page. */
export function App() {
  const { t } = useI18n()
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-primary">{t('app_title')}</h1>
        <LanguageToggle />
      </header>
      <Outlet />
    </main>
  )
}
