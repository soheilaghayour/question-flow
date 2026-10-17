import { CurrentButton } from '@/components/atoms/CurrentButton'
import { LANGUAGES } from '@/i18n/context'
import { useI18n } from '@/i18n/useI18n'

export function LanguageSwitch() {
  const { language, setLanguage, t } = useI18n()
  return (
    <div role="group" aria-label={t('language')} className="flex items-center gap-1">
      {LANGUAGES.map((option) => (
        <CurrentButton key={option} current={option === language} onClick={() => setLanguage(option)}>
          {option.toUpperCase()}
        </CurrentButton>
      ))}
    </div>
  )
}
