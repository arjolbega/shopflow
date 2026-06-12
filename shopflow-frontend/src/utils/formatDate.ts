import { format, formatDistanceToNow, parseISO } from "date-fns";

// "Jan 15, 2025"
export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "MMM d, yyyy");
}

// "Jan 15, 2025, 14:00" — shows YOUR local time, not UTC
export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), "MMM d, yyyy, HH:mm");
}

// "2 hours ago"
export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
}
