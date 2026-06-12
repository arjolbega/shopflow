import { cn } from "../../utils/cn";
import type { OrderStatus } from "../../types";

type BadgeVariant = "default" | "accent" | "success" | "error" | "warning" | "info" | "muted";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-bg-elevated text-text-secondary border-border",
  accent: "bg-accent-muted text-accent border-border-accent",
  success: "bg-success/10 text-success border-success/20",
  error: "bg-error/10 text-error border-error/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20",
  muted: "bg-bg-subtle text-text-muted border-border"
};

export default function Badge({ children, variant = "default", className, dot = false }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", "px-2.5 py-0.5 rounded-full", "text-xs font-medium", "border", variants[variant], className)}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", variant === "success" && "bg-success", variant === "error" && "bg-error", variant === "warning" && "bg-warning", variant === "accent" && "bg-accent", variant === "info" && "bg-info", variant === "muted" && "bg-text-muted", variant === "default" && "bg-text-secondary")} />}
      {children}
    </span>
  );
}

// ─── Order Status Badge ───────────────────────────────
// Convenience component used throughout the app

const statusVariants: Record<OrderStatus, BadgeVariant> = {
  pending: "warning",
  processing: "info",
  shipped: "accent",
  delivered: "success",
  cancelled: "error",
  refunded: "muted"
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded"
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <Badge variant={statusVariants[status]} dot>
      {statusLabels[status]}
    </Badge>
  );
}
