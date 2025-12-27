/**
 * Search with Filters Component
 * Advanced search and filtering for enterprise use
 */
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal,
  Calendar,
  DollarSign,
  Tag
} from 'lucide-react';

export interface FilterDefinition {
  id: string;
  label: string;
  type: 'select' | 'date' | 'dateRange' | 'number' | 'numberRange' | 'text';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

export interface FilterValue {
  id: string;
  value: any;
  label?: string;
}

interface AdvancedSearchProps {
  placeholder?: string;
  filters: FilterDefinition[];
  onSearch: (query: string) => void;
  onFiltersChange: (filters: FilterValue[]) => void;
  className?: string;
}

export function AdvancedSearch({
  placeholder,
  filters,
  onSearch,
  onFiltersChange,
  className,
}: AdvancedSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    // Debounced search with setTimeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => onSearch(value), 300);
  };

  const handleFilterChange = useCallback((filter: FilterDefinition, value: any, label?: string) => {
    setActiveFilters(prev => {
      const existing = prev.findIndex(f => f.id === filter.id);
      let newFilters: FilterValue[];
      
      if (value === null || value === undefined || value === '') {
        newFilters = prev.filter(f => f.id !== filter.id);
      } else if (existing >= 0) {
        newFilters = [...prev];
        newFilters[existing] = { id: filter.id, value, label };
      } else {
        newFilters = [...prev, { id: filter.id, value, label }];
      }
      
      onFiltersChange(newFilters);
      return newFilters;
    });
  }, [onFiltersChange]);

  const clearFilter = (filterId: string) => {
    setActiveFilters(prev => {
      const newFilters = prev.filter(f => f.id !== filterId);
      onFiltersChange(newFilters);
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    onFiltersChange([]);
  };

  const getFilterValue = (filterId: string) => {
    return activeFilters.find(f => f.id === filterId)?.value;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={placeholder || t('search.placeholder', 'Search...')}
            className="ps-10"
            data-search-input
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => handleQueryChange('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter Button */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              {t('search.filters', 'Filters')}
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ms-1">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{t('search.advancedFilters', 'Advanced Filters')}</h4>
                {activeFilters.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    {t('search.clearAll', 'Clear all')}
                  </Button>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                {filters.map(filter => (
                  <FilterInput
                    key={filter.id}
                    filter={filter}
                    value={getFilterValue(filter.id)}
                    onChange={(value, label) => handleFilterChange(filter, value, label)}
                  />
                ))}
              </div>

              <Separator />
              
              <Button className="w-full" onClick={() => setIsFilterOpen(false)}>
                {t('search.applyFilters', 'Apply Filters')}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">{t('search.activeFilters', 'Active filters:')}</span>
          {activeFilters.map(filter => {
            const definition = filters.find(f => f.id === filter.id);
            return (
              <Badge key={filter.id} variant="secondary" className="gap-1">
                {definition?.label}: {filter.label || String(filter.value)}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => clearFilter(filter.id)}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface FilterInputProps {
  filter: FilterDefinition;
  value: any;
  onChange: (value: any, label?: string) => void;
}

function FilterInput({ filter, value, onChange }: FilterInputProps) {
  const { t } = useTranslation();

  switch (filter.type) {
    case 'select':
      return (
        <div className="space-y-2">
          <Label>{filter.label}</Label>
          <Select value={value || ''} onValueChange={(v) => {
            const option = filter.options?.find(o => o.value === v);
            onChange(v, option?.label);
          }}>
            <SelectTrigger>
              <SelectValue placeholder={t('search.selectOption', 'Select...')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('common.all', 'All')}</SelectItem>
              {filter.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'date':
      return (
        <div className="space-y-2">
          <Label>{filter.label}</Label>
          <DatePicker
            value={value ? new Date(value) : undefined}
            onChange={(date) => onChange(date?.toISOString(), date?.toLocaleDateString())}
          />
        </div>
      );

    case 'numberRange':
      return (
        <div className="space-y-2">
          <Label>{filter.label}</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder={t('search.min', 'Min')}
              value={value?.min || ''}
              onChange={(e) => onChange({ ...value, min: e.target.value })}
              className="w-24"
            />
            <span>-</span>
            <Input
              type="number"
              placeholder={t('search.max', 'Max')}
              value={value?.max || ''}
              onChange={(e) => onChange({ ...value, max: e.target.value })}
              className="w-24"
            />
          </div>
        </div>
      );

    case 'text':
    default:
      return (
        <div className="space-y-2">
          <Label>{filter.label}</Label>
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={filter.label}
          />
        </div>
      );
  }
}
