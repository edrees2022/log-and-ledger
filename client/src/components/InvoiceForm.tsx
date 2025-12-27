import { useEffect, useMemo, useState, useRef, forwardRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { normalizeDate, computeCompleteness } from "@shared/aiSchemas";
import ExtractionPreview from '@/components/ai/ExtractionPreview';
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AIIngestDialog from '@/components/ai/AIIngestDialog';
import { apiRequest } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
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
  Calendar,
  User,
  Package,
  Percent,
  ArrowLeft,
  Copy,
  AlertCircle,
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

// NOTE: React hooks must not be used at module scope. Queries moved inside component.

export function InvoiceForm() {
  const { t, i18n } = useTranslation();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customer, setCustomer] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [paymentTerms, setPaymentTerms] = useState("net_30");
  const [poNumber, setPoNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [extracted, setExtracted] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [currency, setCurrency] = useState("");
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [defaultTaxRate, setDefaultTaxRate] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Track AI-applied snapshot for correction logging
  const aiAppliedRef = useRef<null | {
    values: {
      invoice_number?: string;
      invoice_date?: string;
      due_date?: string;
      total?: number;
      notes_vendor?: boolean;
      notes_text?: boolean;
    };
    meta?: any;
  }>(null);

  // Fetch customers and taxes inside the component
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

  const { data: currencies = [] } = useQuery<any[]>({
    queryKey: ["/api/currencies"],
  });

  const { data: exchangeRates = [] } = useQuery<any[]>({
    queryKey: ["/api/currencies/rates"],
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch items for product selection
  const { data: itemsData = [] } = useQuery<any[]>({
    queryKey: ["/api/items"],
  });
  const items = useMemo(() => (
    (itemsData || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      type: item.type,
      price: parseFloat(item.sell_price || item.price || '0'),
      taxId: item.default_tax_id,
    }))
  ), [itemsData]);

  // Fetch company settings for defaults
  const { data: companySettings } = useQuery<any>({
    queryKey: ["/api/settings/company"],
  });

  // Fetch next invoice number
  const { data: nextInvoiceData } = useQuery<{ invoice_number: string }>({
    queryKey: ["/api/sales/invoices/next-number"],
    staleTime: 0, // Always fetch fresh number
  });

  // Initialize from company settings
  useEffect(() => {
    if (companySettings) {
      // Set default currency from company settings
      if (!currency && companySettings.base_currency) {
        setCurrency(companySettings.base_currency);
      }
      // Set default tax rate from company settings
      const rate = parseFloat(companySettings.default_tax_rate || '0');
      setDefaultTaxRate(rate);
      // Set payment terms from company settings
      const days = parseInt(companySettings.payment_terms_days || '30');
      const term = PAYMENT_TERMS.find(t => t.days === days);
      if (term) {
        setPaymentTerms(term.value);
      }
      // Calculate due date based on payment terms
      if (invoiceDate && !dueDate) {
        const due = new Date(invoiceDate);
        due.setDate(due.getDate() + days);
        setDueDate(due);
      }
    }
  }, [companySettings]);

  // Set invoice number from next number
  useEffect(() => {
    if (nextInvoiceData?.invoice_number && !invoiceNumber) {
      setInvoiceNumber(nextInvoiceData.invoice_number);
    }
  }, [nextInvoiceData, invoiceNumber]);

  // Update due date when payment terms change
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

  // Update exchange rate when currency changes
  useEffect(() => {
    const baseCurrency = companySettings?.base_currency || "USD";
    if (currency === baseCurrency) {
      // Base currency always has rate of 1
      setExchangeRate(1.0);
    } else if (currency) {
      // Find latest rate for selected currency
      const rate = exchangeRates.find((r: any) => r.currency === currency);
      if (rate) {
        setExchangeRate(parseFloat(rate.rate));
      } else {
        // Default to 1 if no rate found
        setExchangeRate(1.0);
      }
    }
  }, [currency, exchangeRates, companySettings?.base_currency]);
  
  // Customer suggestion from vendor_name
  const similarity = (a: string, b: string) => {
    const s1 = a.toLowerCase();
    const s2 = b.toLowerCase();
    if (!s1 || !s2) return 0;
    let matches = 0;
    const set = new Set(s1.split(/\s+/).filter(Boolean));
    for (const w of s2.split(/\s+/).filter(Boolean)) if (set.has(w)) matches++;
    return matches / Math.max(1, Math.min(s1.split(/\s+/).length, s2.split(/\s+/).length));
  };

  // Persist apply toggle defaults
  const handleApplyToggle = (key: keyof typeof applyFields, value: any) => {
    const boolVal = !!value;
    setApplyFields(s => ({ ...s, [key]: boolVal }));
    try {
      const prefsRaw = localStorage.getItem('ai.applyDefaults.invoices');
      const prefs = prefsRaw ? JSON.parse(prefsRaw) : {};
      localStorage.setItem('ai.applyDefaults.invoices', JSON.stringify({ ...prefs, [key]: boolVal }));
    } catch {}
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
  const [applyFields, setApplyFields] = useState({
    invoice_number: true,
    invoice_date: true,
    due_date: true,
    total: true,
    notes_vendor: true,
    notes_text: true,
  });
  // provider/model and file/page state are managed inside AIIngestDialog now

  // Provider/model are handled in AIIngestDialog
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  // Initialize first line item with default tax when settings load
  useEffect(() => {
    if (lineItems.length === 0 && defaultTaxRate >= 0) {
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
  }, [defaultTaxRate]);

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      taxRate: defaultTaxRate, // Use default tax rate from settings
      discount: 0,
      amount: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const duplicateLineItem = (id: string) => {
    const item = lineItems.find(i => i.id === id);
    if (item) {
      const newItem: LineItem = {
        ...item,
        id: Date.now().toString(),
      };
      const index = lineItems.findIndex(i => i.id === id);
      const newItems = [...lineItems];
      newItems.splice(index + 1, 0, newItem);
      setLineItems(newItems);
    }
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length <= 1) {
      toast({ 
        title: t('common.error'), 
        description: t('forms.atLeastOneItem', { defaultValue: 'Invoice must have at least one item' }), 
        variant: 'destructive' 
      });
      return;
    }
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate amount when quantity, rate, or discount changes
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

  // Handle item selection from product list
  const handleItemSelect = (lineId: string, itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      // Find tax rate for this item
      let taxRate = defaultTaxRate;
      if (item.taxId) {
        const tax = taxRates.find(t => t.id === item.taxId);
        if (tax) taxRate = tax.rate;
      }
      
      setLineItems(lineItems.map(line => {
        if (line.id === lineId) {
          const rate = item.price;
          const amount = line.quantity * rate;
          return {
            ...line,
            itemId: itemId,
            description: item.name,
            rate: rate,
            taxRate: taxRate,
            amount: amount,
          };
        }
        return line;
      }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTotalDiscount = () => {
    return lineItems.reduce((sum, item) => {
      const subtotal = item.quantity * item.rate;
      const discountAmount = (subtotal * (item.discount || 0)) / 100;
      return sum + discountAmount;
    }, 0);
  };

  const calculateTotalTax = () => {
    return lineItems.reduce((sum, item) => {
      const taxAmount = (item.amount * item.taxRate) / 100;
      return sum + taxAmount;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!customer) {
      errors.push(t('forms.customerRequired', { defaultValue: 'Customer is required' }));
    }
    if (!invoiceDate) {
      errors.push(t('forms.invoiceDateRequired', { defaultValue: 'Invoice date is required' }));
    }
    if (!dueDate) {
      errors.push(t('forms.dueDateRequired', { defaultValue: 'Due date is required' }));
    }
    if (lineItems.length === 0) {
      errors.push(t('forms.atLeastOneItem', { defaultValue: 'At least one item is required' }));
    }
    const hasEmptyItem = lineItems.some(item => !item.description.trim() || item.rate <= 0);
    if (hasEmptyItem) {
      errors.push(t('forms.itemsIncomplete', { defaultValue: 'All items must have description and price' }));
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Helper to normalize various date shapes to YYYY-MM-DD
  const toISODate = (val: any) => {
    try { return normalizeDate(val); } catch { return ''; }
  };

  // Receive extraction payload from AIIngestDialog
  const handleScanExtract = (payload: any) => {
    if (!payload) return;
    setExtracted(payload);
    // Load saved apply defaults if exist
    try {
      const raw = localStorage.getItem('ai.applyDefaults.invoices');
      if (raw) {
        const prefs = JSON.parse(raw);
        setApplyFields(prev => ({ ...prev, ...prefs }));
      }
    } catch {}
    setPreviewOpen(true);
  };

  const handleSave = async () => {
    try {
      // Validate form
      if (!validateForm()) {
        toast({ 
          title: t('common.error'), 
          description: t('forms.pleaseFixErrors', { defaultValue: 'Please fix the errors before saving' }), 
          variant: 'destructive' 
        });
        return;
      }

      // Correction logging: diff AI snapshot vs current values
      try {
        if (aiAppliedRef.current) {
          const snap = aiAppliedRef.current.values;
          const currentDate = invoiceDate ? invoiceDate.toISOString().split('T')[0] : '';
          const currentDueDate = dueDate ? dueDate.toISOString().split('T')[0] : '';
          const current = {
            invoice_number: invoiceNumber,
            invoice_date: currentDate,
            due_date: currentDueDate,
            total: calculateTotal(),
          };
          const corrections: any[] = [];
          if (snap.invoice_number && snap.invoice_number !== current.invoice_number) corrections.push({ field: 'invoice_number', before: snap.invoice_number, after: current.invoice_number });
          if (snap.invoice_date && snap.invoice_date !== current.invoice_date) corrections.push({ field: 'invoice_date', before: snap.invoice_date, after: current.invoice_date });
          if (snap.due_date && snap.due_date !== current.due_date) corrections.push({ field: 'due_date', before: snap.due_date, after: current.due_date });
          if (snap.total !== undefined && Math.abs((snap.total || 0) - (current.total || 0)) > 0.001) corrections.push({ field: 'total', before: snap.total, after: current.total });
          if (corrections.length > 0) {
            const fb = {
              source: 'sales-invoice',
              accepted: false,
              category: 'extraction-correction',
              description: JSON.stringify({ corrections, meta: aiAppliedRef.current.meta || null }),
            } as any;
            void apiRequest('POST', '/api/ai/feedback', fb).catch(() => {});
          }
        }
      } catch {}

      // Compute totals
      const subtotal = calculateSubtotal();
      const discountTotal = calculateTotalDiscount();
      const taxTotal = calculateTotalTax();
      const total = subtotal + taxTotal;

      const payload = {
        invoice_number: invoiceNumber || undefined,
        customer_id: customer,
        date: invoiceDate ? invoiceDate.toISOString() : new Date().toISOString(),
        due_date: dueDate ? dueDate.toISOString() : invoiceDate?.toISOString() || new Date().toISOString(),
        status: 'draft',
        currency,
        fx_rate: exchangeRate.toString(),
        subtotal: subtotal.toFixed(2),
        tax_total: taxTotal.toFixed(2),
        total: total.toFixed(2),
        paid_amount: '0',
        notes: poNumber ? `${t('forms.poNumber', { defaultValue: 'PO#' })}: ${poNumber}\n${notes || ''}`.trim() : (notes || undefined),
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
        }))
      };

      const res = await apiRequest('POST', '/api/sales/invoices', payload);
      const created = await res.json();
      toast({ 
        title: t('common.saved', { defaultValue: 'Saved' }), 
        description: t('sales.invoices.draftSaved', { defaultValue: 'Invoice draft saved' }) 
      });
      // Navigate to invoice detail page
      navigate(`/sales/invoices/${created.id}`);
    } catch (error: any) {
      toast({ 
        title: t('common.error'), 
        description: error?.message || t('sales.invoices.saveFailed', { defaultValue: 'Failed to save draft' }), 
        variant: 'destructive' 
      });
    }
  };

  const handleSend = async () => {
    try {
      // Validate form first
      if (!validateForm()) {
        toast({ 
          title: t('common.error'), 
          description: t('forms.pleaseFixErrors', { defaultValue: 'Please fix the errors before sending' }), 
          variant: 'destructive' 
        });
        return;
      }

      // Compute totals
      const subtotal = calculateSubtotal();
      const taxTotal = calculateTotalTax();
      const total = subtotal + taxTotal;

      const payload = {
        invoice_number: invoiceNumber || undefined,
        customer_id: customer,
        date: invoiceDate ? invoiceDate.toISOString() : new Date().toISOString(),
        due_date: dueDate ? dueDate.toISOString() : invoiceDate?.toISOString() || new Date().toISOString(),
        status: 'sent', // Mark as sent directly
        currency,
        fx_rate: exchangeRate.toString(),
        subtotal: subtotal.toFixed(2),
        tax_total: taxTotal.toFixed(2),
        total: total.toFixed(2),
        paid_amount: '0',
        notes: poNumber ? `${t('forms.poNumber', { defaultValue: 'PO#' })}: ${poNumber}\n${notes || ''}`.trim() : (notes || undefined),
        lines: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.rate,
          tax_rate: item.taxRate,
          discount_percentage: item.discount || 0,
          amount: item.amount,
          project_id: item.projectId,
          item_id: item.itemId,
        }))
      };

      const res = await apiRequest('POST', '/api/sales/invoices', payload);
      const created = await res.json();
      
      // Send the invoice
      await apiRequest('POST', `/api/sales/invoices/${created.id}/send`, {});
      
      toast({ 
        title: t('sales.invoices.sent', { defaultValue: 'Invoice sent' }), 
        description: t('sales.invoices.emailQueued', { defaultValue: 'Email queued for delivery' }) 
      });
      navigate(`/sales/invoices/${created.id}`);
    } catch (error: any) {
      toast({ 
        title: t('common.error'), 
        description: error?.message || t('sales.invoices.sendFailed', { defaultValue: 'Failed to send invoice' }), 
        variant: 'destructive' 
      });
    }
  };

  // Helpers to control apply toggles in bulk and defaults
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
    try {
      localStorage.setItem('ai.applyDefaults.invoices', JSON.stringify(next));
    } catch {}
  };

  const resetApplyDefaults = () => {
    try { localStorage.removeItem('ai.applyDefaults.invoices'); } catch {}
    if (!extracted) return;
    setApplyFields({
      invoice_number: !!extracted.invoice_number,
      invoice_date: !!extracted.date,
      due_date: !!extracted.due_date,
      total: !!extracted.total,
      notes_vendor: !!extracted.vendor_name,
      notes_text: !!extracted.notes,
    });
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
      setNotes(prev => `${prev ? prev + '\n' : ''}${t('ai.vendorDetected',{defaultValue:'Vendor'})}: ${extracted.vendor_name}`.trim());
    }
    if (applyFields.notes_text && extracted.notes) {
      setNotes(prev => `${prev ? prev + '\n' : ''}${extracted.notes}`.trim());
    }
    // Save snapshot of applied values for later correction logging
    try {
      const totalNum = parseFloat((extracted.total ?? '').toString());
      aiAppliedRef.current = {
        values: {
          invoice_number: applyFields.invoice_number ? (extracted.invoice_number || undefined) : undefined,
          invoice_date: applyFields.invoice_date ? (toISODate(extracted.date) || undefined) : undefined,
          due_date: applyFields.due_date ? (toISODate(extracted.due_date) || undefined) : undefined,
          total: applyFields.total && !isNaN(totalNum) ? totalNum : undefined,
          notes_vendor: !!(applyFields.notes_vendor && extracted.vendor_name),
          notes_text: !!(applyFields.notes_text && extracted.notes),
        },
        meta: extracted.meta,
      };
    } catch {}
    // Lightweight feedback logging (non-blocking)
    try {
      const fields = ['invoice_number','date','due_date','total','currency','vendor_name','notes'];
      const { percent } = computeCompleteness(extracted, fields);
      const applied = {
        invoice_number: !!(applyFields.invoice_number && extracted.invoice_number),
        date: !!(applyFields.invoice_date && extracted.date),
        due_date: !!(applyFields.due_date && extracted.due_date),
        total: !!(applyFields.total && extracted.total),
        notes_vendor: !!(applyFields.notes_vendor && extracted.vendor_name),
        notes_text: !!(applyFields.notes_text && extracted.notes),
      };
      const fb = {
        source: 'sales-invoice',
        accepted: true,
        category: 'extraction-apply',
        confidence: percent / 100,
        amount: !isNaN(totalNum) ? totalNum : undefined,
        description: JSON.stringify({ applied, meta: extracted.meta || null }),
      } as any;
      void apiRequest('POST', '/api/ai/feedback', fb).catch(() => {});
    } catch {}
    setPreviewOpen(false);
    setScanOpen(false);
    setExtracted(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${isMobile ? 'space-y-4' : 'flex items-center justify-between'}`}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/sales/invoices')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-foreground`}>{t('forms.createInvoice')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('forms.createInvoiceDesc', { defaultValue: 'Create a new sales invoice' })}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 ${isMobile ? 'flex-col sm:flex-row' : ''}`}>
          <Button variant="outline" onClick={handleSave} data-testid="button-save-invoice" className={isMobile ? 'w-full sm:w-auto' : ''}>
            <Save className="h-4 w-4 me-2" />
            {t('forms.saveDraft')}
          </Button>
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
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <DialogTitle>{t('ai.previewExtraction', { defaultValue: 'Preview extracted fields' })}</DialogTitle>
                  <div className="flex items-center gap-2">
                    {extracted && (() => {
                      const fields = ['invoice_number','date','due_date','total','currency','vendor_name','notes'];
                      const { count, total, percent } = computeCompleteness(extracted, fields);
                      return <Badge variant="secondary" className="text-xs">{t('ai.completeness',{defaultValue:'Complete'})}: {count}/{total} ({percent}%)</Badge>;
                    })()}
                    <Button size="sm" variant="ghost" onClick={() => setAllApply(true)}>{t('common.all',{defaultValue:'All'})}</Button>
                    <Button size="sm" variant="ghost" onClick={() => setAllApply(false)}>{t('common.none',{defaultValue:'None'})}</Button>
                    <Button size="sm" variant="ghost" onClick={resetApplyDefaults}>{t('common.reset',{defaultValue:'Reset defaults'})}</Button>
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
                      notes_vendor: t('ai.vendor', { defaultValue: 'Vendor' }),
                      notes_text: t('common.notes'),
                    }}
                    bestMatch={bestCustomerMatch ? {
                      label: t('ai.customerMatch',{defaultValue:'Suggested customer'}),
                      name: bestCustomerMatch.customer.name,
                      actionLabel: t('ai.useCustomer',{defaultValue:'Use customer'}),
                      onUse: () => setCustomer(bestCustomerMatch.customer.id)
                    } : null}
                  />
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
                  <Button onClick={applyExtracted}>{t('common.apply', { defaultValue: 'Apply' })}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSend} data-testid="button-send-invoice" className={isMobile ? 'w-full sm:w-auto' : ''}>
            <Send className="h-4 w-4 me-2" />
            {t('forms.sendInvoice')}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Invoice Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-invoice-details">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('forms.invoiceDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-number">{t('forms.invoiceNumber')}</Label>
                <Input
                  id="invoice-number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder={t('forms.autoGenerated', { defaultValue: 'Auto-generated' })}
                  data-testid="input-invoice-number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="po-number">{t('forms.poNumber', { defaultValue: 'PO Number' })}</Label>
                <Input
                  id="po-number"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder={t('forms.optional', { defaultValue: 'Optional' })}
                  data-testid="input-po-number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('forms.invoiceDate')} *</Label>
                <DatePicker
                  value={invoiceDate}
                  onChange={setInvoiceDate}
                  placeholder={t('forms.selectDate')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('forms.paymentTerms', { defaultValue: 'Payment Terms' })}</Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TERMS.map((term) => (
                      <SelectItem key={term.value} value={term.value}>
                        {term.value === 'due_on_receipt' ? t('forms.dueOnReceipt', { defaultValue: 'Due on Receipt' }) :
                         term.value === 'custom' ? t('forms.custom', { defaultValue: 'Custom' }) :
                         t('forms.netDays', { days: term.days, defaultValue: `Net ${term.days} Days` })}
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
                onChange={(date) => {
                  setDueDate(date);
                  setPaymentTerms('custom');
                }}
                placeholder={t('forms.selectDate')}
                minDate={invoiceDate}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('forms.currency', { defaultValue: 'Currency' })}</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('forms.selectCurrency', { defaultValue: 'Select Currency' })} />
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
                <Label>{t('forms.exchangeRate', { defaultValue: 'Exchange Rate' })}</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
                  disabled={!currency || currency === companySettings?.base_currency}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-customer-details">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('forms.customerDetails')}
            </CardTitle>
            <CardDescription>
              {t('forms.customerDetailsDesc', { defaultValue: 'Select the customer for this invoice' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('forms.customer')} *</Label>
              <Select value={customer} onValueChange={setCustomer}>
                <SelectTrigger data-testid="select-customer" className={!customer && validationErrors.length > 0 ? 'border-destructive' : ''}>
                  <SelectValue placeholder={t('forms.selectCustomer')} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((cust) => (
                    <SelectItem key={cust.id} value={cust.id}>
                      {cust.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {customer && (
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <p className="font-medium">
                  {customers.find(c => c.id === customer)?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {customers.find(c => c.id === customer)?.email}
                </p>
              </div>
            )}
            {customers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t('forms.noCustomersFound', { defaultValue: 'No customers found. Add customers in Contacts page.' })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card data-testid="card-line-items">
        <CardHeader>
          <div className={`${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {t('forms.lineItems')}
              </CardTitle>
              <CardDescription className="mt-1">
                {t('forms.lineItemsDesc', { defaultValue: 'Add products or services to the invoice' })}
              </CardDescription>
            </div>
            <Button onClick={addLineItem} size="sm" data-testid="button-add-line-item" className={isMobile ? 'w-full sm:w-auto' : ''}>
              <Plus className="h-4 w-4 me-2" />
              {t('forms.addItem')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3 bg-card">
                  <div className="flex justify-between items-start">
                    <Label className="text-base font-semibold">{t('forms.itemLabel', { index: index + 1, defaultValue: `Item ${index + 1}` })}</Label>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => duplicateLineItem(item.id)}
                        title={t('common.duplicate', { defaultValue: 'Duplicate' })}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeLineItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Product Selection */}
                  {items.length > 0 && (
                    <div className="space-y-2">
                      <Label>{t('forms.selectProduct', { defaultValue: 'Select Product' })}</Label>
                      <Select 
                        value={item.itemId || "none"} 
                        onValueChange={(value) => {
                          if (value !== "none") handleItemSelect(item.id, value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('forms.orTypeManually', { defaultValue: 'Or type manually below' })} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('forms.manualEntry', { defaultValue: 'Manual Entry' })}</SelectItem>
                          {items.map((prod) => (
                            <SelectItem key={prod.id} value={prod.id}>
                              <div className="flex items-center gap-2">
                                <Package className="h-3 w-3" />
                                {prod.code ? `${prod.code} - ` : ''}{prod.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>{t('forms.description')} *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      placeholder={t('forms.itemDescriptionPlaceholder')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>{t('forms.quantity')}</Label>
                      <NumericInput
                        step="any"
                        inputMode="decimal"
                        value={item.quantity}
                        onValueChange={(num) => updateLineItem(item.id, 'quantity', num || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('forms.rate')} *</Label>
                      <NumericInput
                        step="any"
                        inputMode="decimal"
                        value={item.rate}
                        onValueChange={(num) => updateLineItem(item.id, 'rate', num)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>{t('forms.discount', { defaultValue: 'Discount %' })}</Label>
                      <NumericInput
                        step="0.01"
                        min={0}
                        max={100}
                        inputMode="decimal"
                        value={item.discount || 0}
                        onValueChange={(num) => updateLineItem(item.id, 'discount', Math.min(100, Math.max(0, num)))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('forms.tax')}</Label>
                      <Select 
                        value={item.taxRate.toString()} 
                        onValueChange={(value) => updateLineItem(item.id, 'taxRate', parseFloat(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">{t('forms.noTax', { defaultValue: 'No Tax (0%)' })}</SelectItem>
                          {taxRates.map((tax) => (
                            <SelectItem key={tax.id} value={tax.rate.toString()}>
                              {tax.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('forms.amount')}</Label>
                      <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50 font-mono text-sm">
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('forms.project', { defaultValue: 'Project' })}</Label>
                    <Select 
                      value={item.projectId || "none"} 
                      onValueChange={(value) => updateLineItem(item.id, 'projectId', value === "none" ? undefined : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('forms.selectProject')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('forms.none')}</SelectItem>
                        {projects.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.code} - {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              {lineItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  {t('forms.noItems')}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[1000px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">{t('forms.description')}</TableHead>
                    <TableHead className="w-[8%]">{t('forms.quantity')}</TableHead>
                    <TableHead className="w-[12%]">{t('forms.rate')}</TableHead>
                    <TableHead className="w-[8%]">{t('forms.discount', { defaultValue: 'Disc %' })}</TableHead>
                    <TableHead className="w-[12%]">{t('forms.tax')}</TableHead>
                    <TableHead className="w-[12%]">{t('forms.project', { defaultValue: 'Project' })}</TableHead>
                    <TableHead className="w-[12%] text-end">{t('forms.amount')}</TableHead>
                    <TableHead className="w-[6%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="space-y-1">
                          {items.length > 0 && (
                            <Select 
                              value={item.itemId || "none"} 
                              onValueChange={(value) => {
                                if (value !== "none") handleItemSelect(item.id, value);
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder={t('forms.selectProduct', { defaultValue: 'Select product...' })} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">{t('forms.manualEntry', { defaultValue: 'Manual Entry' })}</SelectItem>
                                {items.map((prod) => (
                                  <SelectItem key={prod.id} value={prod.id}>
                                    {prod.code ? `${prod.code} - ` : ''}{prod.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <Input
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                            placeholder={t('forms.itemDescriptionPlaceholder')}
                            className="min-w-[180px]"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <NumericInput
                          step="any"
                          inputMode="decimal"
                          value={item.quantity}
                          onValueChange={(num) => updateLineItem(item.id, 'quantity', num || 1)}
                          className="min-w-[70px]"
                        />
                      </TableCell>
                      <TableCell>
                        <NumericInput
                          step="any"
                          inputMode="decimal"
                          value={item.rate}
                          onValueChange={(num) => updateLineItem(item.id, 'rate', num)}
                          className="min-w-[90px]"
                        />
                      </TableCell>
                      <TableCell>
                        <NumericInput
                          step="0.01"
                          min={0}
                          max={100}
                          inputMode="decimal"
                          value={item.discount || 0}
                          onValueChange={(num) => updateLineItem(item.id, 'discount', Math.min(100, Math.max(0, num)))}
                          className="min-w-[60px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={item.taxRate.toString()} 
                          onValueChange={(value) => updateLineItem(item.id, 'taxRate', parseFloat(value))}
                        >
                          <SelectTrigger className="min-w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">{t('forms.noTax', { defaultValue: 'No Tax (0%)' })}</SelectItem>
                            {taxRates.map((tax) => (
                              <SelectItem key={tax.id} value={tax.rate.toString()}>
                                {tax.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={item.projectId || "none"} 
                          onValueChange={(value) => updateLineItem(item.id, 'projectId', value === "none" ? undefined : value)}
                        >
                          <SelectTrigger className="min-w-[100px]">
                            <SelectValue placeholder={t('forms.none')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t('forms.none')}</SelectItem>
                            {projects.map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.code} - {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-end">
                        <span className="font-mono text-sm">{formatCurrency(item.amount)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => duplicateLineItem(item.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title={t('common.duplicate', { defaultValue: 'Duplicate' })}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLineItem(item.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('forms.subtotal')}</span>
                <span className="font-mono">{formatCurrency(calculateSubtotal() + calculateTotalDiscount())}</span>
              </div>
              {calculateTotalDiscount() > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    {t('forms.discount', { defaultValue: 'Discount' })}
                  </span>
                  <span className="font-mono">-{formatCurrency(calculateTotalDiscount())}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>{t('forms.netAmount', { defaultValue: 'Net Amount' })}</span>
                <span className="font-mono">{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('forms.tax')} ({defaultTaxRate}%)</span>
                <span className="font-mono">{formatCurrency(calculateTotalTax())}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>{t('forms.total')}</span>
                <span className="font-mono">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card data-testid="card-notes">
        <CardHeader>
          <CardTitle>{t('forms.notesAndTerms')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={t('forms.notesPlaceholder')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            data-testid="textarea-notes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
