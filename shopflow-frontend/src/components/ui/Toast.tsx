import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import type { Toast, ToastType } from "../../store/toastStore";
import { useToastStore } from "../../store/toastStore";
import { cn } from "../../utils/cn";

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={16} className="text-success flex-shrink-0" />,
  error: <XCircle size={16} className="text-error flex-shrink-0" />,
  warning: <AlertTriangle size={16} className="text-warning flex-shrink-0" />,
  info: <Info size={16} className="text-info flex-shrink-0" />
};

const styles: Record<ToastType, string> = {
  success: "border-success/20 bg-success/5",
  error: "border-error/20 bg-error/5",
  warning: "border-warning/20 bg-warning/5",
  info: "border-info/20 bg-info/5"
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore();

  return (
    <div className={cn("flex items-start gap-3", "px-4 py-3 rounded-xl", "border backdrop-blur-sm", "bg-bg-surface", "shadow-lg", "min-w-[280px] max-w-[380px]", "animate-in slide-in-from-right-full duration-300", styles[toast.type])}>
      {icons[toast.type]}

      <p className="text-sm text-text-primary flex-1 leading-relaxed">{toast.message}</p>

      <button onClick={() => removeToast(toast.id)} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer flex-shrink-0 mt-0.5">
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
