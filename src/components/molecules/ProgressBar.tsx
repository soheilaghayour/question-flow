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
      <p className="text-sm text-muted">{label}</p>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 overflow-hidden rounded-full border border-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
