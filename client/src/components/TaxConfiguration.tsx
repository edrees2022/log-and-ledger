import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  Calculator,
  Percent,
  Calendar,
  Building,
} from "lucide-react";
import { getCountryList, getPresetsForCountry, getTaxTypeLabel, TaxType } from "@/data/taxPresets";

interface TaxRate {
  id: string;
  name: string;
  code: string;
  rate: number;
  type: 'VAT' | 'Sales Tax' | 'Corporate Tax' | 'Withholding' | 'Custom';
  inclusive: boolean;
  active: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  jurisdiction?: string;
  glAccount: string;
  // Optional threshold settings
  thresholdAmount?: number;
  thresholdPeriod?: 'annual' | 'monthly' | 'rolling12' | string;
  thresholdAppliesTo?: 'turnover' | 'income' | 'other' | string;
}

// Removed demo tax rates. UI starts empty until wired to backend endpoints.

const taxTypes = ['VAT', 'Sales Tax', 'Corporate Tax', 'Withholding', 'Custom'];

export function TaxConfiguration() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { data: taxes = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/taxes"],
  });

  // Adapter: backend -> UI shape
  const taxRates = useMemo<TaxRate[]>(() => {
    const typeToUI = (tax_type: string): TaxRate["type"] => {
      switch (tax_type) {
        case "vat": return "VAT";
        case "sales_tax": return "Sales Tax";
        case "corporate_tax": return "Corporate Tax";
        case "withholding": return "Withholding";
        default: return "Custom";
      }
    };
    return (taxes || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      code: t.code,
      rate: parseFloat(t.rate || "0"),
      type: typeToUI(t.tax_type),
      inclusive: (t.calculation_type || "exclusive") === "inclusive",
      active: !!t.is_active,
      effectiveFrom: t.effective_from ? new Date(t.effective_from).toISOString().slice(0, 10) : "",
      effectiveTo: t.effective_to ? new Date(t.effective_to).toISOString().slice(0, 10) : undefined,
      jurisdiction: t.jurisdiction || "",
      glAccount: t.liability_account_id || "",
      thresholdAmount: t.threshold_amount ? parseFloat(String(t.threshold_amount)) : undefined,
      thresholdPeriod: t.threshold_period || undefined,
      thresholdAppliesTo: t.threshold_applies_to || undefined,
    }));
  }, [taxes]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxRate | null>(null);
  const [formData, setFormData] = useState<Partial<TaxRate>>({
    name: "",
    code: "",
    rate: 0,
    type: "VAT",
    inclusive: false,
    active: true,
    effectiveFrom: new Date().toISOString().split('T')[0],
    jurisdiction: "",
    glAccount: "",
    thresholdAmount: undefined,
    thresholdPeriod: '',
    thresholdAppliesTo: '',
  });
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedPresetTypes, setSelectedPresetTypes] = useState<TaxType[]>([]);

  const handleAddNew = () => {
    setEditingTax(null);
    setFormData({
      name: "",
      code: "",
      rate: 0,
      type: "VAT",
      inclusive: false,
      active: true,
      effectiveFrom: new Date().toISOString().split('T')[0],
      jurisdiction: "",
      glAccount: "",
      thresholdAmount: undefined,
      thresholdPeriod: '',
      thresholdAppliesTo: '',
    });
    setIsDialogOpen(true);
  };

  const handleAddPresets = () => {
    setSelectedCountry("");
    setSelectedPresetTypes(["vat","corporate_tax"]);
    setIsPresetDialogOpen(true);
  };

  const handleEdit = (tax: TaxRate) => {
    setEditingTax(tax);
    setFormData(tax);
    setIsDialogOpen(true);
  };

  const upsertMutation = useMutation({
    mutationFn: async (payload: TaxRate & { isUpdate?: boolean }) => {
      const serverPayload = {
        code: payload.code,
        name: payload.name,
        rate: String(payload.rate ?? 0),
        tax_type: (payload.type || 'Custom')
          .toLowerCase()
          .replace(' ', '_'),
        calculation_type: payload.inclusive ? 'inclusive' : 'exclusive',
        liability_account_id: payload.glAccount || undefined,
        jurisdiction: payload.jurisdiction || undefined,
        threshold_amount: payload.thresholdAmount != null ? String(payload.thresholdAmount) : undefined,
        threshold_period: payload.thresholdPeriod || undefined,
        threshold_applies_to: payload.thresholdAppliesTo || undefined,
        effective_from: payload.effectiveFrom ? new Date(payload.effectiveFrom) : new Date(),
        is_active: payload.active ?? true,
      } as any;

      if (payload.isUpdate) {
        return await apiRequest('PUT', `/api/taxes/${payload.id}`, serverPayload);
      }
      return await apiRequest('POST', '/api/taxes', serverPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/taxes"] });
      setIsDialogOpen(false);
      toast({ title: t('common.saved'), description: t('common.changesSaved') });
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error?.message || t('common.saveFailed'), variant: 'destructive' });
    }
  });

  const batchCreateMutation = useMutation({
    mutationFn: async (payload: { country: string; types: TaxType[] }) => {
      const presets = getPresetsForCountry(payload.country);
      if (!presets) return;
      // If no types selected, create all taxes for the country
      const toCreate = payload.types.length > 0 
        ? presets.presets.filter(p => payload.types.includes(p.type))
        : presets.presets;
      for (const p of toCreate) {
        const serverPayload = {
          code: p.code,
          name: p.name,
          rate: String(p.rate),
          tax_type: p.type,
          calculation_type: p.calculation_type || 'exclusive',
          jurisdiction: presets.countryName,
          effective_from: new Date(),
          is_active: true,
          notes: p.notes || '',
        } as any;
        await apiRequest('POST', '/api/taxes', serverPayload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/taxes"] });
      setIsPresetDialogOpen(false);
      setSelectedPresetTypes([]);
      toast({ title: t('common.saved'), description: t('common.changesSaved') });
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error?.message || t('common.saveFailed'), variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await apiRequest('DELETE', `/api/taxes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/taxes"] });
      toast({ title: t('common.deleted'), description: t('common.deleteSuccess') });
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error?.message || t('common.deleteFailed'), variant: 'destructive' });
    }
  });

  const handleSave = () => {
    const payload = {
      ...(editingTax ? { id: editingTax.id } : {}),
      name: formData.name || "",
      code: formData.code || "",
      rate: formData.rate ?? 0,
      type: (formData.type as TaxRate['type']) || 'VAT',
      inclusive: !!formData.inclusive,
      active: formData.active ?? true,
      effectiveFrom: formData.effectiveFrom || new Date().toISOString().slice(0,10),
      jurisdiction: formData.jurisdiction || "",
      glAccount: formData.glAccount || "",
      isUpdate: !!editingTax,
    } as TaxRate & { isUpdate?: boolean };
    upsertMutation.mutate(payload);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const toggleActive = (id: string) => {
    const tax = taxRates.find(t => t.id === id);
    if (!tax) return;
    upsertMutation.mutate({ ...tax, active: !tax.active, isUpdate: true });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'VAT': return 'bg-blue-100 text-blue-800';
      case 'Sales Tax': return 'bg-green-100 text-green-800';
      case 'Corporate Tax': return 'bg-purple-100 text-purple-800';
      case 'Withholding': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTranslatedType = (type: string) => {
    switch (type) {
      case 'VAT': return t('taxes.vat');
      case 'Sales Tax': return t('taxes.salesTax');
      case 'Corporate Tax': return t('taxes.corporateTax');
      case 'Withholding': return t('taxes.withholding');
      default: return t('taxes.custom');
    }
  };

  // Revert to single table view with horizontal scroll; keep mobile hint only
  const mobileView = false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{t('tax.taxConfiguration')}</h1>
          <p className="text-muted-foreground mt-1">
            Configure global tax rates and rules for your accounting system
          </p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto sm:flex-nowrap sm:justify-end">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 sm:flex-none text-sm px-3"
              onClick={handleAddPresets}
              data-testid="button-add-tax-presets"
            >
              <Plus className="h-4 w-4 me-1" />
              {t('tax.presets', { defaultValue: 'Presets' })}
            </Button>
            <Button
              size="sm"
              className="flex-1 sm:flex-none text-sm px-3"
              onClick={handleAddNew}
              data-testid="button-add-tax-rate"
            >
              <Plus className="h-4 w-4 me-1" />
              {t('common.new', { defaultValue: 'New' })}
            </Button>
          </div>
        </div>
      </div>

      {/* Tax Rates Responsive */}
      <Card data-testid="card-tax-rates" className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calculator className="h-5 w-5" />
            <span>{t('tax.taxRates')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          {!isMobile && (
            <div className="overflow-x-auto">
              <Table style={{minWidth: '960px'}}>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('tax.name')}</TableHead>
                    <TableHead>{t('tax.code')}</TableHead>
                    <TableHead>{t('tax.type')}</TableHead>
                    <TableHead>{t('tax.rate')}</TableHead>
                    <TableHead>{t('tax.calculation')}</TableHead>
                    <TableHead>{t('tax.jurisdiction')}</TableHead>
                    <TableHead>{t('tax.threshold', { defaultValue: 'Threshold' })}</TableHead>
                    <TableHead>{t('tax.status')}</TableHead>
                    <TableHead>{t('tax.effectiveFrom')}</TableHead>
                    <TableHead className="text-end">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxRates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="p-6 text-center text-sm text-muted-foreground" data-testid="tax-empty-row">
                        {t('tax.noTaxRates', { defaultValue: 'No tax rates yet' })}
                      </TableCell>
                    </TableRow>
                  )}
                  {taxRates.map((tax) => (
                    <TableRow key={tax.id} data-testid={`tax-row-${tax.id}`}>
                      <TableCell className="font-medium">{tax.name}</TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {tax.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(tax.type)}>
                          {getTranslatedType(tax.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Percent className="h-3 w-3" />
                          <span className="font-mono">{tax.rate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tax.inclusive ? "default" : "secondary"}>
                          {tax.inclusive ? t("tax.inclusive") : t("tax.exclusive")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          <span className="text-sm">{tax.jurisdiction || t("tax.global")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {tax.thresholdAmount != null ? (
                          <div className="text-xs">
                            <div><strong>{t('tax.amt', { defaultValue: 'Amt:' })}</strong> {tax.thresholdAmount}</div>
                            <div><strong>{t('tax.per', { defaultValue: 'Per:' })}</strong> {tax.thresholdPeriod || '-'}</div>
                            <div><strong>{t('tax.for', { defaultValue: 'For:' })}</strong> {tax.thresholdAppliesTo || '-'}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={tax.active}
                            onCheckedChange={() => toggleActive(tax.id)}
                            data-testid={`switch-active-${tax.id}`}
                          />
                          <span className="text-sm">
                            {tax.active ? t('common.active') : t('common.inactive')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">
                            {new Date(tax.effectiveFrom).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(tax)}
                            data-testid={`button-edit-${tax.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tax.id)}
                            data-testid={`button-delete-${tax.id}`}
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

          {/* Mobile Card View */}
          {isMobile && (
            <div className="space-y-3 px-4 pb-4">
              {taxRates.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground" data-testid="tax-empty-row">
                  {t('tax.noTaxRates', { defaultValue: 'No tax rates yet' })}
                </div>
              ) : (
                taxRates.map((tax) => (
                  <Card key={tax.id} className="border" data-testid={`tax-card-${tax.id}`}>
                    <CardContent className="p-4 space-y-3">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate">{tax.name}</h3>
                          <code className="bg-muted px-2 py-0.5 rounded text-xs">
                            {tax.code}
                          </code>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(tax)}
                            data-testid={`button-edit-${tax.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(tax.id)}
                            data-testid={`button-delete-${tax.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {/* Type and Rate */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getTypeColor(tax.type)}>
                          {tax.type}
                        </Badge>
                        <div className="flex items-center gap-1 font-semibold">
                          <Percent className="h-3 w-3" />
                          <span className="font-mono text-lg">{tax.rate}%</span>
                        </div>
                        <Badge variant={tax.inclusive ? "default" : "secondary"}>
                          {tax.inclusive ? t("tax.inclusive") : t("tax.exclusive")}
                        </Badge>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-muted-foreground text-xs">{t("tax.jurisdiction", "Jurisdiction")}</div>
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            <span>{tax.jurisdiction || t("tax.global")}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs">{t("tax.effectiveFrom", "Effective From")}</div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(tax.effectiveFrom).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Threshold Info */}
                      {tax.thresholdAmount != null && (
                        <div className="text-xs bg-muted p-2 rounded">
                          <div className="font-medium mb-1">{t("tax.threshold", "Threshold")}</div>
                          <div><strong>{t("common.amount", "Amount")}:</strong> {tax.thresholdAmount}</div>
                          <div><strong>{t("common.period", "Period")}:</strong> {tax.thresholdPeriod || '-'}</div>
                          <div><strong>{t("tax.appliesTo", "Applies to")}:</strong> {tax.thresholdAppliesTo || '-'}</div>
                        </div>
                      )}

                      {/* Status Toggle */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm font-medium">{t("common.status", "Status")}</span>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={tax.active}
                            onCheckedChange={() => toggleActive(tax.id)}
                            data-testid={`switch-active-${tax.id}`}
                          />
                          <span className="text-sm">
                            {tax.active ? t('common.active') : t('common.inactive')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md" data-testid="dialog-tax-form">
          <DialogHeader>
            <DialogTitle>
              {editingTax ? t('forms.editTaxRate') : t('forms.addNewTaxRate')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tax-name">{t('forms.taxName')}</Label>
              <Input
                id="tax-name"
                value={formData.name || ""}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., VAT Standard Rate"
                data-testid="input-tax-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-code">{t('forms.taxCode')}</Label>
              <Input
                id="tax-code"
                value={formData.code || ""}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="e.g., VAT-STD"
                data-testid="input-tax-code"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax-type">{t('forms.taxType')}</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({...formData, type: value as TaxRate['type']})}
                >
                  <SelectTrigger data-testid="select-tax-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taxTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getTranslatedType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax-rate">{t('forms.taxRate')} (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  step="0.01"
                  value={formData.rate || 0}
                  onChange={(e) => setFormData({...formData, rate: parseFloat(e.target.value) || 0})}
                  data-testid="input-tax-rate"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.inclusive || false}
                onCheckedChange={(checked) => setFormData({...formData, inclusive: checked})}
                data-testid="switch-inclusive"
              />
              <div>
                <Label>{t('tax.taxInclusive')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('tax.taxInclusiveDesc')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="threshold-amount">{t('tax.thresholdAmount', { defaultValue: 'Threshold Amount (Optional)' })}</Label>
                <Input
                  id="threshold-amount"
                  type="number"
                  step="0.01"
                  value={formData.thresholdAmount ?? ''}
                  onChange={(e) => setFormData({...formData, thresholdAmount: e.target.value === '' ? undefined : parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 375000.00"
                  data-testid="input-threshold-amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold-period">{t('tax.thresholdPeriod', { defaultValue: 'Threshold Period' })}</Label>
                <Select
                  value={formData.thresholdPeriod as any}
                  onValueChange={(value) => setFormData({...formData, thresholdPeriod: value})}
                >
                  <SelectTrigger data-testid="select-threshold-period">
                    <SelectValue placeholder={t("tax.selectPeriod", { defaultValue: "Select period" })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">{t('tax.annual', { defaultValue: 'Annual' })}</SelectItem>
                    <SelectItem value="monthly">{t('tax.monthly', { defaultValue: 'Monthly' })}</SelectItem>
                    <SelectItem value="rolling12">{t('tax.rolling12', { defaultValue: 'Rolling 12 Months' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold-applies">{t('tax.thresholdAppliesTo', { defaultValue: 'Threshold Applies To' })}</Label>
                <Select
                  value={formData.thresholdAppliesTo as any}
                  onValueChange={(value) => setFormData({...formData, thresholdAppliesTo: value})}
                >
                  <SelectTrigger data-testid="select-threshold-applies">
                    <SelectValue placeholder={t("tax.selectBasis", { defaultValue: "Select basis" })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="turnover">{t('tax.turnover', { defaultValue: 'Turnover (VAT)' })}</SelectItem>
                    <SelectItem value="income">{t('tax.incomeProfit', { defaultValue: 'Income/Profit (Corporate)' })}</SelectItem>
                    <SelectItem value="other">{t('tax.other', { defaultValue: 'Other' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jurisdiction">{t('tax.jurisdictionOptional', { defaultValue: 'Jurisdiction (Optional)' })}</Label>
              <Input
                id="jurisdiction"
                value={formData.jurisdiction || ""}
                onChange={(e) => setFormData({...formData, jurisdiction: e.target.value})}
                placeholder="e.g., UAE, California"
                data-testid="input-jurisdiction"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effective-from">Effective From</Label>
              <Input
                id="effective-from"
                type="date"
                value={formData.effectiveFrom || ""}
                onChange={(e) => setFormData({...formData, effectiveFrom: e.target.value})}
                data-testid="input-effective-from"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gl-account">{t('tax.glAccount', { defaultValue: 'GL Account' })}</Label>
              <Input
                id="gl-account"
                value={formData.glAccount || ""}
                onChange={(e) => setFormData({...formData, glAccount: e.target.value})}
                placeholder="e.g., 2300 - VAT Payable"
                data-testid="input-gl-account"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                data-testid="button-cancel"
              >
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSave} data-testid="button-save-tax">
                {editingTax ? t("common.update") : t("common.create")} {t("tax.taxRate")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Presets Dialog */}
      <Dialog open={isPresetDialogOpen} onOpenChange={setIsPresetDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-tax-presets">
          <DialogHeader>
            <DialogTitle>
              {t('tax.quickAddPresets', { defaultValue: 'Quick Add: Country Tax Presets' })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country">{t('common.country', { defaultValue: 'Country' })}</Label>
              <Select value={selectedCountry} onValueChange={(val) => {
                setSelectedCountry(val);
                setSelectedPresetTypes([]); // Reset selections when country changes
              }}>
                <SelectTrigger data-testid="select-country">
                  <SelectValue placeholder={t("common.selectCountry", { defaultValue: "Select a country" })} />
                </SelectTrigger>
                <SelectContent>
                  {getCountryList().map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name} ({c.nameAr})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCountry && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t('tax.availableTaxes', { defaultValue: 'Available Taxes' })}</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const presets = getPresetsForCountry(selectedCountry);
                      if (presets) {
                        const allTypes = presets.presets.map(p => p.type);
                        setSelectedPresetTypes(prev => 
                          prev.length === allTypes.length ? [] : allTypes
                        );
                      }
                    }}
                  >
                    {t('common.selectAll', { defaultValue: 'Select All' })}
                  </Button>
                </div>
                <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                  {getPresetsForCountry(selectedCountry)?.presets.map((preset, idx) => {
                    const checked = selectedPresetTypes.includes(preset.type);
                    const typeLabel = getTaxTypeLabel(preset.type);
                    return (
                      <div 
                        key={`${preset.code}-${idx}`}
                        className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${checked ? 'bg-primary/10' : ''}`}
                        onClick={() => {
                          setSelectedPresetTypes((prev) =>
                            prev.includes(preset.type)
                              ? prev.filter((k) => k !== preset.type)
                              : [...prev, preset.type]
                          );
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                checked={checked}
                                onChange={() => {}}
                                className="h-4 w-4"
                              />
                              <span className="font-medium">{preset.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {preset.rate}%
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 ms-6">
                              {preset.nameAr}
                            </div>
                            {preset.notes && (
                              <div className="text-xs text-muted-foreground mt-1 ms-6">
                                {preset.notes}
                              </div>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {typeLabel.en}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('tax.presetsHint', { 
                    defaultValue: 'Select the taxes you want to add, or leave empty to add all.' 
                  })}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsPresetDialogOpen(false)}
                data-testid="button-cancel-presets"
              >
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={() => selectedCountry && batchCreateMutation.mutate({ country: selectedCountry, types: selectedPresetTypes })}
                disabled={!selectedCountry || batchCreateMutation.isPending}
                data-testid="button-apply-presets"
              >
                {batchCreateMutation.isPending 
                  ? t('common.loading', { defaultValue: 'Loading...' })
                  : selectedPresetTypes.length > 0
                    ? t('tax.addSelected', { defaultValue: `Add ${selectedPresetTypes.length} Tax(es)` })
                    : t('tax.addAllTaxes', { defaultValue: 'Add All Taxes' })
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
