import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

type Variant = "base" | "high" | "raised";
type Padding = "none" | "sm" | "md" | "lg";

interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Elevation level:
   *   base   → ph-surface   (most panels, card lists)
   *   high   → ph-surface-high  (hover state, side-sheets)
   *   raised → ph-surface-raise (selected tier, active modal)
   */
  variant?: Variant;
  padding?: Padding;
}

const variantClasses: Record<Variant, string> = {
  base:   "bg-ph-surface  border border-ph-border     shadow-ph-card",
  high:   "bg-ph-surface-high border border-ph-border-md  shadow-ph-card",
  raised: "bg-ph-surface-raise border border-ph-border-high shadow-ph-card",
};

const paddingClasses: Record<Padding, string> = {
  none: "",
  sm:   "p-3",
  md:   "p-4",
  lg:   "p-6",
};

export function SurfaceCard({
  variant = "base",
  padding = "md",
  className,
  children,
  ...props
}: SurfaceCardProps) {
  return (
    <div
      className={cn(
        "rounded-ph-xl ph-transition-colors",
        variantClasses[variant],
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
