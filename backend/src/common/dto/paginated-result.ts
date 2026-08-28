export interface PaginatedResult<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export function paginate<T>(
  items: T[],
  totalItems: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    items,
    meta: {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      currentPage: page,
    },
  };
}
