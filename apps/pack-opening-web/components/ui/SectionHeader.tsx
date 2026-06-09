import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Small uppercase label above the title.
   * e.g. "Prize Pool", "Live from the vault"
   */
  eyebrow?: string;
  /** Main heading — bold, large */
  title: string;
  /** Optional supporting description below the title */
  lead?: string;
  /** Optional element aligned to the right of the eyebrow row */
  action?: React.ReactNode;
  align?: "left" | "center";
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  action,
  align = "left",
  className,
  ...props
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div className={cn(isCenter && "text-center", className)} {...props}>
      {(eyebrow || action) && (
        <div
          className={cn(
            "mb-2 flex items-center gap-3",
            isCenter ? "justify-center" : "justify-between",
          )}
        >
          {eyebrow && (
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ph-text-muted">
              {eyebrow}
            </p>
          )}
          {action && <div className="ml-auto">{action}</div>}
        </div>
      )}

      <h2 className="text-xl font-black tracking-tight text-ph-text sm:text-2xl">
        {title}
      </h2>

      {lead && (
        <p className="mt-1.5 text-sm leading-relaxed text-ph-text-sec">
          {lead}
        </p>
      )}
    </div>
  );
}
