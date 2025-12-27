/**
 * Mobile-Friendly Date Picker
 * Touch-optimized date selection with swipe gestures
 */
import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';

interface MobileDatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  title?: string;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function MobileDatePicker({
  open,
  onOpenChange,
  value,
  onChange,
  minDate,
  maxDate,
  title,
}: MobileDatePickerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const today = new Date();
  const [viewDate, setViewDate] = useState(value || today);
  const [selectedDate, setSelectedDate] = useState(value);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Get calendar days
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);

  // Generate calendar grid
  const calendarDays = [];
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i),
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    });
  }
  
  // Next month days
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const goToPreviousMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left = next month (or prev in RTL)
        isRTL ? goToPreviousMonth() : goToNextMonth();
      } else {
        // Swipe right = prev month (or next in RTL)
        isRTL ? goToNextMonth() : goToPreviousMonth();
      }
    }
    
    setTouchStart(null);
  };

  const handleDateSelect = (date: Date) => {
    if (isDisabled(date)) return;
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      onChange(selectedDate);
      onOpenChange(false);
    }
  };

  const goToToday = () => {
    setViewDate(today);
    setSelectedDate(today);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {title || t('common.selectDate')}
          </DialogTitle>
        </DialogHeader>

        <div
          ref={calendarRef}
          className="p-4"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={isRTL ? goToNextMonth : goToPreviousMonth}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="font-semibold">
              {MONTHS[month]} {year}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={isRTL ? goToPreviousMonth : goToNextMonth}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_OF_WEEK.map(day => (
              <div
                key={day}
                className="text-center text-xs text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, index) => (
              <button
                key={index}
                onClick={() => handleDateSelect(item.date)}
                disabled={isDisabled(item.date)}
                className={cn(
                  'aspect-square flex items-center justify-center rounded-full text-sm transition-colors touch-manipulation',
                  !item.isCurrentMonth && 'text-muted-foreground/50',
                  item.isCurrentMonth && 'text-foreground',
                  isDisabled(item.date) && 'opacity-30 cursor-not-allowed',
                  isToday(item.date) && 'border-2 border-primary',
                  isSelected(item.date) && 'bg-primary text-primary-foreground',
                  !isSelected(item.date) && !isDisabled(item.date) && 'hover:bg-muted active:bg-muted/80'
                )}
              >
                {item.day}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
            >
              {t('common.today')}
            </Button>
          </div>
        </div>

        <DialogFooter className="p-4 pt-0 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedDate} className="flex-1">
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Date input that opens mobile picker
 */
interface DateInputProps {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function MobileDateInput({
  value,
  onChange,
  placeholder,
  minDate,
  maxDate,
  className,
}: DateInputProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2 border rounded-md',
          'bg-background text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          !value && 'text-muted-foreground',
          className
        )}
      >
        <span>{value ? formatDate(value) : placeholder || t('common.selectDate')}</span>
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      </button>

      <MobileDatePicker
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
      />
    </>
  );
}
