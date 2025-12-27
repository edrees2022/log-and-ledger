/**
 * Collapsible Section Component
 * Expandable/collapsible sections with smooth animations
 */
import { useState, ReactNode, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react';

// Context for accordion behavior
interface AccordionContextValue {
  openItems: string[];
  toggleItem: (id: string) => void;
  allowMultiple: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

// Accordion Container
interface AccordionProps {
  children: ReactNode;
  defaultOpen?: string[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({
  children,
  defaultOpen = [],
  allowMultiple = true,
  className,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (allowMultiple) {
        return [...prev, id];
      }
      return [id];
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, allowMultiple }}>
      <div className={cn("space-y-2", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// Accordion Item
interface AccordionItemProps {
  id: string;
  title: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'bordered' | 'ghost';
}

export function AccordionItem({
  id,
  title,
  children,
  icon,
  badge,
  disabled = false,
  className,
  variant = 'default',
}: AccordionItemProps) {
  const context = useContext(AccordionContext);
  const [localOpen, setLocalOpen] = useState(false);
  
  const isOpen = context ? context.openItems.includes(id) : localOpen;
  const toggle = context 
    ? () => context.toggleItem(id) 
    : () => setLocalOpen(prev => !prev);

  const variantClasses = {
    default: 'bg-card',
    bordered: 'border rounded-lg',
    ghost: 'hover:bg-muted/50',
  };

  return (
    <div className={cn(variantClasses[variant], className)}>
      <button
        onClick={toggle}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between p-4 text-left transition-colors",
          "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          variant === 'bordered' && "rounded-lg",
          isOpen && variant === 'bordered' && "rounded-b-none border-b"
        )}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium">{title}</span>
          {badge}
        </div>
        <ChevronDown 
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform duration-200",
            isOpen && "transform rotate-180"
          )} 
        />
      </button>
      
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}

// Standalone Collapsible Section
interface CollapsibleSectionProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: 'default' | 'card' | 'minimal';
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  icon,
  actions,
  className,
  headerClassName,
  contentClassName,
  variant = 'default',
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const variantStyles = {
    default: {
      container: 'border rounded-lg',
      header: 'p-4 border-b',
      content: 'p-4',
    },
    card: {
      container: 'bg-card border rounded-lg shadow-sm',
      header: 'p-4',
      content: 'p-4 pt-0',
    },
    minimal: {
      container: '',
      header: 'py-2',
      content: 'py-2',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn(styles.container, className)}>
      <div 
        className={cn(
          "flex items-center justify-between cursor-pointer",
          styles.header,
          !isOpen && variant !== 'minimal' && "border-b-0",
          headerClassName
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <ChevronRight 
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-200",
              isOpen && "transform rotate-90"
            )} 
          />
          {icon}
          <span className="font-semibold">{title}</span>
        </div>
        {actions && (
          <div onClick={e => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </div>
      
      {isOpen && (
        <div className={cn(styles.content, contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
}

// Expandable Card
interface ExpandableCardProps {
  title: string;
  summary: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export function ExpandableCard({
  title,
  summary,
  children,
  defaultExpanded = false,
  className,
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold">{title}</h3>
            {!isExpanded && (
              <div className="mt-2 text-sm text-muted-foreground">
                {summary}
              </div>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            {isExpanded ? (
              <Minus className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Plus className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// Details/Summary Style Component
interface DetailsSectionProps {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function DetailsSection({
  summary,
  children,
  defaultOpen = false,
  className,
}: DetailsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("group", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <ChevronRight 
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-90"
          )} 
        />
        {summary}
      </button>
      {isOpen && (
        <div className="mt-2 ml-6 text-sm text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
}
