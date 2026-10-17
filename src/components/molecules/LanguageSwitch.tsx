import { ToggleButton } from '@/components/atoms/ToggleButton'
import { LANGUAGES } from '@/i18n/context'
import { useI18n } from '@/i18n/useI18n'

export function LanguageSwitch() {
  const { language, setLanguage, t } = useI18n()
  return (
    <div role="group" aria-label={t('language')} className="flex items-center gap-1">
      {LANGUAGES.map((option) => (
        <ToggleButton key={option} pressed={option === language} onClick={() => setLanguage(option)}>
          {option.toUpperCase()}
        </ToggleButton>
      ))}
    </div>
  )
}
