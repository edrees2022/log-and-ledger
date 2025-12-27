/**
 * Data Table Component
 * Professional sortable, filterable data table
 */
import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface DataColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: DataColumn<T>[];
  isLoading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onRowClick?: (row: T) => void;
  pagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  pagination = true,
  pageSize: initialPageSize = 10,
  emptyMessage,
  className,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;
    
    return [...data].sort((a, b) => {
      const aVal = getNestedValue(a, sortKey);
      const bVal = getNestedValue(b, sortKey);
      
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  }, [sortKey, sortDirection]);

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;
    const allIds = paginatedData.map(row => row.id);
    const allSelected = allIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      onSelectionChange(selectedIds.filter(id => !allIds.includes(id)));
    } else {
      const combined = [...selectedIds, ...allIds];
      onSelectionChange(combined.filter((id, index) => combined.indexOf(id) === index));
    }
  }, [paginatedData, selectedIds, onSelectionChange]);

  const handleSelectRow = useCallback((id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  }, [selectedIds, onSelectionChange]);

  const isAllSelected = paginatedData.length > 0 && 
    paginatedData.every(row => selectedIds.includes(row.id));
  const isPartiallySelected = paginatedData.some(row => selectedIds.includes(row.id)) && !isAllSelected;

  const SortIcon = ({ column }: { column: string }) => {
    if (sortKey !== column) return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
    if (sortDirection === 'asc') return <ChevronUp className="h-4 w-4" />;
    return <ChevronDown className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className={`border rounded-lg ${className}`}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(ref) => {
                      if (ref) (ref as any).indeterminate = isPartiallySelected;
                    }}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={`${column.width ? `w-[${column.width}]` : ''}`}
                  style={{ textAlign: column.align || 'left' }}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ms-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort(column.key as string)}
                    >
                      {column.header}
                      <SortIcon column={column.key as string} />
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0)} 
                  className="h-32 text-center text-muted-foreground"
                >
                  {emptyMessage || t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  className={`${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''} ${
                    selectedIds.includes(row.id) ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onCheckedChange={() => handleSelectRow(row.id)}
                      />
                    </TableCell>
                  )}
                  {columns.map((column, colIndex) => (
                    <TableCell 
                      key={colIndex}
                      style={{ textAlign: column.align || 'left' }}
                    >
                      {column.render 
                        ? column.render(getNestedValue(row, column.key as string), row, rowIndex)
                        : getNestedValue(row, column.key as string)
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t('table.rowsPerPage', 'Rows per page')}</span>
            <Select value={String(pageSize)} onValueChange={(v) => {
              setPageSize(Number(v));
              setCurrentPage(1);
            }}>
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map(size => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t('table.pageInfo', 'Page {{current}} of {{total}}', { 
                current: currentPage, 
                total: totalPages 
              })}
            </span>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}
