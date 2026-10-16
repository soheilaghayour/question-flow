import { Outlet } from 'react-router'
import { useI18n } from '@/i18n/useI18n'
import { LanguageSwitch } from '@/components/molecules/LanguageSwitch'

/** The shell around every route: header with the language switch, then the page. */
export function App() {
  const { t } = useI18n()
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-primary">{t('app_title')}</h1>
        <LanguageSwitch />
      </header>
      <Outlet />
    </main>
  )
}
