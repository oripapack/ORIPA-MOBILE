"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  /**
   * Primary — Open Pack CTA, positive actions.
   * Green per design spec: "Use green for positive actions, buyback, Open Pack."
   */
  primary: [
    "bg-ph-green text-ph-green-ink font-bold",
    "shadow-ph-cta",
    "hover:bg-ph-green-hover hover:shadow-ph-cta-hover",
    "active:scale-[0.98]",
    "disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed",
  ].join(" "),

  /**
   * Secondary — outlined, neutral. Demo pull, cancel, secondary actions.
   */
  secondary: [
    "bg-transparent text-ph-text font-semibold",
    "border border-ph-border-md",
    "hover:border-ph-border-high hover:bg-ph-surface-high",
    "active:scale-[0.98]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),

  /**
   * Ghost — text-only, low emphasis. Navigation links, dismiss actions.
   */
  ghost: [
    "bg-transparent text-ph-text-muted font-semibold",
    "hover:text-ph-text-sec",
    "active:scale-[0.98]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-xs rounded-ph-lg",
  md: "px-6 py-3.5 text-sm rounded-ph-xl",
  lg: "px-8 py-4 text-base rounded-ph-pill",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base
        "inline-flex items-center justify-center gap-2",
        "ph-transition select-none outline-none",
        "focus-visible:ring-2 focus-visible:ring-ph-green focus-visible:ring-offset-2 focus-visible:ring-offset-ph-bg",
        // Variants
        variantClasses[variant],
        sizeClasses[size],
        // Modifiers
        fullWidth && "w-full",
        isLoading && "cursor-wait",
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
