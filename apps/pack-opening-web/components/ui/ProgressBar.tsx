import { cn } from "../utils/cn";

interface ProgressBarProps {
  /** Fraction 0–1 */
  value: number;
  /** e.g. "Remaining pulls" */
  label?: string;
  /** e.g. "196,304 / 1,000,000 · 80.3% left" */
  sublabel?: string;
  color?: "green" | "red";
  className?: string;
}

const fillClasses = {
  green: "bg-ph-green",
  red:   "bg-ph-red",
};

export function ProgressBar({
  value,
  label,
  sublabel,
  color = "green",
  className,
}: ProgressBarProps) {
  const pct = Math.min(1, Math.max(0, value)) * 100;

  return (
    <div className={cn("w-full", className)}>
      {(label || sublabel) && (
        <div className="mb-2 flex items-baseline justify-between gap-2">
          {label   && <span className="text-xs font-semibold text-ph-text-sec">{label}</span>}
          {sublabel && <span className="text-xs text-ph-text-muted tabular-nums">{sublabel}</span>}
        </div>
      )}

      {/* Track */}
      <div className="h-1.5 w-full overflow-hidden rounded-ph-pill bg-ph-surface-high">
        {/* Fill */}
        <div
          className={cn("h-full rounded-ph-pill transition-[width] duration-ph-slow ease-out", fillClasses[color])}
          style={{ width: `${pct.toFixed(2)}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
