import { Badge } from '@/components/ui/Badge'
import { CheckIcon } from '@/components/ui/Icons'
import { useI18n } from '@/i18n/useI18n'

export function AppliedBadge() {
  const { t } = useI18n()
  return (
    <Badge>
      <CheckIcon />
      {t('applied_badge')}
    </Badge>
  )
}
