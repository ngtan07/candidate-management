import { useState, useCallback } from "react";

export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const setPaginationData = useCallback((pagination) => {
    if (!pagination) return;
    if (pagination.page !== undefined) setPage(pagination.page);
    if (pagination.limit !== undefined) setLimit(pagination.limit);
    if (pagination.total !== undefined) setTotal(pagination.total);
    if (pagination.totalPages !== undefined) setTotalPages(pagination.totalPages);
  }, []);

  const nextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const goToPage = (pageNumber) => {
    const validPage = Math.max(1, Math.min(pageNumber, totalPages));
    setPage(validPage);
  };

  return {
    page,
    limit,
    total,
    totalPages,
    setPage,
    setLimit,
    setPaginationData,
    nextPage,
    prevPage,
    goToPage,
  };
};

export default usePagination;

