import { useEffect, useMemo, useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Loader2, Trash2 } from 'lucide-react';
import type { Bill } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BillFormDialog } from '@/components/BillFormDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Receipt, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Copy,
  Send,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  Building2,
  CreditCard
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { normalizeDate, computeCompleteness } from '@shared/aiSchemas';
import ExtractionPreview from '@/components/ai/ExtractionPreview';
import AIIngestDialog from '@/components/ai/AIIngestDialog';
import { useTranslation } from 'react-i18next';

// Bill form type definition
type BillForm = {
  supplier_id: string;
  supplier_reference: string;
  bill_date: string;
  due_date: string;
  amount: string;
  description: string;
  notes?: string;
  project_id?: string;
};

// Bills status configuration
const statusMapping = {
  draft: 'draft',
  approved: 'pending',
  paid: 'paid',
  overdue: 'overdue',
  pending: 'pending',
  partially_paid: 'partially_paid',
  // Normalize legacy values
  partial: 'partially_paid',
  unpaid: 'pending',
} as const;

export default function BillsPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  
  // Rebuild schema with localized messages
  const billSchema = useMemo(() => z.object({
    supplier_id: z.string().min(1, t('validation.selectVendor')),
    supplier_reference: z.string().min(1, t('validation.supplierReferenceRequired')),
    bill_date: z.string().min(1, t('validation.billDateRequired')),
    due_date: z.string().min(1, t('validation.dueDateRequired')),
    amount: z.string().min(1, t('validation.amountRequired')),
    description: z.string().min(2, t('validation.descriptionMin2')),
    notes: z.string().optional(),
    project_id: z.string().optional(),
  }), [t]);

  
  const statusConfig = {
    draft: { label: t('common.draft'), icon: Edit, color: 'secondary' },
    pending: { label: t('common.pending'), icon: Clock, color: 'default' },
    partially_paid: { label: t('common.partiallyPaid'), icon: DollarSign, color: 'warning' },
    paid: { label: t('common.paid'), icon: CheckCircle, color: 'success' },
    overdue: { label: t('common.overdue'), icon: AlertCircle, color: 'destructive' },
    cancelled: { label: t('common.cancelled'), icon: Clock, color: 'secondary' },
  };
  
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showBillFormDialog, setShowBillFormDialog] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [extracted, setExtracted] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [applyFields, setApplyFields] = useState({
    supplier_reference: true,
    bill_date: true,
    due_date: true,
    amount: true,
    notes_vendor: true,
    notes_text: true,
  });
  const [allocOpen, setAllocOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const selectedBillId = selectedBill?.id;
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(1.0);

  // Fetch contacts (suppliers)
  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ['/api/contacts'],
  });

  const suppliers = contacts.filter(contact => 
    contact.type === 'supplier' || contact.type === 'both'
  );

  // Provider/model state now managed by AIIngestDialog

  // Create bill mutation
  const createMutation = useMutation({
    mutationFn: async (data: BillForm) => {
      const processedData = {
        ...data,
        subtotal: data.amount, // Send as string
        total: data.amount,    // Send as string
        tax_total: '0',
        paid_amount: '0',
        status: 'draft',
        currency,
        fx_rate: exchangeRate.toString(),
        date: data.bill_date, // Map bill_date to date
      };
      return await apiRequest('POST', '/api/purchases/bills', processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases/bills'] });
      setShowDialog(false);
      toast({
        title: t('purchases.bills.billCreated'),
        description: t('purchases.bills.billCreatedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('purchases.bills.billCreateError'),
        variant: 'destructive',
      });
    },
  });

  // Form
  const form = useForm<BillForm>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      supplier_id: '',
      supplier_reference: '',
      bill_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      amount: '',
      description: '',
      notes: '',
    },
  });

  const onSubmit = (data: BillForm) => {
    createMutation.mutate(data);
  };

  // AI: parse dates like yyyy-mm-dd, dd/mm/yyyy, mm/dd/yyyy → yyyy-mm-dd
  const toISODate = (raw?: string) => normalizeDate(raw) || '';

  const handleScanExtract = async (payload: any) => {
    try {
      setScanLoading(true);
      payload.locale = i18n?.language || 'en';
      const res = await apiRequest('POST', '/api/ai/extract/document', { ...payload, type: 'invoice' });
  const result = await res.json();
      setExtracted(result || {});
      // Initialize apply toggles based on extracted presence
      try {
        const prefsRaw = localStorage.getItem('ai.applyDefaults.bills');
        const prefs = prefsRaw ? JSON.parse(prefsRaw) : {};
        const prefOrTrue = (k: string) => (prefs[k] !== false);
        setApplyFields({
          supplier_reference: prefOrTrue('supplier_reference') && !!(result?.invoice_number),
          bill_date: prefOrTrue('bill_date') && !!(result?.date),
          due_date: prefOrTrue('due_date') && !!(result?.due_date),
          amount: prefOrTrue('amount') && !!(result?.total),
          notes_vendor: prefOrTrue('notes_vendor') && !!(result?.vendor_name),
          notes_text: prefOrTrue('notes_text') && !!(result?.notes),
        });
      } catch {
        setApplyFields({
          supplier_reference: !!(result?.invoice_number),
          bill_date: !!(result?.date),
          due_date: !!(result?.due_date),
          amount: !!(result?.total),
          notes_vendor: !!(result?.vendor_name),
          notes_text: !!(result?.notes),
        });
      }
      setPreviewOpen(true);
    } catch (err: any) {
      toast({ title: t('common.error'), description: err?.message || t('ai.scanFailed', { defaultValue: 'Failed to extract fields.' }), variant: 'destructive' });
    } finally {
      setScanLoading(false);
    }
  };

  // Persist apply toggle defaults
  const handleApplyToggle = (key: keyof typeof applyFields, value: any) => {
    const boolVal = !!value;
    setApplyFields(s => ({ ...s, [key]: boolVal }));
    try {
      const prefsRaw = localStorage.getItem('ai.applyDefaults.bills');
      const prefs = prefsRaw ? JSON.parse(prefsRaw) : {};
      localStorage.setItem('ai.applyDefaults.bills', JSON.stringify({ ...prefs, [key]: boolVal }));
    } catch {}
  };

  const applyExtracted = () => {
    if (!extracted) return;
    // Map to form fields
    if (applyFields.supplier_reference && extracted?.invoice_number) form.setValue('supplier_reference', extracted.invoice_number);
    const billDate = toISODate(extracted?.date);
    if (applyFields.bill_date && billDate) form.setValue('bill_date', billDate);
    const due = toISODate(extracted?.due_date);
    if (applyFields.due_date && due) form.setValue('due_date', due);
    const total = (extracted?.total ?? '').toString();
    if (applyFields.amount && total) form.setValue('amount', total);
    if (applyFields.notes_vendor && extracted?.vendor_name) {
      const prev = form.getValues('notes') || '';
      form.setValue('notes', `${prev ? prev + '\n' : ''}${t('ai.vendorDetected', { defaultValue: 'Vendor' })}: ${extracted.vendor_name}`.trim());
    }
    if (applyFields.notes_text && extracted?.notes) {
      const prev = form.getValues('notes') || '';
      form.setValue('notes', `${prev ? prev + '\n' : ''}${extracted.notes}`.trim());
    }
    setPreviewOpen(false);
    setScanOpen(false);
    setExtracted(null);
    toast({ title: t('common.success'), description: t('ai.fieldsApplied', { defaultValue: 'Extracted fields applied.' }) });
  };

  // Helpers to control apply toggles in bulk and defaults
  const setAllApply = (value: boolean) => {
    if (!extracted) return;
    const next = {
      supplier_reference: value && !!extracted.invoice_number,
      bill_date: value && !!extracted.date,
      due_date: value && !!extracted.due_date,
      amount: value && !!extracted.total,
      notes_vendor: value && !!extracted.vendor_name,
      notes_text: value && !!extracted.notes,
    };
    setApplyFields(next);
    // Persist as defaults too
    try {
      localStorage.setItem('ai.applyDefaults.bills', JSON.stringify(next));
    } catch {}
  };

  const resetApplyDefaults = () => {
    try { localStorage.removeItem('ai.applyDefaults.bills'); } catch {}
    // Recompute from presence, defaulting to true when present
    if (!extracted) return;
    setApplyFields({
      supplier_reference: !!extracted.invoice_number,
      bill_date: !!extracted.date,
      due_date: !!extracted.due_date,
      amount: !!extracted.total,
      notes_vendor: !!extracted.vendor_name,
      notes_text: !!extracted.notes,
    });
  };

  // Simple similarity helper for vendor suggestion
  const similarity = (a: string, b: string) => {
    const s1 = a.toLowerCase();
    const s2 = b.toLowerCase();
    if (!s1 || !s2) return 0;
    let matches = 0;
    const set = new Set(s1.split(/\s+/).filter(Boolean));
    for (const w of s2.split(/\s+/).filter(Boolean)) if (set.has(w)) matches++;
    return matches / Math.max(1, Math.min(s1.split(/\s+/).length, s2.split(/\s+/).length));
  };

  const bestSupplierMatch = useMemo(() => {
    const name = extracted?.vendor_name?.toString?.() || '';
    if (!name || suppliers.length === 0) return null;
    let best: any = null;
    let bestScore = 0;
    for (const s of suppliers) {
      const score = similarity(name, s.name || '');
      if (score > bestScore) { bestScore = score; best = s; }
    }
    return bestScore >= 0.6 ? { supplier: best, score: bestScore } : null;
  }, [extracted?.vendor_name, suppliers]);

  // Fetch bills data
  const { data: bills = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/purchases/bills'],
    select: (data: any[]) => {
      return data.map((bill: any) => ({
        ...bill,
        // Normalize status for UI consistency
        status: statusMapping[bill.status as keyof typeof statusMapping] || bill.status,
        // Ensure numeric fields
        total: Number(bill.total || 0),
        paid_amount: Number(bill.paid_amount || 0),
        subtotal: Number(bill.subtotal || 0),
        tax_total: Number(bill.tax_total || 0)
      }));
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/purchases/bills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases/bills'] });
      toast({
        title: t('purchases.bills.billDeleted'),
        description: t('purchases.bills.billDeletedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('purchases.bills.billDeleteError'),
        variant: 'destructive',
      });
    },
  });

  // Fetch allocations for selected bill
  const { data: billAllocations = [], isLoading: billAllocLoading } = useQuery({
    queryKey: ['/api/purchases/bills', selectedBillId || '', 'allocations'],
    enabled: !!selectedBillId && allocOpen,
    select: (rows: any[]) => rows || [],
  });

  const unmatchAllocation = useMutation({
    mutationFn: async (allocationId: string) => {
      return apiRequest('DELETE', `/api/banking/reconciliation/allocations/${allocationId}`);
    },
    onSuccess: () => {
      if (selectedBillId) {
        queryClient.invalidateQueries({ queryKey: ['/api/purchases/bills', selectedBillId, 'allocations'] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/banking/reconciliation/allocations/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/purchases/bills'] });
      toast({ title: t('common.success'), description: t('banking.unmatchedSuccessfully', { defaultValue: 'Allocation removed' }) });
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error.message || t('banking.unmatchFailed', { defaultValue: 'Failed to remove allocation' }), variant: 'destructive' });
    }
  });

  // Filter bills
  const filteredBills = bills.filter((bill: any) => {
    const matchesSearch = 
      bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.supplier_reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case 'draft':
        return bill.status === 'draft';
      case 'pending':
        return bill.status === 'pending';
      case 'paid':
        return bill.status === 'paid';
      case 'overdue':
        return bill.status === 'overdue';
      default:
        return true;
    }
  });

  // Calculate statistics
  const stats = {
    total: bills.length,
    totalAmount: bills.reduce((sum: number, b: any) => sum + (Number(b.total) || 0), 0),
    paidAmount: bills.reduce((sum: number, b: any) => sum + (Number(b.paid_amount) || 0), 0),
    outstanding: bills.reduce((sum: number, b: any) => sum + ((Number(b.total) || 0) - (Number(b.paid_amount) || 0)), 0),
    overdue: bills.filter((b: any) => b.status === 'overdue').reduce((sum: number, b: any) => sum + (Number(b.total) || 0), 0),
  };

  const handlePayBill = (id: string) => {
    toast({
      title: t('banking.paymentInitiated'),
      description: t('banking.paymentInitiatedDesc'),
    });
  };

  const handleDuplicate = (id: string) => {
    toast({
      title: t('purchases.bills.billDuplicated'),
      description: t('purchases.bills.billDuplicatedDesc'),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm(t('purchases.bills.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };



  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    const Icon = config.icon;
    return (
      <Badge variant={config.color as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Currency queries
  const { data: currencies = [] } = useQuery<any[]>({
    queryKey: ["/api/currencies"],
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  const { data: exchangeRates = [] } = useQuery<any[]>({
    queryKey: ["/api/currencies/rates"],
  });

  useEffect(() => {
    if (currency === "USD") {
      setExchangeRate(1.0);
    } else {
      const rate = exchangeRates.find((r: any) => r.currency === currency);
      if (rate) {
        setExchangeRate(parseFloat(rate.rate));
      }
    }
  }, [currency, exchangeRates]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" data-testid="loading-bills" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('common.error')}</h3>
        <p className="text-muted-foreground mb-4">{t('common.errorLoadingData')}</p>
        <Button 
          onClick={() => queryClient.refetchQueries({ queryKey: ['/api/purchases/bills'] })}
          data-testid="button-refresh-bills"
        >
          {t('common.refresh')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('navigation.bills')}</h1>
          <p className="text-muted-foreground mt-1">{t('purchases.bills.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            size={isMobile ? 'sm' : 'default'}
            data-testid="button-new-bill-with-items"
            className="w-full sm:w-auto"
            onClick={() => setShowBillFormDialog(true)}
          >
            <Plus className="h-4 w-4 me-2" />
            {t('purchases.bills.addBill')}
          </Button>
        </div>
      </div>

      {/* Bill Form Dialog with Line Items */}
      <BillFormDialog 
        open={showBillFormDialog} 
        onOpenChange={setShowBillFormDialog}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/purchases/bills'] })}
      />

      {/* Quick Bill Dialog (legacy simple form) */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <DialogTitle>{t('purchases.bills.quickBill')}</DialogTitle>
                    <div className="flex items-center gap-3">
                  <Button type="button" variant="secondary" size={isMobile ? 'sm' : 'default'} onClick={() => setScanOpen(true)}>
                    {t('ai.scanWithAI')}
                  </Button>
                </div>
              </div>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="supplier_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('purchases.bills.supplier')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('placeholders.selectSupplier')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="project_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.project')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('placeholders.selectProject')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="supplier_reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('purchases.bills.supplierReference')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('purchases.bills.supplierInvoiceNumber')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common.amount')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bill_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('purchases.bills.billDate')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.invoices.dueDate')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.description')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('purchases.bills.descriptionPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{`${t('common.notes')} (${t('common.optional')})`}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('placeholders.additionalNotes')} className="resize-none" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="w-full sm:w-auto">
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
                    {createMutation.isPending ? t('common.creating') : t('common.create')}
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">{t('common.currency')}</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('forms.selectCurrency')} />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((c: any) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.code} - {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exchange-rate">{t('common.exchangeRate')}</Label>
                    <Input
                      id="exchange-rate"
                      type="number"
                      step="0.000001"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                      disabled={currency === 'USD'}
                    />
                  </div>
                </div>
              </form>
            </Form>
            {/* AI Scan Dialog (Unified) */}
            <AIIngestDialog
              open={scanOpen}
              onOpenChange={setScanOpen}
              title={t('ai.pasteInvoiceText', { defaultValue: 'Paste invoice text' })}
              onExtract={handleScanExtract}
              allowPdf
              autoCloseOnExtract
              locale={i18n?.language || 'en'}
            />

            {/* Preview Extracted Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-2">
                    <DialogTitle>{t('ai.previewExtraction')}</DialogTitle>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setAllApply(true)}>{t('common.all')}</Button>
                      <Button size="sm" variant="ghost" onClick={() => setAllApply(false)}>{t('common.none')}</Button>
                      <Button size="sm" variant="ghost" onClick={resetApplyDefaults}>{t('common.reset')}</Button>
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-3">
                  {extracted ? (
                    <>
                      <ExtractionPreview
                        extraction={extracted}
                        kind="invoice"
                        requiredFields={["invoice_number","date","due_date","total"]}
                        fieldMap={{ invoice_number: 'supplier_reference', date: 'bill_date', due_date: 'due_date', total: 'amount' }}
                        currentValues={form.getValues() as any}
                        applyToggles={applyFields as any}
                        onToggle={(k, v) => handleApplyToggle(k as any, v)}
                        toggleLabels={{
                          supplier_reference: t('purchases.bills.supplierReference'),
                          bill_date: t('purchases.bills.billDate'),
                          due_date: t('sales.invoices.dueDate'),
                          amount: t('common.amount'),
                          notes_vendor: t('ai.vendor', { defaultValue: 'Vendor' }),
                          notes_text: t('common.notes'),
                        }}
                        bestMatch={bestSupplierMatch ? {
                          label: t('ai.vendorMatch',{defaultValue:'Suggested supplier'}),
                          name: bestSupplierMatch.supplier.name,
                          actionLabel: t('ai.useSupplier',{defaultValue:'Use supplier'}),
                          onUse: () => form.setValue('supplier_id', bestSupplierMatch.supplier.id)
                        } : null}
                      />
                      {extracted.meta && (
                        <div className="text-xs text-muted-foreground">
                          {t('ai.meta',{defaultValue:'Source'})}: {extracted.meta.mode || ''}
                          {extracted.meta.provider ? ` • ${extracted.meta.provider}` : ''}
                          {extracted.meta.model ? ` • ${extracted.meta.model}` : ''}
                          {extracted.meta.mime_type ? ` • ${extracted.meta.mime_type}` : ''}
                          {extracted.meta.page_range ? ` • pages: ${extracted.meta.page_range}` : ''}
                          {typeof extracted.meta.duration_ms === 'number' ? ` • time: ${extracted.meta.duration_ms}ms` : ''}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">{t('ai.noData', { defaultValue: 'No data to preview.' })}</p>
                  )}
                  <div className="flex items-center gap-3 justify-end">
                    <Button variant="outline" onClick={() => setPreviewOpen(false)}>{t('common.cancel')}</Button>
                    <Button type="button" variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(JSON.stringify(extracted, null, 2)); setCopied(true); setTimeout(()=>setCopied(false), 1500);} catch {} }}>
                      {copied ? t('common.copied',{defaultValue:'Copied!'}) : t('ai.copyJson',{defaultValue:'Copy JSON'})}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => { try { const blob = new Blob([JSON.stringify(extracted, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'extraction.json'; a.click(); URL.revokeObjectURL(url); } catch {} }}>
                      {t('ai.downloadJson',{defaultValue:'Download JSON'})}
                    </Button>
                    <Button onClick={applyExtracted}>{t('common.apply')}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </DialogContent>
        </Dialog>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('purchases.bills.totalBills')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground mt-1">{t('dashboard.thisMonth')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('purchases.bills.totalAmount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalAmount, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{`${t('common.all')} ${t('navigation.bills')}`}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('purchases.bills.outstanding')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.outstanding, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{t('purchases.bills.toBePaid')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('purchases.bills.overdueAmount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.overdue, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{t('purchases.bills.pastDueDate')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder={t('placeholders.searchBills')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
            data-testid="input-search-bills"
          />
        </div>
      </div>

      {/* Tabs and Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="flex flex-wrap w-full h-auto min-h-10 items-start content-start gap-3 bg-muted/70 backdrop-blur rounded-lg px-4 py-4 mb-4 shadow-sm border border-border"
          style={{ height: 'auto' }}
        >
          <TabsTrigger value="all">{t('purchases.bills.allBills')}</TabsTrigger>
          <TabsTrigger value="draft">{t('common.draft')}</TabsTrigger>
          <TabsTrigger value="pending">{t('common.pending')}</TabsTrigger>
          <TabsTrigger value="paid">{t('common.paid')}</TabsTrigger>
          <TabsTrigger value="overdue">{t('common.overdue')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('purchases.bills.billNumber')}</TableHead>
                    <TableHead>{t('purchases.bills.supplier')}</TableHead>
                    <TableHead>{t('items.category')}</TableHead>
                    <TableHead>{t('purchases.bills.billDate')}</TableHead>
                    <TableHead>{t('sales.invoices.dueDate')}</TableHead>
                    <TableHead>{t('common.total')}</TableHead>
                    <TableHead>{t('info.balance')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-end">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill: any) => (
                    <TableRow key={bill.id} data-testid={`row-bill-${bill.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          <a className="hover:underline" href={`/purchases/bills/${bill.id}`}>{bill.bill_number}</a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {bill.supplier_reference || t('purchases.bills.supplier')}
                        </div>
                      </TableCell>
                      <TableCell>{t('categories.other')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(bill.date).toLocaleDateString(i18n.language)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(bill.due_date).toLocaleDateString(i18n.language)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(bill.total || 0, bill.currency || 'USD')}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency((bill.total || 0) - (bill.paid_amount || 0), bill.currency || 'USD')}
                      </TableCell>
                      <TableCell>{getStatusBadge(bill.status)}</TableCell>
                      <TableCell className="text-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-actions-${bill.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 me-2" />
                              {t('common.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedBill(bill); setAllocOpen(true); }}>
                              <DollarSign className="h-4 w-4 me-2" />
                              {t('common.allocations')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 me-2" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(bill.id)}>
                              <Copy className="h-4 w-4 me-2" />
                              {t('common.duplicate')}
                            </DropdownMenuItem>
                            {(bill.status === 'pending' || bill.status === 'overdue' || bill.status === 'partially_paid') && (
                              <DropdownMenuItem onClick={() => handlePayBill(bill.id)}>
                                <CreditCard className="h-4 w-4 me-2" />
                                {t('banking.makePayment')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 me-2" />
                              {t('sales.invoices.downloadPDF')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(bill.id)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-${bill.id}`}
                            >
                              <Trash2 className="h-4 w-4 me-2" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bill Allocations Dialog */}
      <Dialog open={allocOpen} onOpenChange={(o) => { setAllocOpen(o); if (!o) setSelectedBill(null); }}>
  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('common.allocations')}
              {selectedBill ? ` - ${selectedBill.bill_number}` : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {billAllocLoading ? (
              <p className="text-muted-foreground">{t('common.loading')}</p>
            ) : billAllocations.length === 0 ? (
              <p className="text-muted-foreground">{t('banking.noAllocations', { defaultValue: 'No allocations yet.' })}</p>
            ) : (
              <div className="divide-y border rounded-md">
                {billAllocations.map((a: any) => {
                  const amt = Number((a.allocated_amount as any)?.toString?.() || a.allocated_amount || 0);
                  const dt = a.allocation_date ? new Date(a.allocation_date) : null;
                  const pay = a.payment_details || {};
                  const payRef = a.payment_type === 'payment' ? pay.payment_number : pay.receipt_number;
                  const payDate = pay.date ? new Date(pay.date) : null;
                  const currency = selectedBill?.currency || 'USD';
                  return (
                    <div key={a.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="text-sm">
                        <div className="font-medium">
                          {formatCurrency(amt, currency)}
                          <span className="ms-2 text-muted-foreground">· {a.payment_type}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {dt ? new Date(dt).toLocaleDateString(i18n.language) : ''}
                          {payRef ? ` • ${payRef}` : ''}
                          {payDate ? ` • ${new Date(payDate).toLocaleDateString(i18n.language)}` : ''}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => unmatchAllocation.mutate(a.id)}>
                        {t('common.unmatch')}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}