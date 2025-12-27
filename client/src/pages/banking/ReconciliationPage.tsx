import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  RefreshCw,
  CheckSquare,
  Square,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useBatchClassification, useClassifyTransaction } from '@/hooks/useAIClassification';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'wouter';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import PageContainer from '@/components/layout/PageContainer';

// Removed mock data; pending bank feed integration.

export default function ReconciliationPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedAccount, setSelectedAccount] = useState('main-business');
  const [reconciliationDate, setReconciliationDate] = useState('2024-02-29');
  // Removed demo initial balance; will derive from selected account or statement API when available
  const [statementBalance, setStatementBalance] = useState('');
  const [showMatched, setShowMatched] = useState(true);
  const [showUnmatched, setShowUnmatched] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, { category: string; confidence: number; suggestedAccounts: { debit: string[]; credit: string[] } }>>({});
  // Suggestions filters
  const LS_KEY = 'recon_filters_v1';
  const LS_PRESETS = 'recon_filter_presets_v1';
  const [typeFilter, setTypeFilter] = useState<'both' | 'receipts' | 'payments'>('both');
  const [maxRows, setMaxRows] = useState<number>(200);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [vendorId, setVendorId] = useState<string>('');
  // Tuning controls
  const [maxCandidates, setMaxCandidates] = useState<number>(3);
  const [minScore, setMinScore] = useState<number>(0);
  const [amountTol, setAmountTol] = useState<number>(0.01);
  const [maxDays, setMaxDays] = useState<number>(30);
  const [preferExact, setPreferExact] = useState<boolean>(true);
  const [sameCurrencyOnly, setSameCurrencyOnly] = useState<boolean>(false);
  const [highOnly, setHighOnly] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedActionKeys, setSelectedActionKeys] = useState<Set<string>>(new Set());
  const [diffThreshold, setDiffThreshold] = useState<number>(7);
  const [presets, setPresets] = useState<Record<string, any>>({});
  const [activePreset, setActivePreset] = useState<string>('');

  const actionKeyOf = (a: { paymentType: string; paymentId: string; documentType: string; documentId: string }) => `${a.paymentType}:${a.paymentId}:${a.documentType}:${a.documentId}`;

  // Load saved filters on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const s = JSON.parse(raw || '{}');
      if (s.typeFilter) setTypeFilter(s.typeFilter);
      if (typeof s.maxRows === 'number') setMaxRows(s.maxRows);
      if (typeof s.from === 'string') setFrom(s.from);
      if (typeof s.to === 'string') setTo(s.to);
      if (typeof s.customerId === 'string') setCustomerId(s.customerId);
      if (typeof s.vendorId === 'string') setVendorId(s.vendorId);
      if (typeof s.maxCandidates === 'number') setMaxCandidates(s.maxCandidates);
      if (typeof s.minScore === 'number') setMinScore(s.minScore);
      if (typeof s.amountTol === 'number') setAmountTol(s.amountTol);
      if (typeof s.maxDays === 'number') setMaxDays(s.maxDays);
      if (typeof s.preferExact === 'boolean') setPreferExact(s.preferExact);
      if (typeof s.sameCurrencyOnly === 'boolean') setSameCurrencyOnly(s.sameCurrencyOnly);
      if (typeof s.highOnly === 'boolean') setHighOnly(s.highOnly);
    } catch {}
  }, []);

  // Load presets on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_PRESETS);
      if (raw) setPresets(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist filters
  useEffect(() => {
    try {
      const s = {
        typeFilter, maxRows, from, to, customerId, vendorId,
        maxCandidates, minScore, amountTol, maxDays, preferExact, sameCurrencyOnly, highOnly,
      };
      localStorage.setItem(LS_KEY, JSON.stringify(s));
    } catch {}
  }, [typeFilter, maxRows, from, to, customerId, vendorId, maxCandidates, minScore, amountTol, maxDays, preferExact, sameCurrencyOnly, highOnly]);

  const savePresets = (next: Record<string, any>) => {
    try { localStorage.setItem(LS_PRESETS, JSON.stringify(next)); } catch {}
    setPresets(next);
  };

  const currentFilters = () => ({
    typeFilter, maxRows, from, to, customerId, vendorId,
    maxCandidates, minScore, amountTol, maxDays, preferExact, sameCurrencyOnly, highOnly,
  });

  const applyFilters = (s: any) => {
    if (!s) return;
    if (s.typeFilter) setTypeFilter(s.typeFilter);
    if (typeof s.maxRows === 'number') setMaxRows(s.maxRows);
    if (typeof s.from === 'string') setFrom(s.from);
    if (typeof s.to === 'string') setTo(s.to);
    if (typeof s.customerId === 'string') setCustomerId(s.customerId);
    if (typeof s.vendorId === 'string') setVendorId(s.vendorId);
    if (typeof s.maxCandidates === 'number') setMaxCandidates(s.maxCandidates);
    if (typeof s.minScore === 'number') setMinScore(s.minScore);
    if (typeof s.amountTol === 'number') setAmountTol(s.amountTol);
    if (typeof s.maxDays === 'number') setMaxDays(s.maxDays);
    if (typeof s.preferExact === 'boolean') setPreferExact(s.preferExact);
    if (typeof s.sameCurrencyOnly === 'boolean') setSameCurrencyOnly(s.sameCurrencyOnly);
    if (typeof s.highOnly === 'boolean') setHighOnly(s.highOnly);
  };

  const suggestionsQuerySuffix = useMemo(() => {
    const params = new URLSearchParams();
    if (typeFilter && typeFilter !== 'both') params.set('type', typeFilter);
    if (maxRows) params.set('max', String(maxRows));
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (customerId) params.set('customer_id', customerId);
    if (vendorId) params.set('vendor_id', vendorId);
    if (maxCandidates) params.set('max_candidates', String(maxCandidates));
    if (minScore) params.set('min_score', String(minScore));
    if (amountTol !== undefined && amountTol !== null) params.set('amount_tolerance', String(amountTol));
    if (maxDays) params.set('max_days', String(maxDays));
    if (preferExact !== undefined) params.set('prefer_exact_amount', String(preferExact));
    if (sameCurrencyOnly !== undefined) params.set('currency_strict', String(sameCurrencyOnly));
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [typeFilter, maxRows, from, to, customerId, vendorId, maxCandidates, minScore, amountTol, maxDays, preferExact, sameCurrencyOnly]);
  const suggestionsKey = `/api/banking/reconciliation/suggestions${suggestionsQuerySuffix}`;

  // Fetch minimal suggestions from API
  const { data: suggestions } = useQuery<any>({
    queryKey: [suggestionsKey],
  });

  // Apply client-side high-confidence filter if enabled
  const filteredSuggestions = useMemo(() => {
    const r = Array.isArray(suggestions?.receipts) ? suggestions.receipts : [];
    const p = Array.isArray(suggestions?.payments) ? suggestions.payments : [];
    if (!highOnly) return { receipts: r, payments: p };
    const filterHigh = (arr: any[]) => arr.filter(s => Boolean(s?.suggestions?.[0]?.high_confidence));
    return { receipts: filterHigh(r), payments: filterHigh(p) };
  }, [suggestions, highOnly]);

  const counts = useMemo(() => {
    const r = filteredSuggestions.receipts || [];
    const p = filteredSuggestions.payments || [];
    const rc = (Array.isArray(suggestions?.receipts) ? suggestions.receipts : []).filter((s: any) => s?.suggestions?.[0]?.high_confidence).length;
    const pc = (Array.isArray(suggestions?.payments) ? suggestions.payments : []).filter((s: any) => s?.suggestions?.[0]?.high_confidence).length;
    return {
      receipts: r.length,
      payments: p.length,
      receiptsHigh: rc,
      paymentsHigh: pc,
    };
  }, [filteredSuggestions, suggestions]);

  const { data: recentAllocations } = useQuery<any>({
    queryKey: ['/api/banking/reconciliation/allocations/recent'],
  });

  const { data: bankTransactions } = useQuery<any>({
    queryKey: ['/api/banking/transactions'],
  });

  // Contacts to select customer/vendor (optional filters)
  const { data: contacts } = useQuery<any>({
    queryKey: ['/api/contacts'],
  });

  const classifyOne = useClassifyTransaction();
  const classifyBatch = useBatchClassification();

  const feedbackMutation = useMutation({
    mutationFn: async (payload: any) => apiRequest('POST', '/api/ai/feedback', payload),
  });

  const allocateMutation = useMutation({
    mutationFn: async (payload: { paymentType: 'receipt'|'payment'; paymentId: string; documentType: 'invoice'|'bill'; documentId: string; amount: number }) => {
      const endpoint = payload.paymentType === 'receipt' 
        ? `/api/banking/receipts/${payload.paymentId}/allocate`
        : `/api/banking/payments/${payload.paymentId}/allocate`;
      
      return await apiRequest('POST', endpoint, {
        [payload.documentType === 'invoice' ? 'invoice_id' : 'bill_id']: payload.documentId,
        amount: payload.amount
      });
    },
    onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: [suggestionsKey] });
      queryClient.invalidateQueries({ queryKey: ['/api/banking/reconciliation/allocations/recent'] });
      toast({ title: t('banking.reconciliation.transactionMatched'), description: t('banking.reconciliation.transactionMatchedDesc') });
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error.message || 'Failed to allocate', variant: 'destructive' });
    }
  });

  // Bulk auto-match
  const autoMatchMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest('POST', '/api/banking/reconciliation/auto-match', payload);
      return await res.json();
    },
  });

  const unallocateMutation = useMutation({
    mutationFn: async (allocationId: string) => {
      return await apiRequest('DELETE', `/api/banking/reconciliation/allocations/${allocationId}`);
    },
    onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: [suggestionsKey] });
      queryClient.invalidateQueries({ queryKey: ['/api/banking/reconciliation/allocations/recent'] });
      toast({ title: t('banking.reconciliation.unmatched', 'Unmatched'), description: t('banking.reconciliation.unmatchedDesc', 'The allocation has been removed.') });
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error.message || 'Failed to unmatch', variant: 'destructive' });
    }
  });

  // Calculate reconciliation status
  // Fetch accounts to derive real balances (no demo numbers)
  const { data: accountsData } = useQuery<any>({ queryKey: ['/api/banking/accounts'] });

  // Determine active account record
  const activeAccount = useMemo(() => {
    const list: any[] = Array.isArray(accountsData) ? accountsData : [];
    return list.find(a => a.id === selectedAccount) || list[0];
  }, [accountsData, selectedAccount]);

  // Derive book balance from account current_balance (fallback 0)
  const bookBalance = Number(activeAccount?.current_balance) || 0;
  // Derive statement balance from account statement_balance if provided or from state if user edits
  const bankStatementBalance = statementBalance ? parseFloat(statementBalance) : Number(activeAccount?.statement_balance) || 0;
  const reconciledTransactions: any[] = [];
  const unreconciledTransactions: any[] = [];
  const unmatchedBankTransactions: any[] = Array.isArray(bankTransactions) ? bankTransactions.map((r: any) => ({
    id: r.id,
    date: r.date,
    description: r.description || r.reference || '',
    amount: Number(r.amount), // positive deposit, negative withdrawal
    matched: !!r.matched,
  })) : [];
  const allBookTransactions: any[] = [];
  const allBankTransactions: any[] = [];
  
  const totalReconciled = reconciledTransactions.reduce((sum, t) => 
    sum + (t.type === 'deposit' ? t.amount : -t.amount), 0
  );
  const totalUnreconciled = unreconciledTransactions.reduce((sum, t) => 
    sum + (t.type === 'deposit' ? t.amount : -t.amount), 0
  );
  
  const difference = bankStatementBalance - bookBalance;
  const isReconciled = Number.isFinite(difference) && Math.abs(difference) < 0.01 && bankStatementBalance !== 0;

  const handleQuickMatch = (s: any, top: any) => {
    allocateMutation.mutate({
      paymentType: s.paymentType,
      paymentId: s.paymentId,
      documentType: top.documentType,
      documentId: top.documentId,
      amount: s.amount,
    });
  };

  const buildAutoMatchPayload = (dry_run: boolean) => ({
    type: typeFilter,
    from,
    to,
    customer_id: customerId || undefined,
    vendor_id: vendorId || undefined,
    amount_tolerance: amountTol,
    max_days: highOnly ? Math.min(7, maxDays) : maxDays,
    currency_strict: sameCurrencyOnly,
    max: maxRows,
    dry_run,
  });

  const handleAutoReconcile = async () => {
    // First do a dry run to preview in a dialog
    try {
      const preview: any = await autoMatchMutation.mutateAsync(buildAutoMatchPayload(true));
      const wouldCount = (preview?.actions || []).filter((a: any) => a.status === 'would-allocate').length;
      if (wouldCount === 0) {
        toast({ title: t('banking.reconciliation.noAutoMatches', { defaultValue: 'No auto-matches found' }), description: t('banking.reconciliation.adjustFilters', { defaultValue: 'Try adjusting your filters or date range.' }) });
        return;
      }
      setPreviewData(preview);
      // Preselect all would-allocate actions by default
      try {
        const all = (preview?.actions || []).filter((a: any) => a.status === 'would-allocate');
        const keys = new Set<string>(all.map((a: any) => actionKeyOf(a)));
        setSelectedActionKeys(keys);
      } catch {}
      setPreviewOpen(true);
    } catch (e: any) {
      toast({ title: t('common.error'), description: e?.message || t('banking.reconciliation.autoMatchFailed', { defaultValue: 'Auto-match failed' }), variant: 'destructive' });
    }
  };

  const confirmAutoReconcile = async () => {
    try {
      // Build selected array to send to server
      const selected = (previewData?.actions || [])
        .filter((a: any) => a.status === 'would-allocate' && selectedActionKeys.has(actionKeyOf(a)))
        .map((a: any) => ({
          paymentType: a.paymentType,
          paymentId: a.paymentId,
          documentType: a.documentType,
          documentId: a.documentId,
        }));
      const result: any = await autoMatchMutation.mutateAsync({
        ...buildAutoMatchPayload(false),
        selected,
      });
      setPreviewOpen(false);
      setPreviewData(null);
      setSelectedActionKeys(new Set());
      queryClient.invalidateQueries({ queryKey: [suggestionsKey] });
      queryClient.invalidateQueries({ queryKey: ['/api/banking/reconciliation/allocations/recent'] });
      const createdCount = Number(result?.allocations_created || 0);
      const createdIds: string[] = Array.isArray(result?.allocation_ids) ? result.allocation_ids : [];
      toast({
        title: t('banking.reconciliation.autoCompleted', { defaultValue: 'Auto-match completed' }),
        description: t('banking.reconciliation.autoSummary', { defaultValue: 'Created {count} allocations', count: createdCount }) as string,
        action: createdIds.length > 0 ? (
          <ToastAction
            altText={t('common.undo', { defaultValue: 'Undo' }) as string}
            onClick={async () => {
              try {
                // Prefer batch undo endpoint when available; fall back to individual deletes if not
                try {
                  await apiRequest('POST', '/api/banking/reconciliation/allocations/undo-batch', { ids: createdIds });
                } catch (err: any) {
                  const msg = String(err?.message || '');
                  if (msg.startsWith('404:')) {
                    // Older server without batch endpoint: use single deletes
                    await Promise.all(createdIds.map((id) => apiRequest('DELETE', `/api/banking/reconciliation/allocations/${id}`)));
                  } else {
                    throw err;
                  }
                }
                queryClient.invalidateQueries({ queryKey: [suggestionsKey] });
                queryClient.invalidateQueries({ queryKey: ['/api/banking/reconciliation/allocations/recent'] });
                toast({ title: t('common.undone', { defaultValue: 'Undone' }), description: t('banking.reconciliation.undoAutoMatch', { defaultValue: 'Reverted allocations' }) });
              } catch (err: any) {
                toast({ title: t('common.error'), description: err?.message || 'Failed to undo', variant: 'destructive' });
              }
            }}
          >
            {t('common.undo', { defaultValue: 'Undo' })}
          </ToastAction>
        ) : undefined,
      });
    } catch (e: any) {
      toast({ title: t('common.error'), description: e?.message || t('banking.reconciliation.autoMatchFailed', { defaultValue: 'Auto-match failed' }), variant: 'destructive' });
    }
  };

  const handleSuggestForRow = async (row: any) => {
    try {
      const result = await classifyOne.mutateAsync({
        description: row.description || '',
        amount: Math.abs(Number(row.amount)),
        currency: 'USD',
        notes: row.reference || undefined,
      });
      setAiSuggestions(prev => ({
        ...prev,
        [row.id]: {
          category: result.category,
          confidence: result.confidence,
          suggestedAccounts: result.suggestedAccounts,
        },
      }));
    } catch (e) {
      toast({ title: t('common.error'), description: (e as any)?.message || t('banking.reconciliation.suggestionFailed', { defaultValue: 'Failed to get suggestion' }), variant: 'destructive' });
    }
  };

  const handleSuggestAll = async () => {
    const inputs = unmatchedBankTransactions.map((r: any) => ({
      description: r.description || '',
      amount: Math.abs(Number(r.amount)),
      currency: 'USD',
    }));
    try {
      const results = await classifyBatch.mutateAsync(inputs);
      const map: Record<string, any> = {};
      unmatchedBankTransactions.forEach((r: any, idx: number) => {
        const res = results[idx];
        if (res) {
          map[r.id] = {
            category: res.category,
            confidence: res.confidence,
            suggestedAccounts: res.suggestedAccounts,
          };
        }
      });
      setAiSuggestions(prev => ({ ...prev, ...map }));
      toast({ title: t('ai.suggestionsReady', { defaultValue: 'AI suggestions ready' }), description: t('ai.suggestedForN', { defaultValue: 'Generated suggestions for {count} transactions', count: results.length }) });
    } catch (e) {
      toast({ title: t('common.error'), description: (e as any)?.message || t('banking.reconciliation.suggestionsFailed', { defaultValue: 'Failed to get suggestions' }), variant: 'destructive' });
    }
  };

  const handleCompleteReconciliation = () => {
    if (!isReconciled) {
      toast({
        title: t('banking.reconciliation.cannotComplete'),
        description: t('banking.reconciliation.cannotCompleteDesc'),
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: t('banking.reconciliation.completed'),
      description: t('banking.reconciliation.completedDesc'),
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
  <PageContainer className="w-full mx-auto px-3 sm:px-3 md:px-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('banking.reconciliation.title')}</h1>
          <p className="text-muted-foreground mt-1 hidden sm:block">{t('banking.reconciliation.description')}</p>
          <p className="text-muted-foreground mt-1 sm:hidden">{t('banking.reconciliation.descriptionShort')}</p>
        </div>
  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Link href="/reports/ai-analytics?source=reconciliation">
            <Button 
              variant="ghost"
              size={isMobile ? 'sm' : 'default'}
              className="w-full sm:w-auto"
              asChild
            >
              {/* anchor child provided by Link */}
              <a aria-label={t('reports.aiAnalytics.title', { defaultValue: 'AI Analytics' }) as string}>
                <BarChart3 className="h-4 w-4 me-0 sm:me-2" />
                <span className="hidden sm:inline">{t('reports.aiAnalytics.title', { defaultValue: 'AI Analytics' })}</span>
              </a>
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={handleAutoReconcile}
            size={isMobile ? 'sm' : 'default'}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 me-0 sm:me-2" />
            <span className="hidden sm:inline">{t('banking.reconciliation.autoMatch')}</span>
          </Button>
          <Button 
            onClick={handleCompleteReconciliation}
            disabled={!isReconciled}
            data-testid="button-complete-reconciliation"
            size={isMobile ? 'sm' : 'default'}
            className="w-full sm:w-auto"
          >
            <span className="sm:hidden">{t('banking.reconciliation.completeShort', { defaultValue: 'Complete' })}</span>
            <span className="hidden sm:inline">{t('banking.reconciliation.completeReconciliation')}</span>
          </Button>
        </div>
      </div>

      {/* Reconciliation Status */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">{t('banking.reconciliation.bookBalance')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{formatCurrency(bookBalance)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('banking.reconciliation.asPerYourRecords')}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">{t('banking.reconciliation.bankBalance')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{formatCurrency(bankStatementBalance)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('banking.reconciliation.fromBankStatement')}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">{t('banking.reconciliation.difference')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className={`text-2xl font-bold ${isReconciled ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(difference))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isReconciled ? t('banking.reconciliation.reconciled') : t('banking.reconciliation.toReconcile')}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">{t('common.status')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center gap-2">
              {isReconciled ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span className="text-green-600 font-semibold">{t('banking.reconciliation.balanced')}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                  <span className="text-orange-600 font-semibold">{t('banking.reconciliation.unbalanced')}</span>
                </>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {reconciledTransactions.length} {t('banking.reconciliation.matched')}, {unreconciledTransactions.length} {t('banking.reconciliation.pending')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions (minimal) */}
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 px-4 pt-4">
      <div className="flex flex-col gap-4">
            <CardTitle className="text-lg">{t('banking.reconciliation.suggestedMatches', 'Suggested Matches')}</CardTitle>
            {/* Filters container: stacked on mobile, dense grid on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
              {/* Presets */}
              <div className="flex flex-col w-full col-span-1 sm:col-span-2 md:col-span-3 xl:col-span-4">
                <Label className="text-xs text-muted-foreground mb-1">{t('common.presets', { defaultValue: 'Presets' })}</Label>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center flex-wrap">
                  <Select value={activePreset || '__none__'} onValueChange={(name: any) => {
                    const realName = name === '__none__' ? '' : name;
                    setActivePreset(realName);
                    if (realName && presets[realName]) applyFilters(presets[realName]);
                  }}>
                    <SelectTrigger className="w-full sm:w-auto h-8">
                      <SelectValue placeholder={t('common.select', { defaultValue: 'Select' }) as string} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{t('common.none', { defaultValue: 'None' })}</SelectItem>
                      {Object.keys(presets).map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="w-full sm:w-auto text-xs" variant="outline" size="sm" onClick={() => {
                    const name = window.prompt(t('banking.reconciliation.savePresetAs', { defaultValue: 'Save preset as' }) as string, activePreset || 'Default');
                    if (!name) return;
                    const next = { ...presets, [name]: currentFilters() };
                    savePresets(next);
                    setActivePreset(name);
                    toast({ title: t('common.saved', { defaultValue: 'Saved' }), description: name });
                  }}>{t('common.save', { defaultValue: 'Save' })}</Button>
                  <Button className="w-full sm:w-auto text-xs" variant="ghost" size="sm" onClick={() => {
                    if (!activePreset) return;
                    if (!window.confirm(t('common.deleteConfirm', { defaultValue: 'Delete this preset?' }) as string)) return;
                    const next = { ...presets };
                    delete next[activePreset];
                    savePresets(next);
                    setActivePreset('');
                  }}>{t('common.delete', { defaultValue: 'Delete' })}</Button>
                </div>
              </div>
              <div className="flex flex-col w-full">
                <Label className="text-xs text-muted-foreground">{t('common.type', { defaultValue: 'Type' })}</Label>
                <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
                  <SelectTrigger className="w-full h-8">
                    <SelectValue placeholder={t('common.type', { defaultValue: 'Type' }) as string} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">{t('common.all', { defaultValue: 'All' })}</SelectItem>
                    <SelectItem value="receipts">{t('banking.reconciliation.receipts', { defaultValue: 'Receipts' })}</SelectItem>
                    <SelectItem value="payments">{t('banking.reconciliation.payments', { defaultValue: 'Payments' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Customer filter (applies to receipts) */}
              <div className="flex flex-col w-full">
                <Label className="text-xs text-muted-foreground">{t('sales.customers.customer', { defaultValue: 'Customer' })}</Label>
                <Select value={customerId || '__all__'} onValueChange={(v: any) => setCustomerId(v === '__all__' ? '' : v)}>
                  <SelectTrigger className="w-full h-8">
                    <SelectValue placeholder={t('common.all', { defaultValue: 'All' }) as string} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">{t('common.all', { defaultValue: 'All' })}</SelectItem>
                    {(Array.isArray(contacts) ? contacts : []).map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name || c.company || c.email || c.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Vendor filter (applies to payments) */}
              <div className="flex flex-col w-full">
                <Label className="text-xs text-muted-foreground">{t('purchases.vendors.vendor', { defaultValue: 'Vendor' })}</Label>
                <Select value={vendorId || '__all__'} onValueChange={(v: any) => setVendorId(v === '__all__' ? '' : v)}>
                  <SelectTrigger className="w-full h-8">
                    <SelectValue placeholder={t('common.all', { defaultValue: 'All' }) as string} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">{t('common.all', { defaultValue: 'All' })}</SelectItem>
                    {(Array.isArray(contacts) ? contacts : []).map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name || c.company || c.email || c.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col w-full">
                <Label className="text-xs text-muted-foreground">{t('common.max', { defaultValue: 'Max' })}</Label>
                <Input type="number" min={1} max={1000} value={maxRows}
                  onChange={(e) => setMaxRows(Math.max(1, Math.min(1000, parseInt(e.target.value || '0', 10))))}
                  className="h-8 w-full" />
              </div>
              <div className="flex flex-col w-full">
                <Label className="text-xs text-muted-foreground">{t('banking.reconciliation.maxCandidates', { defaultValue: 'Max candidates' })}</Label>
                <Input type="number" min={1} max={10} value={maxCandidates}
                  onChange={(e) => setMaxCandidates(Math.max(1, Math.min(10, parseInt(e.target.value || '0', 10))))}
                  className="h-8 w-full" />
              </div>
              <div className="flex flex-col w-full">
                <Label className="text-xs text-muted-foreground">{t('banking.reconciliation.minScore', { defaultValue: 'Min score' })}</Label>
                <Input type="number" min={0} max={1000} value={minScore}
                  onChange={(e) => setMinScore(Math.max(0, Math.min(1000, parseInt(e.target.value || '0', 10))))}
                  className="h-8 w-full" />
              </div>
              <div className="flex flex-col w-full">
                <Label className="text-xs text-muted-foreground">{t('common.from', { defaultValue: 'From' })}</Label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 w-full" />
              </div>
              <div className="flex flex-col w-full">
                <Label className="text-xs text-muted-foreground">{t('common.to', { defaultValue: 'To' })}</Label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-8 w-full" />
              </div>
              <div className="flex flex-col w-full">
                <Label className="text-xs text-muted-foreground">{t('banking.reconciliation.amountTolerance', { defaultValue: 'Amount tol.' })}</Label>
                <Input type="number" step="0.01" min={0} max={10} value={amountTol}
                  onChange={(e) => setAmountTol(Math.max(0, Math.min(10, parseFloat(e.target.value || '0'))))}
                  className="h-8 w-full" />
              </div>
              <div className="flex flex-col w-full">
                <Label className="text-xs text-muted-foreground">{t('banking.reconciliation.maxDays', { defaultValue: 'Max days' })}</Label>
                <Input type="number" min={1} max={365} value={maxDays}
                  onChange={(e) => setMaxDays(Math.max(1, Math.min(365, parseInt(e.target.value || '0', 10))))}
                  className="h-8 w-full" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Checkbox id="preferExact" checked={preferExact} onCheckedChange={(v: any) => setPreferExact(Boolean(v))} />
                <Label htmlFor="preferExact" className="text-xs text-muted-foreground">{t('banking.reconciliation.preferExact', { defaultValue: 'Prefer exact amount' })}</Label>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Checkbox id="sameCurrencyOnly" checked={sameCurrencyOnly} onCheckedChange={(v: any) => setSameCurrencyOnly(Boolean(v))} />
                <Label htmlFor="sameCurrencyOnly" className="text-xs text-muted-foreground">{t('banking.reconciliation.sameCurrencyOnly', { defaultValue: 'Same currency only' })}</Label>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Checkbox id="highOnly" checked={highOnly} onCheckedChange={(v: any) => setHighOnly(Boolean(v))} />
                <Label htmlFor="highOnly" className="text-xs text-muted-foreground">{t('banking.reconciliation.highOnly', { defaultValue: 'High confidence only' })}</Label>
              </div>
              <div className="mt-2">
                <Button variant="secondary" size="sm" onClick={() => {
                  setTypeFilter('both');
                  setMaxRows(200);
                  setFrom('');
                  setTo('');
                  setCustomerId('');
                  setVendorId('');
                  setMaxCandidates(3);
                  setMinScore(0);
                  setAmountTol(0.01);
                  setMaxDays(30);
                  setPreferExact(true);
                  setSameCurrencyOnly(false);
                  setHighOnly(false);
                  try { localStorage.removeItem(LS_KEY); } catch {}
                }}>
                  {t('common.reset', { defaultValue: 'Reset' })}
                </Button>
              </div>
            </div>
          </div>
  </CardHeader>
  <CardContent className="space-y-3 px-2 sm:px-4">
          {/* Suggestions summary */}
          <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs">{t('banking.reconciliation.receipts', { defaultValue: 'Receipts' })}: {counts.receipts}</Badge>
            <Badge variant="secondary" className="text-xs">{t('banking.reconciliation.payments', { defaultValue: 'Payments' })}: {counts.payments}</Badge>
            <Badge variant="outline" className="text-xs">{t('banking.reconciliation.highConfidence', { defaultValue: 'High confidence' })}: {counts.receiptsHigh + counts.paymentsHigh}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">{t('banking.reconciliation.customerReceipts', 'Customer Receipts')}</h3>
              <div className="space-y-2">
                {(filteredSuggestions?.receipts || []).map((s: any) => {
                  const top = s.suggestions?.[0];
                  return (
                    <div key={s.paymentId} className={`flex items-center justify-between border rounded-md p-2 ${top?.high_confidence ? 'border-emerald-300 bg-emerald-50' : ''}`}>
                      <div>
                        <div className="text-sm font-medium flex items-center gap-2">{t('banking.reconciliation.receipt', 'Receipt')} {s.receipt_number ? `#${s.receipt_number}` : ''} · {new Date(s.date).toLocaleDateString()}
                          {top?.high_confidence ? (
                            <Badge variant="default" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">{t('banking.reconciliation.highConfidence', { defaultValue: 'High confidence' })}</Badge>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted-foreground">{s.customer_name ? `${t('sales.customers.customer', { defaultValue: 'Customer' })}: ${s.customer_name} · ` : ''}{t('common.amount')}: {s.amount.toFixed(2)} · {top ? `${t('sales.invoices.invoice')} ${top.invoice_number || ''}` : t('banking.reconciliation.noCandidate', 'No candidate')}
                          {top?.currency_mismatch ? <span className="ms-2 text-amber-600">{t('banking.reconciliation.currencyMismatch', { defaultValue: 'Currency mismatch' })}</span> : null}
                          {typeof top?.total_score === 'number' ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="ms-2 underline decoration-dotted cursor-help">
                                  {t('banking.reconciliation.score', { defaultValue: 'score' })}: a:{top?.amount_score ?? 0} + d:{top?.date_score ?? 0} = {top?.total_score}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="max-w-xs text-xs">
                                  <div className="font-medium mb-1">{t('banking.reconciliation.scoreExplain', { defaultValue: 'Score breakdown' })}</div>
                                  <div>• a: {t('banking.reconciliation.amountScore', { defaultValue: 'amount score: exact match gets +100' })}</div>
                                  <div>• d: {t('banking.reconciliation.dateScore', { defaultValue: 'date score: closer dates score higher' })}</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : null}
                        </div>
                      </div>
                      {top && (
                        <Button size="sm" onClick={() => handleQuickMatch(s, top)} disabled={allocateMutation.isPending}>{t('banking.reconciliation.match', 'Match')}</Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('banking.reconciliation.vendorPayments', 'Vendor Payments')}</h3>
              <div className="space-y-2">
                {(filteredSuggestions?.payments || []).map((s: any) => {
                  const top = s.suggestions?.[0];
                  return (
                    <div key={s.paymentId} className={`flex items-center justify-between border rounded-md p-2 ${top?.high_confidence ? 'border-emerald-300 bg-emerald-50' : ''}`}>
                      <div>
                        <div className="text-sm font-medium flex items-center gap-2">{t('banking.reconciliation.payment', 'Payment')} {s.payment_number ? `#${s.payment_number}` : ''} · {new Date(s.date).toLocaleDateString()}
                          {top?.high_confidence ? (
                            <Badge variant="default" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">{t('banking.reconciliation.highConfidence', { defaultValue: 'High confidence' })}</Badge>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted-foreground">{s.vendor_name ? `${t('purchases.vendors.vendor', { defaultValue: 'Vendor' })}: ${s.vendor_name} · ` : ''}{t('common.amount')}: {s.amount.toFixed(2)} · {top ? `${t('purchases.bills.bill')} ${top.bill_number || ''}` : t('banking.reconciliation.noCandidate', 'No candidate')}
                          {top?.currency_mismatch ? <span className="ms-2 text-amber-600">{t('banking.reconciliation.currencyMismatch', { defaultValue: 'Currency mismatch' })}</span> : null}
                          {typeof top?.total_score === 'number' ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="ms-2 underline decoration-dotted cursor-help">
                                  {t('banking.reconciliation.score', { defaultValue: 'score' })}: a:{top?.amount_score ?? 0} + d:{top?.date_score ?? 0} = {top?.total_score}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="max-w-xs text-xs">
                                  <div className="font-medium mb-1">{t('banking.reconciliation.scoreExplain', { defaultValue: 'Score breakdown' })}</div>
                                  <div>• a: {t('banking.reconciliation.amountScore', { defaultValue: 'amount score: exact match gets +100' })}</div>
                                  <div>• d: {t('banking.reconciliation.dateScore', { defaultValue: 'date score: closer dates score higher' })}</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : null}
                        </div>
                      </div>
                      {top && (
                        <Button size="sm" onClick={() => handleQuickMatch(s, top)} disabled={allocateMutation.isPending}>{t('banking.reconciliation.match', 'Match')}</Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-match Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={(open) => { setPreviewOpen(open); if (!open) setSelectedActionKeys(new Set()); }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('banking.reconciliation.autoPreview', { defaultValue: 'Auto-match preview' })}</DialogTitle>
            <DialogDescription>
              {t('banking.reconciliation.autoPreviewDesc', { defaultValue: 'These exact-amount unique matches will be allocated.' })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between mb-2 text-sm">
            <div className="flex items-center gap-2">
              <Checkbox
                id="selectAll"
                checked={(previewData?.actions || []).filter((a: any) => a.status === 'would-allocate').every((a: any) => selectedActionKeys.has(actionKeyOf(a))) && (previewData?.actions || []).some((a: any) => a.status === 'would-allocate')}
                onCheckedChange={(v: any) => {
                  const allWould = (previewData?.actions || []).filter((a: any) => a.status === 'would-allocate');
                  if (Boolean(v)) {
                    setSelectedActionKeys(new Set(allWould.map((a: any) => actionKeyOf(a))));
                  } else {
                    setSelectedActionKeys(new Set());
                  }
                }}
              />
              <Label htmlFor="selectAll">{t('common.selectAll', { defaultValue: 'Select all' })}</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const would = (previewData?.actions || []).filter((a: any) => a.status === 'would-allocate' && a.paymentType === 'receipt');
                  setSelectedActionKeys(new Set<string>(would.map((a: any) => actionKeyOf(a))));
                }}
              >{t('banking.reconciliation.selectReceipts', { defaultValue: 'Receipts only' })}</Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const would = (previewData?.actions || []).filter((a: any) => a.status === 'would-allocate' && a.paymentType === 'payment');
                  setSelectedActionKeys(new Set<string>(would.map((a: any) => actionKeyOf(a))));
                }}
              >{t('banking.reconciliation.selectPayments', { defaultValue: 'Payments only' })}</Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const would = (previewData?.actions || []).filter((a: any) => a.status === 'would-allocate' && a.high_confidence);
                  setSelectedActionKeys(new Set<string>(would.map((a: any) => actionKeyOf(a))));
                }}
              >{t('banking.reconciliation.selectHighConfidence', { defaultValue: 'High confidence only' })}</Button>
            </div>
            <div className="text-muted-foreground">
              {t('common.selected', { defaultValue: 'Selected' })}: {Array.from(selectedActionKeys).length} / {(previewData?.actions || []).filter((a: any) => a.status === 'would-allocate').length}
            </div>
          </div>
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedActionKeys(prev => {
                    const next = new Set<string>(prev);
                    (previewData?.actions || []).forEach((a: any) => {
                      if (a.status === 'would-allocate' && a.currency_mismatch) next.delete(actionKeyOf(a));
                    });
                    return next;
                  });
                }}
              >{t('banking.reconciliation.deselectCurrencyMismatch', { defaultValue: 'Deselect currency mismatch' })}</Button>
              <div className="flex items-center gap-2">
                <Label>{t('banking.reconciliation.maxDateDiff', { defaultValue: 'Max Δ days' })}</Label>
                <Input
                  className="h-7 w-16"
                  type="number" min={1} max={365}
                  value={diffThreshold}
                  onChange={(e) => setDiffThreshold(Math.max(1, Math.min(365, parseInt(e.target.value || '1', 10))))}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedActionKeys(prev => {
                      const next = new Set<string>(prev);
                      (previewData?.actions || []).forEach((a: any) => {
                        if (a.status === 'would-allocate' && typeof a.date_diff_days === 'number' && a.date_diff_days > diffThreshold) next.delete(actionKeyOf(a));
                      });
                      return next;
                    });
                  }}
                >{t('banking.reconciliation.deselectAbove', { defaultValue: 'Deselect above' })}</Button>
              </div>
            </div>
          </div>
          <div className="max-h-[50vh] overflow-auto">
            <div className="overflow-x-auto">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>{t('common.type')}</TableHead>
                    <TableHead>{t('common.document')}</TableHead>
                    <TableHead>{t('common.counterparty', { defaultValue: 'Counterparty' })}</TableHead>
                    <TableHead>{t('common.date')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('common.notes', { defaultValue: 'Notes' })}</TableHead>
                    <TableHead className="text-end">{t('common.amount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(previewData?.actions || []).map((a: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Checkbox
                          disabled={a.status !== 'would-allocate'}
                          checked={selectedActionKeys.has(actionKeyOf(a))}
                          onCheckedChange={(v: any) => {
                            const k = actionKeyOf(a);
                            setSelectedActionKeys(prev => {
                              const next = new Set(prev);
                              if (Boolean(v)) next.add(k); else next.delete(k);
                              return next;
                            });
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {a.paymentType === 'receipt' ? t('banking.reconciliation.receipt', 'Receipt') : t('banking.reconciliation.payment', 'Payment')} → {a.documentType === 'invoice' ? t('sales.invoices.invoice', 'Invoice') : t('purchases.bills.bill', 'Bill')}
                        </Badge>
                      </TableCell>
                      <TableCell>{a.document_ref || a.documentId}</TableCell>
                      <TableCell>{a.counterparty_name || '-'}</TableCell>
                      <TableCell>{a.date ? new Date(a.date).toLocaleDateString(i18n.language) : '-'}</TableCell>
                      <TableCell>
                        {a.status === 'would-allocate' ? (
                          <Badge variant="default" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">{t('common.ready', { defaultValue: 'Ready' })}</Badge>
                        ) : a.status === 'skipped' ? (
                          <Badge variant="secondary" className="text-xs">{t('common.skipped', { defaultValue: 'Skipped' })}</Badge>
                        ) : (
                          <Badge variant="default" className="text-xs">{t('common.done', { defaultValue: 'Done' })}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 flex-wrap">
                          {a.currency_mismatch ? (
                            <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-800 border-amber-200">{t('banking.reconciliation.currencyMismatch', { defaultValue: 'Currency mismatch' })}</Badge>
                          ) : null}
                          {typeof a.date_diff_days === 'number' ? (
                            <Badge variant="outline" className={`text-[10px] ${Number(a.date_diff_days) <= 7 ? 'border-emerald-300 text-emerald-700' : 'border-amber-300 text-amber-700'}`}>Δ {a.date_diff_days}d</Badge>
                          ) : null}
                          {a.high_confidence ? (
                            <Badge variant="default" className="text-[10px] bg-emerald-100 text-emerald-800 border-emerald-200">{t('banking.reconciliation.highConfidence', { defaultValue: 'High confidence' })}</Badge>
                          ) : null}
                          <span className="text-[10px] text-muted-foreground">
                            {t('banking.reconciliation.why', { defaultValue: 'Why:' })}
                            {' '}
                            {a.amount_equal
                              ? t('banking.reconciliation.exactAmount', { defaultValue: 'Exact amount' })
                              : t('banking.reconciliation.closeAmount', { defaultValue: 'Amount within tolerance' })}
                            ; {a.currency_mismatch ? t('banking.reconciliation.mismatch', { defaultValue: 'currency mismatch' }) : t('banking.reconciliation.sameCurrency', { defaultValue: 'same currency' })}
                            ; {a.high_confidence
                              ? t('banking.reconciliation.withinDays', { defaultValue: 'within {n} days', n: 7 })
                              : (typeof a.date_diff_days === 'number' ? t('banking.reconciliation.dateDiffN', { defaultValue: 'Δ {n} days', n: Math.abs(a.date_diff_days) }) : '')}
                            {a.unique ? `; ${t('banking.reconciliation.uniqueCandidate', { defaultValue: 'unique candidate' })}` : ''}
                            {typeof a.total_score === 'number' ? ` — ${t('banking.reconciliation.score', { defaultValue: 'score' })}: a:${a.amount_score ?? 0} + d:${a.date_score ?? 0} = ${a.total_score}` : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-end">{formatCurrency(Number(a.amount || 0))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={confirmAutoReconcile} disabled={Array.from(selectedActionKeys).length === 0}>
              {t('common.confirm', { defaultValue: 'Confirm' })} ({Array.from(selectedActionKeys).length})
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                const rows = (previewData?.actions || []).map((a: any) => ({
                  paymentType: a.paymentType,
                  payment_ref: a.payment_ref || '',
                  documentType: a.documentType,
                  document_ref: a.document_ref || '',
                  counterparty_name: a.counterparty_name || '',
                  date: a.date || '',
                  document_date: a.document_date || '',
                  amount: a.amount,
                  currency_mismatch: a.currency_mismatch ? 'yes' : 'no',
                  date_diff_days: a.date_diff_days ?? '',
                  high_confidence: a.high_confidence ? 'yes' : 'no',
                  status: a.status,
                  reason: a.reason || '',
                }));
                const headers = Object.keys(rows[0] || { data: '' });
                const csv = [headers.join(','), ...rows.map((r: Record<string, any>) => headers.map(h => {
                  const v = (r as any)[h];
                  const s = String(v ?? '');
                  return '"' + s.replace(/"/g, '""') + '"';
                }).join(','))].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `auto-match-preview-${new Date().toISOString().slice(0,19)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >{t('common.export', { defaultValue: 'Export' })}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recent Matches (quick undo) */}
      <Card className="overflow-hidden">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-lg">{t('banking.reconciliation.recentMatches', 'Recent Matches')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="px-4 pb-4">
              <Table className="min-w-[450px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">{t('common.date', { defaultValue: 'Date' })}</TableHead>
                    <TableHead className="whitespace-nowrap">{t('common.type', { defaultValue: 'Type' })}</TableHead>
                    <TableHead className="whitespace-nowrap">{t('common.document', { defaultValue: 'Document' })}</TableHead>
                    <TableHead className="text-end whitespace-nowrap">{t('common.amount', { defaultValue: 'Amount' })}</TableHead>
                    <TableHead className="text-end whitespace-nowrap">{t('common.actions', { defaultValue: 'Actions' })}</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {(recentAllocations || []).map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">{new Date(row.allocation_date).toLocaleDateString(i18n.language)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="secondary" className="text-xs">
                        {row.payment_type === 'receipt' ? t('banking.reconciliation.receipt', 'Receipt') : t('banking.reconciliation.payment', 'Payment')} → {row.document_type === 'invoice' ? t('sales.invoices.invoice', 'Invoice') : t('purchases.bills.bill', 'Bill')}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {row.document_type === 'invoice' ? (row.document_details?.invoice_number || row.document_id) : (row.document_details?.bill_number || row.document_id)}
                    </TableCell>
                    <TableCell className="text-end whitespace-nowrap">{formatCurrency(Number(row.allocated_amount))}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button size="sm" variant="outline" onClick={() => unallocateMutation.mutate(row.id)} disabled={unallocateMutation.isPending}>
                        {t('banking.reconciliation.unmatch', 'Unmatch')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Book Transactions */}
        <Card className="overflow-hidden">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-lg">{t('banking.reconciliation.transactionsFromYourAccounting')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="px-4 pb-4">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead className="whitespace-nowrap">{t('common.date', { defaultValue: 'Date' })}</TableHead>
                      <TableHead className="whitespace-nowrap">{t('common.description', { defaultValue: 'Description' })}</TableHead>
                      <TableHead className="whitespace-nowrap">{t('common.amount', { defaultValue: 'Amount' })}</TableHead>
                      <TableHead className="whitespace-nowrap">{t('common.status', { defaultValue: 'Status' })}</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {allBookTransactions
                    .filter(t => (showMatched && t.matched) || (showUnmatched && !t.matched))
                    .map((transaction) => (
                    <TableRow key={transaction.id} data-testid={`row-book-${transaction.id}`}>
                      <TableCell>
                        <Checkbox 
                          checked={transaction.matched}
                          onCheckedChange={() => {}}
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(transaction.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-xs text-muted-foreground">{transaction.reference}</div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {transaction.type === 'deposit' ? (
                            <ArrowUpRight className="h-3 w-3 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 text-red-600" />
                          )}
                          <span className={transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {transaction.matched ? (
                          <Badge variant="default" className="gap-1 bg-green-100 text-green-800 border-green-200">
                            <CheckSquare className="h-3 w-3" />
                            {t('banking.reconciliation.matched')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Square className="h-3 w-3" />
                            {t('banking.reconciliation.unmatched')}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Statement Transactions */}
        <Card className="overflow-hidden">
          <CardHeader className="px-4 pt-4 pb-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <CardTitle className="text-lg">{t('banking.reconciliation.bankStatement')}</CardTitle>
              <div className="flex items-center gap-2">
                <Link href="/reports/ai-analytics?source=bank-statement">
                  <Button size={isMobile ? 'sm' : 'default'} variant="ghost" className="hidden md:inline-flex">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {t('reports.aiAnalytics.title', { defaultValue: 'AI Analytics' })}
                  </Button>
                </Link>
                <Button size={isMobile ? 'sm' : 'default'} variant="outline" onClick={handleSuggestAll} disabled={classifyBatch.isPending || unmatchedBankTransactions.length === 0}>
                  {classifyBatch.isPending ? t('ai.generating', { defaultValue: 'Generating…' }) : t('ai.suggestForAll', { defaultValue: 'Suggest for all' })}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="px-4 pb-4">
                <Table className="min-w-[450px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead className="whitespace-nowrap">{t('common.date', { defaultValue: 'Date' })}</TableHead>
                      <TableHead className="whitespace-nowrap">{t('common.description', { defaultValue: 'Description' })}</TableHead>
                      <TableHead className="whitespace-nowrap">{t('common.amount', { defaultValue: 'Amount' })}</TableHead>
                      <TableHead className="whitespace-nowrap">{t('common.status', { defaultValue: 'Status' })}</TableHead>
                      <TableHead className="text-right whitespace-nowrap">{t('common.actions', { defaultValue: 'Actions' })}</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {unmatchedBankTransactions.map((transaction) => (
                    <TableRow key={transaction.id} data-testid={`row-bank-${transaction.id}`}>
                      <TableCell>
                        <Checkbox 
                          checked={transaction.matched}
                          onCheckedChange={() => {}}
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(transaction.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="font-medium">{transaction.description}</div>
                        {aiSuggestions[transaction.id] && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {t('ai.suggested', { defaultValue: 'Suggested' })}: <span className="font-medium">{aiSuggestions[transaction.id].category}</span> · {Math.round(aiSuggestions[transaction.id].confidence * 100)}%
                            <span className="ml-2 inline-flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => feedbackMutation.mutate({
                                  transactionId: transaction.id,
                                  source: 'bank-statement',
                                  accepted: true,
                                  category: aiSuggestions[transaction.id].category,
                                  confidence: aiSuggestions[transaction.id].confidence,
                                  suggestedAccounts: aiSuggestions[transaction.id].suggestedAccounts,
                                  description: transaction.description,
                                  amount: Math.abs(Number(transaction.amount)),
                                })}
                                aria-label="Accept suggestion"
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => feedbackMutation.mutate({
                                  transactionId: transaction.id,
                                  source: 'bank-statement',
                                  accepted: false,
                                  category: aiSuggestions[transaction.id].category,
                                  confidence: aiSuggestions[transaction.id].confidence,
                                  suggestedAccounts: aiSuggestions[transaction.id].suggestedAccounts,
                                  description: transaction.description,
                                  amount: Math.abs(Number(transaction.amount)),
                                })}
                                aria-label="Reject suggestion"
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {transaction.amount > 0 ? (
                            <ArrowUpRight className="h-3 w-3 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 text-red-600" />
                          )}
                          <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(Math.abs(transaction.amount))}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {transaction.matched ? (
                          <Badge variant="default" className="gap-1 bg-green-100 text-green-800 border-green-200">
                            <CheckSquare className="h-3 w-3" />
                            {t('banking.reconciliation.matched')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Square className="h-3 w-3" />
                            {t('banking.reconciliation.unmatched')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button size="sm" variant="outline" onClick={() => handleSuggestForRow(transaction)} disabled={classifyOne.isPending}>
                          {classifyOne.isPending ? t('ai.generating', { defaultValue: 'Generating…' }) : t('ai.suggest', { defaultValue: 'Suggest' })}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}