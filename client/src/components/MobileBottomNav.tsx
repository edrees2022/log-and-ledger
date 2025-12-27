/**
 * Mobile Bottom Navigation Component
 * Fixed bottom navigation bar for mobile devices
 * Shows key actions and navigation items
 */
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useSidebar } from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Receipt,
  Users,
  Package,
  ChartBar,
  Plus,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

export function MobileBottomNav() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { setOpenMobile } = useSidebar();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: t('sidebar.dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/dashboard',
    },
    {
      id: 'invoices',
      label: t('sidebar.invoices'),
      icon: <Receipt className="h-5 w-5" />,
      href: '/sales/invoices',
    },
    {
      id: 'contacts',
      label: t('sidebar.contacts'),
      icon: <Users className="h-5 w-5" />,
      href: '/contacts',
    },
    {
      id: 'inventory',
      label: t('sidebar.inventory'),
      icon: <Package className="h-5 w-5" />,
      href: '/inventory',
    },
    {
      id: 'reports',
      label: t('sidebar.reports'),
      icon: <ChartBar className="h-5 w-5" />,
      href: '/reports',
    },
  ];

  const quickActions = [
    { id: 'new-invoice', label: t('sales.newInvoice'), href: '/sales/invoices/new' },
    { id: 'new-contact', label: t('contacts.addContact'), href: '/contacts/new' },
    { id: 'new-item', label: t('inventory.addItem'), href: '/inventory/new' },
    { id: 'new-expense', label: t('purchases.newExpense'), href: '/purchases/expenses/new' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return location === '/dashboard' || location === '/';
    return location.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setLocation(item.href)}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full min-w-0 px-1',
              'transition-colors touch-manipulation',
              isActive(item.href)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className={cn(
              'transition-transform',
              isActive(item.href) && 'scale-110'
            )}>
              {item.icon}
            </span>
            <span className="text-[10px] mt-1 truncate max-w-full">
              {item.label}
            </span>
          </button>
        ))}

        {/* Quick Actions Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center justify-center flex-1 h-full min-w-0 px-1 text-muted-foreground hover:text-foreground touch-manipulation">
              <div className="relative">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-1">{t('common.new')}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-48">
            {quickActions.map((action) => (
              <DropdownMenuItem
                key={action.id}
                onClick={() => setLocation(action.href)}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Menu Button */}
        <button
          onClick={() => setOpenMobile(true)}
          className="flex flex-col items-center justify-center flex-1 h-full min-w-0 px-1 text-muted-foreground hover:text-foreground touch-manipulation"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] mt-1">{t('common.menu')}</span>
        </button>
      </div>
    </nav>
  );
}

/**
 * Hook to check if we're on mobile
 */
export function useIsMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}
