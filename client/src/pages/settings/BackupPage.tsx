import { useState, useEffect } from "react";
import { API_URL } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, GitMerge, Database, AlertTriangle, Clock, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

export default function BackupPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  
  // Derive hasCompany from auth context - check if user has a valid company (not 'auth-only')
  const hasCompany = user?.company_id && user.company_id !== 'auth-only';

  // Auto-backup settings
  const [autoBackupEnabled, setAutoBackupEnabled] = useState<boolean>(false);
  const [autoBackupFrequency, setAutoBackupFrequency] = useState<string>('daily');
  const [maxBackups, setMaxBackups] = useState<string>('7');
  const [lastAutoBackup, setLastAutoBackup] = useState<string | null>(null);

  // Load auto-backup settings from localStorage
  useEffect(() => {
    const settings = localStorage.getItem('autoBackupSettings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        setAutoBackupEnabled(parsed.enabled || false);
        setAutoBackupFrequency(parsed.frequency || 'daily');
        setMaxBackups(parsed.maxBackups || '7');
        setLastAutoBackup(parsed.lastBackup || null);
      } catch (e) {
        console.error('Error loading auto-backup settings:', e);
      }
    }
  }, []);

  // Save auto-backup settings to localStorage
  const saveAutoBackupSettings = (enabled: boolean, frequency: string, max: string) => {
    const settings = {
      enabled,
      frequency,
      maxBackups: max,
      lastBackup: lastAutoBackup,
    };
    localStorage.setItem('autoBackupSettings', JSON.stringify(settings));
    setAutoBackupEnabled(enabled);
    setAutoBackupFrequency(frequency);
    setMaxBackups(max);
  };

  // Calculate next backup time
  const getNextBackupTime = () => {
    if (!lastAutoBackup) return t('backup.autoBackupNever');
    
    const lastBackupDate = new Date(lastAutoBackup);
    let nextBackup = new Date(lastBackupDate);
    
    switch (autoBackupFrequency) {
      case 'daily':
        nextBackup.setDate(nextBackup.getDate() + 1);
        break;
      case 'weekly':
        nextBackup.setDate(nextBackup.getDate() + 7);
        break;
      case 'monthly':
        nextBackup.setMonth(nextBackup.getMonth() + 1);
        break;
    }
    
    return nextBackup.toLocaleString(i18n.language);
  };

  // Perform auto-backup
  const performAutoBackup = async () => {
    try {
      // Get Firebase token
      const auth = (await import('firebase/auth')).getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      const idToken = await currentUser.getIdToken();
      
      // Helper function to fetch with auth
      const fetchWithAuth = async (endpoint: string) => {
        try {
          const response = await fetch(`${API_URL}${endpoint}`, { 
            credentials: 'include',
            headers: { 'Authorization': `Bearer ${idToken}` }
          });
          if (!response.ok) return [];
          return await response.json();
        } catch {
          return [];
        }
      };
      
      // Fetch all data - Complete backup
      const [
        companies, accounts, contacts, items, taxes, journals, journalLines,
        salesInvoices, salesQuotes, salesOrders, purchaseOrders, bills, expenses,
        payments, receipts, salesCreditNotes, purchaseDebitNotes, bankAccounts,
        bankStatementLines, bankReconciliations, costCenters, fixedAssets, projects,
        warehouses, stockMovements, batches, stockTransfers, budgets, recurringTemplates,
        fiscalPeriods, documentSequences, exchangeRates, departments, employees, checks, attachments,
      ] = await Promise.all([
        fetchWithAuth('/api/companies'), fetchWithAuth('/api/accounts'),
        fetchWithAuth('/api/contacts'), fetchWithAuth('/api/items'),
        fetchWithAuth('/api/taxes'), fetchWithAuth('/api/journals'),
        fetchWithAuth('/api/journal-lines'), fetchWithAuth('/api/sales-invoices'),
        fetchWithAuth('/api/sales-quotes'), fetchWithAuth('/api/sales-orders'),
        fetchWithAuth('/api/purchase-orders'), fetchWithAuth('/api/bills'),
        fetchWithAuth('/api/expenses'), fetchWithAuth('/api/payments'),
        fetchWithAuth('/api/receipts'), fetchWithAuth('/api/sales-credit-notes'),
        fetchWithAuth('/api/purchase-debit-notes'), fetchWithAuth('/api/bank-accounts'),
        fetchWithAuth('/api/bank-statement-lines'), fetchWithAuth('/api/bank-reconciliations'),
        fetchWithAuth('/api/cost-centers'), fetchWithAuth('/api/fixed-assets'),
        fetchWithAuth('/api/projects'), fetchWithAuth('/api/warehouses'),
        fetchWithAuth('/api/stock-movements'), fetchWithAuth('/api/batches'),
        fetchWithAuth('/api/stock-transfers'), fetchWithAuth('/api/budgets'),
        fetchWithAuth('/api/recurring-templates'), fetchWithAuth('/api/fiscal-periods'),
        fetchWithAuth('/api/document-sequences'), fetchWithAuth('/api/exchange-rates'),
        fetchWithAuth('/api/departments'), fetchWithAuth('/api/employees'),
        fetchWithAuth('/api/checks'), fetchWithAuth('/api/attachments'),
      ]);

      // Create complete backup object
      const backup = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        data: {
          companies, accounts, contacts, items, taxes, journals, journalLines,
          salesInvoices, salesQuotes, salesOrders, salesCreditNotes,
          purchaseOrders, bills, expenses, purchaseDebitNotes,
          payments, receipts, bankAccounts, bankStatementLines, bankReconciliations, checks,
          warehouses, stockMovements, batches, stockTransfers,
          costCenters, fixedAssets, projects, budgets, recurringTemplates,
          fiscalPeriods, documentSequences, exchangeRates, departments, employees, attachments,
        },
      };

      // Generate filename
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `log-ledger-auto-backup_${date}_${time}.json`;

      // Download file
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update last backup time
      const newLastBackup = new Date().toISOString();
      setLastAutoBackup(newLastBackup);
      
      const settings = JSON.parse(localStorage.getItem('autoBackupSettings') || '{}');
      settings.lastBackup = newLastBackup;
      localStorage.setItem('autoBackupSettings', JSON.stringify(settings));

      // Cleanup old backups (browser downloads folder - can't delete but we track)
      cleanupOldBackups();

    } catch (error) {
      console.error('Auto-backup failed:', error);
    }
  };

  // Cleanup old backups tracking
  const cleanupOldBackups = () => {
    try {
      const backupHistory = JSON.parse(localStorage.getItem('backupHistory') || '[]');
      const maxBackupsNum = parseInt(maxBackups);
      
      if (backupHistory.length >= maxBackupsNum) {
        // Keep only the most recent backups
        const sortedHistory = backupHistory.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        const keepHistory = sortedHistory.slice(0, maxBackupsNum - 1);
        localStorage.setItem('backupHistory', JSON.stringify(keepHistory));
      }
      
      // Add current backup to history
      backupHistory.push({
        timestamp: new Date().toISOString(),
        filename: `log-ledger-auto-backup_${new Date().toISOString().split('T')[0]}.json`
      });
      localStorage.setItem('backupHistory', JSON.stringify(backupHistory));
    } catch (e) {
      console.error('Error cleaning up backups:', e);
    }
  };

  // Check if auto-backup is due
  useEffect(() => {
    if (!autoBackupEnabled || !hasCompany) return;

    const checkAutoBackup = () => {
      if (!lastAutoBackup) {
        // First time - do backup now
        performAutoBackup();
        return;
      }

      const lastBackupDate = new Date(lastAutoBackup);
      const now = new Date();
      const diffHours = (now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60);

      let shouldBackup = false;
      switch (autoBackupFrequency) {
        case 'daily':
          shouldBackup = diffHours >= 24;
          break;
        case 'weekly':
          shouldBackup = diffHours >= 24 * 7;
          break;
        case 'monthly':
          shouldBackup = diffHours >= 24 * 30;
          break;
      }

      if (shouldBackup) {
        performAutoBackup();
        toast({
          title: t('backup.autoBackupCompleted'),
          description: t('backup.autoBackupSuccess'),
        });
      }
    };

    // Check on mount and every hour
    checkAutoBackup();
    const interval = setInterval(checkAutoBackup, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoBackupEnabled, autoBackupFrequency, lastAutoBackup, hasCompany]);

  // Generate backup filename with current date and time
  const getBackupFilename = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // 2025-10-27
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // 14-30-45
    return `log-ledger-backup_${date}_${time}.json`;
  };

  // Export all data to JSON file
  const handleBackup = async () => {
    try {
      setIsLoading(true);
      
      // Get Firebase token
      const auth = (await import('firebase/auth')).getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      const idToken = await currentUser.getIdToken();
      
      // Helper function to fetch with auth
      const fetchWithAuth = async (endpoint: string) => {
        try {
          const response = await fetch(`${API_URL}${endpoint}`, { 
            credentials: 'include',
            headers: { 'Authorization': `Bearer ${idToken}` }
          });
          if (!response.ok) return [];
          return await response.json();
        } catch {
          return [];
        }
      };
      
      // Fetch ALL data from API with auth token - Complete backup
      const [
        companies,
        accounts,
        contacts,
        items,
        taxes,
        journals,
        journalLines,
        salesInvoices,
        salesQuotes,
        salesOrders,
        purchaseOrders,
        bills,
        expenses,
        payments,
        receipts,
        salesCreditNotes,
        purchaseDebitNotes,
        bankAccounts,
        bankStatementLines,
        bankReconciliations,
        costCenters,
        fixedAssets,
        projects,
        warehouses,
        stockMovements,
        batches,
        stockTransfers,
        budgets,
        recurringTemplates,
        fiscalPeriods,
        documentSequences,
        exchangeRates,
        departments,
        employees,
        checks,
        attachments,
      ] = await Promise.all([
        fetchWithAuth('/api/companies'),
        fetchWithAuth('/api/accounts'),
        fetchWithAuth('/api/contacts'),
        fetchWithAuth('/api/items'),
        fetchWithAuth('/api/taxes'),
        fetchWithAuth('/api/journals'),
        fetchWithAuth('/api/journal-lines'),
        fetchWithAuth('/api/sales-invoices'),
        fetchWithAuth('/api/sales-quotes'),
        fetchWithAuth('/api/sales-orders'),
        fetchWithAuth('/api/purchase-orders'),
        fetchWithAuth('/api/bills'),
        fetchWithAuth('/api/expenses'),
        fetchWithAuth('/api/payments'),
        fetchWithAuth('/api/receipts'),
        fetchWithAuth('/api/sales-credit-notes'),
        fetchWithAuth('/api/purchase-debit-notes'),
        fetchWithAuth('/api/bank-accounts'),
        fetchWithAuth('/api/bank-statement-lines'),
        fetchWithAuth('/api/bank-reconciliations'),
        fetchWithAuth('/api/cost-centers'),
        fetchWithAuth('/api/fixed-assets'),
        fetchWithAuth('/api/projects'),
        fetchWithAuth('/api/warehouses'),
        fetchWithAuth('/api/stock-movements'),
        fetchWithAuth('/api/batches'),
        fetchWithAuth('/api/stock-transfers'),
        fetchWithAuth('/api/budgets'),
        fetchWithAuth('/api/recurring-templates'),
        fetchWithAuth('/api/fiscal-periods'),
        fetchWithAuth('/api/document-sequences'),
        fetchWithAuth('/api/exchange-rates'),
        fetchWithAuth('/api/departments'),
        fetchWithAuth('/api/employees'),
        fetchWithAuth('/api/checks'),
        fetchWithAuth('/api/attachments'),
      ]);

      // Create backup object with version 2.0 for complete backup
      const backup = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        data: {
          // Core data
          companies,
          accounts,
          contacts,
          items,
          taxes,
          // Journals & Accounting
          journals,
          journalLines,
          // Sales
          salesInvoices,
          salesQuotes,
          salesOrders,
          salesCreditNotes,
          // Purchases
          purchaseOrders,
          bills,
          expenses,
          purchaseDebitNotes,
          // Banking & Payments
          payments,
          receipts,
          bankAccounts,
          bankStatementLines,
          bankReconciliations,
          checks,
          // Inventory
          warehouses,
          stockMovements,
          batches,
          stockTransfers,
          // Other
          costCenters,
          fixedAssets,
          projects,
          budgets,
          recurringTemplates,
          fiscalPeriods,
          documentSequences,
          exchangeRates,
          departments,
          employees,
          attachments,
        }
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getBackupFilename();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: t('backup.success'),
        description: t('backup.downloadComplete'),
      });
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: t('backup.error'),
        description: t('backup.failed'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBackupFile(file);
    }
  };

  // Restore backup (replace all data)
  const handleRestore = async (merge: boolean = false) => {
    if (!backupFile) return;

    try {
      setIsLoading(true);
      
      // Get Firebase token
      const auth = (await import('firebase/auth')).getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      const idToken = await currentUser.getIdToken();
      
      // Read file
      const text = await backupFile.text();
      const backup = JSON.parse(text);

      // Validate backup
      if (!backup.version || !backup.data) {
        throw new Error('Invalid backup file');
      }

      // Call API to restore or merge
      const endpoint = merge ? `${API_URL}/api/merge` : `${API_URL}/api/restore`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        credentials: 'include',
        body: JSON.stringify(backup),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Operation failed');
      }

      const result = await response.json();
      
      toast({
        title: merge ? t('backup.mergeSuccess') : t('backup.restoreSuccess'),
        description: merge 
          ? `${t('backup.dataMerged')} - ${result.stats.accounts.new} ${t('backup.newAccounts')}, ${result.stats.contacts.new} ${t('backup.newContacts')}, ${result.stats.items.new} ${t('backup.newItems')}`
          : `${t('backup.dataRestored')} - ${result.stats.accounts} ${t('backup.accounts')}, ${result.stats.contacts} ${t('backup.contacts')}, ${result.stats.items} ${t('backup.items')}`,
      });

      setShowRestoreDialog(false);
      setShowMergeDialog(false);
      setBackupFile(null);
      
      // Reload page to refresh data
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Restore error:', error);
      toast({
        title: t('backup.error'),
        description: error instanceof Error ? error.message : t('backup.invalidFile'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('backup.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('backup.description')}
        </p>
      </div>

      {/* No Company Warning */}
      {!hasCompany && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('common.warning')}</AlertTitle>
          <AlertDescription>
            {t('backup.noCompanyWarning')}
            <br />
            <a href="/companies" className="underline font-semibold mt-2 inline-block">
              {t('backup.createCompanyNow')} →
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* Backup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t('backup.createBackup')}
          </CardTitle>
          <CardDescription>
            {t('backup.createDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleBackup}
            disabled={isLoading || !hasCompany}
            className="w-full md:w-auto"
          >
            <Download className="h-4 w-4 me-2" />
            {t('backup.downloadBackup')}
          </Button>
        </CardContent>
      </Card>

      {/* Auto-Backup Settings Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('backup.autoBackup')}
          </CardTitle>
          <CardDescription>
            {t('backup.autoBackupDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Switch */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-backup-enabled" className="text-base">
                {t('backup.enableAutoBackup')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('backup.autoBackupWillSave')}
              </p>
            </div>
            <Switch
              id="auto-backup-enabled"
              checked={autoBackupEnabled}
              onCheckedChange={(checked) => {
                saveAutoBackupSettings(checked, autoBackupFrequency, maxBackups);
                toast({
                  title: checked ? t('backup.autoBackupEnabled') : t('backup.autoBackupDisabled'),
                  description: checked 
                    ? t('backup.autoBackupWillStart') 
                    : t('backup.autoBackupWillStop'),
                });
              }}
              disabled={!hasCompany}
            />
          </div>

          {/* Frequency Selection */}
          <div className="space-y-2">
            <Label htmlFor="backup-frequency">{t('backup.frequency')}</Label>
            <Select
              value={autoBackupFrequency}
              onValueChange={(value) => saveAutoBackupSettings(autoBackupEnabled, value, maxBackups)}
              disabled={!autoBackupEnabled || !hasCompany}
            >
              <SelectTrigger id="backup-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{t('backup.daily')}</SelectItem>
                <SelectItem value="weekly">{t('backup.weekly')}</SelectItem>
                <SelectItem value="monthly">{t('backup.monthly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Backups Selection */}
          <div className="space-y-2">
            <Label htmlFor="max-backups">{t('backup.maxBackupsToKeep')}</Label>
            <Select
              value={maxBackups}
              onValueChange={(value) => saveAutoBackupSettings(autoBackupEnabled, autoBackupFrequency, value)}
              disabled={!autoBackupEnabled || !hasCompany}
            >
              <SelectTrigger id="max-backups">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 {t('backup.backups')}</SelectItem>
                <SelectItem value="7">7 {t('backup.backups')}</SelectItem>
                <SelectItem value="14">14 {t('backup.backups')}</SelectItem>
                <SelectItem value="30">30 {t('backup.backups')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t('backup.oldBackupsWillBeMarked')}
            </p>
          </div>

          {/* Status */}
          {autoBackupEnabled && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('backup.status')}:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {t('backup.active')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('backup.lastBackup')}:</span>
                <span className="font-medium">
                  {lastAutoBackup 
                    ? new Date(lastAutoBackup).toLocaleString() 
                    : t('backup.never')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('backup.nextBackup')}:</span>
                <span className="font-medium">{getNextBackupTime()}</span>
              </div>
            </div>
          )}

          {/* Manual Trigger */}
          {autoBackupEnabled && (
            <Button
              onClick={performAutoBackup}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Download className="h-4 w-4 me-2" />
              {t('backup.backupNow')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Restore Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t('backup.restoreBackup')}
          </CardTitle>
          <CardDescription>
            {t('backup.restoreDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="block w-full text-sm text-muted-foreground
                file:me-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90"
            />
            {backupFile && (
              <p className="text-sm text-muted-foreground mt-2">
                {t('backup.selectedFile')}: {backupFile.name}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-2">
            <Button
              onClick={() => setShowRestoreDialog(true)}
              disabled={!backupFile || isLoading || !hasCompany}
              variant="destructive"
              className="w-full md:w-auto"
            >
              <Upload className="h-4 w-4 me-2" />
              {t('backup.restore')}
            </Button>
            <Button
              onClick={() => setShowMergeDialog(true)}
              disabled={!backupFile || isLoading || !hasCompany}
              variant="outline"
              className="w-full md:w-auto"
            >
              <GitMerge className="h-4 w-4 me-2" />
              {t('backup.merge')}
            </Button>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                {t('common.warning')}
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                {t('backup.restoreWarning')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {t('backup.infoTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold mb-2">{t('backup.infoDescription')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            <p>• {t('backup.infoCompanies')}</p>
            <p>• {t('backup.infoAccounts')}</p>
            <p>• {t('backup.infoContacts')}</p>
            <p>• {t('backup.infoItems')}</p>
            <p>• {t('backup.infoTaxes')}</p>
            <p>• {t('backup.infoJournals')}</p>
            <p>• {t('backup.infoInvoices')}</p>
            <p>• {t('backup.infoBills')}</p>
            <p>• {t('backup.infoPayments')}</p>
            <p>• {t('backup.infoBanking')}</p>
            <p>• {t('backup.infoInventory')}</p>
            <p>• {t('backup.infoAssets')}</p>
            <p>• {t('backup.infoProjects')}</p>
            <p>• {t('backup.infoBudgets')}</p>
            <p>• {t('backup.infoEmployees')}</p>
            <p>• {t('backup.infoSettings')}</p>
          </div>
          <p className="pt-2 italic text-green-600 dark:text-green-400">✅ {t('backup.infoComplete')}</p>
          <p className="italic">💡 {t('backup.infoTimestamp')}</p>
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('backup.restore')} - {t('common.confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('backup.restoreWarning')} <br/><br/>
              {t('backup.continueQuestion')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleRestore(false)}>
              {t('backup.restore')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merge Confirmation Dialog */}
      <AlertDialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('backup.merge')} - {t('common.confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('backup.mergeWarning')} <br/><br/>
              {t('backup.continueQuestion')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleRestore(true)}>
              {t('backup.merge')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
