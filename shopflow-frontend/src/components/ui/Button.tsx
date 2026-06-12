import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";
import Spinner from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: `
    bg-text-primary text-bg-base font-semibold
    hover:bg-text-primary/90
    disabled:bg-text-primary/40
  `,
  accent: `
    bg-accent text-bg-base font-semibold
    hover:bg-accent-hover
    disabled:bg-accent/40
    shadow-[0_4px_20px_rgba(245,158,11,0.2)]
    hover:shadow-[0_4px_24px_rgba(245,158,11,0.35)]
  `,
  secondary: `
    bg-transparent border border-accent text-accent font-medium
    hover:bg-accent-muted
    disabled:border-accent/30 disabled:text-accent/40
  `,
  ghost: `
    bg-transparent border border-border text-text-secondary font-medium
    hover:bg-bg-subtle hover:text-text-primary hover:border-border-hover
    disabled:text-text-muted disabled:border-border
  `,
  danger: `
    bg-error/10 border border-error/30 text-error font-medium
    hover:bg-error/20 hover:border-error/50
    disabled:opacity-40
  `
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-2 text-xs rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3.5 text-base rounded-xl gap-2.5"
};

export default function Button({ variant = "primary", size = "md", isLoading = false, fullWidth = false, leftIcon, rightIcon, children, disabled, className, ...props }: ButtonProps) {
  return (
    <button disabled={disabled || isLoading} className={cn("inline-flex items-center justify-center", "transition-all duration-200", "cursor-pointer select-none", "disabled:cursor-not-allowed", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50", variants[variant], sizes[size], fullWidth && "w-full", className)} {...props}>
      {isLoading ? (
        <Spinner size="sm" />
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
