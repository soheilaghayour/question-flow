import { Outlet } from 'react-router'
import { useI18n } from '@/i18n/useI18n'
import { Heading } from '@/components/atoms/Heading'
import { LanguageSwitch } from '@/components/molecules/LanguageSwitch'

export function App() {
  const { t } = useI18n()
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <Heading level={1} size="lg">
          {t('app_title')}
        </Heading>
        <LanguageSwitch />
      </header>
      <Outlet />
    </main>
  )
}
