import { cn } from "../../utils/cn";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface SpinnerProps {
  size?: Size;
  className?: string;
}

const sizes: Record<Size, string> = {
  xs: "w-3 h-3 border",
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-2",
  xl: "w-12 h-12 border-[3px]"
};

export default function Spinner({ size = "md", className }: SpinnerProps) {
  return <div className={cn("rounded-full animate-spin", "border-text-primary/20 border-t-text-primary", sizes[size], className)} />;
}
