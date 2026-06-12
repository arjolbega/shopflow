import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; label: string };
  accent?: boolean;
}

export default function StatCard({ title, value, subtitle, icon, trend, accent = false }: StatCardProps) {
  return (
    <div className={cn("bg-bg-surface border rounded-2xl p-5", "flex flex-col gap-4", accent ? "border-border-accent shadow-[0_0_24px_rgba(245,158,11,0.08)]" : "border-border")}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-1">{title}</p>
          <p className={cn("text-3xl font-bold", accent ? "text-accent" : "text-text-primary")} style={{ fontFamily: "var(--font-display)" }}>
            {value}
          </p>
          {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", accent ? "bg-accent-muted border border-border-accent text-accent" : "bg-bg-elevated border border-border text-text-secondary")}>{icon}</div>
      </div>

      {trend && (
        <div className={cn("flex items-center gap-1.5 text-xs font-medium", trend.value >= 0 ? "text-success" : "text-error")}>
          <span>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
          <span className="text-text-muted font-normal">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
