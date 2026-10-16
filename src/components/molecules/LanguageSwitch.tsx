import { useLocation } from 'react-router'
import { NavItem } from '@/components/atoms/NavItem'
import { LANGUAGES } from '@/i18n/context'
import { LANGUAGE_PREFIXES, pathInLanguage } from '@/i18n/languagePath'
import { useI18n } from '@/i18n/useI18n'

export function LanguageSwitch() {
  const { language, t } = useI18n()
  const { pathname, search } = useLocation()
  const pagePath = pathname.slice(LANGUAGE_PREFIXES[language].length)
  return (
    <div role="group" aria-label={t('language')} className="flex items-center gap-1">
      {LANGUAGES.map((option) => (
        // replace: the wizard's Back must step through the form, not undo a switch.
        <NavItem key={option} size="compact" to={pathInLanguage(option, pagePath) + search} replace>
          {option.toUpperCase()}
        </NavItem>
      ))}
    </div>
  )
}
