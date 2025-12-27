import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Plus, Edit, Trash2, Check, Calendar, DollarSign } from 'lucide-react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

// Company form schema will be created inside component to use translations

// CompanyForm type will be defined inside component after schema

// Dynamic currencies will be created inside component

// Dynamic date formats will be created inside component

// Dynamic number formats will be created inside component

// Month names will be accessed dynamically via translations

export default function CompaniesPage() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);

  // Dynamic schema using translations - memoized to update when language changes
  const companySchema = useMemo(() => z.object({
    name: z.string().min(2, t('validationErrors.companyNameMin')),
    legal_name: z.string().optional(),
    tax_number: z.string().optional(),
    registration_number: z.string().optional(),
    base_currency: z.string().min(3, t('validationErrors.currencyRequired')),
    fiscal_year_start: z.number().min(1).max(12),
    date_format: z.string(),
    number_format: z.string(),
    parent_company_id: z.string().optional().nullable(),
  }), [t, i18n.resolvedLanguage]);

  type CompanyForm = z.infer<typeof companySchema>;

  // Dynamic months using translations
  const months = useMemo(() => [
    t('months.january'), t('months.february'), t('months.march'), t('months.april'), 
    t('months.may'), t('months.june'), t('months.july'), t('months.august'),
    t('months.september'), t('months.october'), t('months.november'), t('months.december')
  ], [t, i18n.resolvedLanguage]);

  // Dynamic currencies using translations - Comprehensive global currency list
  const currencies = useMemo(() => [
    // Major World Currencies
    { code: 'USD', name: t('currencies.USD'), symbol: '$' },
    { code: 'EUR', name: t('currencies.EUR'), symbol: '€' },
    { code: 'GBP', name: t('currencies.GBP'), symbol: '£' },
    { code: 'JPY', name: t('currencies.JPY'), symbol: '¥' },
    { code: 'CHF', name: t('currencies.CHF'), symbol: 'CHF' },
    { code: 'CAD', name: t('currencies.CAD'), symbol: 'C$' },
    { code: 'AUD', name: t('currencies.AUD'), symbol: 'A$' },
    { code: 'NZD', name: t('currencies.NZD'), symbol: 'NZ$' },
    
    // Arabic & Middle Eastern Currencies
    { code: 'AED', name: t('currencies.AED'), symbol: 'د.إ' },
    { code: 'SAR', name: t('currencies.SAR'), symbol: 'ر.س' },
    { code: 'EGP', name: t('currencies.EGP'), symbol: 'ج.م' },
    { code: 'SYP', name: t('currencies.SYP'), symbol: 'ل.س' }, // Syria - specifically requested
    { code: 'LBP', name: t('currencies.LBP'), symbol: 'ل.ل' }, // Lebanon
    { code: 'IQD', name: t('currencies.IQD'), symbol: 'ع.د' }, // Iraq
    { code: 'JOD', name: t('currencies.JOD'), symbol: 'د.أ' }, // Jordan
    { code: 'KWD', name: t('currencies.KWD'), symbol: 'د.ك' }, // Kuwait
    { code: 'QAR', name: t('currencies.QAR'), symbol: 'ر.ق' }, // Qatar
    { code: 'BHD', name: t('currencies.BHD'), symbol: 'د.ب' }, // Bahrain
    { code: 'OMR', name: t('currencies.OMR'), symbol: 'ر.ع' }, // Oman
    { code: 'YER', name: t('currencies.YER'), symbol: 'ر.ي' }, // Yemen
    { code: 'MAD', name: t('currencies.MAD'), symbol: 'د.م' }, // Morocco
    { code: 'DZD', name: t('currencies.DZD'), symbol: 'د.ج' }, // Algeria
    { code: 'TND', name: t('currencies.TND'), symbol: 'د.ت' }, // Tunisia
    { code: 'LYD', name: t('currencies.LYD'), symbol: 'د.ل' }, // Libya
    { code: 'SDG', name: t('currencies.SDG'), symbol: 'ج.س' }, // Sudan
    { code: 'ILS', name: t('currencies.ILS'), symbol: '₪' }, // Israel
    { code: 'IRR', name: t('currencies.IRR'), symbol: '﷼' }, // Iran
    { code: 'TRY', name: t('currencies.TRY'), symbol: '₺' }, // Turkey
    
    // Asian Currencies
    { code: 'PHP', name: t('currencies.PHP'), symbol: '₱' }, // Philippines - specifically requested
    { code: 'CNY', name: t('currencies.CNY'), symbol: '¥' }, // China
    { code: 'KRW', name: t('currencies.KRW'), symbol: '₩' }, // South Korea
    { code: 'INR', name: t('currencies.INR'), symbol: '₹' }, // India
    { code: 'IDR', name: t('currencies.IDR'), symbol: 'Rp' }, // Indonesia
    { code: 'THB', name: t('currencies.THB'), symbol: '฿' }, // Thailand
    { code: 'MYR', name: t('currencies.MYR'), symbol: 'RM' }, // Malaysia
    { code: 'SGD', name: t('currencies.SGD'), symbol: 'S$' }, // Singapore
    { code: 'VND', name: t('currencies.VND'), symbol: '₫' }, // Vietnam
    { code: 'BDT', name: t('currencies.BDT'), symbol: '৳' }, // Bangladesh
    { code: 'PKR', name: t('currencies.PKR'), symbol: '₨' }, // Pakistan
    { code: 'LKR', name: t('currencies.LKR'), symbol: '₨' }, // Sri Lanka
    { code: 'MMK', name: t('currencies.MMK'), symbol: 'K' }, // Myanmar
    { code: 'KHR', name: t('currencies.KHR'), symbol: '៛' }, // Cambodia
    { code: 'LAK', name: t('currencies.LAK'), symbol: '₭' }, // Laos
    { code: 'NPR', name: t('currencies.NPR'), symbol: '₨' }, // Nepal
    { code: 'BTN', name: t('currencies.BTN'), symbol: 'Nu.' }, // Bhutan
    { code: 'MNT', name: t('currencies.MNT'), symbol: '₮' }, // Mongolia
    { code: 'KZT', name: t('currencies.KZT'), symbol: '₸' }, // Kazakhstan
    { code: 'UZS', name: t('currencies.UZS'), symbol: "so'm" }, // Uzbekistan
    
    // European Currencies
    { code: 'NOK', name: t('currencies.NOK'), symbol: 'kr' }, // Norway
    { code: 'SEK', name: t('currencies.SEK'), symbol: 'kr' }, // Sweden
    { code: 'DKK', name: t('currencies.DKK'), symbol: 'kr' }, // Denmark
    { code: 'ISK', name: t('currencies.ISK'), symbol: 'kr' }, // Iceland
    { code: 'PLN', name: t('currencies.PLN'), symbol: 'zł' }, // Poland
    { code: 'CZK', name: t('currencies.CZK'), symbol: 'Kč' }, // Czech Republic
    { code: 'HUF', name: t('currencies.HUF'), symbol: 'Ft' }, // Hungary
    { code: 'RON', name: t('currencies.RON'), symbol: 'lei' }, // Romania
    { code: 'BGN', name: t('currencies.BGN'), symbol: 'лв' }, // Bulgaria
    { code: 'HRK', name: t('currencies.HRK'), symbol: 'kn' }, // Croatia
    { code: 'RSD', name: t('currencies.RSD'), symbol: 'дин' }, // Serbia
    { code: 'UAH', name: t('currencies.UAH'), symbol: '₴' }, // Ukraine
    { code: 'RUB', name: t('currencies.RUB'), symbol: '₽' }, // Russia
    
    // African Currencies
    { code: 'ZAR', name: t('currencies.ZAR'), symbol: 'R' }, // South Africa
    { code: 'NGN', name: t('currencies.NGN'), symbol: '₦' }, // Nigeria
    { code: 'GHS', name: t('currencies.GHS'), symbol: '₵' }, // Ghana
    { code: 'KES', name: t('currencies.KES'), symbol: 'KSh' }, // Kenya
    { code: 'UGX', name: t('currencies.UGX'), symbol: 'USh' }, // Uganda
    { code: 'TZS', name: t('currencies.TZS'), symbol: 'TSh' }, // Tanzania
    { code: 'ETB', name: t('currencies.ETB'), symbol: 'Br' }, // Ethiopia
    { code: 'RWF', name: t('currencies.RWF'), symbol: 'RF' }, // Rwanda
    { code: 'XOF', name: t('currencies.XOF'), symbol: 'CFA' }, // West Africa CFA
    { code: 'XAF', name: t('currencies.XAF'), symbol: 'FCFA' }, // Central Africa CFA
    
    // American Currencies
    { code: 'MXN', name: t('currencies.MXN'), symbol: '$' }, // Mexico
    { code: 'BRL', name: t('currencies.BRL'), symbol: 'R$' }, // Brazil
    { code: 'ARS', name: t('currencies.ARS'), symbol: '$' }, // Argentina
    { code: 'CLP', name: t('currencies.CLP'), symbol: '$' }, // Chile
    { code: 'COP', name: t('currencies.COP'), symbol: '$' }, // Colombia
    { code: 'PEN', name: t('currencies.PEN'), symbol: 'S/' }, // Peru
  ], [t, i18n.resolvedLanguage]);

  // Dynamic date formats
  const dateFormats = useMemo(() => [
    { value: 'dd/MM/yyyy', label: '31/12/2024' },
    { value: 'MM/dd/yyyy', label: '12/31/2024' },
    { value: 'yyyy-MM-dd', label: '2024-12-31' },
    { value: 'dd.MM.yyyy', label: '31.12.2024' },
  ], []);

  // Dynamic number formats using translations  
  const numberFormats = useMemo(() => [
    { value: '1,234.56', label: `1,234.56 (${t('formats.us')})` },
    { value: '1.234,56', label: `1.234,56 (${t('formats.eu')})` },
    { value: '1 234.56', label: `1 234.56 (${t('formats.fr')})` },
    { value: '1234.56', label: '1234.56' },
  ], [t, i18n.resolvedLanguage]);

  // Fetch companies
  const { data: companies = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/companies'],
  });

  // Create company mutation
  const createMutation = useMutation({
    mutationFn: async (data: CompanyForm) => {
      return await apiRequest('POST', '/api/companies', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      setShowDialog(false);
      toast({
        title: t('messages.companyCreated'),
        description: t('messages.companyCreatedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('messages.createCompanyError'),
        variant: 'destructive',
      });
    },
  });

  // Update company mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CompanyForm }) => {
      return await apiRequest('PUT', `/api/companies/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      setShowDialog(false);
      setEditingCompany(null);
      toast({
        title: t('messages.companyUpdated'),
        description: t('messages.companyUpdatedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('messages.updateCompanyError'),
        variant: 'destructive',
      });
    },
  });

  // Delete company mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/companies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: t('messages.companyDeleted'),
        description: t('messages.companyDeletedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('messages.deleteCompanyError'),
        variant: 'destructive',
      });
    },
  });

  const form = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: editingCompany || {
      name: '',
      legal_name: '',
      tax_number: '',
      registration_number: '',
      base_currency: 'USD',
      fiscal_year_start: 1,
      date_format: 'dd/MM/yyyy',
      number_format: '1,234.56',
      parent_company_id: null,
    },
  });

  const onSubmit = async (data: CompanyForm) => {
    if (editingCompany) {
      await updateMutation.mutateAsync({ id: editingCompany.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (company: any) => {
    setEditingCompany(company);
    form.reset(company);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('pages.companies.confirmDelete'))) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const currentCompany = companies.find((c) => c.id === user?.company_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('pages.companies.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('pages.companies.description')}
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditingCompany(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-company" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 me-2" />
              {t('pages.companies.addCompany')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCompany ? t('pages.companies.editCompany') : t('pages.companies.createCompany')}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form id="company-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forms.companyName')} *</FormLabel>
                        <FormControl>
                          <Input placeholder={t('forms.companyNamePlaceholder')} data-testid="input-company-name" className="min-w-0 w-full" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="legal_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forms.legalName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('forms.legalNamePlaceholder')} data-testid="input-legal-name" className="min-w-0 w-full" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tax_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forms.taxNumber')}</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789" data-testid="input-tax-number" className="min-w-0 w-full" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="registration_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forms.registrationNumber')}</FormLabel>
                        <FormControl>
                          <Input placeholder="REG-2024-001" data-testid="input-registration-number" className="min-w-0 w-full" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="base_currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forms.baseCurrency')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-base-currency">
                              <SelectValue placeholder={t('forms.selectCurrency')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.symbol} {currency.code} - {currency.name}
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
                    name="fiscal_year_start"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forms.fiscalYearStart')} *</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-fiscal-year">
                              <SelectValue placeholder={t('forms.selectMonth')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month, index) => (
                              <SelectItem key={index + 1} value={(index + 1).toString()}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date_format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('formats.dateFormat')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-date-format">
                              <SelectValue placeholder={t('formats.selectDateFormat')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dateFormats.map((format) => (
                              <SelectItem key={format.value} value={format.value}>
                                {format.label}
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
                    name="number_format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('formats.numberFormat')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-number-format">
                              <SelectValue placeholder={t('formats.selectNumberFormat')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {numberFormats.map((format) => (
                              <SelectItem key={format.value} value={format.value}>
                                {format.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="parent_company_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forms.parentCompany', { defaultValue: 'Parent Company (Holding)' })}</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value === "none" ? null : value)} 
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('forms.selectParentCompany', { defaultValue: 'Select Parent Company (Optional)' })} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">{t('forms.noParentCompany', { defaultValue: 'No Parent Company' })}</SelectItem>
                            {companies
                              .filter((c: any) => c.id !== editingCompany?.id) // Prevent self-selection
                              .map((company: any) => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {null}
              </form>
            </Form>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                data-testid="button-cancel"
                className="w-full sm:w-auto"
              >
                {t('forms.cancel')}
              </Button>
              <Button 
                type="submit" 
                form="company-form"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-company"
                className="w-full sm:w-auto"
              >
                {editingCompany ? t('forms.update') : t('forms.create')} {t('forms.company')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Company */}
      {currentCompany && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              {t('pages.companies.currentActive')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('forms.companyName')}</p>
                <p className="font-medium">{currentCompany.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('forms.currency')}</p>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <p className="font-medium">{currentCompany.base_currency}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('forms.fiscalYear')}</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <p className="font-medium">{months[currentCompany.fiscal_year_start - 1]}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('formats.dateFormat')}</p>
                <p className="font-medium">{currentCompany.date_format}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Companies List */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ) : companies.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center space-y-4">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">{t('pages.companies.noCompanies')}</p>
              <p className="text-sm text-muted-foreground">{t('pages.companies.createFirstCompany')}</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={() => setShowDialog(true)}>
                  <Plus className="h-4 w-4 me-2" />
                  {t('pages.companies.addCompany')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          companies.map((company: any) => (
            <Card 
              key={company.id} 
              className={company.id === user?.company_id ? 'border-primary/20' : ''}
              data-testid={`card-company-${company.id}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {company.name}
                  </div>
                  {company.id === user?.company_id && (
                    <Badge variant="default" className="text-xs">{t('forms.active')}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.legal_name && (
                  <div>
                    <p className="text-xs text-muted-foreground">{t('forms.legalName')}</p>
                    <p className="text-sm">{company.legal_name}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('forms.currency')}</p>
                    <p className="text-sm font-medium">{company.base_currency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('forms.fiscalYear')}</p>
                    <p className="text-sm font-medium">{months[company.fiscal_year_start - 1]}</p>
                  </div>
                </div>
                {company.tax_number && (
                  <div>
                    <p className="text-xs text-muted-foreground">{t('forms.taxNumber')}</p>
                    <p className="text-sm">{company.tax_number}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(company)}
                    data-testid={`button-edit-${company.id}`}
                  >
                    <Edit className="h-3 w-3 me-1" />
                    {t('forms.edit')}
                  </Button>
                  {company.id !== user?.company_id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(company.id)}
                      data-testid={`button-delete-${company.id}`}
                    >
                      <Trash2 className="h-3 w-3 me-1" />
                      {t('forms.delete')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}