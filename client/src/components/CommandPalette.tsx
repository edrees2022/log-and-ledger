/**
 * Quick Actions Command Palette
 * Spotlight-style command palette for quick navigation and actions
 */
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  FileText,
  Plus,
  Receipt,
  ShoppingCart,
  Users,
  Package,
  Wallet,
  Settings,
  LayoutDashboard,
  Calculator,
  BarChart3,
  Building2,
  Briefcase,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  FolderKanban,
  BookOpen,
  Search,
  HelpCircle,
  Keyboard,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShowShortcuts?: () => void;
}

interface CommandAction {
  id: string;
  label: string;
  icon: React.ElementType;
  keywords?: string[];
  action: () => void;
  group: 'navigation' | 'create' | 'reports' | 'settings' | 'help';
}

export function CommandPalette({ open, onOpenChange, onShowShortcuts }: CommandPaletteProps) {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');

  // Define all available commands
  const commands: CommandAction[] = useMemo(() => [
    // Navigation
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard, keywords: ['home', 'main'], action: () => navigate('/'), group: 'navigation' },
    { id: 'invoices', label: t('sidebar.invoices'), icon: FileText, keywords: ['sales', 'billing'], action: () => navigate('/sales/invoices'), group: 'navigation' },
    { id: 'bills', label: t('sidebar.bills'), icon: ShoppingCart, keywords: ['purchases', 'expenses'], action: () => navigate('/purchases/bills'), group: 'navigation' },
    { id: 'contacts', label: t('sidebar.contacts'), icon: Users, keywords: ['customers', 'suppliers', 'vendors'], action: () => navigate('/contacts'), group: 'navigation' },
    { id: 'items', label: t('sidebar.items'), icon: Package, keywords: ['products', 'inventory'], action: () => navigate('/items'), group: 'navigation' },
    { id: 'accounts', label: t('sidebar.accounts'), icon: Wallet, keywords: ['chart', 'ledger', 'coa'], action: () => navigate('/accounts'), group: 'navigation' },
    { id: 'journals', label: t('sidebar.journals'), icon: BookOpen, keywords: ['entries', 'gl'], action: () => navigate('/journals'), group: 'navigation' },
    { id: 'banking', label: t('sidebar.banking'), icon: CreditCard, keywords: ['bank', 'reconciliation'], action: () => navigate('/banking'), group: 'navigation' },
    { id: 'projects', label: t('sidebar.projects'), icon: FolderKanban, keywords: ['project management'], action: () => navigate('/projects'), group: 'navigation' },
    { id: 'budgets', label: t('sidebar.budgets'), icon: Calculator, keywords: ['planning', 'forecast'], action: () => navigate('/budgets'), group: 'navigation' },
    { id: 'assets', label: t('sidebar.assets'), icon: Building2, keywords: ['fixed assets', 'depreciation'], action: () => navigate('/assets'), group: 'navigation' },
    
    // Quick Create
    { id: 'new-invoice', label: t('quickActions.newInvoice', 'New Invoice'), icon: Plus, keywords: ['create', 'add'], action: () => navigate('/sales/invoices/new'), group: 'create' },
    { id: 'new-bill', label: t('quickActions.newBill', 'New Bill'), icon: Plus, keywords: ['create', 'add', 'expense'], action: () => navigate('/purchases/bills/new'), group: 'create' },
    { id: 'new-journal', label: t('quickActions.newJournal', 'New Journal Entry'), icon: Plus, keywords: ['create', 'add', 'entry'], action: () => navigate('/journals/new'), group: 'create' },
    { id: 'new-contact', label: t('quickActions.newContact', 'New Contact'), icon: Plus, keywords: ['create', 'add', 'customer', 'supplier'], action: () => navigate('/contacts?new=true'), group: 'create' },
    { id: 'new-item', label: t('quickActions.newItem', 'New Item'), icon: Plus, keywords: ['create', 'add', 'product'], action: () => navigate('/items?new=true'), group: 'create' },
    { id: 'new-project', label: t('quickActions.newProject', 'New Project'), icon: Plus, keywords: ['create', 'add'], action: () => navigate('/projects?new=true'), group: 'create' },
    
    // Reports
    { id: 'trial-balance', label: t('reports.trialBalance'), icon: BarChart3, keywords: ['report', 'tb'], action: () => navigate('/reports/trial-balance'), group: 'reports' },
    { id: 'balance-sheet', label: t('reports.balanceSheet'), icon: FileSpreadsheet, keywords: ['report', 'bs', 'financial'], action: () => navigate('/reports/balance-sheet'), group: 'reports' },
    { id: 'income-statement', label: t('reports.incomeStatement'), icon: BarChart3, keywords: ['report', 'pnl', 'profit', 'loss'], action: () => navigate('/reports/income-statement'), group: 'reports' },
    { id: 'cash-flow', label: t('reports.cashFlow'), icon: Wallet, keywords: ['report', 'cf'], action: () => navigate('/reports/cash-flow'), group: 'reports' },
    { id: 'tax-report', label: t('reports.taxReport', 'Tax Report'), icon: Receipt, keywords: ['vat', 'tax'], action: () => navigate('/reports/tax'), group: 'reports' },
    
    // Settings
    { id: 'settings', label: t('sidebar.settings'), icon: Settings, keywords: ['preferences', 'config'], action: () => navigate('/settings'), group: 'settings' },
    { id: 'company', label: t('settings.company'), icon: Building2, keywords: ['company', 'profile'], action: () => navigate('/settings/company'), group: 'settings' },
    { id: 'users', label: t('settings.users'), icon: Users, keywords: ['team', 'permissions'], action: () => navigate('/settings/users'), group: 'settings' },
    { id: 'currencies', label: t('settings.currencies'), icon: CreditCard, keywords: ['exchange', 'rates'], action: () => navigate('/settings/currencies'), group: 'settings' },
    
    // Help
    { id: 'shortcuts', label: t('shortcuts.title', 'Keyboard Shortcuts'), icon: Keyboard, keywords: ['hotkeys', 'keys'], action: () => onShowShortcuts?.(), group: 'help' },
    { id: 'user-guide', label: t('help.userGuide', 'User Guide'), icon: HelpCircle, keywords: ['documentation', 'help'], action: () => navigate('/user-guide'), group: 'help' },
  ], [t, navigate, onShowShortcuts]);

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    const searchLower = search.toLowerCase();
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some(k => k.toLowerCase().includes(searchLower))
    );
  }, [commands, search]);

  // Group filtered commands
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandAction[]> = {
      navigation: [],
      create: [],
      reports: [],
      settings: [],
      help: [],
    };
    filteredCommands.forEach(cmd => {
      groups[cmd.group].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Listen for Ctrl+K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const runCommand = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  const groupLabels: Record<string, string> = {
    navigation: t('commandPalette.navigation', 'Navigation'),
    create: t('commandPalette.quickCreate', 'Quick Create'),
    reports: t('commandPalette.reports', 'Reports'),
    settings: t('commandPalette.settings', 'Settings'),
    help: t('commandPalette.help', 'Help'),
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder={t('commandPalette.placeholder', 'Type a command or search...')}
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>{t('commandPalette.noResults', 'No results found.')}</CommandEmpty>
        
        {Object.entries(groupedCommands).map(([group, items]) => {
          if (items.length === 0) return null;
          return (
            <CommandGroup key={group} heading={groupLabels[group]}>
              {items.map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  value={cmd.id}
                  onSelect={() => runCommand(cmd.action)}
                  className="flex items-center gap-2"
                >
                  <cmd.icon className="h-4 w-4" />
                  <span>{cmd.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
      
      <div className="border-t p-2 text-xs text-muted-foreground flex items-center justify-between">
        <span>{t('commandPalette.tip', 'Tip: Use ⌘K to open anytime')}</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑↓</kbd>
          <span>{t('commandPalette.navigate', 'navigate')}</span>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs ms-2">↵</kbd>
          <span>{t('commandPalette.select', 'select')}</span>
        </span>
      </div>
    </CommandDialog>
  );
}
