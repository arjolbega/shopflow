// Utility for merging Tailwind classes cleanly
// Equivalent to clsx — avoids class conflicts

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
