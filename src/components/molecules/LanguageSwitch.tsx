import { Fragment } from 'react'
import { Link, useLocation } from 'react-router'
import { LANGUAGES } from '@/i18n/context'
import { LANGUAGE_PREFIXES, pathInLanguage } from '@/i18n/languagePath'
import { useI18n } from '@/i18n/useI18n'

export function LanguageSwitch() {
  const { language, t } = useI18n()
  const { pathname, search } = useLocation()
  const pagePath = pathname.slice(LANGUAGE_PREFIXES[language].length)
  return (
    <div role="group" aria-label={t('language')} className="flex items-center text-muted">
      {LANGUAGES.map((option, index) => (
        <Fragment key={option}>
          {index > 0 && <span aria-hidden="true">|</span>}
          {/* replace: the wizard's Back must step through the form, not undo a switch. */}
          <Link
            to={pathInLanguage(option, pagePath) + search}
            replace
            aria-current={option === language ? 'page' : undefined}
            className="rounded px-2 py-1 text-sm font-medium hover:text-primary aria-[current=page]:text-primary aria-[current=page]:underline aria-[current=page]:underline-offset-4 focus-ring"
          >
            {option.toUpperCase()}
          </Link>
        </Fragment>
      ))}
    </div>
  )
}
