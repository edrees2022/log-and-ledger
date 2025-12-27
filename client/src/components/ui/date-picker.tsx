"use client"

import * as React from "react"
import { format, setMonth, setYear } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
  value?: Date | string
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
}

// Custom Calendar with month/year dropdowns
function CalendarWithDropdowns({
  selected,
  onSelect,
  disabled,
  locale,
  ...props
}: {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  locale?: any
}) {
  const { t } = useTranslation()
  const [month, setMonthState] = React.useState<Date>(selected || new Date())

  const months = [
    t("months.january", "يناير"),
    t("months.february", "فبراير"),
    t("months.march", "مارس"),
    t("months.april", "أبريل"),
    t("months.may", "مايو"),
    t("months.june", "يونيو"),
    t("months.july", "يوليو"),
    t("months.august", "أغسطس"),
    t("months.september", "سبتمبر"),
    t("months.october", "أكتوبر"),
    t("months.november", "نوفمبر"),
    t("months.december", "ديسمبر"),
  ]

  // Generate years from 2000 to 2050
  const years = Array.from({ length: 51 }, (_, i) => 2000 + i)

  const handleMonthChange = (value: string) => {
    const newDate = setMonth(month, parseInt(value))
    setMonthState(newDate)
  }

  const handleYearChange = (value: string) => {
    const newDate = setYear(month, parseInt(value))
    setMonthState(newDate)
  }

  const handlePrevMonth = () => {
    setMonthState(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }

  const handleNextMonth = () => {
    setMonthState(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }

  return (
    <div className="p-3">
      {/* Month/Year Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={handlePrevMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <div className="flex gap-2">
          <Select value={month.getMonth().toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="h-8 w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={month.getFullYear().toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="h-8 w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={handleNextMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={month}
        onMonthChange={setMonthState}
        disabled={disabled}
        locale={locale}
        showOutsideDays
        classNames={{
          months: "flex flex-col",
          month: "space-y-4",
          caption: "hidden",
          nav: "hidden",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "day-outside text-muted-foreground aria-selected:bg-accent/50",
          day_disabled: "text-muted-foreground opacity-50",
          day_hidden: "invisible",
        }}
        {...props}
      />
    </div>
  )
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled,
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = React.useState(false)
  
  // Convert string to Date if needed
  const dateValue = React.useMemo(() => {
    if (!value) return undefined
    if (value instanceof Date) return value
    // Parse ISO date string (YYYY-MM-DD)
    const parsed = new Date(value)
    return isNaN(parsed.getTime()) ? undefined : parsed
  }, [value])

  const locale = i18n.language === 'ar' ? ar : enUS

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-start font-normal h-9",
            !dateValue && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="me-2 h-4 w-4" />
          {dateValue ? (
            format(dateValue, "PPP", { locale })
          ) : (
            <span>{placeholder || t("common.selectDate", "اختر التاريخ")}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarWithDropdowns
          selected={dateValue}
          onSelect={handleSelect}
          disabled={(date) => {
            if (minDate && date < minDate) return true
            if (maxDate && date > maxDate) return true
            return false
          }}
          locale={locale}
        />
      </PopoverContent>
    </Popover>
  )
}
