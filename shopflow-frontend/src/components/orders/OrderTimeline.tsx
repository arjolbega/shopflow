import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "../../utils/cn";
import type { OrderStatus } from "../../types";

const STATUS_ORDER: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

const ORDER_STEPS: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: "pending", label: "Order Placed", icon: <Clock size={16} /> },
  { status: "processing", label: "Processing", icon: <Package size={16} /> },
  { status: "shipped", label: "Shipped", icon: <Package size={16} /> },
  { status: "delivered", label: "Delivered", icon: <CheckCircle size={16} /> }
];

const OrderTimeline = ({ status }: { status: OrderStatus }) => {
  const isCancelled = status === "cancelled" || status === "refunded";
  const currentIndex = STATUS_ORDER.indexOf(status);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 px-5 py-4 bg-error/5 border border-error/20 rounded-xl">
        <XCircle size={18} className="text-error flex-shrink-0" />
        <p className="text-sm text-error font-medium">This order has been {status}.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0">
      {ORDER_STEPS.map((step, i) => {
        const isCompleted = STATUS_ORDER.indexOf(step.status) <= currentIndex;
        const isCurrent = step.status === status;

        return (
          <div key={step.status} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300", isCompleted ? "bg-accent border-accent text-bg-base shadow-[0_0_12px_rgba(245,158,11,0.3)]" : "bg-bg-elevated border-border text-text-muted")}>{step.icon}</div>
              <span className={cn("text-xs font-medium whitespace-nowrap", isCurrent ? "text-accent" : isCompleted ? "text-text-secondary" : "text-text-muted")}>{step.label}</span>
            </div>
            {i < ORDER_STEPS.length - 1 && <div className={cn("flex-1 h-0.5 mb-5 mx-1 transition-all duration-500", STATUS_ORDER.indexOf(step.status) < currentIndex ? "bg-accent" : "bg-border")} />}
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
