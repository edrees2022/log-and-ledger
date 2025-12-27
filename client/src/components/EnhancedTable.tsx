import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Columns,
  Download,
  Printer,
  Search,
  X,
  Pin,
  PinOff,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface Column<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  filterable?: boolean;
  pinned?: "left" | "right" | null;
  hidden?: boolean;
  width?: number | string;
  align?: "left" | "center" | "right";
}

interface EnhancedTableProps<T extends { id: string | number }> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  selectable?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string;
  striped?: boolean;
  compact?: boolean;
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
}

// Regular Row Component
function TableRowComponent<T extends { id: string | number }>({
  row,
  columns,
  isSelected,
  onSelect,
  onRowClick,
  onRowDoubleClick,
  selectable,
  actions,
}: {
  row: T;
  columns: Column<T>[];
  isSelected: boolean;
  onSelect: (id: string | number) => void;
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  selectable: boolean;
  actions?: (row: T) => React.ReactNode;
}) {
  const getCellValue = (column: Column<T>) => {
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    return row[column.accessor] as React.ReactNode;
  };

  return (
    <TableRow
      className={`${isSelected ? "bg-primary/10" : ""} cursor-pointer hover:bg-muted/50`}
      onClick={() => onRowClick?.(row)}
      onDoubleClick={() => onRowDoubleClick?.(row)}
    >
      {selectable && (
        <TableCell className="w-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(row.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </TableCell>
      )}
      {columns
        .filter((col) => !col.hidden)
        .map((column) => (
          <TableCell
            key={column.id}
            className={`${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : ""}`}
            style={{ width: column.width }}
          >
            {getCellValue(column)}
          </TableCell>
        ))}
      {actions && (
        <TableCell className="w-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">{actions(row)}</DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      )}
    </TableRow>
  );
}

export default function EnhancedTable<T extends { id: string | number }>({
  data,
  columns: initialColumns,
  onRowClick,
  onRowDoubleClick,
  onSelectionChange,
  selectable = false,
  stickyHeader = true,
  maxHeight = "auto",
  compact = false,
  actions,
  emptyMessage,
  loading = false,
}: EnhancedTableProps<T>) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // State
  const [columns, setColumns] = useState<Column<T>[]>(initialColumns);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;

    const column = columns.find((col) => col.id === sortColumn);
    if (!column) return 0;

    let aValue: any, bValue: any;

    if (typeof column.accessor === "function") {
      aValue = column.accessor(a);
      bValue = column.accessor(b);
    } else {
      aValue = a[column.accessor];
      bValue = b[column.accessor];
    }

    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const comparison = aValue < bValue ? -1 : 1;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Filter data
  const filteredData = searchQuery
    ? sortedData.filter((row) =>
        columns.some((col) => {
          let value: any;
          if (typeof col.accessor === "function") {
            value = col.accessor(row);
          } else {
            value = row[col.accessor];
          }
          return String(value).toLowerCase().includes(searchQuery.toLowerCase());
        })
      )
    : sortedData;

  // Handle sort
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  // Handle selection
  const handleSelect = useCallback(
    (id: string | number) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        onSelectionChange?.(Array.from(newSet));
        return newSet;
      });
    },
    [onSelectionChange]
  );

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = new Set(filteredData.map((row) => row.id));
      setSelectedIds(allIds);
      onSelectionChange?.(Array.from(allIds));
    }
  }, [filteredData, selectedIds, onSelectionChange]);

  // Toggle column visibility
  const toggleColumn = (columnId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, hidden: !col.hidden } : col
      )
    );
  };

  // Pin column
  const pinColumn = (columnId: string, side: "left" | "right" | null) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, pinned: side } : col
      )
    );
  };

  // Visible columns (pinned first, then others)
  const visibleColumns = [
    ...columns.filter((col) => col.pinned === "left" && !col.hidden),
    ...columns.filter((col) => !col.pinned && !col.hidden),
    ...columns.filter((col) => col.pinned === "right" && !col.hidden),
  ];

  // Export to CSV
  const exportToCSV = () => {
    const headers = visibleColumns.map((col) => col.header).join(",");
    const rows = filteredData
      .map((row) =>
        visibleColumns
          .map((col) => {
            let value: any;
            if (typeof col.accessor === "function") {
              value = col.accessor(row);
            } else {
              value = row[col.accessor];
            }
            return `"${String(value || "").replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`rounded-lg border ${isExpanded ? "fixed inset-4 z-50 bg-background" : ""}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          {showSearch ? (
            <div className="flex items-center gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("common.search")}
                className="h-8 w-64"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setShowSearch(true)}>
              <Search className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Columns className="h-4 w-4 mr-1" />
                {t("enhancedTable.columns")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {columns.map((col) => (
                <DropdownMenuItem
                  key={col.id}
                  onClick={() => toggleColumn(col.id)}
                >
                  {col.hidden ? (
                    <EyeOff className="h-4 w-4 mr-2" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  {col.header}
                  {col.hidden && <span className="ml-auto text-muted-foreground">{t("common.hidden")}</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size > 0
              ? t("enhancedTable.selectedCount", { count: selectedIds.size })
              : t("enhancedTable.totalCount", { count: filteredData.length })}
          </span>
          <Button variant="ghost" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div
        className={`overflow-auto ${compact ? "text-sm" : ""}`}
        style={{ maxHeight: isExpanded ? "calc(100vh - 120px)" : maxHeight }}
      >
        <Table>
          <TableHeader className={stickyHeader ? "sticky top-0 bg-background z-10" : ""}>
            <TableRow>
              {selectable && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedIds.size === filteredData.length && filteredData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.id}
                  className={`${column.sortable ? "cursor-pointer select-none" : ""} ${
                    column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : ""
                  } ${column.pinned ? "bg-muted/50" : ""}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    {column.pinned && (
                      <Pin className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span className="ml-auto">
                        {sortColumn === column.id ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </span>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => pinColumn(column.id, "left")}>
                          <Pin className="h-4 w-4 mr-2" />
                          {t("enhancedTable.pinLeft")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => pinColumn(column.id, "right")}>
                          <Pin className="h-4 w-4 mr-2 rotate-180" />
                          {t("enhancedTable.pinRight")}
                        </DropdownMenuItem>
                        {column.pinned && (
                          <DropdownMenuItem onClick={() => pinColumn(column.id, null)}>
                            <PinOff className="h-4 w-4 mr-2" />
                            {t("enhancedTable.unpin")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleColumn(column.id)}>
                          <EyeOff className="h-4 w-4 mr-2" />
                          {t("enhancedTable.hideColumn")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableHead>
              ))}
              {actions && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    visibleColumns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)
                  }
                  className="h-32 text-center text-muted-foreground"
                >
                  {loading ? t("common.loading") : emptyMessage || t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <TableRowComponent
                  key={row.id}
                  row={row}
                  columns={visibleColumns}
                  isSelected={selectedIds.has(row.id)}
                  onSelect={handleSelect}
                  onRowClick={onRowClick}
                  onRowDoubleClick={onRowDoubleClick}
                  selectable={selectable}
                  actions={actions}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
