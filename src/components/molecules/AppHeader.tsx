import { Heading } from '@/components/atoms/Heading'
import { useI18n } from '@/i18n/useI18n'
import { LanguageSwitch } from './LanguageSwitch'

export function AppHeader() {
  const { t } = useI18n()
  return (
    <header className="sticky top-0 z-10 border-b border-muted/30 bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Heading level={1} size="lg">
          {t('app_title')}
        </Heading>
        <LanguageSwitch />
      </div>
    </header>
  )
}
