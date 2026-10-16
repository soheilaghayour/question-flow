import { Fragment } from 'react'
import { Button } from '@/components/atoms/Button'
import { LANGUAGES } from '@/i18n/context'
import { useI18n } from '@/i18n/useI18n'

export function LanguageSwitch() {
  const { language, chooseLanguage, t } = useI18n()
  return (
    <div role="group" aria-label={t('language')} className="flex items-center text-muted">
      {LANGUAGES.map((option, index) => (
        <Fragment key={option}>
          {index > 0 && <span aria-hidden="true">|</span>}
          <Button variant="ghost" aria-pressed={option === language} onClick={() => chooseLanguage(option)}>
            {option.toUpperCase()}
          </Button>
        </Fragment>
      ))}
    </div>
  )
}
