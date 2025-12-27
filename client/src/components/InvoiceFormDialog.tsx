import { useEffect, useMemo, useState, useRef, forwardRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { normalizeDate, computeCompleteness } from "@shared/aiSchemas";
import ExtractionPreview from '@/components/ai/ExtractionPreview';
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import AIIngestDialog from '@/components/ai/AIIngestDialog';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrackingSelector } from "@/components/TrackingSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Trash2,
  Save,
  Send,
  Calculator,
  FileText,
  User,
  Package,
  Percent,
  Copy,
  AlertCircle,
  ScanLine,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Numeric input that selects all on focus when value is 0
interface NumericInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  onValueChange: (value: number) => void;
  selectOnZero?: boolean;
}

const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  ({ value, onValueChange, selectOnZero = true, className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="number"
        value={value}
        onChange={(e) => {
          const raw = e.target.value.replace(',', '.');
          const num = parseFloat(raw);
          onValueChange(isNaN(num) ? 0 : num);
        }}
        onFocus={(e) => {
          if (selectOnZero && (value === 0 || e.target.value === '0')) {
            e.target.select();
          }
        }}
        className={className}
        {...props}
      />
    );
  }
);
NumericInput.displayName = 'NumericInput';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  taxRate: number;
  discount: number;
  amount: number;
  projectId?: string;
  itemId?: string;
  warehouseId?: string;
  accountId?: string; // Revenue account override for this line
  // Tracking fields for serial/batch
  trackingType?: 'none' | 'batch' | 'serial';
  serialNumbers?: string[]; // For serial tracking - selected serial numbers
  batchId?: string; // For batch tracking - selected batch
  batchInfo?: { // For new batch in purchases
    batchNumber?: string;
    expiryDate?: string;
  };
}

// Payment terms options
const PAYMENT_TERMS = [
  { value: 'due_on_receipt', days: 0 },
  { value: 'net_7', days: 7 },
  { value: 'net_15', days: 15 },
  { value: 'net_30', days: 30 },
  { value: 'net_45', days: 45 },
  { value: 'net_60', days: 60 },
  { value: 'net_90', days: 90 },
  { value: 'custom', days: -1 },
];

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  /** Invoice ID for edit mode - if provided, will load existing invoice data */
  editInvoiceId?: string | null;
}

export function InvoiceFormDialog({ open, onOpenChange, onSuccess, editInvoiceId }: InvoiceFormDialogProps) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customer, setCustomer] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [paymentTerms, setPaymentTerms] = useState("net_30");
  const [poNumber, setPoNumber] = useState("");
  const [orderId, setOrderId] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [extracted, setExtracted] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [currency, setCurrency] = useState("");
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [defaultTaxRate, setDefaultTaxRate] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  
  // AI tracking
  const aiAppliedRef = useRef<any>(null);
  const [applyFields, setApplyFields] = useState({
    invoice_number: true,
    invoice_date: true,
    due_date: true,
    total: true,
    notes_vendor: true,
    notes_text: true,
  });

  // Queries
  const { data: contactsData = [] } = useQuery<any[]>({ queryKey: ['/api/contacts'] });
  const customers = useMemo(() => (
    (contactsData || [])
      .filter((contact: any) => contact?.type === 'customer' || contact?.type === 'both')
      .map((c: any) => ({ id: c.id, name: c.name, email: c.email || '' }))
  ), [contactsData]);

  const { data: taxesData = [] } = useQuery<any[]>({ queryKey: ['/api/taxes'] });
  const taxRates = useMemo(() => (
    (taxesData || [])
      .filter((t: any) => t?.is_active)
      .map((t: any) => ({
        id: t.id,
        name: `${t.name} (${t.rate}%)`,
        rate: parseFloat(t.rate || '0'),
        type: t.calculation_method || 'exclusive',
      }))
  ), [taxesData]);

  const { data: currencies = [] } = useQuery<any[]>({ queryKey: ["/api/currencies"] });
  const { data: exchangeRatesData = [] } = useQuery<any[]>({ queryKey: ["/api/currencies/rates"] });
  const { data: projects = [] } = useQuery<any[]>({ queryKey: ["/api/projects"] });
  const { data: salesOrders = [] } = useQuery<any[]>({ queryKey: ["/api/sales/orders"] });
  
  const { data: itemsData = [] } = useQuery<any[]>({ queryKey: ["/api/items"] });
  const items = useMemo(() => (
    (itemsData || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      type: item.type,
      price: parseFloat(item.sell_price || item.price || '0'),
      taxId: item.default_tax_id,
      trackingType: item.tracking_type || 'none',
      salesAccountId: item.sales_account_id,
    }))
  ), [itemsData]);

  // Fetch GL accounts for revenue account selection
  const { data: glAccounts = [] } = useQuery<any[]>({ queryKey: ['/api/accounts'] });
  const revenueAccounts = useMemo(() => (
    glAccounts.filter((a: any) => a.account_type === 'revenue')
  ), [glAccounts]);

  // Fetch company default accounts
  const { data: defaultAccounts } = useQuery<{
    default_sales_account_id: string | null;
  }>({ queryKey: ['/api/settings/default-accounts'] });

  const { data: companySettings } = useQuery<any>({ queryKey: ["/api/settings/company"] });
  
  const { data: nextInvoiceData, refetch: refetchNextNumber } = useQuery<{ invoice_number: string }>({
    queryKey: ["/api/sales/invoices/next-number"],
    staleTime: 0,
    enabled: open && !editInvoiceId,
  });

  // Fetch existing invoice for edit mode
  const { data: existingInvoice, isLoading: loadingInvoice } = useQuery({
    queryKey: ['/api/sales/invoices', editInvoiceId],
    queryFn: async () => {
      if (!editInvoiceId) return null;
      const res = await apiRequest('GET', `/api/sales/invoices/${editInvoiceId}`);
      return res.json();
    },
    enabled: !!editInvoiceId && open,
  });

  const isEditMode = !!editInvoiceId;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest('POST', '/api/sales/invoices', payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/invoices'] });
      toast({ title: t('common.saved'), description: t('sales.invoices.draftSaved') });
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest('PUT', `/api/sales/invoices/${editInvoiceId}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/invoices', editInvoiceId] });
      toast({ title: t('common.saved'), description: t('sales.invoices.invoiceUpdated', { defaultValue: 'Invoice updated successfully' }) });
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  // Reset form when dialog opens
  const resetForm = () => {
    setInvoiceNumber("");
    setCustomer("");
    setInvoiceDate(new Date());
    setDueDate(undefined);
    setPaymentTerms("net_30");
    setPoNumber("");
    setOrderId(undefined);
    setNotes("");
    setCurrency("");
    setExchangeRate(1.0);
    setValidationErrors([]);
    setLineItems([]);
    setExtracted(null);
  };

  // Initialize when dialog opens (new invoice mode)
  useEffect(() => {
    if (open && !editInvoiceId) {
      resetForm();
      refetchNextNumber();
    }
  }, [open, editInvoiceId]);

  // Populate form with existing invoice data for edit mode
  useEffect(() => {
    if (open && existingInvoice && editInvoiceId) {
      setInvoiceNumber(existingInvoice.invoice_number || '');
      setCustomer(existingInvoice.customer_id || '');
      setInvoiceDate(existingInvoice.date ? new Date(existingInvoice.date) : new Date());
      setDueDate(existingInvoice.due_date ? new Date(existingInvoice.due_date) : undefined);
      setPoNumber(existingInvoice.po_number || '');
      setOrderId(existingInvoice.order_id || undefined);
      setNotes(existingInvoice.notes || '');
      setCurrency(existingInvoice.currency || companySettings?.base_currency || 'USD');
      setExchangeRate(parseFloat(existingInvoice.fx_rate || '1'));
      setPaymentTerms('custom'); // Use custom since we're loading existing dates
      
      // Load line items
      if (existingInvoice.lines && existingInvoice.lines.length > 0) {
        setLineItems(existingInvoice.lines.map((line: any, index: number) => ({
          id: line.id || (index + 1).toString(),
          description: line.description || '',
          quantity: Number(line.quantity || 1),
          rate: Number(line.unit_price || 0),
          taxRate: Number(line.tax_rate || 0),
          discount: Number(line.discount_percentage || 0),
          amount: Number(line.line_total || line.amount || 0),
          projectId: line.project_id,
          itemId: line.item_id,
          warehouseId: line.warehouse_id,
        })));
      } else {
        setLineItems([{
          id: "1",
          description: "",
          quantity: 1,
          rate: 0,
          taxRate: defaultTaxRate,
          discount: 0,
          amount: 0,
        }]);
      }
    }
  }, [open, existingInvoice, editInvoiceId, companySettings?.base_currency, defaultTaxRate]);

  // Initialize from company settings
  useEffect(() => {
    if (companySettings && open) {
      if (!currency && companySettings.base_currency) {
        setCurrency(companySettings.base_currency);
      }
      const rate = parseFloat(companySettings.default_tax_rate || '0');
      setDefaultTaxRate(rate);
      const days = parseInt(companySettings.payment_terms_days || '30');
      const term = PAYMENT_TERMS.find(t => t.days === days);
      if (term) setPaymentTerms(term.value);
      if (invoiceDate && !dueDate) {
        const due = new Date(invoiceDate);
        due.setDate(due.getDate() + days);
        setDueDate(due);
      }
    }
  }, [companySettings, open]);

  // Set invoice number
  useEffect(() => {
    if (nextInvoiceData?.invoice_number && !invoiceNumber && open) {
      setInvoiceNumber(nextInvoiceData.invoice_number);
    }
  }, [nextInvoiceData, open]);

  // Initialize line items with default tax
  useEffect(() => {
    if (lineItems.length === 0 && defaultTaxRate >= 0 && open) {
      setLineItems([{
        id: "1",
        description: "",
        quantity: 1,
        rate: 0,
        taxRate: defaultTaxRate,
        discount: 0,
        amount: 0,
      }]);
    }
  }, [defaultTaxRate, open]);

  // Update due date on payment terms change
  useEffect(() => {
    if (invoiceDate && paymentTerms !== 'custom') {
      const term = PAYMENT_TERMS.find(t => t.value === paymentTerms);
      if (term && term.days >= 0) {
        const due = new Date(invoiceDate);
        due.setDate(due.getDate() + term.days);
        setDueDate(due);
      }
    }
  }, [paymentTerms, invoiceDate]);

  // Fetch live exchange rate from API when currency changes
  useEffect(() => {
    const baseCurrency = companySettings?.base_currency || "AED";
    
    if (!currency || currency === baseCurrency) {
      setExchangeRate(1.0);
      return;
    }
    
    // Fetch live rate from exchangerate-api.com (free tier)
    const fetchLiveRate = async () => {
      try {
        const response = await fetch(
          `https://api.exchangerate-api.com/v4/latest/${currency}`
        );
        if (response.ok) {
          const data = await response.json();
          const rate = data.rates?.[baseCurrency];
          if (rate && rate > 0) {
            setExchangeRate(parseFloat(rate.toFixed(6)));
            return;
          }
        }
      } catch (error) {
        console.log('Live rate fetch failed, trying backup API...');
      }
      
      // Backup: try another free API
      try {
        const response = await fetch(
          `https://open.er-api.com/v6/latest/${currency}`
        );
        if (response.ok) {
          const data = await response.json();
          const rate = data.rates?.[baseCurrency];
          if (rate && rate > 0) {
            setExchangeRate(parseFloat(rate.toFixed(6)));
            return;
          }
        }
      } catch (error) {
        console.log('Backup API failed, using saved rates...');
      }
      
      // Fallback to saved exchange rates
      const directRate = exchangeRatesData.find((r: any) => 
        r.from_currency === currency && r.to_currency === baseCurrency
      );
      if (directRate?.rate) {
        setExchangeRate(parseFloat(directRate.rate));
      } else {
        const inverseRate = exchangeRatesData.find((r: any) => 
          r.from_currency === baseCurrency && r.to_currency === currency
        );
        if (inverseRate?.rate) {
          setExchangeRate(1 / parseFloat(inverseRate.rate));
        } else {
          setExchangeRate(1.0);
        }
      }
    };
    
    fetchLiveRate();
  }, [currency, exchangeRatesData, companySettings?.base_currency]);

  // Line item functions
  const addLineItem = () => {
    setLineItems([...lineItems, {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      taxRate: defaultTaxRate,
      discount: 0,
      amount: 0,
      accountId: defaultAccounts?.default_sales_account_id || undefined,
    }]);
  };

  const duplicateLineItem = (id: string) => {
    const item = lineItems.find(i => i.id === id);
    if (item) {
      const newItem = { ...item, id: Date.now().toString() };
      const index = lineItems.findIndex(i => i.id === id);
      const newItems = [...lineItems];
      newItems.splice(index + 1, 0, newItem);
      setLineItems(newItems);
    }
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length <= 1) {
      toast({ title: t('common.error'), description: t('forms.atLeastOneItem'), variant: 'destructive' });
      return;
    }
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate' || field === 'discount') {
          const subtotal = updated.quantity * updated.rate;
          const discountAmount = (subtotal * (updated.discount || 0)) / 100;
          updated.amount = subtotal - discountAmount;
        }
        return updated;
      }
      return item;
    }));
  };

  const handleItemSelect = (lineId: string, itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      let taxRate = defaultTaxRate;
      if (item.taxId) {
        const tax = taxRates.find(t => t.id === item.taxId);
        if (tax) taxRate = tax.rate;
      }
      // Use item's sales account or fall back to company default
      const accountId = item.salesAccountId || defaultAccounts?.default_sales_account_id || undefined;
      
      setLineItems(lineItems.map(line => {
        if (line.id === lineId) {
          const rate = item.price;
          const amount = line.quantity * rate;
          return { 
            ...line, 
            itemId, 
            description: item.name, 
            rate, 
            taxRate, 
            amount,
            accountId,
            trackingType: item.trackingType || 'none',
            serialNumbers: [],
            batchId: undefined
          };
        }
        return line;
      }));
    }
  };

  // Calculations
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const calculateSubtotal = () => lineItems.reduce((sum, item) => sum + item.amount, 0);
  const calculateTotalDiscount = () => lineItems.reduce((sum, item) => {
    const subtotal = item.quantity * item.rate;
    return sum + (subtotal * (item.discount || 0)) / 100;
  }, 0);
  const calculateTotalTax = () => lineItems.reduce((sum, item) => sum + (item.amount * item.taxRate) / 100, 0);
  const calculateTotal = () => calculateSubtotal() + calculateTotalTax();

  // Validation
  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!customer) errors.push(t('forms.customerRequired'));
    if (!invoiceDate) errors.push(t('forms.invoiceDateRequired'));
    if (!dueDate) errors.push(t('forms.dueDateRequired'));
    if (lineItems.length === 0) errors.push(t('forms.atLeastOneItem'));
    const hasEmptyItem = lineItems.some(item => !item.description.trim() || item.rate <= 0);
    if (hasEmptyItem) errors.push(t('forms.itemsIncomplete'));
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // AI helpers
  const toISODate = (val: any) => {
    try { return normalizeDate(val); } catch { return ''; }
  };

  const handleScanExtract = (payload: any) => {
    if (!payload) return;
    setExtracted(payload);
    try {
      const raw = localStorage.getItem('ai.applyDefaults.invoices');
      if (raw) {
        const prefs = JSON.parse(raw);
        setApplyFields(prev => ({ ...prev, ...prefs }));
      }
    } catch {}
    setPreviewOpen(true);
  };

  const similarity = (a: string, b: string) => {
    const s1 = a.toLowerCase();
    const s2 = b.toLowerCase();
    if (!s1 || !s2) return 0;
    let matches = 0;
    const set = new Set(s1.split(/\s+/).filter(Boolean));
    for (const w of s2.split(/\s+/).filter(Boolean)) if (set.has(w)) matches++;
    return matches / Math.max(1, Math.min(s1.split(/\s+/).length, s2.split(/\s+/).length));
  };

  const bestCustomerMatch = useMemo(() => {
    const name = extracted?.vendor_name?.toString?.() || '';
    if (!name) return null;
    let best: any = null, bestScore = 0;
    for (const c of customers) {
      const score = similarity(name, c.name || '');
      if (score > bestScore) { bestScore = score; best = c; }
    }
    return bestScore >= 0.6 ? { customer: best, score: bestScore } : null;
  }, [extracted?.vendor_name, customers]);

  const handleApplyToggle = (key: keyof typeof applyFields, value: any) => {
    const boolVal = !!value;
    setApplyFields(s => ({ ...s, [key]: boolVal }));
    try {
      const prefsRaw = localStorage.getItem('ai.applyDefaults.invoices');
      const prefs = prefsRaw ? JSON.parse(prefsRaw) : {};
      localStorage.setItem('ai.applyDefaults.invoices', JSON.stringify({ ...prefs, [key]: boolVal }));
    } catch {}
  };

  const setAllApply = (value: boolean) => {
    if (!extracted) return;
    const next = {
      invoice_number: value && !!extracted.invoice_number,
      invoice_date: value && !!extracted.date,
      due_date: value && !!extracted.due_date,
      total: value && !!extracted.total,
      notes_vendor: value && !!extracted.vendor_name,
      notes_text: value && !!extracted.notes,
    };
    setApplyFields(next);
    try { localStorage.setItem('ai.applyDefaults.invoices', JSON.stringify(next)); } catch {}
  };

  const applyExtracted = () => {
    if (!extracted) return;
    const totalNum = parseFloat((extracted.total ?? '').toString());
    if (applyFields.invoice_number && extracted.invoice_number) setInvoiceNumber(extracted.invoice_number);
    if (applyFields.invoice_date && extracted.date) {
      const dateStr = toISODate(extracted.date);
      if (dateStr) setInvoiceDate(new Date(dateStr));
    }
    if (applyFields.due_date && extracted.due_date) {
      const dateStr = toISODate(extracted.due_date);
      if (dateStr) setDueDate(new Date(dateStr));
    }
    if (applyFields.total && !isNaN(totalNum) && totalNum > 0) {
      setLineItems(prev => {
        const copy = [...prev];
        if (copy.length === 0) {
          copy.push({ id: Date.now().toString(), description: t('forms.scannedItem'), quantity: 1, rate: totalNum, taxRate: defaultTaxRate, discount: 0, amount: totalNum });
        } else {
          copy[0] = { ...copy[0], quantity: 1, rate: totalNum, amount: totalNum, description: copy[0].description || t('forms.scannedItem') };
        }
        return copy;
      });
    }
    if (applyFields.notes_vendor && extracted.vendor_name) {
      setNotes(prev => `${prev ? prev + '\n' : ''}${t('ai.vendorDetected')}: ${extracted.vendor_name}`.trim());
    }
    if (applyFields.notes_text && extracted.notes) {
      setNotes(prev => `${prev ? prev + '\n' : ''}${extracted.notes}`.trim());
    }
    setPreviewOpen(false);
    setScanOpen(false);
    setExtracted(null);
  };

  // Save handler with status option
  const handleSave = (status: 'draft' | 'sent' = 'draft') => {
    if (!validateForm()) {
      toast({ title: t('common.error'), description: t('forms.pleaseFixErrors'), variant: 'destructive' });
      return;
    }

    const subtotal = calculateSubtotal();
    const taxTotal = calculateTotalTax();
    const total = subtotal + taxTotal;

    const payload = {
      invoice_number: invoiceNumber || undefined,
      customer_id: customer,
      order_id: orderId || undefined,
      date: (invoiceDate || new Date()).toISOString(),
      due_date: (dueDate || invoiceDate || new Date()).toISOString(),
      status: isEditMode ? (existingInvoice?.status || status) : status,
      currency,
      fx_rate: exchangeRate.toString(),
      subtotal: subtotal.toFixed(2),
      tax_total: taxTotal.toFixed(2),
      total: total.toFixed(2),
      paid_amount: isEditMode ? (existingInvoice?.paid_amount || '0') : '0',
      notes: notes || undefined,
      lines: lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.rate,
        tax_rate: item.taxRate,
        discount_percentage: item.discount || 0,
        amount: item.amount,
        project_id: item.projectId,
        item_id: item.itemId,
        warehouse_id: item.warehouseId,
        account_id: item.accountId, // Revenue account for this line
        // Tracking data for sales
        tracking_type: item.trackingType,
        serial_numbers: item.serialNumbers,
        batch_id: item.batchId,
      }))
    };

    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:w-[90vw] max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <FileText className="h-5 w-5" />
                {isEditMode 
                  ? t('sales.invoices.editInvoice', { defaultValue: 'Edit Invoice' }) 
                  : t('forms.createInvoice')
                }
                {isEditMode && invoiceNumber && (
                  <span className="text-muted-foreground">#{invoiceNumber}</span>
                )}
              </DialogTitle>
              {!isEditMode && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setScanOpen(true)}>
                    <ScanLine className="h-4 w-4 me-2" />
                    {t('ai.scanDocument', { defaultValue: 'Scan' })}
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>
          
          {/* Loading state for edit mode */}
          {isEditMode && loadingInvoice ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {validationErrors.map((error, i) => <li key={i}>{error}</li>)}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Invoice Details & Customer */}
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                {/* Invoice Details Card */}
                <Card>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="h-4 w-4" />
                      {t('forms.invoiceDetails')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label>{t('forms.invoiceNumber')}</Label>
                        <Input
                          value={invoiceNumber}
                          onChange={(e) => setInvoiceNumber(e.target.value)}
                          placeholder={t('forms.autoGenerated')}
                          disabled={isEditMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('forms.salesOrder')}</Label>
                        <Select value={orderId || "none"} onValueChange={(v) => setOrderId(v === "none" ? undefined : v)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('forms.optional')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t('forms.none')}</SelectItem>
                            {salesOrders.filter((o: any) => o.status !== 'cancelled' && o.status !== 'invoiced').map((order: any) => (
                              <SelectItem key={order.id} value={order.id}>
                                {order.order_number} - {customers.find(c => c.id === order.customer_id)?.name || t('forms.unknownCustomer')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label>{t('forms.invoiceDate')} *</Label>
                        <DatePicker value={invoiceDate} onChange={setInvoiceDate} placeholder={t('forms.selectDate')} />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('forms.paymentTerms')}</Label>
                        <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_TERMS.map((term) => (
                              <SelectItem key={term.value} value={term.value}>
                                {term.value === 'due_on_receipt' ? t('forms.dueOnReceipt') :
                                 term.value === 'custom' ? t('forms.custom') :
                                 t('forms.netDays', { days: term.days })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('forms.dueDate')} *</Label>
                      <DatePicker
                        value={dueDate}
                        onChange={(date) => { setDueDate(date); setPaymentTerms('custom'); }}
                        placeholder={t('forms.selectDate')}
                        minDate={invoiceDate}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label>{t('forms.currency')}</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('forms.selectCurrency')} />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((c: any) => (
                              <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {t('forms.exchangeRate')}
                          {currency && currency !== companySettings?.base_currency && (
                            <span className="text-xs text-green-500 ms-1">
                              (1 {currency} = {exchangeRate.toFixed(4)} {companySettings?.base_currency || 'AED'})
                            </span>
                          )}
                        </Label>
                        <NumericInput
                          value={exchangeRate}
                          onValueChange={(num) => setExchangeRate(num || 1)}
                          step="any"
                          className="h-10"
                          disabled={!currency || currency === companySettings?.base_currency}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Card */}
                <Card>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4" />
                      {t('forms.customerDetails')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label>{t('forms.customer')} *</Label>
                      <Select value={customer} onValueChange={setCustomer}>
                        <SelectTrigger className={!customer && validationErrors.length > 0 ? 'border-destructive' : ''}>
                          <SelectValue placeholder={t('forms.selectCustomer')} />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((cust) => (
                            <SelectItem key={cust.id} value={cust.id}>{cust.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {customer && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-medium">{customers.find(c => c.id === customer)?.name}</p>
                        <p className="text-sm text-muted-foreground">{customers.find(c => c.id === customer)?.email}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Line Items */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calculator className="h-4 w-4" />
                      {t('forms.lineItems')}
                    </CardTitle>
                    <Button onClick={addLineItem} size="sm">
                      <Plus className="h-4 w-4 me-2" />
                      {t('forms.addItem')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Full-width line items */}
                  <div className="space-y-4">
                    {lineItems.map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-4 bg-muted/30">
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-primary">{t('forms.item')} #{index + 1}</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => duplicateLineItem(item.id)} className="h-8 w-8">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => removeLineItem(item.id)} className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Main Grid - responsive columns */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
                          {items.length > 0 && (
                            <div className="col-span-2 sm:col-span-1 lg:col-span-2 space-y-1">
                              <Label className="text-xs text-muted-foreground">{t('forms.product')}</Label>
                              <Select value={item.itemId || "none"} onValueChange={(value) => { if (value !== "none") handleItemSelect(item.id, value); }}>
                                <SelectTrigger className="h-10 w-full">
                                  <SelectValue placeholder={t('forms.selectProduct')} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">{t('forms.manualEntry')}</SelectItem>
                                  {items.map((prod) => (
                                    <SelectItem key={prod.id} value={prod.id}>
                                      {prod.code ? `${prod.code} - ` : ''}{prod.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          <div className={`space-y-1 ${items.length > 0 ? 'col-span-2 sm:col-span-2 lg:col-span-4' : 'col-span-2 sm:col-span-3 lg:col-span-6'}`}>
                            <Label className="text-xs text-muted-foreground">{t('forms.description')}</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                              placeholder={t('forms.itemDescriptionPlaceholder')}
                              className="h-10 w-full"
                            />
                          </div>
                        </div>
                        
                        {/* Numbers Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{t('forms.quantity')}</Label>
                            <NumericInput
                              value={item.quantity}
                              onValueChange={(num) => updateLineItem(item.id, 'quantity', num || 1)}
                              step="any"
                              className="h-10 w-full"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{t('forms.rate')}</Label>
                            <NumericInput
                              value={item.rate}
                              onValueChange={(num) => updateLineItem(item.id, 'rate', num)}
                              step="any"
                              className="h-10 w-full"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{t('forms.discount')} %</Label>
                            <NumericInput
                              value={item.discount || 0}
                              onValueChange={(num) => updateLineItem(item.id, 'discount', Math.min(100, Math.max(0, num)))}
                              min={0}
                              max={100}
                              className="h-10 w-full"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{t('forms.tax')}</Label>
                            <Select value={item.taxRate.toString()} onValueChange={(value) => updateLineItem(item.id, 'taxRate', parseFloat(value))}>
                              <SelectTrigger className="h-10 w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">{t('forms.noTax')}</SelectItem>
                                {taxRates.map((tax) => (
                                  <SelectItem key={tax.id} value={tax.rate.toString()}>{tax.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-xs text-muted-foreground">{t('forms.amount')}</Label>
                            <div className="h-10 flex items-center justify-end px-4 bg-primary/10 border border-primary/20 rounded-md font-mono font-bold text-lg text-primary min-w-[140px] whitespace-nowrap">
                              {formatCurrency(item.amount)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Project Row - Separate */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{t('forms.project')}</Label>
                            <Select value={item.projectId || "none"} onValueChange={(value) => updateLineItem(item.id, 'projectId', value === "none" ? undefined : value)}>
                              <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder={t('forms.none')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">{t('forms.none')}</SelectItem>
                                {projects.map((p: any) => (
                                  <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Revenue Account Selection */}
                          {revenueAccounts.length > 0 && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">{t('forms.revenueAccount', 'Revenue Account')}</Label>
                              <Select 
                                value={item.accountId || "default"} 
                                onValueChange={(value) => updateLineItem(item.id, 'accountId', value === "default" ? undefined : value)}
                              >
                                <SelectTrigger className="h-10 w-full">
                                  <SelectValue placeholder={t('forms.defaultAccount', 'Default')} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="default">{t('forms.defaultAccount', 'Default')}</SelectItem>
                                  {revenueAccounts.map((acc: any) => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                      {acc.code} - {i18n.language === 'ar' && acc.name_ar ? acc.name_ar : acc.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          {/* Serial/Batch Tracking */}
                          {item.itemId && item.trackingType && item.trackingType !== 'none' && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">
                                {item.trackingType === 'serial' 
                                  ? t('inventory.serialNumbers', { defaultValue: 'الأرقام التسلسلية' })
                                  : t('inventory.batchInfo', { defaultValue: 'بيانات الدفعة' })
                                }
                              </Label>
                              <TrackingSelector
                                mode="sales"
                                itemId={item.itemId}
                                warehouseId={item.warehouseId}
                                trackingType={item.trackingType as 'serial' | 'batch'}
                                quantity={item.quantity}
                                selectedSerials={item.serialNumbers}
                                selectedBatchId={item.batchId}
                                onSerialsChange={(serials) => updateLineItem(item.id, 'serialNumbers', serials)}
                                onBatchChange={(batchId) => updateLineItem(item.id, 'batchId', batchId)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-6 flex justify-end">
                    <div className="w-full sm:w-96 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>{t('forms.subtotal')}</span>
                        <span className="font-mono">{formatCurrency(calculateSubtotal() + calculateTotalDiscount())}</span>
                      </div>
                      {calculateTotalDiscount() > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span className="flex items-center gap-1"><Percent className="h-3 w-3" />{t('forms.discount')}</span>
                          <span className="font-mono">-{formatCurrency(calculateTotalDiscount())}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>{t('forms.netAmount')}</span>
                        <span className="font-mono">{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('forms.tax')}</span>
                        <span className="font-mono">{formatCurrency(calculateTotalTax())}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>{t('forms.total')}</span>
                        <span className="font-mono">{formatCurrency(calculateTotal())}</span>
                      </div>
                      
                      {/* Currency conversion info */}
                      {currency && currency !== companySettings?.base_currency && exchangeRate !== 1 && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-dashed space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{t('forms.exchangeRate')}</span>
                            <span>1 {currency} = {exchangeRate.toFixed(4)} {companySettings?.base_currency || 'AED'}</span>
                          </div>
                          <div className="flex justify-between font-medium text-primary">
                            <span>{t('forms.equivalentIn', { currency: companySettings?.base_currency || 'AED' })}</span>
                            <span className="font-mono">
                              {new Intl.NumberFormat(i18n.language, { 
                                style: 'currency', 
                                currency: companySettings?.base_currency || 'AED' 
                              }).format(calculateTotal() * exchangeRate)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">{t('forms.notesAndTerms')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={t('forms.notesPlaceholder')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
          )}

          <DialogFooter className="px-4 sm:px-6 py-4 sm:py-5 border-t shrink-0 flex-wrap gap-2 bg-background sticky bottom-0">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none h-11">
              {t('common.cancel')}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => handleSave('draft')} 
              disabled={createMutation.isPending || updateMutation.isPending} 
              className="flex-1 sm:flex-none h-11"
            >
              <Save className="h-4 w-4 me-2" />
              {(createMutation.isPending || updateMutation.isPending) 
                ? t('common.saving') 
                : isEditMode ? t('common.save') : t('forms.saveDraft')
              }
            </Button>
            {!isEditMode && (
              <Button 
                onClick={() => handleSave('sent')} 
                disabled={createMutation.isPending} 
                className="flex-1 sm:flex-none h-11"
              >
                <Send className="h-4 w-4 me-2" />
                {t('forms.saveAndSend')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Scan Dialog */}
      <AIIngestDialog
        open={scanOpen}
        onOpenChange={setScanOpen}
        title={t('ai.pasteInvoiceText')}
        onExtract={handleScanExtract}
        allowPdf
        autoCloseOnExtract
        locale={i18n?.language || 'en'}
      />

      {/* Extraction Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2">
              <DialogTitle>{t('ai.previewExtraction')}</DialogTitle>
              <div className="flex items-center gap-2">
                {extracted && (() => {
                  const fields = ['invoice_number','date','due_date','total','currency','vendor_name','notes'];
                  const { count, total, percent } = computeCompleteness(extracted, fields);
                  return <Badge variant="secondary" className="text-xs">{t('ai.completeness')}: {count}/{total} ({percent}%)</Badge>;
                })()}
                <Button size="sm" variant="ghost" onClick={() => setAllApply(true)}>{t('common.all')}</Button>
                <Button size="sm" variant="ghost" onClick={() => setAllApply(false)}>{t('common.none')}</Button>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-3">
            {extracted ? (
              <ExtractionPreview
                extraction={extracted}
                kind="invoice"
                requiredFields={["invoice_number","date","due_date","total"]}
                fieldMap={{ invoice_number: 'invoice_number', date: 'invoice_date', due_date: 'due_date', total: 'total' }}
                currentValues={{ invoice_number: invoiceNumber, invoice_date: invoiceDate, due_date: dueDate, total: calculateTotal().toFixed(2), notes }}
                applyToggles={applyFields as any}
                onToggle={(k, v) => handleApplyToggle(k as any, v)}
                toggleLabels={{
                  invoice_number: t('forms.invoiceNumber'),
                  invoice_date: t('forms.invoiceDate'),
                  due_date: t('forms.dueDate'),
                  total: t('forms.total'),
                  notes_vendor: t('ai.vendor'),
                  notes_text: t('common.notes'),
                }}
                bestMatch={bestCustomerMatch ? {
                  label: t('ai.customerMatch'),
                  name: bestCustomerMatch.customer.name,
                  actionLabel: t('ai.useCustomer'),
                  onUse: () => setCustomer(bestCustomerMatch.customer.id)
                } : null}
              />
            ) : (
              <p className="text-muted-foreground">{t('ai.noData')}</p>
            )}
            <div className="flex items-center gap-3 justify-end">
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>{t('common.cancel')}</Button>
              <Button type="button" variant="secondary" onClick={async () => {
                try { await navigator.clipboard.writeText(JSON.stringify(extracted, null, 2)); setCopied(true); setTimeout(()=>setCopied(false), 1500);} catch {}
              }}>
                {copied ? t('common.copied') : t('ai.copyJson')}
              </Button>
              <Button onClick={applyExtracted}>{t('common.apply')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
