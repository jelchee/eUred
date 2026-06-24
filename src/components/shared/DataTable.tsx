import { useState, useMemo, useCallback } from 'react';
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  accessor: keyof T | ((row: T) => string | number | React.ReactNode);
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  emptyMessage?: string;
  rowClassName?: (row: T) => string;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  key: string | null;
  direction: SortDirection;
}

function getCellValue<T>(row: T, accessor: Column<T>['accessor']): string | number | React.ReactNode {
  if (typeof accessor === 'function') {
    return accessor(row);
  }
  return row[accessor] as string | number | React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  pageSize = 10,
  searchable = false,
  searchPlaceholder = 'Search...',
  className,
  emptyMessage = 'No data available',
  rowClassName,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = useCallback((columnKey: string) => {
    setSort((prev) => {
      if (prev.key !== columnKey) {
        return { key: columnKey, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key: columnKey, direction: 'desc' };
      }
      return { key: null, direction: null };
    });
    setCurrentPage(1);
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const value = getCellValue(row, col.accessor);
        if (value == null) return false;
        return String(value).toLowerCase().includes(query);
      })
    );
  }, [data, columns, searchQuery]);

  const sortedData = useMemo(() => {
    if (!sort.key || !sort.direction) return filteredData;

    const column = columns.find((col) => col.key === sort.key);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = getCellValue(a, column.accessor);
      const bVal = getCellValue(b, column.accessor);

      const aStr = aVal == null ? '' : String(aVal);
      const bStr = bVal == null ? '' : String(bVal);

      const aNum = Number(aStr);
      const bNum = Number(bStr);

      let comparison: number;
      if (!isNaN(aNum) && !isNaN(bNum) && aStr !== '' && bStr !== '') {
        comparison = aNum - bNum;
      } else {
        comparison = aStr.localeCompare(bStr);
      }

      return sort.direction === 'desc' ? -comparison : comparison;
    });
  }, [filteredData, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Reset page if out of bounds
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const handleRowKeyDown = useCallback(
    (row: T, e: React.KeyboardEvent) => {
      if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onRowClick(row);
      }
    },
    [onRowClick]
  );

  return (
    <div className={cn('w-full', className)}>
      {/* Search */}
      {searchable && (
        <div className="mb-4 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-sm text-left" role="grid">
          <thead className="bg-slate-800/80 text-slate-300 text-xs uppercase tracking-wider">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 font-medium whitespace-nowrap',
                    col.sortable && 'cursor-pointer select-none hover:text-slate-100'
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  onKeyDown={
                    col.sortable
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSort(col.key);
                          }
                        }
                      : undefined
                  }
                  tabIndex={col.sortable ? 0 : undefined}
                  aria-sort={
                    sort.key === col.key && sort.direction
                      ? sort.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  role={col.sortable ? 'columnheader' : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && sort.key === col.key && sort.direction === 'asc' && (
                      <ArrowUp className="h-3 w-3" aria-hidden="true" />
                    )}
                    {col.sortable && sort.key === col.key && sort.direction === 'desc' && (
                      <ArrowDown className="h-3 w-3" aria-hidden="true" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    'bg-slate-900/50 transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-slate-800/70 focus:bg-slate-800/70 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500',
                    rowClassName && rowClassName(row)
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={(e) => handleRowKeyDown(row, e)}
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? 'row' : undefined}
                >
                  {columns.map((col) => {
                    const rawValue = getCellValue(row, col.accessor);
                    const displayValue = col.render
                      ? col.render(rawValue as T[keyof T], row)
                      : rawValue;

                    return (
                      <td
                        key={col.key}
                        className="px-4 py-3 text-slate-200 whitespace-nowrap"
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sortedData.length > pageSize && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
            {sortedData.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="p-1.5 rounded-md border border-slate-700 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="p-1.5 rounded-md border border-slate-700 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
