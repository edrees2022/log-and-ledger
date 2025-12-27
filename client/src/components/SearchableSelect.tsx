/**
 * Searchable Select Component
 * A combo box with search functionality for large lists
 */
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  Check,
  ChevronDown,
  Search,
  X,
  Loader2,
} from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  className?: string;
  maxHeight?: number;
  emptyMessage?: string;
  onSearch?: (query: string) => void;
  renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
  groupBy?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  multiple = false,
  disabled = false,
  loading = false,
  clearable = true,
  className,
  maxHeight = 300,
  emptyMessage,
  onSearch,
  renderOption,
  groupBy = false,
}: SearchableSelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedValues = useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const filteredOptions = useMemo(() => {
    if (!query) return options;
    const lowerQuery = query.toLowerCase();
    return options.filter(
      option =>
        option.label.toLowerCase().includes(lowerQuery) ||
        option.description?.toLowerCase().includes(lowerQuery)
    );
  }, [options, query]);

  const groupedOptions = useMemo(() => {
    if (!groupBy) return { ungrouped: filteredOptions };
    return filteredOptions.reduce((acc, option) => {
      const group = option.group || 'Other';
      if (!acc[group]) acc[group] = [];
      acc[group].push(option);
      return acc;
    }, {} as Record<string, SelectOption[]>);
  }, [filteredOptions, groupBy]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (onSearch) {
      const handler = setTimeout(() => onSearch(query), 300);
      return () => clearTimeout(handler);
    }
  }, [query, onSearch]);

  const handleSelect = useCallback((optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setOpen(false);
    }
  }, [multiple, selectedValues, onChange]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  }, [multiple, onChange]);

  const getSelectedLabel = () => {
    if (selectedValues.length === 0) {
      return placeholder || t('select.placeholder', 'Select...');
    }
    if (multiple) {
      return (
        <div className="flex flex-wrap gap-1">
          {selectedValues.slice(0, 2).map(val => {
            const option = options.find(o => o.value === val);
            return (
              <Badge key={val} variant="secondary" className="text-xs">
                {option?.label || val}
                <button
                  className="ml-1 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(val);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          {selectedValues.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{selectedValues.length - 2}
            </Badge>
          )}
        </div>
      );
    }
    const selected = options.find(o => o.value === selectedValues[0]);
    return selected?.label || selectedValues[0];
  };

  const renderOptionContent = (option: SelectOption, isSelected: boolean) => {
    if (renderOption) {
      return renderOption(option, isSelected);
    }
    return (
      <div className="flex items-center gap-3 flex-1">
        {option.icon}
        <div className="flex-1 min-w-0">
          <p className="truncate">{option.label}</p>
          {option.description && (
            <p className="text-xs text-muted-foreground truncate">
              {option.description}
            </p>
          )}
        </div>
        {isSelected && <Check className="h-4 w-4 flex-shrink-0" />}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selectedValues.length && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate flex-1 text-left">{getSelectedLabel()}</span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {clearable && selectedValues.length > 0 && !disabled && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        {/* Search Input */}
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder || t('select.search', 'Search...')}
              className="pl-8"
            />
          </div>
        </div>

        {/* Options List */}
        <ScrollArea style={{ maxHeight }}>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              {emptyMessage || t('select.noResults', 'No results found')}
            </div>
          ) : groupBy ? (
            Object.entries(groupedOptions).map(([group, groupOptions]) => (
              <div key={group}>
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                  {group}
                </div>
                {groupOptions.map(option => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/50",
                      option.disabled && "opacity-50 cursor-not-allowed",
                      selectedValues.includes(option.value) && "bg-muted"
                    )}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                  >
                    {renderOptionContent(option, selectedValues.includes(option.value))}
                  </div>
                ))}
              </div>
            ))
          ) : (
            filteredOptions.map(option => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/50",
                  option.disabled && "opacity-50 cursor-not-allowed",
                  selectedValues.includes(option.value) && "bg-muted"
                )}
                onClick={() => !option.disabled && handleSelect(option.value)}
              >
                {renderOptionContent(option, selectedValues.includes(option.value))}
              </div>
            ))
          )}
        </ScrollArea>

        {/* Footer for multiple select */}
        {multiple && selectedValues.length > 0 && (
          <div className="p-2 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t('select.selected', '{{count}} selected', { count: selectedValues.length })}
            </span>
            <Button variant="ghost" size="sm" onClick={() => onChange([])}>
              {t('select.clearAll', 'Clear all')}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
