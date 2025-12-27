import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';

interface ReportContainerProps {
  className?: string;
}

export function ReportContainer({ children, className }: PropsWithChildren<ReportContainerProps>) {
  return (
    <div className={cn('space-y-6 w-full max-w-screen-lg mx-auto px-3 md:px-6', className)}>
      {children}
    </div>
  );
}

export default ReportContainer;
