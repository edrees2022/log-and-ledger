import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Capacitor } from '@capacitor/core';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dashboard } from "@/components/Dashboard";
import { InvoiceForm } from "@/components/InvoiceForm";
import { TaxConfiguration } from "@/components/TaxConfiguration";
import CompaniesPage from "@/pages/CompaniesPage";
import AccountsPage from "@/pages/AccountsPage";
import ContactsPage from "@/pages/ContactsPage";
import ItemsPage from "@/pages/ItemsPage";
// Sales Pages
import UnifiedInvoicesPage from "@/pages/sales/UnifiedInvoicesPage";
import QuotationsPage from "@/pages/sales/QuotationsPage";
import OrdersPage from "@/pages/sales/OrdersPage";
import CreditNotesPage from "@/pages/sales/CreditNotesPage";
import InvoiceDetailPage from "@/pages/sales/InvoiceDetailPage";
import InvoiceEditPage from "@/pages/sales/InvoiceEditPage";
// Purchase Pages  
import BillsPage from "@/pages/purchases/BillsPage";
import BillDetailPage from "@/pages/purchases/BillDetailPage";
import PurchaseOrdersPage from "@/pages/purchases/OrdersPage";
import ExpensesPage from "@/pages/purchases/ExpensesPage";
import DebitNotesPage from "@/pages/purchases/DebitNotesPage";
// Banking Pages
import BankAccountsPage from "@/pages/banking/AccountsPage";
import ReconciliationPage from "@/pages/banking/ReconciliationPage";
import PaymentsPage from "@/pages/banking/PaymentsPage";
import ReceiptsPage from "@/pages/banking/ReceiptsPage";
import ChecksPage from "@/pages/banking/ChecksPage";
// Reports Pages
import FinancialReports from "@/pages/FinancialReports";
import BalanceSheetPage from "@/pages/reports/BalanceSheetPage";
import ProfitLossPage from "@/pages/reports/ProfitLossPage";
import CashFlowPage from "@/pages/reports/CashFlowPage";
import TrialBalancePage from "@/pages/reports/TrialBalancePage";
import AccountLedgerPage from "@/pages/reports/AccountLedgerPage";
import JournalBookPage from "@/pages/reports/JournalBookPage";
import AgingReportPage from "@/pages/reports/AgingReportPage";
import ContactStatementPage from "@/pages/reports/ContactStatementPage";
import SalesPurchaseSummaryPage from "@/pages/reports/SalesPurchaseSummaryPage";
import ProfitLossComparisonPage from "@/pages/reports/ProfitLossComparisonPage";
import FinancialRatiosPage from "@/pages/reports/FinancialRatiosPage";
import TaxPage from "@/pages/reports/TaxPage";
import TaxTypeReportPage from "@/pages/reports/TaxTypeReportPage";
import OtherTaxesPage from "@/pages/reports/OtherTaxesPage";
import CustomTaxReportPage from "@/pages/reports/CustomTaxReportPage";
import InventoryPage from "@/pages/reports/InventoryPage";
import AIAnalyticsPage from "@/pages/reports/AIAnalyticsPage";
import CashFlowForecast from "@/pages/reports/CashFlowForecast";
import ESGReportPage from "@/pages/reports/ESGReportPage";
import AuditLogsPage from "@/pages/admin/AuditLogsPage";
import GlobalDashboard from "@/pages/reports/GlobalDashboard";
// Settings Pages
import GeneralSettingsPage from "@/pages/settings/GeneralSettingsPage";
import DefaultAccountsPage from "@/pages/settings/DefaultAccountsPage";
import LegalSettingsPage from "@/pages/settings/LegalSettingsPage";
import UsersPage from "@/pages/settings/UsersPage";
import BackupPage from "@/pages/settings/BackupPage";
import AISettingsPage from "@/pages/settings/AISettingsPage";
import CurrenciesPage from "@/pages/settings/CurrenciesPage";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectDetailsPage from "@/pages/ProjectDetailsPage";
import ProjectProfitabilityPage from "@/pages/projects/ProjectProfitabilityPage";
import AdvancedFeaturesPage from "@/pages/AdvancedFeaturesPage";
// Legal Pages
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import DisclaimerPage from "@/pages/DisclaimerPage";
import UserGuidePage from "@/pages/UserGuidePage";
import GlobalSearchPage from "@/pages/GlobalSearchPage";
import DataImportPage from "@/pages/DataImportPage";
import QuickEntryPage from "@/pages/QuickEntryPage";
import BatchOperationsPage from "@/pages/BatchOperationsPage";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Bell, Wifi, WifiOff, Plus, CreditCard, LogOut } from "lucide-react";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/AuthPage";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { AdBanner } from "@/components/AdBanner";
import { Footer } from "@/components/Footer";
import { LegalConsentDialog } from "@/components/LegalConsentDialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import AssetsPage from "@/pages/assets/AssetsPage";
import JournalsPage from "@/pages/journals/JournalsPage";
import JournalForm from "@/pages/journals/JournalForm";
import CostCentersPage from "@/pages/accounting/CostCentersPage";
import InsightsPage from "@/pages/accounting/InsightsPage";
import EmployeesPage from "@/pages/hr/EmployeesPage";
import DepartmentsPage from "@/pages/hr/DepartmentsPage";
import PayrollPage from "@/pages/hr/PayrollPage";
// Manufacturing Pages
import BOMPage from "@/pages/manufacturing/BOMPage";
import ProductionOrdersPage from "@/pages/manufacturing/ProductionOrdersPage";

import InventoryValuationPage from "@/pages/inventory/InventoryValuationPage";
import StockAdjustmentsPage from "@/pages/inventory/StockAdjustmentsPage";
import WarehousesPage from "@/pages/inventory/WarehousesPage";
import LandedCostPage from "@/pages/inventory/LandedCostPage";
import LandedCostDetail from "@/pages/inventory/LandedCostDetail";
import StockTransferList from "@/pages/inventory/StockTransferList";
import StockTransferForm from "@/pages/inventory/StockTransferForm";
import StockTransferEdit from "@/pages/inventory/StockTransferEdit";
import BudgetsPage from "@/pages/budgets/BudgetsPage";
import BudgetVsActualPage from "@/pages/budgets/BudgetVsActualPage";

// Approval Pages
import ApprovalsPage from "@/pages/approvals/ApprovalsPage";
import ApprovalSettingsPage from "@/pages/approvals/ApprovalSettingsPage";

// Portal Pages
import PortalLogin from "@/pages/portal/PortalLogin";
import PortalDashboard from "@/pages/portal/PortalDashboard";
import PortalDocuments from "@/pages/portal/PortalDocuments";

// Enterprise Components
import { CommandPalette } from "@/components/CommandPalette";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// Component to redirect /settings to /settings/general
function SettingsRedirect() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation('/settings/general');
  }, [setLocation]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/companies" component={CompaniesPage} />
      <Route path="/accounts" component={AccountsPage} />
      <Route path="/contacts" component={ContactsPage} />
      <Route path="/items" component={ItemsPage} />
      <Route path="/inventory/warehouses" component={WarehousesPage} />
      <Route path="/inventory/adjustments" component={StockAdjustmentsPage} />
      <Route path="/inventory/valuation" component={InventoryValuationPage} />
      <Route path="/inventory/landed-cost" component={LandedCostPage} />
      <Route path="/inventory/landed-cost/:id" component={LandedCostDetail} />
      <Route path="/inventory/transfers" component={StockTransferList} />
      <Route path="/inventory/transfers/new" component={StockTransferForm} />
      <Route path="/inventory/transfers/edit/:id" component={StockTransferEdit} />
      <Route path="/budgets" component={BudgetsPage} />
      <Route path="/budgets/vs-actual" component={BudgetVsActualPage} />

      {/* Approval Routes */}
      <Route path="/approvals" component={ApprovalsPage} />
      <Route path="/settings/approvals" component={ApprovalSettingsPage} />

      <Route path="/fixed-assets" component={AssetsPage} />
      <Route path="/journals" component={JournalsPage} />
      <Route path="/journals/new" component={JournalForm} />
      <Route path="/accounting/cost-centers" component={CostCentersPage} />
      <Route path="/accounting/insights" component={InsightsPage} />
      <Route path="/hr/employees" component={EmployeesPage} />
      <Route path="/hr/departments" component={DepartmentsPage} />
      <Route path="/hr/payroll" component={PayrollPage} />

      {/* Manufacturing Routes */}
      <Route path="/manufacturing/boms" component={BOMPage} />
      <Route path="/manufacturing/orders" component={ProductionOrdersPage} />

      {/* Sales Routes */}
      <Route path="/sales/invoices" component={UnifiedInvoicesPage} />
      <Route path="/sales/invoices/new" component={InvoiceForm} />
      <Route path="/sales/invoices/:id/edit" component={InvoiceEditPage} />
      <Route path="/sales/invoices/:id" component={InvoiceDetailPage} />
      <Route path="/sales/quotations" component={QuotationsPage} />
      <Route path="/sales/orders" component={OrdersPage} />
      <Route path="/sales/credit-notes" component={CreditNotesPage} />

      {/* Purchase Routes */}
      <Route path="/purchases/bills" component={BillsPage} />
  <Route path="/purchases/bills/:id" component={BillDetailPage} />
      <Route path="/purchases/orders" component={PurchaseOrdersPage} />
      <Route path="/purchases/expenses" component={ExpensesPage} />
      <Route path="/purchases/debit-notes" component={DebitNotesPage} />

      {/* Banking Routes */}
      <Route path="/banking/accounts" component={BankAccountsPage} />
      <Route path="/banking/checks" component={ChecksPage} />
      <Route path="/banking/reconciliation" component={ReconciliationPage} />
      <Route path="/banking/payments" component={PaymentsPage} />
      <Route path="/banking/receipts" component={ReceiptsPage} />

      {/* Reports Routes */}
      <Route path="/reports/financial" component={FinancialReports} />
      <Route path="/reports/balance-sheet" component={BalanceSheetPage} />
      <Route path="/reports/profit-loss" component={ProfitLossPage} />
      <Route path="/reports/cash-flow" component={CashFlowPage} />
  <Route path="/reports/trial-balance" component={TrialBalancePage} />
  <Route path="/reports/account-ledger" component={AccountLedgerPage} />
  <Route path="/reports/journal-book" component={JournalBookPage} />
  <Route path="/reports/aging" component={AgingReportPage} />
  <Route path="/reports/contact-statement" component={ContactStatementPage} />
  <Route path="/reports/sales-purchases" component={SalesPurchaseSummaryPage} />
  <Route path="/reports/profit-loss-comparison" component={ProfitLossComparisonPage} />
  <Route path="/reports/financial-ratios" component={FinancialRatiosPage} />
  {/* Specific per-tax routes come before the general tax reports route */}
  <Route path="/reports/tax/custom/:id" component={CustomTaxReportPage} />
  <Route path="/reports/tax/other" component={OtherTaxesPage} />
  <Route path="/reports/tax/:type" component={TaxTypeReportPage} />
  <Route path="/reports/tax" component={TaxPage} />
      <Route path="/reports/inventory" component={InventoryPage} />
  <Route path="/reports/ai-analytics" component={AIAnalyticsPage} />
  <Route path="/reports/cash-flow-forecast" component={CashFlowForecast} />
  <Route path="/reports/esg" component={ESGReportPage} />
  <Route path="/reports/global-dashboard" component={GlobalDashboard} />

      {/* Settings Routes */}
      <Route path="/settings" component={SettingsRedirect} />
      {/* Backward-compat: singular path redirect to plural */}
      <Route path="/settings/tax" component={() => {
        const [, setLocation] = useLocation();
        useEffect(() => setLocation('/settings/taxes'), [setLocation]);
        return null;
      }} />
      <Route path="/settings/taxes" component={TaxConfiguration} />
      <Route path="/settings/general" component={GeneralSettingsPage} />
      <Route path="/settings/accounts" component={DefaultAccountsPage} />
      <Route path="/settings/legal" component={LegalSettingsPage} />
      <Route path="/settings/users" component={UsersPage} />
      <Route path="/settings/backup" component={BackupPage} />
      <Route path="/settings/ai" component={AISettingsPage} />
      <Route path="/settings/currencies" component={CurrenciesPage} />

  <Route path="/projects" component={ProjectsPage} />
  <Route path="/projects/profitability" component={ProjectProfitabilityPage} />
  <Route path="/projects/:id" component={ProjectDetailsPage} />

      {/* Advanced Features Route */}
      <Route path="/advanced" component={AdvancedFeaturesPage} />

      {/* Legal Routes */}
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/disclaimer" component={DisclaimerPage} />
      <Route path="/user-guide" component={UserGuidePage} />
      <Route path="/search" component={GlobalSearchPage} />
      <Route path="/import" component={DataImportPage} />
      <Route path="/quick-entry" component={QuickEntryPage} />
      <Route path="/batch" component={BatchOperationsPage} />

      {/* Admin Routes */}
      <Route path="/admin/audit-logs" component={AuditLogsPage} />

      {/* Portal Routes */}
      <Route path="/portal/login" component={PortalLogin} />
      <Route path="/portal/dashboard" component={PortalDashboard} />
      <Route path="/portal/documents" component={PortalDocuments} />

      <Route component={NotFound} />
    </Switch>
  );
}

// Application content that requires authentication
function ApplicationContent() {
  const { t } = useTranslation();
  const { user, logout, acceptLegalConsent, authOnlyMode, retrySSO, lastSSORequestId } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLegalConsent, setShowLegalConsent] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  
  // Enterprise keyboard shortcuts
  const { setHelpDialogHandler } = useKeyboardShortcuts({ enabled: true });
  
  // Set up shortcuts help dialog handler
  useEffect(() => {
    setHelpDialogHandler(() => setShowShortcutsHelp(true));
  }, [setHelpDialogHandler]);

  // Demo notifications removed – integrate real notifications when backend is ready

  // Check if user needs to accept legal consent
  useEffect(() => {
    if (user) {
      // Check if user has accepted in localStorage (prefer stable user id; keep legacy email key)
      const keyById = `legal_consent_${user.id}`;
      const keyByEmail = user.email ? `legal_consent_${user.email}` : '';
      const hasAcceptedLocally = (localStorage.getItem(keyById) === 'true') || (keyByEmail && localStorage.getItem(keyByEmail) === 'true');
      
      // For mobile apps: trust localStorage if backend hasn't loaded yet
      // This prevents showing consent dialog every time on mobile
      if (Capacitor.isNativePlatform() && hasAcceptedLocally) {
        setShowLegalConsent(false);
        return;
      }
      
      // IMPORTANT: Trust the backend value first, localStorage is just a fallback
      // If backend says false, show dialog regardless of localStorage
      if (user.legal_consent_accepted === true) {
        setShowLegalConsent(false);
      } else if (hasAcceptedLocally) {
        // User accepted locally but not in backend yet - show dialog to re-accept
        setShowLegalConsent(true);
      } else {
        setShowLegalConsent(true);
      }
    }
  }, [user]);

  const handleAcceptLegalConsent = async () => {
    try {
      await acceptLegalConsent();
      setShowLegalConsent(false);
    } catch (error) {
      console.error('Error accepting legal consent:', error);
      // Fallback: at least store locally to not block the user
      try {
        if (user) {
          localStorage.setItem(`legal_consent_${user.id}`, 'true');
          if (user.email) localStorage.setItem(`legal_consent_${user.email}`, 'true');
          localStorage.setItem(`legal_consent_${user.id}_date`, new Date().toISOString());
        }
      } catch {}
      setShowLegalConsent(false);
    }
  };

  const toggleOfflineMode = () => {
    setIsOnline(!isOnline);
    console.log('Offline mode toggled:', !isOnline);
  };

  // Auto reflect browser connectivity
  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const handleQuickAction = (action: string) => {
    console.log('Quick action triggered:', action);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isMobile = useIsMobile();

  const sidebarStyle = {
    "--sidebar-width": isMobile ? "18rem" : "16rem",
    "--sidebar-width-icon": "3rem",
  };

  function RetryBindButton() {
    return (
      <Button size="sm" variant="outline" onClick={() => retrySSO()} data-testid="button-retry-sso">
        Retry server bind
      </Button>
    );
  }

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex min-h-screen w-full max-w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0 max-w-full">
          {/* Header - Fixed at top */}
          <header className="fixed top-0 right-0 left-0 md:left-[var(--sidebar-width,0px)] z-40 border-b bg-background">
            <div className="flex flex-col gap-2 p-3 md:p-4 min-w-0">
              {/* First row: Title and user info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="flex flex-col md:flex-row md:items-center gap-1">
                    <h2 className="text-sm md:text-lg font-semibold text-foreground">
                      Log & Ledger Pro
                    </h2>
                    {!isMobile && (
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs w-fit">
                          {t('header.globalAccounting')}
                        </Badge>
                        {authOnlyMode && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Badge variant="destructive" className="text-xs w-fit animate-pulse cursor-pointer" title={t('header.authOnlyDescription')}>
                                {t('header.authOnly')}
                              </Badge>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">{t('header.authOnlyDescription')}</p>
                                {lastSSORequestId && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <code className="px-1 py-0.5 rounded bg-muted text-muted-foreground">{lastSSORequestId.slice(0,12)}…</code>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 px-2 py-1 text-xs"
                                      onClick={() => {
                                        navigator.clipboard.writeText(lastSSORequestId).catch(()=>{});
                                      }}
                                    >{t('header.copyId')}</Button>
                                  </div>
                                )}
                                <RetryBindButton />
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* User info - Hidden on mobile */}
                {!isMobile && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {user?.full_name}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {t(`roles.${user?.role}`, { defaultValue: user?.role || '' })}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Second row: Actions */}
              <div className="flex items-center justify-end gap-1 md:gap-2">
                {/* Quick Actions */}
                {isMobile ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickAction('new-invoice')}
                    data-testid="button-quick-invoice"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickAction('new-invoice')}
                      data-testid="button-quick-invoice"
                    >
                      <Plus className="h-4 w-4 me-1" />
                      {t('header.invoice')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickAction('record-payment')}
                      data-testid="button-quick-payment"
                    >
                      <CreditCard className="h-4 w-4 me-1" />
                      {t('header.payment')}
                    </Button>
                  </>
                )}

              {/* Online/Offline Status - Hidden on mobile */}
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleOfflineMode}
                  data-testid="button-offline-toggle"
                >
                  {isOnline ? (
                    <Wifi className="h-4 w-4 text-green-600" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-600" />
                  )}
                </Button>
              )}

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  data-testid="button-notifications"
                >
                  <Bell className="h-4 w-4" />
                </Button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div
                    className={`absolute end-0 top-12 ${isMobile ? 'w-64' : 'w-80'} bg-popover border rounded-lg shadow-lg p-4 z-50`}
                    data-testid="dropdown-notifications"
                  >
                    <h3 className="font-medium mb-3">{t('settings.notifications')}</h3>
                    <div className="text-sm text-muted-foreground">No notifications yet.</div>
                  </div>
                )}
              </div>

              {/* Theme Toggle - Always visible */}
              <ThemeToggle />

              {/* Language Toggle - Always visible for all users */}
              <LanguageToggle />

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              </div>
            </div>
          </header>

          {/* Main Content - with top padding for fixed header and bottom padding for ad banner */}
          <main className="flex-1 p-3 md:p-6 pt-28 md:pt-28 pb-24 md:pb-24 bg-background w-full min-w-0 max-w-full">
            <Router />
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Enterprise Features */}
      <CommandPalette 
        open={showCommandPalette} 
        onOpenChange={setShowCommandPalette}
        onShowShortcuts={() => setShowShortcutsHelp(true)}
      />
      <KeyboardShortcutsDialog 
        open={showShortcutsHelp} 
        onOpenChange={setShowShortcutsHelp} 
      />

      {/* Legal Consent Dialog */}
      <LegalConsentDialog 
        open={showLegalConsent} 
        onAccept={handleAcceptLegalConsent} 
      />
    </SidebarProvider>
  );
}

// Main App component with authentication logic
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <TranslationProvider>
            <AuthProvider>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
              <AdBanner />
            </AuthProvider>
          </TranslationProvider>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

// App content that handles authentication state
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Log & Ledger Pro...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <ApplicationContent />;
}

export default App;
