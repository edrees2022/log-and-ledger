import { useEffect, useMemo, useState, forwardRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Save,
  Copy,
  AlertCircle,
  Percent,
  Package,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Numeric input component
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
  accountId?: string;
  trackingType?: 'none' | 'batch' | 'serial';
  serialNumbers?: string[];
  batchId?: string;
  batchInfo?: {
    batchNumber?: string;
    expiryDate?: string;
  };
}

interface BillFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editBillId?: string | null;
}

export function BillFormDialog({ open, onOpenChange, onSuccess, editBillId }: BillFormDialogProps) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Form state
  const [billNumber, setBillNumber] = useState("");
  const [supplier, setSupplier] = useState("");
  const [billDate, setBillDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [supplierReference, setSupplierReference] = useState("");
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState("");
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [defaultTaxRate, setDefaultTaxRate] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");

  // Queries
  const { data: contactsData = [] } = useQuery<any[]>({ queryKey: ["/api/contacts"] });
  const suppliers = useMemo(() => (
    (contactsData || [])
      .filter((contact: any) => contact?.type === 'supplier' || contact?.type === 'both')
      .map((c: any) => ({ id: c.id, name: c.name }))
  ), [contactsData]);

  const { data: projects = [] } = useQuery<any[]>({ queryKey: ["/api/projects"] });
  const { data: warehouses = [] } = useQuery<any[]>({ queryKey: ["/api/inventory/warehouses"] });
  
  const { data: itemsData = [] } = useQuery<any[]>({ queryKey: ["/api/items"] });
  const items = useMemo(() => (
    (itemsData || [])
      .filter((item: any) => item.type === 'inventory' || item.type === 'product')
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        type: item.type,
        price: parseFloat(item.cost_price || item.price || '0'),
        taxId: item.default_tax_id,
        trackingType: item.tracking_type || 'none',
      }))
  ), [itemsData]);

  const { data: taxRatesData = [] } = useQuery<any[]>({ queryKey: ["/api/taxes"] });
  const taxRates = useMemo(() => (
    (taxRatesData || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      rate: parseFloat(t.rate || '0'),
    }))
  ), [taxRatesData]);

  const { data: currencies = [] } = useQuery<any[]>({ queryKey: ["/api/currencies"] });
  const { data: companySettings } = useQuery<any>({ queryKey: ["/api/settings/company"] });
  
  // Fetch default accounts for the company
  const { data: defaultAccounts } = useQuery<any>({
    queryKey: ["/api/settings/default-accounts"],
  });
  
  // Fetch expense accounts (type = expense or cogs)
  const { data: allAccounts = [] } = useQuery<any[]>({ queryKey: ["/api/accounts"] });
  const expenseAccounts = useMemo(() => 
    (allAccounts || []).filter((a: any) => a.type === 'expense' || a.type === 'cogs'),
    [allAccounts]
  );

  // Set default currency
  useEffect(() => {
    if (!currency && companySettings?.base_currency) {
      setCurrency(companySettings.base_currency);
    }
  }, [companySettings, currency]);

  // Set default warehouse
  useEffect(() => {
    if (!selectedWarehouse && warehouses.length > 0) {
      const defaultW = warehouses.find((w: any) => w.is_default) || warehouses[0];
      if (defaultW) setSelectedWarehouse(defaultW.id);
    }
  }, [warehouses, selectedWarehouse]);

  // Set default due date (30 days)
  useEffect(() => {
    if (billDate && !dueDate) {
      const due = new Date(billDate);
      due.setDate(due.getDate() + 30);
      setDueDate(due);
    }
  }, [billDate, dueDate]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open && !editBillId) {
      setBillNumber("");
      setSupplier("");
      setBillDate(new Date());
      setDueDate(undefined);
      setSupplierReference("");
      setNotes("");
      setValidationErrors([]);
      setLineItems([{
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        rate: 0,
        taxRate: defaultTaxRate,
        discount: 0,
        amount: 0,
      }]);
    }
  }, [open, editBillId, defaultTaxRate]);

  // Line items management
  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      taxRate: defaultTaxRate,
      discount: 0,
      amount: 0,
      warehouseId: selectedWarehouse,
      accountId: defaultAccounts?.default_purchase_account_id || undefined,
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

  const handleItemSelect = (lineId: string, itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      let taxRate = defaultTaxRate;
      if (item.taxId) {
        const tax = taxRates.find(t => t.id === item.taxId);
        if (tax) taxRate = tax.rate;
      }
      
      // Get the item's purchase account or fall back to default
      const selectedItem = (itemsData || []).find((i: any) => i.id === itemId);
      const itemAccountId = selectedItem?.purchase_account_id || defaultAccounts?.default_purchase_account_id;
      
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
            accountId: itemAccountId,
            trackingType: item.trackingType || 'none',
            serialNumbers: [],
            batchId: undefined,
            batchInfo: undefined,
            warehouseId: selectedWarehouse,
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
    if (!supplier) errors.push(t('validation.selectVendor'));
    if (!billDate) errors.push(t('validation.billDateRequired'));
    if (!dueDate) errors.push(t('validation.dueDateRequired'));
    if (lineItems.length === 0) errors.push(t('forms.atLeastOneItem'));
    const hasEmptyItem = lineItems.some(item => !item.description.trim() || item.rate <= 0);
    if (hasEmptyItem) errors.push(t('forms.itemsIncomplete'));
    
    // Validate tracking
    for (const item of lineItems) {
      if (item.trackingType === 'serial') {
        const serialCount = item.serialNumbers?.length || 0;
        if (serialCount !== item.quantity) {
          errors.push(t('inventory.serialCountMismatch', { 
            defaultValue: `يجب إدخال ${item.quantity} أرقام تسلسلية للصنف: ${item.description}`,
            count: item.quantity 
          }));
        }
      } else if (item.trackingType === 'batch') {
        if (!item.batchInfo?.batchNumber) {
          errors.push(t('inventory.batchRequired', { 
            defaultValue: `يجب إدخال رقم الدفعة للصنف: ${item.description}` 
          }));
        }
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Create bill mutation
  const createBillMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/purchases/bills', data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create bill');
      }
      return res.json();
    },
    onSuccess: async (data) => {
      // Create serials/batches for tracked items
      for (const item of lineItems) {
        if (item.itemId && item.trackingType === 'serial' && item.serialNumbers?.length) {
          await apiRequest('POST', '/api/inventory/serials', {
            item_id: item.itemId,
            warehouse_id: item.warehouseId || selectedWarehouse,
            serial_numbers: item.serialNumbers,
          });
        } else if (item.itemId && item.trackingType === 'batch' && item.batchInfo?.batchNumber) {
          await apiRequest('POST', '/api/inventory/batches', {
            item_id: item.itemId,
            warehouse_id: item.warehouseId || selectedWarehouse,
            batch_number: item.batchInfo.batchNumber,
            quantity: item.quantity,
            expiry_date: item.batchInfo.expiryDate,
          });
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/purchases/bills'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/serials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/batches'] });
      onOpenChange(false);
      onSuccess?.();
      toast({
        title: t('common.success'),
        description: t('purchases.bills.billCreated'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!validateForm()) return;

    const billData = {
      supplier_id: supplier,
      supplier_reference: supplierReference,
      bill_date: billDate?.toISOString(),
      date: billDate?.toISOString(),
      due_date: dueDate?.toISOString(),
      currency,
      fx_rate: exchangeRate.toString(),
      subtotal: calculateSubtotal().toString(),
      tax_total: calculateTotalTax().toString(),
      total: calculateTotal().toString(),
      notes,
      status: 'draft',
      lines: lineItems.map((item, index) => ({
        line_number: index + 1,
        item_id: item.itemId,
        description: item.description,
        quantity: item.quantity.toString(),
        unit_price: item.rate.toString(),
        discount_percent: item.discount?.toString() || '0',
        tax_rate: item.taxRate.toString(),
        line_total: item.amount.toString(),
        project_id: item.projectId,
        warehouse_id: item.warehouseId || selectedWarehouse,
        account_id: item.accountId,
      })),
    };

    createBillMutation.mutate(billData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {editBillId ? t('purchases.bills.editBill') : t('purchases.bills.newBill')}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)] px-6">
          <div className="space-y-6 pb-4">
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {validationErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Header Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>{t('purchases.bills.supplier')} *</Label>
                <Select value={supplier} onValueChange={setSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('forms.selectSupplier')} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('purchases.bills.supplierReference')}</Label>
                <Input
                  value={supplierReference}
                  onChange={(e) => setSupplierReference(e.target.value)}
                  placeholder={t('purchases.bills.supplierReferencePlaceholder', { defaultValue: 'INV-001' })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('purchases.bills.billDate')} *</Label>
                <DatePicker
                  value={billDate}
                  onChange={setBillDate}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('sales.invoices.dueDate')} *</Label>
                <DatePicker
                  value={dueDate}
                  onChange={setDueDate}
                />
              </div>
            </div>

            {/* Warehouse & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>{t('inventory.warehouse')}</Label>
                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('inventory.selectWarehouse')} />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w: any) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('common.currency')}</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c: any) => (
                      <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">{t('forms.items')}</Label>
                <Button onClick={addLineItem} size="sm" variant="outline">
                  <Plus className="h-4 w-4 me-1" />
                  {t('forms.addItem')}
                </Button>
              </div>

              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
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
                    
                    {/* Product & Description */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{t('forms.product')}</Label>
                        <Select value={item.itemId || "none"} onValueChange={(value) => { if (value !== "none") handleItemSelect(item.id, value); }}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('forms.selectProduct')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t('forms.manualEntry')}</SelectItem>
                            {items.map((prod) => (
                              <SelectItem key={prod.id} value={prod.id}>
                                {prod.code ? `${prod.code} - ` : ''}{prod.name}
                                {prod.trackingType !== 'none' && (
                                  <Badge variant="outline" className="ms-2 text-xs">
                                    {prod.trackingType === 'serial' ? t('inventory.serial') : t('inventory.batch')}
                                  </Badge>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{t('forms.description')}</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          placeholder={t('forms.itemDescriptionPlaceholder')}
                        />
                      </div>
                    </div>
                    
                    {/* Numbers Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{t('forms.quantity')}</Label>
                        <NumericInput
                          value={item.quantity}
                          onValueChange={(num) => updateLineItem(item.id, 'quantity', num || 1)}
                          step="any"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{t('forms.rate')}</Label>
                        <NumericInput
                          value={item.rate}
                          onValueChange={(num) => updateLineItem(item.id, 'rate', num)}
                          step="any"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{t('forms.discount')} %</Label>
                        <NumericInput
                          value={item.discount || 0}
                          onValueChange={(num) => updateLineItem(item.id, 'discount', Math.min(100, Math.max(0, num)))}
                          min={0}
                          max={100}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{t('forms.tax')}</Label>
                        <Select value={item.taxRate.toString()} onValueChange={(value) => updateLineItem(item.id, 'taxRate', parseFloat(value))}>
                          <SelectTrigger>
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
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{t('forms.amount')}</Label>
                        <div className="h-10 flex items-center justify-end px-3 bg-primary/10 border border-primary/20 rounded-md font-mono font-bold text-primary">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Tracking Row */}
                    {item.itemId && item.trackingType && item.trackingType !== 'none' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1">
                            {item.trackingType === 'serial' 
                              ? t('inventory.serialNumbers', { defaultValue: 'الأرقام التسلسلية' })
                              : t('inventory.batchInfo', { defaultValue: 'بيانات الدفعة' })
                            }
                            <Badge variant="secondary" className="text-xs">
                              {item.trackingType === 'serial' ? t('inventory.required') : t('inventory.required')}
                            </Badge>
                          </Label>
                          <TrackingSelector
                            mode="purchases"
                            itemId={item.itemId}
                            warehouseId={item.warehouseId || selectedWarehouse}
                            trackingType={item.trackingType as 'serial' | 'batch'}
                            quantity={item.quantity}
                            newSerialNumbers={item.serialNumbers}
                            newBatchInfo={item.batchInfo}
                            onNewSerialsChange={(serials) => updateLineItem(item.id, 'serialNumbers', serials)}
                            onNewBatchChange={(info) => updateLineItem(item.id, 'batchInfo', info)}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{t('forms.project')}</Label>
                          <Select value={item.projectId || "none"} onValueChange={(value) => updateLineItem(item.id, 'projectId', value === "none" ? undefined : value)}>
                            <SelectTrigger>
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
                      </div>
                    )}
                    
                    {/* Expense Account Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{t('forms.expenseAccount')}</Label>
                        <Select value={item.accountId || "default"} onValueChange={(value) => updateLineItem(item.id, 'accountId', value === "default" ? undefined : value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('forms.defaultAccount')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">{t('forms.defaultAccount')}</SelectItem>
                            {expenseAccounts.map((acc: any) => (
                              <SelectItem key={acc.id} value={acc.id}>
                                {acc.code} - {i18n.language === 'ar' && acc.name_ar ? acc.name_ar : acc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Project selector for non-tracked items */}
                      {(!item.itemId || !item.trackingType || item.trackingType === 'none') && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{t('forms.project')}</Label>
                          <Select value={item.projectId || "none"} onValueChange={(value) => updateLineItem(item.id, 'projectId', value === "none" ? undefined : value)}>
                            <SelectTrigger>
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
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full sm:w-80 space-y-2 text-sm">
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
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>{t('common.notes')}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('placeholders.additionalNotes')}
                rows={3}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={createBillMutation.isPending}>
            <Save className="h-4 w-4 me-2" />
            {createBillMutation.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
