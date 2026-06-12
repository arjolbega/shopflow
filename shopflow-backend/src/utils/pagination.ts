import { PaginationMeta } from "../types";

export interface PaginationResult {
  limit: number;
  offset: number;
  meta: (total: number) => PaginationMeta;
}

export function buildPagination(page: number, limit: number): PaginationResult {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const offset = (safePage - 1) * safeLimit;

  return {
    limit: safeLimit,
    offset,
    meta: (total: number): PaginationMeta => {
      const totalPages = Math.ceil(total / safeLimit);
      return {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1
      };
    }
  };
}
