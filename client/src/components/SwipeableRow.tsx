/**
 * Swipeable Actions Component
 * Touch-friendly swipe actions for mobile lists
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Edit, Trash2, Eye, MoreHorizontal, Copy, Share } from 'lucide-react';

export interface SwipeAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: 'default' | 'primary' | 'danger' | 'warning' | 'success';
  onClick: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
}

const colorClasses = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary text-primary-foreground',
  danger: 'bg-destructive text-destructive-foreground',
  warning: 'bg-yellow-500 text-white',
  success: 'bg-green-500 text-white',
};

export function SwipeableRow({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className,
}: SwipeableRowProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startOffset, setStartOffset] = useState(0);

  const maxLeftOffset = leftActions.length * 80;
  const maxRightOffset = rightActions.length * 80;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartOffset(offsetX);
  }, [offsetX]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    let newOffset = startOffset + diff;

    // Apply boundaries
    if (leftActions.length === 0 && newOffset > 0) newOffset = 0;
    if (rightActions.length === 0 && newOffset < 0) newOffset = 0;

    newOffset = Math.max(-maxRightOffset, Math.min(maxLeftOffset, newOffset));

    setOffsetX(newOffset);
  }, [isDragging, startX, startOffset, leftActions.length, rightActions.length, maxLeftOffset, maxRightOffset]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);

    // Snap to actions or back to center
    if (offsetX > threshold && leftActions.length > 0) {
      setOffsetX(maxLeftOffset);
    } else if (offsetX < -threshold && rightActions.length > 0) {
      setOffsetX(-maxRightOffset);
    } else {
      setOffsetX(0);
    }
  }, [offsetX, threshold, leftActions.length, rightActions.length, maxLeftOffset, maxRightOffset]);

  const handleActionClick = (action: SwipeAction) => {
    action.onClick();
    setOffsetX(0);
  };

  const closeActions = () => {
    setOffsetX(0);
  };

  // Close on outside click
  useEffect(() => {
    if (offsetX === 0) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeActions();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [offsetX]);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 bottom-0 flex">
          {leftActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={cn(
                'flex flex-col items-center justify-center w-20 h-full',
                colorClasses[action.color]
              )}
              style={{
                transform: `translateX(${Math.min(0, offsetX - maxLeftOffset)}px)`,
                opacity: offsetX > 0 ? 1 : 0,
              }}
            >
              {action.icon}
              <span className="text-xs mt-1">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 bottom-0 flex">
          {rightActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={cn(
                'flex flex-col items-center justify-center w-20 h-full',
                colorClasses[action.color]
              )}
              style={{
                transform: `translateX(${Math.max(0, offsetX + maxRightOffset)}px)`,
                opacity: offsetX < 0 ? 1 : 0,
              }}
            >
              {action.icon}
              <span className="text-xs mt-1">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          'relative bg-background transition-transform',
          isDragging ? 'transition-none' : 'duration-200'
        )}
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

// Preset action creators
export function createEditAction(onClick: () => void, t: (key: string) => string): SwipeAction {
  return {
    id: 'edit',
    label: t('common.edit'),
    icon: <Edit className="h-5 w-5" />,
    color: 'primary',
    onClick,
  };
}

export function createDeleteAction(onClick: () => void, t: (key: string) => string): SwipeAction {
  return {
    id: 'delete',
    label: t('common.delete'),
    icon: <Trash2 className="h-5 w-5" />,
    color: 'danger',
    onClick,
  };
}

export function createViewAction(onClick: () => void, t: (key: string) => string): SwipeAction {
  return {
    id: 'view',
    label: t('common.view'),
    icon: <Eye className="h-5 w-5" />,
    color: 'default',
    onClick,
  };
}

export function createCopyAction(onClick: () => void, t: (key: string) => string): SwipeAction {
  return {
    id: 'copy',
    label: t('common.copy'),
    icon: <Copy className="h-5 w-5" />,
    color: 'success',
    onClick,
  };
}

export function createShareAction(onClick: () => void, t: (key: string) => string): SwipeAction {
  return {
    id: 'share',
    label: t('common.share'),
    icon: <Share className="h-5 w-5" />,
    color: 'primary',
    onClick,
  };
}
