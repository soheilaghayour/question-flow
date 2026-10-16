import type { Profile } from '@/domain/schema'
import { Heading } from '@/components/atoms/Heading'
import { Text } from '@/components/atoms/Text'
import { useI18n } from '@/i18n/useI18n'

export function ProfileCard({ profile }: { profile: Profile }) {
  const { t } = useI18n()
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
  const salary = profile.salary_expectation
  const rows: Array<[string, string]> = [
    [t('profile_location'), profile.location.city],
    [t('profile_salary'), `${salary.amount}${salary.currency ? ` ${salary.currency}` : ''}`],
    [t('profile_notice'), profile.notice_period.replace(/_/g, ' ')],
    [t('profile_experience'), String(profile.years_of_experience)],
    [
      t('profile_languages'),
      profile.languages.map((l) => `${l.language.toUpperCase()} (${l.level})`).join(', '),
    ],
  ]
  return (
    <aside className="flex h-fit flex-col gap-3 rounded-lg border border-muted bg-surface p-4">
      <Heading level={2} size="sm">
        {t('profile_heading')}
      </Heading>
      {name && <Text weight="medium">{name}</Text>}
      {profile.headline && (
        <Text tone="muted" size="sm">
          {profile.headline}
        </Text>
      )}
      <dl className="flex flex-col gap-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <Text as="dt" tone="muted" size="sm">
              {label}
            </Text>
            <Text as="dd" size="sm">
              {value}
            </Text>
          </div>
        ))}
      </dl>
    </aside>
  )
}
