import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "../../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export default function Input({ label, error, hint, leftIcon, rightIcon, className, ref, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium tracking-widest uppercase text-text-secondary" htmlFor={label}>
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">{leftIcon}</div>}

        <input id={label} ref={ref} className={cn("w-full bg-bg-subtle border rounded-xl", "text-sm text-text-primary", "placeholder:text-text-muted", "transition-all duration-200", "outline-none", "focus:border-accent focus:ring-2 focus:ring-accent/10", error ? "border-error/60 focus:border-error focus:ring-error/10" : "border-border hover:border-border-hover", leftIcon ? "pl-10 pr-4 py-3" : "px-4 py-3", rightIcon ? "pl-4 pr-10 py-3" : "", className)} {...props} />

        {rightIcon && <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted">{rightIcon}</div>}
      </div>

      {error && (
        <p className="text-xs text-error flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}
