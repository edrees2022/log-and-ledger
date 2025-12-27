import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
  ArrowLeft,
  Copy,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

export default function InvoiceEditPage() {
  const { t, i18n } = useTranslation();
  const [, params] = useRoute('/sales/invoices/:id/edit');
  const id = params?.id as string;
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customer, setCustomer] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [paymentTerms, setPaymentTerms] = useState("custom");
  const [poNumber, setPoNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [defaultTaxRate, setDefaultTaxRate] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch invoice data
  const { data: invoice, isLoading: invoiceLoading, error: invoiceError } = useQuery<any>({
    queryKey: ['/api/sales/invoices', id],
    enabled: !!id,
  });

  // Fetch customers
  const { data: contactsData = [] } = useQuery<any[]>({ queryKey: ['/api/contacts'] });
  const customers = useMemo(() => (
    (contactsData || [])
      .filter((contact: any) => contact?.type === 'customer' || contact?.type === 'both')
      .map((c: any) => ({ id: c.id, name: c.name, email: c.email || '' }))
  ), [contactsData]);

  // Fetch taxes
  const { data: taxesData = [] } = useQuery<any[]>({ queryKey: ['/api/taxes'] });
  const taxRates = useMemo(() => (
    (taxesData || [])
      .filter((t: any) => t?.is_active)
      .map((t: any) => ({
        id: t.id,
        name: `${t.name} (${t.rate}%)`,
        rate: parseFloat(t.rate || '0'),
      }))
  ), [taxesData]);

  // Fetch items for product selection
  const { data: itemsData = [] } = useQuery<any[]>({ queryKey: ["/api/items"] });
  const items = useMemo(() => (
    (itemsData || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      price: parseFloat(item.sell_price || item.price || '0'),
      taxId: item.default_tax_id,
    }))
  ), [itemsData]);

  // Fetch company settings
  const { data: companySettings } = useQuery<any>({ queryKey: ["/api/settings/company"] });

  // Initialize form from invoice data
  useEffect(() => {
    if (invoice && !isLoaded) {
      setInvoiceNumber(invoice.invoice_number || '');
      setCustomer(invoice.customer_id || '');
      setInvoiceDate(invoice.date ? new Date(invoice.date) : undefined);
      setDueDate(invoice.due_date ? new Date(invoice.due_date) : undefined);
      setCurrency(invoice.currency || 'USD');
      setExchangeRate(parseFloat(invoice.fx_rate || '1'));
      
      // Extract PO from notes if present
      const notesText = invoice.notes || '';
      const poMatch = notesText.match(/PO#?:\s*([^\n]+)/i);
      if (poMatch) {
        setPoNumber(poMatch[1].trim());
        setNotes(notesText.replace(/PO#?:\s*[^\n]+\n?/i, '').trim());
      } else {
        setNotes(notesText);
      }
      
      // Set line items
      if (invoice.lines && invoice.lines.length > 0) {
        setLineItems(invoice.lines.map((line: any, index: number) => ({
          id: line.id || `${Date.now()}-${index}`,
          description: line.description || '',
          quantity: Number(line.quantity || 1),
          rate: Number(line.unit_price || 0),
          taxRate: Number(line.tax_rate || 0),
          discount: Number(line.discount_percentage || 0),
          amount: Number(line.amount || 0),
          projectId: line.project_id,
          itemId: line.item_id,
        })));
      } else {
        setLineItems([{
          id: '1',
          description: '',
          quantity: 1,
          rate: 0,
          taxRate: defaultTaxRate,
          discount: 0,
          amount: 0,
        }]);
      }
      
      setIsLoaded(true);
    }
  }, [invoice, isLoaded, defaultTaxRate]);

  // Set default tax from company settings
  useEffect(() => {
    if (companySettings) {
      const rate = parseFloat(companySettings.default_tax_rate || '0');
      setDefaultTaxRate(rate);
    }
  }, [companySettings]);

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

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      taxRate: defaultTaxRate,
      discount: 0,
      amount: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const duplicateLineItem = (itemId: string) => {
    const item = lineItems.find(i => i.id === itemId);
    if (item) {
      const newItem: LineItem = { ...item, id: Date.now().toString() };
      const index = lineItems.findIndex(i => i.id === itemId);
      const newItems = [...lineItems];
      newItems.splice(index + 1, 0, newItem);
      setLineItems(newItems);
    }
  };

  const removeLineItem = (itemId: string) => {
    if (lineItems.length <= 1) {
      toast({ title: t('common.error'), description: t('forms.atLeastOneItem'), variant: 'destructive' });
      return;
    }
    setLineItems(lineItems.filter(item => item.id !== itemId));
  };

  const updateLineItem = (itemId: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === itemId) {
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

  const handleItemSelect = (lineId: string, selectedItemId: string) => {
    const item = items.find(i => i.id === selectedItemId);
    if (item) {
      let taxRate = defaultTaxRate;
      if (item.taxId) {
        const tax = taxRates.find(t => t.id === item.taxId);
        if (tax) taxRate = tax.rate;
      }
      
      setLineItems(lineItems.map(line => {
        if (line.id === lineId) {
          const rate = item.price;
          const amount = line.quantity * rate;
          return { ...line, itemId: selectedItemId, description: item.name, rate, taxRate, amount };
        }
        return line;
      }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: currency || 'USD' }).format(amount);
  };

  const calculateSubtotal = () => lineItems.reduce((sum, item) => sum + item.amount, 0);
  const calculateTotalTax = () => lineItems.reduce((sum, item) => sum + (item.amount * item.taxRate) / 100, 0);
  const calculateTotal = () => calculateSubtotal() + calculateTotalTax();

  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!customer) errors.push(t('forms.customerRequired', { defaultValue: 'Customer is required' }));
    if (!invoiceDate) errors.push(t('forms.invoiceDateRequired', { defaultValue: 'Invoice date is required' }));
    if (!dueDate) errors.push(t('forms.dueDateRequired', { defaultValue: 'Due date is required' }));
    if (lineItems.length === 0) errors.push(t('forms.atLeastOneItem', { defaultValue: 'At least one item is required' }));
    if (lineItems.some(item => !item.description.trim() || item.rate <= 0)) {
      errors.push(t('forms.itemsIncomplete', { defaultValue: 'All items must have description and price' }));
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest('PUT', `/api/sales/invoices/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/invoices', id] });
      toast({ title: t('common.saved'), description: t('sales.invoices.updated', { defaultValue: 'Invoice updated' }) });
      navigate(`/sales/invoices/${id}`);
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error?.message || t('sales.invoices.updateFailed', { defaultValue: 'Failed to update invoice' }), variant: 'destructive' });
    },
  });

  const handleSave = async () => {
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
      date: invoiceDate?.toISOString(),
      due_date: dueDate?.toISOString(),
      currency,
      fx_rate: exchangeRate.toString(),
      subtotal: subtotal.toFixed(2),
      tax_total: taxTotal.toFixed(2),
      total: total.toFixed(2),
      notes: poNumber ? `PO#: ${poNumber}\n${notes || ''}`.trim() : (notes || undefined),
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

    updateMutation.mutate(payload);
  };

  if (invoiceLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (invoiceError || !invoice) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t('common.errorLoadingData')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Only allow editing draft invoices
  if (invoice.status !== 'draft') {
    return (
      <div className="p-6 space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('sales.invoices.cannotEditNonDraft', { defaultValue: 'Only draft invoices can be edited. This invoice has already been sent.' })}
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link href={`/sales/invoices/${id}`}>
            <ArrowLeft className="h-4 w-4 me-2" /> {t('common.back')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/sales/invoices/${id}`}>
              <ArrowLeft className="h-4 w-4 me-2" /> {t('common.back')}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('sales.invoices.editInvoice', { defaultValue: 'Edit Invoice' })}</h1>
            <p className="text-sm text-muted-foreground">{invoiceNumber}</p>
          </div>
        </div>
        <Badge variant="secondary">{t('sales.invoices.draft')}</Badge>
      </div>

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

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t('forms.invoiceDetails', { defaultValue: 'Invoice Details' })}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>{t('forms.invoiceNumber')}</Label>
            <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t('common.customer')} *</Label>
            <Select value={customer} onValueChange={setCustomer}>
              <SelectTrigger><SelectValue placeholder={t('forms.selectCustomer')} /></SelectTrigger>
              <SelectContent>
                {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('forms.invoiceDate')} *</Label>
            <DatePicker value={invoiceDate} onChange={setInvoiceDate} />
          </div>
          <div className="space-y-2">
            <Label>{t('forms.paymentTerms')}</Label>
            <Select value={paymentTerms} onValueChange={setPaymentTerms}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_TERMS.map(term => (
                  <SelectItem key={term.value} value={term.value}>
                    {t(`forms.${term.value}`, { defaultValue: term.value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('sales.invoices.dueDate')} *</Label>
            <DatePicker value={dueDate} onChange={setDueDate} />
          </div>
          <div className="space-y-2">
            <Label>{t('forms.poNumber', { defaultValue: 'PO Number' })}</Label>
            <Input value={poNumber} onChange={e => setPoNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t('forms.currency')}</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="SAR">SAR</SelectItem>
                <SelectItem value="AED">AED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('forms.lineItems')}</CardTitle>
          <Button onClick={addLineItem} size="sm">
            <Plus className="h-4 w-4 me-2" /> {t('forms.addItem')}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">{t('forms.description')}</TableHead>
                  <TableHead className="w-20 text-center">{t('forms.quantity')}</TableHead>
                  <TableHead className="w-28 text-end">{t('forms.rate')}</TableHead>
                  <TableHead className="w-20 text-center">{t('forms.discount')}</TableHead>
                  <TableHead className="w-24 text-center">{t('forms.tax')}</TableHead>
                  <TableHead className="w-28 text-end">{t('forms.amount')}</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <Select value={item.itemId || ''} onValueChange={(val) => handleItemSelect(item.id, val)}>
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue placeholder={t('forms.selectProduct', { defaultValue: 'Select product...' })} />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input
                          value={item.description}
                          onChange={e => updateLineItem(item.id, 'description', e.target.value)}
                          placeholder={t('forms.description')}
                          className="h-8"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="text-center h-8"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={e => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="text-end h-8"
                        min="0"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.discount}
                        onChange={e => updateLineItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                        className="text-center h-8"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </TableCell>
                    <TableCell>
                      <Select value={item.taxRate.toString()} onValueChange={(val) => updateLineItem(item.id, 'taxRate', parseFloat(val))}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">{t('forms.noTax', { defaultValue: 'No Tax (0%)' })}</SelectItem>
                          {taxRates.map(tax => (
                            <SelectItem key={tax.id} value={tax.rate.toString()}>{tax.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-end font-mono">
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => duplicateLineItem(item.id)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => removeLineItem(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-end gap-2">
            <div className="flex justify-between w-full max-w-xs">
              <span className="text-muted-foreground">{t('forms.subtotal')}</span>
              <span className="font-mono">{formatCurrency(calculateSubtotal())}</span>
            </div>
            <div className="flex justify-between w-full max-w-xs">
              <span className="text-muted-foreground">{t('forms.tax')}</span>
              <span className="font-mono">{formatCurrency(calculateTotalTax())}</span>
            </div>
            <div className="flex justify-between w-full max-w-xs border-t pt-2">
              <span className="font-semibold">{t('forms.total')}</span>
              <span className="font-mono font-semibold text-lg">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>{t('forms.notes')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={t('forms.notesPlaceholder', { defaultValue: 'Additional notes...' })}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href={`/sales/invoices/${id}`}>{t('common.cancel')}</Link>
        </Button>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 me-2 animate-spin" /> : <Save className="h-4 w-4 me-2" />}
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
}
