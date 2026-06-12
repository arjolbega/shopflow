import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Column, PaginationMeta } from "../../types";
import Button from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import { cn } from "../../utils/cn";

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  rowKey: (row: T) => string | number;
}

export default function DataTable<T>({ columns, data, isLoading = false, pagination, onPageChange, emptyMessage = "No data found", rowKey }: DataTableProps<T>) {
  return (
    <div className="flex flex-col gap-0">
      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-elevated border-b border-border">
              {columns.map((col) => (
                <th key={col.key} className={cn("px-4 py-3 text-left", "text-xs font-semibold tracking-widest uppercase text-text-muted", col.width)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-bg-surface">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <p className="text-sm text-text-muted">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={rowKey(row)} className="hover:bg-bg-elevated/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-text-muted">
            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={!pagination.hasPrevPage} onClick={() => onPageChange(pagination.page - 1)} leftIcon={<ChevronLeft size={14} />}>
              Prev
            </Button>
            <span className="text-xs text-text-muted px-2">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button variant="ghost" size="sm" disabled={!pagination.hasNextPage} onClick={() => onPageChange(pagination.page + 1)} rightIcon={<ChevronRight size={14} />}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
