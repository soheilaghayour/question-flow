import type { Profile } from '@/domain/schema'
import { useI18n } from '@/i18n/useI18n'

/** The profile that feeds prefill, made visible: the candidate should see
 * WHERE prefilled answers come from before entering the form. Display only —
 * values render plain (no locale number formatting, see issue #21). */
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
      <h2 className="font-semibold">{t('profile_heading')}</h2>
      {name && <p className="font-medium">{name}</p>}
      {profile.headline && <p className="text-sm text-muted">{profile.headline}</p>}
      <dl className="flex flex-col gap-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-muted">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}
