import { useState, useMemo, useEffect } from "react";

export const usePagination = (items, itemsPerPage = 9) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  useEffect(() => {
    setPage(1);
  }, [items.length, itemsPerPage]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, page, itemsPerPage]);

  return { page, setPage, totalPages, paginatedItems, totalItems: items.length };
};
