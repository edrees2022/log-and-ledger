/**
 * Pull to Refresh Component
 * Native-like pull to refresh for mobile
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { RefreshCw, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshThreshold?: number;
  maxPull?: number;
  className?: string;
  disabled?: boolean;
}

type RefreshState = 'idle' | 'pulling' | 'ready' | 'refreshing';

export function PullToRefresh({
  children,
  onRefresh,
  refreshThreshold = 80,
  maxPull = 120,
  className,
  disabled = false,
}: PullToRefreshProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [state, setState] = useState<RefreshState>('idle');
  const [startY, setStartY] = useState(0);
  const [canPull, setCanPull] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || state === 'refreshing') return;

    const container = containerRef.current;
    if (!container) return;

    // Only allow pull if at top of scroll
    const scrollTop = container.scrollTop;
    if (scrollTop <= 0) {
      setCanPull(true);
      setStartY(e.touches[0].clientY);
    }
  }, [disabled, state]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!canPull || disabled || state === 'refreshing') return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0) {
      // Apply resistance as you pull further
      const resistance = 1 - Math.min(distance / (maxPull * 3), 0.7);
      const adjustedDistance = Math.min(distance * resistance, maxPull);
      
      setPullDistance(adjustedDistance);
      setState(adjustedDistance >= refreshThreshold ? 'ready' : 'pulling');

      // Prevent default scroll on pull
      e.preventDefault();
    }
  }, [canPull, disabled, state, startY, maxPull, refreshThreshold]);

  const handleTouchEnd = useCallback(async () => {
    setCanPull(false);

    if (state === 'ready') {
      setState('refreshing');
      setPullDistance(refreshThreshold * 0.6);

      try {
        await onRefresh();
      } finally {
        setState('idle');
        setPullDistance(0);
      }
    } else {
      setState('idle');
      setPullDistance(0);
    }
  }, [state, refreshThreshold, onRefresh]);

  // Reset on unmount
  useEffect(() => {
    return () => {
      setState('idle');
      setPullDistance(0);
    };
  }, []);

  const indicatorOpacity = Math.min(pullDistance / (refreshThreshold * 0.7), 1);
  const indicatorScale = 0.5 + Math.min(pullDistance / refreshThreshold, 1) * 0.5;
  const rotation = state === 'refreshing' ? 'animate-spin' : '';

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center overflow-hidden transition-transform"
        style={{
          height: `${pullDistance}px`,
          transform: `translateY(${-50 + Math.min(pullDistance / 2, 30)}px)`,
        }}
      >
        <div
          className={cn(
            'flex flex-col items-center gap-1 transition-opacity',
            state === 'idle' && 'opacity-0'
          )}
          style={{
            opacity: indicatorOpacity,
            transform: `scale(${indicatorScale})`,
          }}
        >
          <div className={cn(
            'p-2 rounded-full bg-muted',
            rotation
          )}>
            {state === 'ready' || state === 'refreshing' ? (
              <RefreshCw className="h-5 w-5 text-primary" />
            ) : (
              <ArrowDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {state === 'refreshing' 
              ? t('common.refreshing')
              : state === 'ready'
              ? t('common.releaseToRefresh')
              : t('common.pullToRefresh')
            }
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: state === 'refreshing' || state === 'idle' ? 'transform 0.2s' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Simple refresh button for non-touch scenarios
 */
interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  className?: string;
}

export function RefreshButton({ onRefresh, className }: RefreshButtonProps) {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClick = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isRefreshing}
      className={cn(
        'p-2 rounded-full hover:bg-muted transition-colors',
        isRefreshing && 'animate-spin',
        className
      )}
      title={t('common.refresh')}
    >
      <RefreshCw className="h-4 w-4" />
    </button>
  );
}
