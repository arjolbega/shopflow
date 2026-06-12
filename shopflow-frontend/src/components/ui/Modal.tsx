import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

type ModalSize = "sm" | "md" | "lg" | "xl";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  showClose?: boolean;
}

const sizes: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl"
};

export default function Modal({ isOpen, onClose, title, children, size = "md", showClose = true }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={cn("relative w-full", "bg-bg-surface border border-border", "rounded-2xl shadow-2xl", "animate-in fade-in zoom-in-95 duration-200", sizes[size])} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between p-6 pb-0">
            {title && <h2 className="text-xl font-bold text-text-primary">{title}</h2>}
            {showClose && (
              <button onClick={onClose} className={cn("ml-auto p-1.5 rounded-lg", "text-text-muted hover:text-text-primary", "hover:bg-bg-elevated", "transition-colors duration-150", "cursor-pointer")}>
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
