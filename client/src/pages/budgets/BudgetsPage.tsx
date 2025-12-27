import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, Trash2, ChevronDown, ChevronUp, Calculator, TrendingUp, TrendingDown, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
] as const;

interface BudgetEntry {
  account_id: string;
  january: string;
  february: string;
  march: string;
  april: string;
  may: string;
  june: string;
  july: string;
  august: string;
  september: string;
  october: string;
  november: string;
  december: string;
  total: string;
}

export default function BudgetsPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [fiscalYear, setFiscalYear] = useState(currentYear.toString());
  const [budgetValues, setBudgetValues] = useState<Record<string, BudgetEntry>>({});
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [entryMode, setEntryMode] = useState<'annual' | 'monthly'>('annual');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copyFromYear, setCopyFromYear] = useState((currentYear - 1).toString());
  const [copyToYear, setCopyToYear] = useState((currentYear + 1).toString());
  const [adjustmentPercent, setAdjustmentPercent] = useState("0");

  // Fetch accounts (Expense and Revenue only usually)
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/accounts");
      const allAccounts = await res.json();
      // Filter for P&L accounts usually
      return allAccounts.filter((a: any) => 
        ['revenue', 'expense'].includes(a.account_type)
      );
    },
  });

  // Fetch existing budgets for the year
  const { data: budgets, isLoading: isLoadingBudgets } = useQuery({
    queryKey: ["budgets", fiscalYear],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/budgets?fiscalYear=${fiscalYear}`);
      const json = await res.json();
      return Array.isArray(json) ? json : (json.data || []);
    },
  });

  // Initialize budget values from fetched data
  useEffect(() => {
    if (budgets && accounts) {
      const values: Record<string, BudgetEntry> = {};
      budgets.forEach((b: any) => {
        values[b.account_id] = {
          account_id: b.account_id,
          january: b.january || '0',
          february: b.february || '0',
          march: b.march || '0',
          april: b.april || '0',
          may: b.may || '0',
          june: b.june || '0',
          july: b.july || '0',
          august: b.august || '0',
          september: b.september || '0',
          october: b.october || '0',
          november: b.november || '0',
          december: b.december || '0',
          total: b.total || '0',
        };
      });
      setBudgetValues(values);
    }
  }, [budgets, accounts]);

  const getBudgetEntry = (accountId: string): BudgetEntry => {
    return budgetValues[accountId] || {
      account_id: accountId,
      january: '0', february: '0', march: '0', april: '0',
      may: '0', june: '0', july: '0', august: '0',
      september: '0', october: '0', november: '0', december: '0',
      total: '0'
    };
  };

  const calculateTotal = (entry: BudgetEntry): number => {
    return MONTHS.reduce((sum, month) => {
      return sum + (parseFloat(entry[month] as string) || 0);
    }, 0);
  };

  const saveBudgetMutation = useMutation({
    mutationFn: async (data: BudgetEntry & { fiscal_year: number }) => {
      const res = await apiRequest("POST", "/api/budgets", {
        ...data,
        period_type: entryMode === 'monthly' ? 'monthly' : 'yearly'
      });
      if (!res.ok) throw new Error("Failed to save budget");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", fiscalYear] });
      toast({
        title: t('common.success'),
        description: t('budgets.saveSuccess', { defaultValue: 'Budget saved successfully' }),
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('budgets.saveError', { defaultValue: 'Failed to save budget' }),
        variant: "destructive",
      });
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: async (budgetId: string) => {
      const res = await apiRequest("DELETE", `/api/budgets/${budgetId}`);
      if (!res.ok) throw new Error("Failed to delete budget");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", fiscalYear] });
      toast({
        title: t('common.success'),
        description: t('budgets.deleteSuccess', { defaultValue: 'Budget deleted successfully' }),
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('budgets.deleteError', { defaultValue: 'Failed to delete budget' }),
        variant: "destructive",
      });
    },
  });

  const copyBudgetMutation = useMutation({
    mutationFn: async (data: { fromYear: string; toYear: string; adjustmentPercent: number }) => {
      const res = await apiRequest("POST", "/api/budgets/copy", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to copy budgets");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setCopyDialogOpen(false);
      toast({
        title: t('common.success'),
        description: t('budgets.copySuccess', { defaultValue: `Copied ${data.count} budgets successfully` }),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('budgets.copyError', { defaultValue: 'Failed to copy budgets' }),
        variant: "destructive",
      });
    },
  });

  const handleCopyBudget = () => {
    copyBudgetMutation.mutate({
      fromYear: copyFromYear,
      toYear: copyToYear,
      adjustmentPercent: parseFloat(adjustmentPercent) || 0
    });
  };

  const handleMonthChange = (accountId: string, month: string, value: string) => {
    setBudgetValues(prev => {
      const entry = getBudgetEntry(accountId);
      const updated = { ...entry, [month]: value };
      updated.total = calculateTotal(updated).toString();
      return { ...prev, [accountId]: updated };
    });
  };

  const handleAnnualChange = (accountId: string, value: string) => {
    const monthlyValue = (parseFloat(value) / 12).toFixed(2);
    setBudgetValues(prev => {
      const entry: BudgetEntry = {
        account_id: accountId,
        january: monthlyValue, february: monthlyValue, march: monthlyValue,
        april: monthlyValue, may: monthlyValue, june: monthlyValue,
        july: monthlyValue, august: monthlyValue, september: monthlyValue,
        october: monthlyValue, november: monthlyValue, december: monthlyValue,
        total: value
      };
      return { ...prev, [accountId]: entry };
    });
  };

  const handleSave = (accountId: string) => {
    const entry = getBudgetEntry(accountId);
    saveBudgetMutation.mutate({
      ...entry,
      fiscal_year: parseInt(fiscalYear)
    });
  };

  const handleDelete = (accountId: string) => {
    const budget = budgets?.find((b: any) => b.account_id === accountId);
    if (budget) {
      setBudgetToDelete(budget.id);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (budgetToDelete) {
      deleteBudgetMutation.mutate(budgetToDelete);
      setDeleteDialogOpen(false);
      setBudgetToDelete(null);
    }
  };

  const toggleExpand = (accountId: string) => {
    setExpandedAccounts(prev => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  };

  // Group accounts by type
  const expenseAccounts = accounts?.filter((a: any) => a.account_type === 'expense') || [];
  const revenueAccounts = accounts?.filter((a: any) => a.account_type === 'revenue') || [];

  // Calculate totals
  const totalExpenseBudget = expenseAccounts.reduce((sum: number, acc: any) => {
    return sum + (parseFloat(getBudgetEntry(acc.id).total) || 0);
  }, 0);

  const totalRevenueBudget = revenueAccounts.reduce((sum: number, acc: any) => {
    return sum + (parseFloat(getBudgetEntry(acc.id).total) || 0);
  }, 0);

  const renderAccountRow = (account: any) => {
    const entry = getBudgetEntry(account.id);
    const hasBudget = budgets?.some((b: any) => b.account_id === account.id);
    const isExpanded = expandedAccounts.has(account.id);

    return (
      <Collapsible key={account.id} open={isExpanded} onOpenChange={() => toggleExpand(account.id)}>
        <TableRow className="group">
          <TableCell className="font-medium">{account.code}</TableCell>
          <TableCell>{account.name}</TableCell>
          <TableCell>
            {entryMode === 'annual' ? (
              <Input 
                type="number" 
                value={entry.total}
                onChange={(e) => handleAnnualChange(account.id, e.target.value)}
                placeholder="0.00"
                className="max-w-[150px]"
              />
            ) : (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <span className="font-medium">
                    {parseFloat(entry.total).toLocaleString(i18n.language, { minimumFractionDigits: 2 })}
                  </span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            )}
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => handleSave(account.id)}
                disabled={saveBudgetMutation.isPending}
              >
                <Save className="h-4 w-4" />
              </Button>
              {hasBudget && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleDelete(account.id)}
                  disabled={deleteBudgetMutation.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
        
        {entryMode === 'monthly' && (
          <CollapsibleContent asChild>
            <TableRow className="bg-muted/30">
              <TableCell colSpan={4} className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {MONTHS.map((month) => (
                    <div key={month} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        {t(`budgets.months.${month}`, { defaultValue: month })}
                      </Label>
                      <Input
                        type="number"
                        value={entry[month]}
                        onChange={(e) => handleMonthChange(account.id, month, e.target.value)}
                        placeholder="0.00"
                        className="h-8"
                      />
                    </div>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          </CollapsibleContent>
        )}
      </Collapsible>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('budgets.title', { defaultValue: 'Budget Planning' })}</h1>
          <p className="text-sm text-muted-foreground">{t('budgets.description', { defaultValue: 'Set annual and monthly budget targets' })}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>{t('budgets.fiscalYear', { defaultValue: 'Fiscal Year' })}</Label>
            <Select value={fiscalYear} onValueChange={setFiscalYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label>{t('budgets.entryMode', { defaultValue: 'Mode' })}</Label>
            <Select value={entryMode} onValueChange={(v) => setEntryMode(v as 'annual' | 'monthly')}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">{t('budgets.annual', { defaultValue: 'Annual' })}</SelectItem>
                <SelectItem value="monthly">{t('budgets.monthly', { defaultValue: 'Monthly' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCopyDialogOpen(true)}>
            <Copy className="h-4 w-4 me-2" />
            {t('budgets.copyFromYear', { defaultValue: 'Copy Budget' })}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              {t('budgets.totalRevenue', { defaultValue: 'Total Revenue Budget' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalRevenueBudget.toLocaleString(i18n.language, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              {t('budgets.totalExpense', { defaultValue: 'Total Expense Budget' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalExpenseBudget.toLocaleString(i18n.language, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              {t('budgets.netBudget', { defaultValue: 'Net Budget' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalRevenueBudget - totalExpenseBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(totalRevenueBudget - totalExpenseBudget).toLocaleString(i18n.language, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Entry Tables */}
      <Tabs defaultValue="expense" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expense" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            {t('budgets.expenses', { defaultValue: 'Expenses' })}
            <Badge variant="secondary">{expenseAccounts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('budgets.revenue', { defaultValue: 'Revenue' })}
            <Badge variant="secondary">{revenueAccounts.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expense">
          <Card>
            <CardHeader>
              <CardTitle>{t('budgets.expenseBudgets', { defaultValue: 'Expense Budgets' })}</CardTitle>
              <CardDescription>{t('budgets.expenseDesc', { defaultValue: 'Set budget limits for expense accounts' })}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('budgets.accountCode', { defaultValue: 'Code' })}</TableHead>
                      <TableHead>{t('budgets.accountName', { defaultValue: 'Account' })}</TableHead>
                      <TableHead>{t('budgets.annualBudget', { defaultValue: 'Annual Budget' })}</TableHead>
                      <TableHead className="w-[100px]">{t('common.actions', { defaultValue: 'Actions' })}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingAccounts || isLoadingBudgets ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">{t('common.loading')}</TableCell>
                      </TableRow>
                    ) : expenseAccounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          {t('budgets.noExpenseAccounts', { defaultValue: 'No expense accounts found' })}
                        </TableCell>
                      </TableRow>
                    ) : (
                      expenseAccounts.map(renderAccountRow)
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>{t('budgets.revenueBudgets', { defaultValue: 'Revenue Budgets' })}</CardTitle>
              <CardDescription>{t('budgets.revenueDesc', { defaultValue: 'Set revenue targets for income accounts' })}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('budgets.accountCode', { defaultValue: 'Code' })}</TableHead>
                      <TableHead>{t('budgets.accountName', { defaultValue: 'Account' })}</TableHead>
                      <TableHead>{t('budgets.annualBudget', { defaultValue: 'Annual Budget' })}</TableHead>
                      <TableHead className="w-[100px]">{t('common.actions', { defaultValue: 'Actions' })}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingAccounts || isLoadingBudgets ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">{t('common.loading')}</TableCell>
                      </TableRow>
                    ) : revenueAccounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          {t('budgets.noRevenueAccounts', { defaultValue: 'No revenue accounts found' })}
                        </TableCell>
                      </TableRow>
                    ) : (
                      revenueAccounts.map(renderAccountRow)
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Copy Budget Dialog */}
      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('budgets.copyBudget', { defaultValue: 'Copy Budget' })}</DialogTitle>
            <DialogDescription>
              {t('budgets.copyBudgetDesc', { defaultValue: 'Copy all budgets from one year to another with optional adjustment.' })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('budgets.fromYear', { defaultValue: 'From Year' })}</Label>
                <Select value={copyFromYear} onValueChange={setCopyFromYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[currentYear - 2, currentYear - 1, currentYear].map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('budgets.toYear', { defaultValue: 'To Year' })}</Label>
                <Select value={copyToYear} onValueChange={setCopyToYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[currentYear, currentYear + 1, currentYear + 2].map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('budgets.adjustmentPercent', { defaultValue: 'Adjustment %' })}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={adjustmentPercent}
                  onChange={(e) => setAdjustmentPercent(e.target.value)}
                  placeholder="0"
                  className="max-w-[100px]"
                />
                <span className="text-sm text-muted-foreground">
                  {t('budgets.adjustmentHint', { defaultValue: 'e.g., 5 for 5% increase, -10 for 10% decrease' })}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCopyBudget} disabled={copyBudgetMutation.isPending}>
              {copyBudgetMutation.isPending ? t('common.copying', { defaultValue: 'Copying...' }) : t('budgets.copyBudget', { defaultValue: 'Copy Budget' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('budgets.deleteBudget', { defaultValue: 'Delete Budget' })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('budgets.deleteConfirm', { defaultValue: 'Are you sure you want to delete this budget?' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
