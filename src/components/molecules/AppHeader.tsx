import { Heading } from '@/components/atoms/Heading'
import { useI18n } from '@/i18n/useI18n'
import { LanguageSwitch } from './LanguageSwitch'

export function AppHeader() {
  const { t } = useI18n()
  // sticky, not fixed: it stays in the flow, so no content offset tracks its height.
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-muted/30 bg-surface py-3">
      <Heading level={1} size="lg">
        {t('app_title')}
      </Heading>
      <LanguageSwitch />
    </header>
  )
}
