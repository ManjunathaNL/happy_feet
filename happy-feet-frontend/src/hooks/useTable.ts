import { useState, useMemo, useCallback,useEffect } from 'react';

export interface TableOptions {
  itemsPerPage?: number;
  initialPage?: number;
  initialSearch?: string;
  searchableFields?: string[]; // Optional: limit search to specific fields
}

export const useTable = <T extends Record<string, any>>(
  data: T[],
  options: TableOptions = {}
) => {
  const {
    itemsPerPage: defaultItemsPerPage = 10,
    initialPage = 1,
    initialSearch = '',
    searchableFields,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);

  // Reset page when search or items per page changes
  const resetPage = useCallback(() => setPage(1), []);

  // Advanced filtering (optimized)
  const filteredData = useMemo(() => {
    if (!search.trim()) return [...data];

    const searchTerm = search.toLowerCase().trim();

    return data.filter(item => {
      if (searchableFields && searchableFields.length > 0) {
        return searchableFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(searchTerm);
        });
      }
      // Default: search all values
      return Object.values(item).some(val =>
        val && String(val).toLowerCase().includes(searchTerm)
      );
    });
  }, [data, search, searchableFields]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = useMemo(() => 
    Math.ceil(sortedData.length / itemsPerPage) || 1, 
    [sortedData.length, itemsPerPage]
  );

  useEffect(() => {
  if (page > totalPages) {
    setPage(totalPages);
  }
}, [page, totalPages]);

useEffect(() => {
  setPage(1);
}, [data]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, page, itemsPerPage]);

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    resetPage();
  }, [resetPage]);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  }, [totalPages]);

  const handleItemsPerPageChange = useCallback((newSize: number) => {
    setItemsPerPage(newSize);
    resetPage();
  }, [resetPage]);

  const toggleSort = useCallback((key: keyof T) => {
    setSortConfig(prev => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null; // reset sort
    });
  }, []);

  // Generate page numbers (smart pagination)
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, page - 2);
      let end = Math.min(totalPages - 1, page + 2);

      if (start > 2) pages.push(-1); // ellipsis
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push(-2); // ellipsis

      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  return {
    // Data
    paginatedData,
    filteredData: sortedData, // useful for showing total count
    totalRecords: data.length,
    filteredCount: sortedData.length,

    // Controls
    page,
    totalPages,
    itemsPerPage,
    search,
    sortConfig,

    // Handlers
    setPage,
      changePage: handlePageChange,
    setSearch: handleSearch,
    setItemsPerPage: handleItemsPerPageChange,
    toggleSort,

    // Utils
    pageNumbers,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    goToFirst: () => handlePageChange(1),
    goToLast: () => handlePageChange(totalPages),
  };
};