/**
 * Loading States Components
 * Various loading indicators and skeleton screens
 */
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Full Page Loader
interface PageLoaderProps {
  message?: string;
  className?: string;
}

export function PageLoader({ message, className }: PageLoaderProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] gap-4",
      className
    )}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {message && (
        <p className="text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
}

// Inline Loader
interface InlineLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InlineLoader({ size = 'md', className }: InlineLoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <Loader2 className={cn(
      "animate-spin text-muted-foreground",
      sizeClasses[size],
      className
    )} />
  );
}

// Skeleton Components
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      "animate-pulse bg-muted rounded",
      className
    )} />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && "w-3/4"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("border rounded-lg p-4 space-y-4", className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4, className }: { 
  rows?: number; 
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="flex gap-4 p-4 bg-muted/50 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4 border-b last:border-b-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className={cn(
                "h-4 flex-1",
                colIndex === 0 && "w-1/4 flex-none"
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 5, className }: { items?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-2">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm({ fields = 4, className }: { fields?: number; className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

// Button Loading State
interface LoadingButtonProps {
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function LoadingButton({
  loading,
  loadingText,
  children,
  className,
  disabled,
  onClick,
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium",
        "bg-primary text-primary-foreground",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      disabled={loading || disabled}
      onClick={onClick}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading ? loadingText || children : children}
    </button>
  );
}

// Progress Bar Loader
interface ProgressLoaderProps {
  progress: number;
  showPercent?: boolean;
  className?: string;
}

export function ProgressLoader({ progress, showPercent = true, className }: ProgressLoaderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
      {showPercent && (
        <p className="text-sm text-muted-foreground text-right">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  );
}

// Dots Loader
export function DotsLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

// Pulse Loader
export function PulseLoader({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <div 
        className="absolute inset-0 rounded-full bg-primary/30 animate-ping"
        style={{ animationDuration: '1.5s' }}
      />
      <div className="absolute inset-2 rounded-full bg-primary/50 animate-pulse" />
      <div className="absolute inset-4 rounded-full bg-primary" />
    </div>
  );
}
