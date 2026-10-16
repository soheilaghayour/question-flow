import { Text } from '@/components/atoms/Text'

interface ProgressBarProps {
  label: string
  /** 0..1 — the caller computes answered/total. */
  fraction: number
}

/** Visible progress keeps long forms finishable: seeing the bar move is the
 * nudge to answer one more question. */
export function ProgressBar({ label, fraction }: ProgressBarProps) {
  const percent = Math.round(Math.min(Math.max(fraction, 0), 1) * 100)
  return (
    <div className="flex flex-col gap-1">
      {/* aria-live: when the label changes (new wizard step), screen readers
          hear it — the visual content swap has no other announcement. */}
      <Text tone="muted" size="sm" aria-live="polite">{label}</Text>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 overflow-hidden rounded-full border border-muted"
      >
        {/* Growth animates only under motion-safe — reduced-motion users get
            the new width instantly (#36). */}
        <div
          className="h-full rounded-full bg-primary motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
