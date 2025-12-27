import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  RefreshCw, 
  Plus, 
  Play, 
  Pause,
  Calendar,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Filter,
  History,
  Banknote,
  FileText,
  Repeat,
  CalendarRange,
  ArrowRightLeft,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, addDays, addWeeks, addMonths, addYears, isBefore, isAfter, parseISO } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Types
type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
type TransactionType = 'invoice' | 'expense' | 'payment' | 'journal_entry' | 'transfer';
type RecurringStatus = 'active' | 'paused' | 'completed' | 'cancelled';

interface RecurringTransaction {
  id: string;
  name: string;
  type: TransactionType;
  amount: number;
  currency: string;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  nextRunDate: string;
  lastRunDate?: string;
  runCount: number;
  maxRuns?: number;
  status: RecurringStatus;
  contactId?: string;
  contactName?: string;
  accountId?: string;
  accountName?: string;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  notes?: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
  notifyBefore?: number;
  autoApprove: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RecurringLog {
  id: string;
  recurringId: string;
  runDate: string;
  status: 'success' | 'failed' | 'skipped';
  transactionId?: string;
  amount: number;
  error?: string;
  notes?: string;
}

interface RecurringTransactionsProps {
  organizationId?: number;
}

// Frequency labels
const frequencyLabels: Record<RecurrenceFrequency, string> = {
  daily: 'recurring.frequency.daily',
  weekly: 'recurring.frequency.weekly',
  biweekly: 'recurring.frequency.biweekly',
  monthly: 'recurring.frequency.monthly',
  quarterly: 'recurring.frequency.quarterly',
  yearly: 'recurring.frequency.yearly'
};

// Transaction type icons
const typeIcons: Record<TransactionType, React.ElementType> = {
  invoice: FileText,
  expense: Banknote,
  payment: ArrowRightLeft,
  journal_entry: FileText,
  transfer: ArrowRight
};

// Status colors
const statusColors: Record<RecurringStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
};

export function RecurringTransactions({ organizationId }: RecurringTransactionsProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;

  // State
  const [selectedRecurring, setSelectedRecurring] = useState<RecurringTransaction | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<RecurringStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<RecurringTransaction>>({
    name: '',
    type: 'expense',
    amount: 0,
    currency: 'USD',
    frequency: 'monthly',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    autoApprove: false,
    dayOfMonth: 1
  });

  // Sample data - replace with actual API calls
  const sampleRecurring: RecurringTransaction[] = [
    {
      id: '1',
      name: 'Office Rent',
      type: 'expense',
      amount: 5000,
      currency: 'USD',
      frequency: 'monthly',
      startDate: '2024-01-01',
      nextRunDate: '2024-02-01',
      lastRunDate: '2024-01-01',
      runCount: 1,
      status: 'active',
      contactName: 'Building Management Co.',
      categoryName: 'Rent',
      description: 'Monthly office rent payment',
      dayOfMonth: 1,
      autoApprove: true,
      createdAt: '2023-12-15',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Monthly Retainer Invoice',
      type: 'invoice',
      amount: 2500,
      currency: 'USD',
      frequency: 'monthly',
      startDate: '2024-01-15',
      nextRunDate: '2024-02-15',
      lastRunDate: '2024-01-15',
      runCount: 1,
      status: 'active',
      contactName: 'Acme Corp',
      description: 'Monthly retainer services',
      dayOfMonth: 15,
      autoApprove: false,
      createdAt: '2023-12-20',
      updatedAt: '2024-01-15'
    },
    {
      id: '3',
      name: 'Software Subscription',
      type: 'expense',
      amount: 99,
      currency: 'USD',
      frequency: 'yearly',
      startDate: '2024-03-01',
      nextRunDate: '2024-03-01',
      runCount: 0,
      status: 'active',
      categoryName: 'Software',
      description: 'Annual software license',
      autoApprove: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  const sampleLogs: RecurringLog[] = [
    {
      id: 'log1',
      recurringId: '1',
      runDate: '2024-01-01',
      status: 'success',
      transactionId: 'txn-123',
      amount: 5000
    },
    {
      id: 'log2',
      recurringId: '2',
      runDate: '2024-01-15',
      status: 'success',
      transactionId: 'inv-456',
      amount: 2500
    }
  ];

  // Query for recurring transactions
  const { data: recurringTransactions = sampleRecurring, isLoading } = useQuery({
    queryKey: ['recurring-transactions', organizationId],
    queryFn: async () => sampleRecurring,
    enabled: !!organizationId
  });

  // Query for logs
  const { data: logs = sampleLogs } = useQuery({
    queryKey: ['recurring-logs', selectedRecurring?.id],
    queryFn: async () => sampleLogs.filter(l => l.recurringId === selectedRecurring?.id),
    enabled: !!selectedRecurring?.id && isHistoryOpen
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: Partial<RecurringTransaction>) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...data, id: Date.now().toString() } as RecurringTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast({ title: t('recurring.created') });
      setIsFormOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: t('recurring.createError'), variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<RecurringTransaction>) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return data as RecurringTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast({ title: t('recurring.updated') });
      setIsFormOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: t('recurring.updateError'), variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast({ title: t('recurring.deleted') });
      setIsDeleteDialogOpen(false);
      setSelectedRecurring(null);
    },
    onError: () => {
      toast({ title: t('recurring.deleteError'), variant: 'destructive' });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RecurringStatus }) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id, status };
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast({ title: status === 'active' ? t('recurring.activated') : t('recurring.paused') });
    }
  });

  const runNowMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast({ title: t('recurring.runSuccess') });
    },
    onError: () => {
      toast({ title: t('recurring.runError'), variant: 'destructive' });
    }
  });

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return recurringTransactions.filter(rt => {
      if (filterStatus !== 'all' && rt.status !== filterStatus) return false;
      if (filterType !== 'all' && rt.type !== filterType) return false;
      return true;
    });
  }, [recurringTransactions, filterStatus, filterType]);

  // Calculate next run date based on frequency
  const calculateNextRunDate = useCallback((startDate: string, frequency: RecurrenceFrequency): Date => {
    const date = parseISO(startDate);
    const now = new Date();
    
    if (isAfter(date, now)) return date;
    
    let nextDate = date;
    while (isBefore(nextDate, now)) {
      switch (frequency) {
        case 'daily': nextDate = addDays(nextDate, 1); break;
        case 'weekly': nextDate = addWeeks(nextDate, 1); break;
        case 'biweekly': nextDate = addWeeks(nextDate, 2); break;
        case 'monthly': nextDate = addMonths(nextDate, 1); break;
        case 'quarterly': nextDate = addMonths(nextDate, 3); break;
        case 'yearly': nextDate = addYears(nextDate, 1); break;
      }
    }
    return nextDate;
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      type: 'expense',
      amount: 0,
      currency: 'USD',
      frequency: 'monthly',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      autoApprove: false,
      dayOfMonth: 1
    });
    setSelectedRecurring(null);
  }, []);

  // Open form for editing
  const openEditForm = useCallback((recurring: RecurringTransaction) => {
    setSelectedRecurring(recurring);
    setFormData(recurring);
    setIsFormOpen(true);
  }, []);

  // Open form for new
  const openNewForm = useCallback(() => {
    resetForm();
    setIsFormOpen(true);
  }, [resetForm]);

  // Handle form submit
  const handleSubmit = useCallback(() => {
    if (selectedRecurring) {
      updateMutation.mutate({ ...formData, id: selectedRecurring.id });
    } else {
      createMutation.mutate(formData);
    }
  }, [formData, selectedRecurring, createMutation, updateMutation]);

  // Duplicate recurring
  const duplicateRecurring = useCallback((recurring: RecurringTransaction) => {
    setFormData({
      ...recurring,
      name: `${recurring.name} (${t('recurring.copy')})`,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      runCount: 0,
      lastRunDate: undefined
    });
    setSelectedRecurring(null);
    setIsFormOpen(true);
  }, [t]);

  // Get upcoming transactions
  const upcomingTransactions = useMemo(() => {
    const upcoming: { recurring: RecurringTransaction; date: Date }[] = [];
    
    recurringTransactions
      .filter(rt => rt.status === 'active')
      .forEach(rt => {
        const nextDate = parseISO(rt.nextRunDate);
        if (isAfter(addDays(new Date(), 30), nextDate)) {
          upcoming.push({ recurring: rt, date: nextDate });
        }
      });
    
    return upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [recurringTransactions]);

  // Stats
  const stats = useMemo(() => {
    const active = recurringTransactions.filter(rt => rt.status === 'active').length;
    const paused = recurringTransactions.filter(rt => rt.status === 'paused').length;
    const monthlyTotal = recurringTransactions
      .filter(rt => rt.status === 'active')
      .reduce((sum, rt) => {
        let monthlyAmount = rt.amount;
        switch (rt.frequency) {
          case 'daily': monthlyAmount = rt.amount * 30; break;
          case 'weekly': monthlyAmount = rt.amount * 4; break;
          case 'biweekly': monthlyAmount = rt.amount * 2; break;
          case 'quarterly': monthlyAmount = rt.amount / 3; break;
          case 'yearly': monthlyAmount = rt.amount / 12; break;
        }
        return sum + monthlyAmount;
      }, 0);
    
    return { active, paused, total: recurringTransactions.length, monthlyTotal };
  }, [recurringTransactions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('recurring.title')}</h2>
          <p className="text-muted-foreground">{t('recurring.description')}</p>
        </div>
        <Button onClick={openNewForm} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('recurring.add')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('recurring.stats.active')}</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('recurring.stats.paused')}</CardTitle>
            <Pause className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paused}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('recurring.stats.total')}</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('recurring.stats.monthlyTotal')}</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.monthlyTotal.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Alert */}
      {upcomingTransactions.length > 0 && (
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertTitle>{t('recurring.upcomingTitle')}</AlertTitle>
          <AlertDescription>
            {t('recurring.upcomingDesc', { count: upcomingTransactions.length })}
            <div className="mt-2 space-y-1">
              {upcomingTransactions.slice(0, 3).map(({ recurring, date }) => (
                <div key={recurring.id} className="text-sm flex items-center gap-2">
                  <span className="font-medium">{recurring.name}</span>
                  <span className="text-muted-foreground">-</span>
                  <span>{format(date, 'PPP', { locale: dateLocale })}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="font-medium">${recurring.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as RecurringStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('recurring.filterStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('recurring.allStatuses')}</SelectItem>
            <SelectItem value="active">{t('recurring.status.active')}</SelectItem>
            <SelectItem value="paused">{t('recurring.status.paused')}</SelectItem>
            <SelectItem value="completed">{t('recurring.status.completed')}</SelectItem>
            <SelectItem value="cancelled">{t('recurring.status.cancelled')}</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterType} onValueChange={(v) => setFilterType(v as TransactionType | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('recurring.filterType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('recurring.allTypes')}</SelectItem>
            <SelectItem value="invoice">{t('recurring.type.invoice')}</SelectItem>
            <SelectItem value="expense">{t('recurring.type.expense')}</SelectItem>
            <SelectItem value="payment">{t('recurring.type.payment')}</SelectItem>
            <SelectItem value="journal_entry">{t('recurring.type.journalEntry')}</SelectItem>
            <SelectItem value="transfer">{t('recurring.type.transfer')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('recurring.table.name')}</TableHead>
                <TableHead>{t('recurring.table.type')}</TableHead>
                <TableHead>{t('recurring.table.amount')}</TableHead>
                <TableHead>{t('recurring.table.frequency')}</TableHead>
                <TableHead>{t('recurring.table.nextRun')}</TableHead>
                <TableHead>{t('recurring.table.status')}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map(recurring => {
                const TypeIcon = typeIcons[recurring.type];
                const isExpanded = expandedId === recurring.id;
                
                return (
                  <React.Fragment key={recurring.id}>
                    <TableRow className="cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : recurring.id)}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          <span className="font-medium">{recurring.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{t(`recurring.type.${recurring.type}`)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${recurring.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {t(frequencyLabels[recurring.frequency])}
                      </TableCell>
                      <TableCell>
                        {format(parseISO(recurring.nextRunDate), 'PP', { locale: dateLocale })}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("gap-1", statusColors[recurring.status])}>
                          {recurring.status === 'active' && <Play className="h-3 w-3" />}
                          {recurring.status === 'paused' && <Pause className="h-3 w-3" />}
                          {recurring.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                          {recurring.status === 'cancelled' && <XCircle className="h-3 w-3" />}
                          {t(`recurring.status.${recurring.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {recurring.status === 'active' && (
                              <DropdownMenuItem onClick={() => runNowMutation.mutate(recurring.id)}>
                                <Play className="h-4 w-4 me-2" />
                                {t('recurring.runNow')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => {
                              setSelectedRecurring(recurring);
                              setIsHistoryOpen(true);
                            }}>
                              <History className="h-4 w-4 me-2" />
                              {t('recurring.viewHistory')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {recurring.status === 'active' ? (
                              <DropdownMenuItem onClick={() => toggleStatusMutation.mutate({ id: recurring.id, status: 'paused' })}>
                                <Pause className="h-4 w-4 me-2" />
                                {t('recurring.pause')}
                              </DropdownMenuItem>
                            ) : recurring.status === 'paused' ? (
                              <DropdownMenuItem onClick={() => toggleStatusMutation.mutate({ id: recurring.id, status: 'active' })}>
                                <Play className="h-4 w-4 me-2" />
                                {t('recurring.activate')}
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem onClick={() => openEditForm(recurring)}>
                              <Edit2 className="h-4 w-4 me-2" />
                              {t('recurring.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicateRecurring(recurring)}>
                              <Copy className="h-4 w-4 me-2" />
                              {t('recurring.duplicate')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setSelectedRecurring(recurring);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 me-2" />
                              {t('recurring.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/50 p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">{t('recurring.startDate')}:</span>
                              <p className="font-medium">{format(parseISO(recurring.startDate), 'PP', { locale: dateLocale })}</p>
                            </div>
                            {recurring.lastRunDate && (
                              <div>
                                <span className="text-muted-foreground">{t('recurring.lastRun')}:</span>
                                <p className="font-medium">{format(parseISO(recurring.lastRunDate), 'PP', { locale: dateLocale })}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">{t('recurring.runCount')}:</span>
                              <p className="font-medium">{recurring.runCount}{recurring.maxRuns ? ` / ${recurring.maxRuns}` : ''}</p>
                            </div>
                            {recurring.contactName && (
                              <div>
                                <span className="text-muted-foreground">{t('recurring.contact')}:</span>
                                <p className="font-medium">{recurring.contactName}</p>
                              </div>
                            )}
                            {recurring.categoryName && (
                              <div>
                                <span className="text-muted-foreground">{t('recurring.category')}:</span>
                                <p className="font-medium">{recurring.categoryName}</p>
                              </div>
                            )}
                            {recurring.description && (
                              <div className="col-span-2">
                                <span className="text-muted-foreground">{t('recurring.description')}:</span>
                                <p className="font-medium">{recurring.description}</p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
              
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Repeat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">{t('recurring.noRecurring')}</p>
                    <p className="text-muted-foreground">{t('recurring.noRecurringDesc')}</p>
                    <Button onClick={openNewForm} className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      {t('recurring.add')}
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRecurring ? t('recurring.editTitle') : t('recurring.addTitle')}
            </DialogTitle>
            <DialogDescription>
              {selectedRecurring ? t('recurring.editDescription') : t('recurring.addDescription')}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>{t('recurring.form.name')}</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('recurring.form.namePlaceholder')}
                  />
                </div>

                <div>
                  <Label>{t('recurring.form.type')}</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as TransactionType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoice">{t('recurring.type.invoice')}</SelectItem>
                      <SelectItem value="expense">{t('recurring.type.expense')}</SelectItem>
                      <SelectItem value="payment">{t('recurring.type.payment')}</SelectItem>
                      <SelectItem value="journal_entry">{t('recurring.type.journalEntry')}</SelectItem>
                      <SelectItem value="transfer">{t('recurring.type.transfer')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('recurring.form.amount')}</Label>
                  <Input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <Label>{t('recurring.form.frequency')}</Label>
                  <Select 
                    value={formData.frequency} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, frequency: v as RecurrenceFrequency }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t('recurring.frequency.daily')}</SelectItem>
                      <SelectItem value="weekly">{t('recurring.frequency.weekly')}</SelectItem>
                      <SelectItem value="biweekly">{t('recurring.frequency.biweekly')}</SelectItem>
                      <SelectItem value="monthly">{t('recurring.frequency.monthly')}</SelectItem>
                      <SelectItem value="quarterly">{t('recurring.frequency.quarterly')}</SelectItem>
                      <SelectItem value="yearly">{t('recurring.frequency.yearly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('recurring.form.startDate')}</Label>
                  <Input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>{t('recurring.form.endDate')} ({t('common.optional')})</Label>
                  <Input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value || undefined }))}
                  />
                </div>

                {(formData.frequency === 'monthly' || formData.frequency === 'quarterly' || formData.frequency === 'yearly') && (
                  <div>
                    <Label>{t('recurring.form.dayOfMonth')}</Label>
                    <Select 
                      value={String(formData.dayOfMonth || 1)} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, dayOfMonth: parseInt(v) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                          <SelectItem key={day} value={String(day)}>{day}</SelectItem>
                        ))}
                        <SelectItem value="31">{t('recurring.lastDayOfMonth')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(formData.frequency === 'weekly' || formData.frequency === 'biweekly') && (
                  <div>
                    <Label>{t('recurring.form.dayOfWeek')}</Label>
                    <Select 
                      value={String(formData.dayOfWeek || 1)} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, dayOfWeek: parseInt(v) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">{t('recurring.days.sunday')}</SelectItem>
                        <SelectItem value="1">{t('recurring.days.monday')}</SelectItem>
                        <SelectItem value="2">{t('recurring.days.tuesday')}</SelectItem>
                        <SelectItem value="3">{t('recurring.days.wednesday')}</SelectItem>
                        <SelectItem value="4">{t('recurring.days.thursday')}</SelectItem>
                        <SelectItem value="5">{t('recurring.days.friday')}</SelectItem>
                        <SelectItem value="6">{t('recurring.days.saturday')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="col-span-2">
                  <Label>{t('recurring.form.description')}</Label>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('recurring.form.descriptionPlaceholder')}
                  />
                </div>

                <div className="col-span-2 flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <Label>{t('recurring.form.autoApprove')}</Label>
                    <p className="text-sm text-muted-foreground">{t('recurring.form.autoApproveDesc')}</p>
                  </div>
                  <Switch
                    checked={formData.autoApprove}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoApprove: checked }))}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || !formData.amount || createMutation.isPending || updateMutation.isPending}
            >
              {selectedRecurring ? t('recurring.save') : t('recurring.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('recurring.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('recurring.deleteDescription', { name: selectedRecurring?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedRecurring && deleteMutation.mutate(selectedRecurring.id)}
              disabled={deleteMutation.isPending}
            >
              {t('recurring.confirmDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('recurring.historyTitle')}</DialogTitle>
            <DialogDescription>
              {t('recurring.historyDescription', { name: selectedRecurring?.name })}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[50vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('recurring.history.date')}</TableHead>
                  <TableHead>{t('recurring.history.amount')}</TableHead>
                  <TableHead>{t('recurring.history.status')}</TableHead>
                  <TableHead>{t('recurring.history.transaction')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>{format(parseISO(log.runDate), 'PP', { locale: dateLocale })}</TableCell>
                    <TableCell>${log.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === 'success' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}>
                        {log.status === 'success' && <CheckCircle className="h-3 w-3 me-1" />}
                        {log.status === 'failed' && <XCircle className="h-3 w-3 me-1" />}
                        {log.status === 'skipped' && <AlertCircle className="h-3 w-3 me-1" />}
                        {t(`recurring.history.${log.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.transactionId ? (
                        <Button variant="ghost" size="sm" className="h-auto p-1">
                          {log.transactionId}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {t('recurring.noHistory')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryOpen(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RecurringTransactions;
