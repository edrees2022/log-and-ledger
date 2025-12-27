import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Plus, Edit, Trash2, Phone, Mail, Globe, Building, CreditCard, Calendar, MapPin, FileText } from 'lucide-react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { SmartScanButton } from '@/components/ai/SmartScanButton';

// Contact form schema factory (localized messages)
const contactSchemaFactory = (t: TFunction) => z.object({
  type: z.enum(['customer', 'supplier', 'both']),
  code: z.string().optional(),
  name: z.string().min(2, t('validation.nameMin2')),
  display_name: z.string().optional(),
  email: z.string().email(t('validation.invalidEmail')).optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  tax_number: z.string().optional(),
  registration_number: z.string().optional(),
  currency: z.string().default('USD'),
  payment_terms_days: z.number().min(0).max(365),
  credit_limit: z.string().optional(),
  linked_company_id: z.string().optional(),
  is_active: z.boolean(),
});

type ContactForm = z.infer<ReturnType<typeof contactSchemaFactory>>;

const contactTypeColors: Record<string, string> = {
  customer: 'text-blue-600',
  supplier: 'text-orange-600',
  both: 'text-purple-600',
};

const buildPaymentTerms = (t: TFunction) => [
  { value: 0, label: t('contacts.dueOnReceipt') },
  { value: 7, label: t('contacts.net7') },
  { value: 15, label: t('contacts.net15') },
  { value: 30, label: t('contacts.net30') },
  { value: 45, label: t('contacts.net45') },
  { value: 60, label: t('contacts.net60') },
  { value: 90, label: t('contacts.net90') },
];

export default function ContactsPage() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const contactSchema = contactSchemaFactory(t);
  const [showDialog, setShowDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');

  const handleScanComplete = (data: any) => {
    // Pre-fill form
    form.setValue('name', data.name || '');
    form.setValue('email', data.email || '');
    form.setValue('phone', data.phone || '');
    form.setValue('website', data.website || '');
    form.setValue('tax_number', data.tax_number || '');
    
    // Guess type based on context if possible, otherwise default
    form.setValue('type', 'customer'); 
    
    setShowDialog(true);
    toast({
      title: t("ai.scanSuccess"),
      description: t("ai.scanFormFilled", "Contact details extracted."),
    });
  };

  // Fetch contacts
  const { data: contacts = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/contacts'],
  });

  // Create contact mutation
  const createMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      return await apiRequest('POST', '/api/contacts', {
        ...data,
        credit_limit: data.credit_limit || null, // Send as string or null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setShowDialog(false);
      toast({
        title: t('toast.titles.Contact created'),
        description: t('toast.descriptions.New contact has been added successfully.'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('toast.titles.Error'),
        description: error.message || t('toast.descriptions.Failed to create contact'),
        variant: 'destructive',
      });
    },
  });

  // Update contact mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContactForm> }) => {
      return await apiRequest('PUT', `/api/contacts/${id}`, {
        ...data,
        credit_limit: data.credit_limit || null, // Send as string or null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setShowDialog(false);
      setEditingContact(null);
      toast({
        title: t('toast.titles.Contact updated'),
        description: t('toast.descriptions.Contact information has been updated successfully.'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('toast.titles.Error'),
        description: error.message || t('toast.descriptions.Failed to update contact'),
        variant: 'destructive',
      });
    },
  });

  // Delete contact mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: t('toast.titles.Contact deleted'),
        description: t('toast.descriptions.Contact has been removed successfully.'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('toast.titles.Error'),
        description: error.message || t('toast.descriptions.Failed to delete contact'),
        variant: 'destructive',
      });
    },
  });

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: editingContact || {
      type: 'customer',
      code: '',
      name: '',
      display_name: '',
      email: '',
      phone: '',
      website: '',
      tax_number: '',
      registration_number: '',
      currency: 'USD',
      payment_terms_days: 30,
      credit_limit: '',
      is_active: true,
    },
  });

  const onSubmit = async (data: ContactForm) => {
    if (editingContact) {
      await updateMutation.mutateAsync({ id: editingContact.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (contact: any) => {
    setEditingContact(contact);
    form.reset({
      ...contact,
      credit_limit: contact.credit_limit?.toString() || '',
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirmations.deleteContact'))) {
      await deleteMutation.mutateAsync(id);
    }
  };

  // Filter contacts by type
  const filteredContacts = contacts.filter((contact) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'customers') return contact.type === 'customer' || contact.type === 'both';
    if (activeTab === 'suppliers') return contact.type === 'supplier' || contact.type === 'both';
    return true;
  });

  // Calculate statistics
  const stats = {
    total: contacts.length,
    customers: contacts.filter(c => c.type === 'customer' || c.type === 'both').length,
    suppliers: contacts.filter(c => c.type === 'supplier' || c.type === 'both').length,
    active: contacts.filter(c => c.is_active).length,
  };

  const currencies = useMemo(() => [
    { code: 'USD', name: t('currencies.USD') },
    { code: 'EUR', name: t('currencies.EUR') },
    { code: 'GBP', name: t('currencies.GBP') },
    { code: 'AED', name: t('currencies.AED') },
    { code: 'SAR', name: t('currencies.SAR') },
    { code: 'EGP', name: t('currencies.EGP') },
    { code: 'SYP', name: t('currencies.SYP') },
    { code: 'LBP', name: t('currencies.LBP') },
    { code: 'IQD', name: t('currencies.IQD') },
    { code: 'JOD', name: t('currencies.JOD') },
    { code: 'KWD', name: t('currencies.KWD') },
    { code: 'QAR', name: t('currencies.QAR') },
    { code: 'BHD', name: t('currencies.BHD') },
    { code: 'OMR', name: t('currencies.OMR') },
    { code: 'YER', name: t('currencies.YER') },
    { code: 'MAD', name: t('currencies.MAD') },
    { code: 'DZD', name: t('currencies.DZD') },
    { code: 'TND', name: t('currencies.TND') },
    { code: 'LYD', name: t('currencies.LYD') },
    { code: 'SDG', name: t('currencies.SDG') },
    { code: 'ILS', name: t('currencies.ILS') },
    { code: 'IRR', name: t('currencies.IRR') },
    { code: 'TRY', name: t('currencies.TRY') },
    { code: 'PHP', name: t('currencies.PHP') },
    { code: 'CNY', name: t('currencies.CNY') },
    { code: 'JPY', name: t('currencies.JPY') },
    { code: 'INR', name: t('currencies.INR') },
    { code: 'PKR', name: t('currencies.PKR') },
    { code: 'BDT', name: t('currencies.BDT') },
    { code: 'IDR', name: t('currencies.IDR') },
    { code: 'MYR', name: t('currencies.MYR') },
    { code: 'THB', name: t('currencies.THB') },
    { code: 'VND', name: t('currencies.VND') },
    { code: 'KRW', name: t('currencies.KRW') },
    { code: 'RUB', name: t('currencies.RUB') },
    { code: 'CAD', name: t('currencies.CAD') },
    { code: 'AUD', name: t('currencies.AUD') },
    { code: 'NZD', name: t('currencies.NZD') },
    { code: 'CHF', name: t('currencies.CHF') },
    { code: 'ZAR', name: t('currencies.ZAR') },
    { code: 'NGN', name: t('currencies.NGN') },
    { code: 'KES', name: t('currencies.KES') },
    { code: 'GHS', name: t('currencies.GHS') },
    { code: 'ETB', name: t('currencies.ETB') },
    { code: 'BRL', name: t('currencies.BRL') },
    { code: 'MXN', name: t('currencies.MXN') },
    { code: 'ARS', name: t('currencies.ARS') },
    { code: 'COP', name: t('currencies.COP') },
    { code: 'CLP', name: t('currencies.CLP') },
    { code: 'PEN', name: t('currencies.PEN') },
  ], [t, i18n.resolvedLanguage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('pages.titles.Contacts')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('pages.descriptions.Manage your customers and suppliers')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SmartScanButton 
            documentType="contact" 
            onScanComplete={handleScanComplete}
          />
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingContact(null);
                form.reset({
                  type: 'customer',
                  name: '',
                  display_name: '',
                  email: '',
                  phone: '',
                  website: '',
                  tax_number: '',
                  registration_number: '',
                  currency: 'USD',
                  payment_terms_days: 0,
                  credit_limit: '',
                  is_active: true,
                });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                {t('contacts.add')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingContact ? t('dialogs.Edit Contact') : t('dialogs.Create New Contact')}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">{t('form.sections.Basic Information')}</h3>
                    
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.labels.Contact Type *')}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-contact-type">
                                <SelectValue placeholder={t('placeholders.Select type')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(['customer','supplier','both'] as const).map((ct) => (
                                <SelectItem key={ct} value={ct}>
                                  <span className={contactTypeColors[ct]}>{t(`contactTypes.${ct}`)}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.labels.Contact Code *')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('placeholders.contactCodeExample')} data-testid="input-contact-code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.labels.Contact Name *')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('contacts.companyNamePlaceholder')} data-testid="input-contact-name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="display_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.labels.Display Name')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('placeholders.displayNameExample')} data-testid="input-display-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">{t('form.sections.Contact Information')}</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.labels.Email Address')}</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder={t('placeholders.emailExample')} data-testid="input-email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.labels.Phone Number')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('placeholders.phoneExample')} data-testid="input-phone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.labels.Website')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('placeholders.websiteExample')} data-testid="input-website" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Tax & Registration */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">{t('form.sections.Business Details')}</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="tax_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.labels.Tax Number')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('placeholders.taxNumberExample')} data-testid="input-tax-number" {...field} />
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
                            <FormLabel>{t('form.labels.Registration Number')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('placeholders.registrationNumberExample')} data-testid="input-registration" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Payment Settings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">{t('form.sections.Financial Information')}</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.labels.Currency *')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-currency">
                                  <SelectValue placeholder={t('placeholders.Select currency')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {currencies.map((currency) => (
                                  <SelectItem key={currency.code} value={currency.code}>
                                    {currency.code} - {currency.name}
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
                        name="payment_terms_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.labels.Payment Terms (Days)')}</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))} 
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-payment-terms">
                                  <SelectValue placeholder={t('placeholders.Select terms')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {buildPaymentTerms(t).map((term) => (
                                  <SelectItem key={term.value} value={term.value.toString()}>
                                    {term.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="credit_limit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.labels.Credit Limit')}</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder={t('placeholders.creditLimitExample')} 
                              data-testid="input-credit-limit" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="linked_company_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.labels.Linked Company ID')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('placeholders.linkedCompanyId')} 
                              data-testid="input-linked-company-id" 
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            {t('contacts.linkedCompanyHelp')}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>{t('form.labels.Active Status')}</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            {t('contacts.activeContactDesc')}
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-contact-active"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowDialog(false)}
                      data-testid="button-cancel"
                    >
                      {t('buttons.cancel')}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-save-contact"
                    >
                      {editingContact ? t('buttons.update') : t('buttons.create')} {t('pageHeadings.contact')}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('statistics.totalContacts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('statistics.customers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.customers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('statistics.suppliers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.suppliers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('statistics.active')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">{t('tabs.allContacts')}</TabsTrigger>
          <TabsTrigger value="customers" data-testid="tab-customers">{t('tabs.customers')}</TabsTrigger>
          <TabsTrigger value="suppliers" data-testid="tab-suppliers">{t('tabs.suppliers')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ) : filteredContacts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">{t('messages.noContactsFound')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('messages.startByAddingContact')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredContacts.map((contact) => (
                <Card key={contact.id} data-testid={`card-contact-${contact.id}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{contact.name}</span>
                      <div className="flex gap-1">
                        {(contact.type === 'customer' || contact.type === 'both') && (
                          <Badge variant="secondary" className="text-xs">{t('contactTypes.customer')}</Badge>
                        )}
                        {(contact.type === 'supplier' || contact.type === 'both') && (
                          <Badge variant="outline" className="text-xs">{t('contactTypes.supplier')}</Badge>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {contact.code && (
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="font-mono">{contact.code}</Badge>
                      </div>
                    )}
                    
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>{contact.currency}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{contact.payment_terms_days === 0 ? t('contacts.dueOnReceipt') : (buildPaymentTerms(t).find(x => x.value === contact.payment_terms_days)?.label || `Net ${contact.payment_terms_days}`)}</span>
                      </div>
                    </div>
                    
                    {!contact.is_active && (
                      <Badge variant="secondary" className="text-xs">{t('status.inactive')}</Badge>
                    )}
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLocation(`/reports/contact-statement?contactId=${contact.id}`)}
                        data-testid={`button-statement-${contact.id}`}
                      >
                        <FileText className="h-3 w-3 me-1" />
                        {t('contacts.viewStatement')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(contact)}
                        data-testid={`button-edit-${contact.id}`}
                      >
                        <Edit className="h-3 w-3 me-1" />
                        {t('buttons.edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(contact.id)}
                        data-testid={`button-delete-${contact.id}`}
                      >
                        <Trash2 className="h-3 w-3 me-1" />
                        {t('buttons.delete')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}