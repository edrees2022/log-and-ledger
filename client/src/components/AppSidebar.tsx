import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { companies } from '@shared/schema';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Building2,
  Calculator,
  Users,
  Package,
  Receipt,
  ShoppingCart,
  FileText,
  CreditCard,
  Wallet,
  ChartBar,
  Settings,
  Globe,
  Shield,
  Database,
  LogOut,
  ChevronDown,
  ChevronRight,
  Plus,
  Building,
  PiggyBank,
  BarChart3,
  FolderKanban,
  ArrowRightLeft,
  Landmark,
  FolderTree,
  FileCheck,
  Briefcase,
  Users2,
  Factory,
  Layers,
  Banknote,
  BrainCircuit,
  HelpCircle,
  BookOpen,
  Clock,
  TrendingUp,
  GitCompare,
  Search,
  Activity,
  Upload,
  Sparkles,
} from 'lucide-react';

// Type for company data from API
type Company = typeof companies.$inferSelect;

// Sidebar menu typing to keep inference stable when adding conditional groups
type MenuEntry = {
  id: string;
  title: string;
  href: string;
  icon: any;
  badge: any;
  subItems?: Array<{ id: string; title: string; href: string; icon: any }>
};
type MenuSection = { group: string; items: MenuEntry[] };

export function AppSidebar() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { user, logout, switchCompany } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Fetch companies from API instead of using mock data
  const { data: companiesData = [], isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
    enabled: !!user
  });

  // Get current active company from the fetched companies
  // Use company_id from user (backend field) or activeCompany.id (if set)
  const activeCompanyId = user?.company_id || user?.activeCompany?.id;
  const activeCompany = companiesData.length > 0 
    ? companiesData.find(c => c.id === activeCompanyId) || companiesData[0]
    : null;

  const menuItems: MenuSection[] = [
    // ═══════════════════════════════════════════════════════════════
    // 1. MAIN - لوحة التحكم الرئيسية
    // ═══════════════════════════════════════════════════════════════
    {
      group: t('navigation.main'),
      items: [
        {
          id: 'dashboard',
          title: t('navigation.dashboard'),
          href: '/',
          icon: LayoutDashboard,
          badge: null,
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════
    // 2. SETUP - البيانات الأساسية (تُعد مرة واحدة)
    // ═══════════════════════════════════════════════════════════════
    {
      group: t('navigation.setup'),
      items: [
        {
          id: 'companies',
          title: t('navigation.companies'),
          href: '/companies',
          icon: Building2,
          badge: null,
        },
        {
          id: 'accounts',
          title: t('navigation.accounts'),
          href: '/accounts',
          icon: Calculator,
          badge: null,
        },
        {
          id: 'contacts',
          title: t('navigation.contacts'),
          href: '/contacts',
          icon: Users,
          badge: null,
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════
    // 3. INVENTORY - المخزون (الأصناف والمستودعات)
    // ═══════════════════════════════════════════════════════════════
    {
      group: t('navigation.inventory', { defaultValue: 'Inventory' }),
      items: [
        {
          id: 'items',
          title: t('navigation.items'),
          href: '/items',
          icon: Package,
          badge: null,
        },
        {
          id: 'warehouses',
          title: t('navigation.warehouses', { defaultValue: 'Warehouses' }),
          href: '/inventory/warehouses',
          icon: Building,
          badge: null,
        },
        {
          id: 'adjustments',
          title: t('navigation.stockAdjustments', { defaultValue: 'Stock Adjustments' }),
          href: '/inventory/adjustments',
          icon: ArrowRightLeft,
          badge: null,
        },
        {
          id: 'transfers',
          title: t('navigation.stockTransfers', { defaultValue: 'Stock Transfers' }),
          href: '/inventory/transfers',
          icon: ArrowRightLeft,
          badge: null,
        },
        {
          id: 'valuation',
          title: t('navigation.valuation', { defaultValue: 'Valuation Report' }),
          href: '/inventory/valuation',
          icon: ChartBar,
          badge: null,
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════
    // 4. SALES - المبيعات (عرض سعر → أمر بيع → فاتورة → إشعار)
    // ═══════════════════════════════════════════════════════════════
    {
      group: t('navigation.sales'),
      items: [
        {
          id: 'quotations',
          title: t('navigation.quotations'),
          href: '/sales/quotations',
          icon: FileText,
          badge: null,
        },
        {
          id: 'orders',
          title: t('navigation.salesOrders'),
          href: '/sales/orders',
          icon: ShoppingCart,
          badge: null,
        },
        {
          id: 'invoices',
          title: t('navigation.invoices'),
          href: '/sales/invoices',
          icon: Receipt,
          badge: null,
        },
        {
          id: 'credit-notes',
          title: t('navigation.creditNotes'),
          href: '/sales/credit-notes',
          icon: CreditCard,
          badge: null,
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════
    // 5. PURCHASES - المشتريات (أمر شراء → فاتورة → تكاليف → إشعار)
    // ═══════════════════════════════════════════════════════════════
    {
      group: t('navigation.purchases'),
      items: [
        {
          id: 'purchase-orders',
          title: t('navigation.purchaseOrders'),
          href: '/purchases/orders',
          icon: ShoppingCart,
          badge: null,
        },
        {
          id: 'bills',
          title: t('navigation.bills'),
          href: '/purchases/bills',
          icon: Receipt,
          badge: null,
        },
        {
          id: 'landed-cost',
          title: t('navigation.landedCost', { defaultValue: 'Landed Costs' }),
          href: '/inventory/landed-cost',
          icon: Calculator,
          badge: null,
        },
        {
          id: 'expenses',
          title: t('navigation.expenses'),
          href: '/purchases/expenses',
          icon: PiggyBank,
          badge: null,
        },
        {
          id: 'debit-notes',
          title: t('navigation.debitNotes'),
          href: '/purchases/debit-notes',
          icon: CreditCard,
          badge: null,
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════
    // 6. BANKING - البنوك (حسابات → مقبوضات → مدفوعات → شيكات → مطابقة)
    // ═══════════════════════════════════════════════════════════════
    {
      group: t('navigation.banking'),
      items: [
        {
          id: 'bank-accounts',
          title: t('navigation.bankAccounts'),
          href: '/banking/accounts',
          icon: Wallet,
          badge: null,
        },
        {
          id: 'receipts',
          title: t('navigation.receipts'),
          href: '/banking/receipts',
          icon: Receipt,
          badge: null,
        },
        {
          id: 'payments',
          title: t('navigation.payments'),
          href: '/banking/payments',
          icon: CreditCard,
          badge: null,
        },
        {
          id: 'checks',
          title: t('navigation.checks', { defaultValue: 'Checks' }),
          href: '/banking/checks',
          icon: FileCheck,
          badge: null,
        },
        {
          id: 'reconciliation',
          title: t('navigation.reconciliation'),
          href: '/banking/reconciliation',
          icon: Shield,
          badge: null,
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════
    // 7. ACCOUNTING - المحاسبة (القيود والعمليات المحاسبية)
    // ═══════════════════════════════════════════════════════════════
    {
      group: t('navigation.accounting', { defaultValue: 'Accounting' }),
      items: [
        {
          id: 'journals',
          title: t('navigation.manualJournals', { defaultValue: 'Manual Journals' }),
          href: '/journals',
          icon: FileText,
          badge: null,
        },
        {
          id: 'cost-centers',
          title: t('navigation.costCenters', { defaultValue: 'Cost Centers' }),
          href: '/accounting/cost-centers',
          icon: FolderTree,
          badge: null,
        },
        {
          id: 'assets',
          title: t('navigation.fixedAssets', { defaultValue: 'Fixed Assets' }),
          href: '/fixed-assets',
          icon: Landmark,
          badge: null,
        },
        {
          id: 'approvals',
          title: t('approvals.title', { defaultValue: 'Approvals' }),
          href: '/approvals',
          icon: Shield,
          badge: null,
          subItems: [
            {
              id: 'approval-requests',
              title: t('approvals.requests', { defaultValue: 'Requests' }),
              href: '/approvals',
              icon: FileCheck,
            },
            {
              id: 'approval-settings',
              title: t('approvals.settings', { defaultValue: 'Rules' }),
              href: '/settings/approvals',
              icon: Settings,
            },
          ],
        },
        {
          id: 'insights',
          title: t('accounting.insights.title', { defaultValue: 'Auto Accountant' }),
          href: '/accounting/insights',
          icon: BrainCircuit,
          badge: <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1">{t('badges.ai', { defaultValue: 'AI' })}</Badge>,
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════
    // 8. BUDGETS & PROJECTS - الميزانيات والمشاريع
    // ═══════════════════════════════════════════════════════════════
    {
      group: t('navigation.planning', { defaultValue: 'Planning' }),
      items: [
        {
          id: 'budgets',
          title: t('navigation.budgets', { defaultValue: 'Budgets' }),
          href: '/budgets',
          icon: PiggyBank,
          badge: null,
          subItems: [
            {
              id: 'budget-planning',
              title: t('navigation.budgetPlanning', { defaultValue: 'Budget Planning' }),
              href: '/budgets',
              icon: Calculator,
            },
            {
              id: 'budget-vs-actual',
              title: t('navigation.budgetVsActual', { defaultValue: 'Budget vs Actual' }),
              href: '/budgets/vs-actual',
              icon: BarChart3,
            },
          ],
        },
        {
          id: 'projects',
          title: t('navigation.projects', { defaultValue: 'Projects' }),
          href: '/projects',
          icon: FolderKanban,
          badge: null,
          subItems: [
            {
              id: 'projects-list',
              title: t('navigation.projectsList', { defaultValue: 'All Projects' }),
              href: '/projects',
              icon: FolderKanban,
            },
            {
              id: 'projects-profitability',
              title: t('navigation.projectsProfitability', { defaultValue: 'Profitability Report' }),
              href: '/projects/profitability',
              icon: BarChart3,
            },
          ],
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════
    // 9. MANUFACTURING - التصنيع
    // ═══════════════════════════════════════════════════════════════
    {
      group: t('navigation.manufacturing', { defaultValue: 'Manufacturing' }),
      items: [
        {
          id: 'boms',
          title: t('navigation.boms', { defaultValue: 'Bill of Materials' }),
          href: '/manufacturing/boms',
          icon: Layers,
          badge: null,
        },
        {
          id: 'production-orders',
          title: t('navigation.productionOrders', { defaultValue: 'Production Orders' }),
          href: '/manufacturing/orders',
          icon: Factory,
          badge: null,
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════
    // 10. HR & PAYROLL - الموارد البشرية والرواتب
    // ═══════════════════════════════════════════════════════════════
    {
      group: t('navigation.hr', { defaultValue: 'HR & Payroll' }),
      items: [
        {
          id: 'employees',
          title: t('navigation.employees', { defaultValue: 'Employees' }),
          href: '/hr/employees',
          icon: Users2,
          badge: null,
        },
        {
          id: 'departments',
          title: t('navigation.departments', { defaultValue: 'Departments' }),
          href: '/hr/departments',
          icon: Briefcase,
          badge: null,
        },
        {
          id: 'payroll',
          title: t('navigation.payroll', { defaultValue: 'Payroll' }),
          href: '/hr/payroll',
          icon: Banknote,
          badge: null,
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════
    // 11. REPORTS - التقارير (مُنظمة في مجموعات)
    // ═══════════════════════════════════════════════════════════════
    {
      group: t('navigation.reports'),
      items: [
        // --- القوائم المالية الرئيسية (الثلاث الأساسية) ---
        {
          id: 'financial-statements',
          title: t('navigation.financialStatements', { defaultValue: 'Financial Statements' }),
          href: '/reports/balance-sheet',
          icon: BarChart3,
          badge: null,
          subItems: [
            {
              id: 'balance-sheet',
              title: t('navigation.balanceSheet'),
              href: '/reports/balance-sheet',
              icon: BarChart3,
            },
            {
              id: 'profit-loss',
              title: t('navigation.profitLoss'),
              href: '/reports/profit-loss',
              icon: ChartBar,
            },
            {
              id: 'cash-flow',
              title: t('navigation.cashFlow'),
              href: '/reports/cash-flow',
              icon: Wallet,
            },
            {
              id: 'profit-loss-comparison',
              title: t('navigation.profitLossComparison'),
              href: '/reports/profit-loss-comparison',
              icon: GitCompare,
            },
          ],
        },
        // --- التقارير المحاسبية التفصيلية ---
        {
          id: 'accounting-reports',
          title: t('navigation.accountingReports', { defaultValue: 'Accounting Reports' }),
          href: '/reports/trial-balance',
          icon: Calculator,
          badge: null,
          subItems: [
            {
              id: 'trial-balance',
              title: t('navigation.trialBalance'),
              href: '/reports/trial-balance',
              icon: Calculator,
            },
            {
              id: 'account-ledger',
              title: t('navigation.accountLedger'),
              href: '/reports/account-ledger',
              icon: FileText,
            },
            {
              id: 'journal-book',
              title: t('navigation.journalBook'),
              href: '/reports/journal-book',
              icon: BookOpen,
            },
          ],
        },
        // --- تقارير العملاء والموردين ---
        {
          id: 'receivables-payables',
          title: t('navigation.receivablesPayables', { defaultValue: 'Receivables & Payables' }),
          href: '/reports/aging',
          icon: Users2,
          badge: null,
          subItems: [
            {
              id: 'aging-report',
              title: t('navigation.agingReport'),
              href: '/reports/aging',
              icon: Clock,
            },
            {
              id: 'contact-statement',
              title: t('navigation.contactStatement'),
              href: '/reports/contact-statement',
              icon: Users2,
            },
            {
              id: 'sales-purchases-summary',
              title: t('navigation.salesPurchasesSummary'),
              href: '/reports/sales-purchases',
              icon: TrendingUp,
            },
          ],
        },
        // --- التقارير الضريبية ---
        {
          id: 'tax',
          title: t('navigation.taxReports'),
          href: '/reports/tax',
          icon: Receipt,
          badge: null,
          subItems: [
            {
              id: 'tax-overview',
              title: t('navigation.taxOverview', { defaultValue: 'Tax Overview' }),
              href: '/reports/tax',
              icon: Receipt,
            },
            {
              id: 'vat-report',
              title: t('navigation.vatReport', { defaultValue: 'VAT Report' }),
              href: '/reports/tax/vat',
              icon: Receipt,
            },
            {
              id: 'corporate-tax-report',
              title: t('navigation.corporateTaxReport', { defaultValue: 'Corporate Tax Report' }),
              href: '/reports/tax/corporate',
              icon: Receipt,
            },
            {
              id: 'withholding-tax-report',
              title: t('navigation.withholdingTaxReport', { defaultValue: 'Withholding Tax Report' }),
              href: '/reports/tax/withholding',
              icon: Receipt,
            },
            {
              id: 'other-taxes',
              title: t('navigation.otherTaxes', { defaultValue: 'Other Taxes' }),
              href: '/reports/tax/other',
              icon: Receipt,
            },
          ],
        },
        // --- تقارير المخزون ---
        {
          id: 'inventory',
          title: t('navigation.inventoryReports'),
          href: '/reports/inventory',
          icon: Package,
          badge: null,
        },
        // --- التحليل المالي ---
        {
          id: 'financial-analysis',
          title: t('navigation.financialAnalysis', { defaultValue: 'Financial Analysis' }),
          href: '/reports/financial-ratios',
          icon: Activity,
          badge: null,
          subItems: [
            {
              id: 'financial-ratios',
              title: t('navigation.financialRatios'),
              href: '/reports/financial-ratios',
              icon: Activity,
            },
            {
              id: 'global-dashboard',
              title: t('reports.globalDashboard', { defaultValue: 'Global Dashboard' }),
              href: '/reports/global-dashboard',
              icon: Globe,
            },
            {
              id: 'esg-report',
              title: t('navigation.esgReport', { defaultValue: 'ESG Report' }),
              href: '/reports/esg',
              icon: Globe,
            },
          ],
        },
        // --- التقارير الذكية (AI) ---
        {
          id: 'ai-reports',
          title: t('navigation.aiReports', { defaultValue: 'AI Reports' }),
          href: '/reports/ai-analytics',
          icon: BrainCircuit,
          badge: <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1">{t('badges.ai', { defaultValue: 'AI' })}</Badge>,
          subItems: [
            {
              id: 'ai-analytics',
              title: t('navigation.aiAnalytics', { defaultValue: 'AI Analytics' }),
              href: '/reports/ai-analytics',
              icon: ChartBar,
            },
            {
              id: 'cash-flow-forecast',
              title: t('navigation.cashFlowForecast', { defaultValue: 'Cash Flow Forecast' }),
              href: '/reports/cash-flow-forecast',
              icon: ChartBar,
            },
          ],
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════
    // 12. PORTALS - البوابات الخارجية
    // ═══════════════════════════════════════════════════════════════
    {
      group: t('navigation.portals', { defaultValue: 'Portals' }),
      items: [
        {
          id: 'portal-dashboard',
          title: t('navigation.portalDashboard', { defaultValue: 'Portal Dashboard' }),
          href: '/portal/dashboard',
          icon: Globe,
          badge: null,
        },
        {
          id: 'portal-documents',
          title: t('navigation.portalDocuments', { defaultValue: 'Portal Documents' }),
          href: '/portal/documents',
          icon: FileText,
          badge: null,
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════
    // 13. TOOLS - أدوات متقدمة
    // ═══════════════════════════════════════════════════════════════
    {
      group: t('navigation.tools', { defaultValue: 'Tools' }),
      items: [
        {
          id: 'global-search',
          title: t('navigation.globalSearch', { defaultValue: 'Global Search' }),
          href: '/search',
          icon: Search,
          badge: null,
        },
        {
          id: 'quick-entry',
          title: t('navigation.quickEntry', { defaultValue: 'Quick Entry' }),
          href: '/quick-entry',
          icon: Plus,
          badge: null,
        },
        {
          id: 'data-import',
          title: t('navigation.dataImport', { defaultValue: 'Data Import' }),
          href: '/import',
          icon: Upload,
          badge: null,
        },
        {
          id: 'batch-operations',
          title: t('navigation.batchOperations', { defaultValue: 'Batch Operations' }),
          href: '/batch',
          icon: Layers,
          badge: null,
        },
        {
          id: 'advanced-features',
          title: t('navigation.advancedFeatures', { defaultValue: 'Advanced Features' }),
          href: '/advanced',
          icon: Sparkles,
          badge: null,
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════
    // 14. SETTINGS - الإعدادات (في النهاية دائماً)
    // ═══════════════════════════════════════════════════════════════
    {
      group: t('navigation.settings'),
      items: [
        {
          id: 'general',
          title: t('navigation.generalSettings'),
          href: '/settings/general',
          icon: Settings,
          badge: null,
        },
        {
          id: 'default-accounts',
          title: t('settings.defaultAccounts', { defaultValue: 'Default Accounts' }),
          href: '/settings/accounts',
          icon: BookOpen,
          badge: null,
        },
        {
          id: 'currencies',
          title: t('navigation.currencies', { defaultValue: 'Currencies' }),
          href: '/settings/currencies',
          icon: Globe,
          badge: null,
        },
        {
          id: 'tax-settings',
          title: t('navigation.taxSettings', { defaultValue: 'Tax Settings' }),
          href: '/settings/taxes',
          icon: Receipt,
          badge: null,
        },
        {
          id: 'ai-settings',
          title: t('navigation.aiSettings', { defaultValue: 'AI Settings' }),
          href: '/settings/ai',
          icon: Settings,
          badge: null,
        },
        {
          id: 'legal',
          title: t('navigation.legalSettings', { defaultValue: 'Legal' }),
          href: '/settings/legal',
          icon: Shield,
          badge: null,
        },
        {
          id: 'users',
          title: t('navigation.users'),
          href: '/settings/users',
          icon: Users,
          badge: null,
        },
        {
          id: 'backup',
          title: t('navigation.backup'),
          href: '/settings/backup',
          icon: Database,
          badge: null,
        },
        {
          id: 'user-guide',
          title: t('navigation.userGuide', { defaultValue: 'User Guide' }),
          href: '/user-guide',
          icon: HelpCircle,
          badge: null,
        },
      ],
    },
  ];

  // Conditionally add Admin group for owner/admin roles
  const canAdmin = user?.role === 'owner' || user?.role === 'admin';
  const adminGroup: MenuSection | null = canAdmin
    ? ({
        group: t('navigation.admin', { defaultValue: 'Admin' }),
        items: [
          {
            id: 'audit-logs',
            title: t('navigation.auditLogs', { defaultValue: 'Audit Logs' }),
            href: '/admin/audit-logs',
            icon: Shield,
            badge: null,
          },
        ],
      } as MenuSection)
    : null;
  const sidebarGroups = adminGroup ? [...menuItems, adminGroup] : menuItems;

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleLogout = async () => {
    await logout();
  };

  const setActiveCompany = async (company: Company) => {
    try {
      await switchCompany(company.id);
    } catch (error) {
      console.error('Failed to switch company:', error);
    }
  };

  // Close mobile sidebar when navigation link is clicked
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Helper function to generate company logo initials
  const generateLogo = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Calculator className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold">{t('app.name')}</span>
            <span className="text-xs text-muted-foreground">{t('app.tagline')}</span>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full" data-testid="button-company-switcher">
            <div className="flex items-center gap-3 p-2 rounded-lg hover-elevate">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs font-medium">
                  {activeCompany ? generateLogo(activeCompany.name) : 'NA'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-start">
                <p className="text-sm font-medium text-sidebar-foreground">
                  {activeCompany?.name || t('companies.noCompany')}
                </p>
                <p className="text-xs text-muted-foreground">{t('companies.switchCompany')}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {companiesData.map((company) => (
              <DropdownMenuItem
                key={company.id}
                onClick={() => setActiveCompany(company)}
                data-testid={`option-company-${company.id}`}
              >
                <Avatar className="h-6 w-6 me-2">
                  <AvatarFallback className="text-xs">
                    {generateLogo(company.name)}
                  </AvatarFallback>
                </Avatar>
                {company.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/companies" data-testid="button-manage-companies" onClick={handleLinkClick}>
                <Building className="h-4 w-4 me-2" />
                {t('companies.manage')}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>
      
      <SidebarContent>
        {sidebarGroups.map((section) => (
          <SidebarGroup key={section.group}>
            <SidebarGroupLabel>{section.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = location === item.href || 
                    (item.subItems && item.subItems.some(sub => location === sub.href));
                  const isExpanded = expandedItems.includes(item.id);
                  
                  return (
                    <SidebarMenuItem key={item.href}>
                      {item.subItems && item.subItems.length > 0 ? (
                        <div>
                          <SidebarMenuButton
                            onClick={() => toggleExpanded(item.id)}
                            className={`justify-between ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
                            data-testid={`button-menu-${item.id}`}
                          >
                            <div className="flex items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {item.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                              <ChevronDown 
                                className={`h-4 w-4 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`} 
                              />
                            </div>
                          </SidebarMenuButton>
                          {isExpanded && (
                            <div className="ms-6 mt-1 space-y-1">
                              {item.subItems.map((subItem) => (
                                <SidebarMenuButton
                                  key={subItem.href}
                                  asChild
                                  size="sm"
                                  className={location === subItem.href ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}
                                >
                                  <Link 
                                    href={subItem.href} 
                                    data-testid={`button-submenu-${subItem.id}`}
                                    onClick={handleLinkClick}
                                  >
                                    <span className="text-xs">{subItem.title}</span>
                                  </Link>
                                </SidebarMenuButton>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <SidebarMenuButton 
                          asChild 
                          className={isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}
                        >
                          <Link 
                            href={item.href} 
                            data-testid={`button-menu-${item.id}`}
                            onClick={handleLinkClick}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs ms-auto">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.full_name || t('common.user')}</span>
              <span className="text-xs text-muted-foreground">{user?.email}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 me-2" />
              {t('common.signOut')}
            </Button>
          </div>
          <div className="mt-3 p-2 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t('common.status')}</span>
              <Badge variant="secondary" className="text-xs">
                {t('common.online')}
              </Badge>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}