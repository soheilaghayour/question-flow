import { Button } from '@/components/atoms/Button'
import { UI_LANGUAGES } from '@/i18n/context'
import { useI18n } from '@/i18n/useI18n'

export function LanguageSwitch() {
  const { language, setLanguage, t } = useI18n()
  return (
    <div role="group" aria-label={t('language')} className="flex items-center text-muted">
      {UI_LANGUAGES.map((option, index) => (
        <span key={option} className="flex items-center">
          {index > 0 && <span aria-hidden="true">|</span>}
          <Button variant="ghost" aria-pressed={option === language} onClick={() => setLanguage(option)}>
            {option.toUpperCase()}
          </Button>
        </span>
      ))}
    </div>
  )
}
