import { PropsWithChildren } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Table } from '@/components/ui/table';

interface TableContainerProps {
  className?: string;
}

export function TableContainer({ children, className }: PropsWithChildren<TableContainerProps>) {
  const isMobile = useIsMobile();
  return (
    <div className={cn(isMobile ? 'mobile-table-container' : 'overflow-x-auto', className)}>
      {children}
    </div>
  );
}

interface ResponsiveTableProps {
  className?: string;
}

export function ResponsiveTable({ children, className }: PropsWithChildren<ResponsiveTableProps>) {
  const isMobile = useIsMobile();
  return (
    <Table className={cn(isMobile ? 'table-mobile-stack' : 'min-w-full', className)}>
      {children}
    </Table>
  );
}

export default TableContainer;
