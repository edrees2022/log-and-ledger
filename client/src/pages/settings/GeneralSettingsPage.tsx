import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { mapCurrencies, sortByName } from '@/lib/currencies';
import { apiRequest } from '@/lib/queryClient';
import { 
  Building2, 
  Save,
  Upload,
  Loader2
} from 'lucide-react';

interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  base_currency: string;
  timezone: string;
  fiscal_year_start: string;
  date_format: string;
  number_format: string;
  invoice_prefix: string;
  next_invoice_number: number;
  quote_prefix: string;
  next_quote_number: number;
  quote_validity_days: number;
  payment_terms_days: number;
  default_tax_rate: string;
  // Push notifications only (Email/SMS to be added later)
  invoice_reminders: boolean;
  payment_alerts: boolean;
  low_stock_alerts: boolean;
  two_factor_required: boolean;
  session_timeout_minutes: number;
  password_expiry_days: number;
  ip_restriction_enabled: boolean;
}

export default function GeneralSettingsPage() {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { refreshSession } = useAuth();
  
  // Get comprehensive currency list from shared utility - sorted for better UX
  const currencies = useMemo(() => sortByName(mapCurrencies(t)), [t, i18n.resolvedLanguage]);
  
  // Fetch settings from API
  const { data: settings, isLoading, error } = useQuery<CompanySettings>({
    queryKey: ['/api/settings/company'],
  });

  // Company settings
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [companyCountry, setCompanyCountry] = useState('');
  const [companyZip, setCompanyZip] = useState('');
  const [taxId, setTaxId] = useState('');
  
  // Regional settings
  const [currency, setCurrency] = useState('AED');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeZone, setTimeZone] = useState('Asia/Dubai');
  const [fiscalYearStart, setFiscalYearStart] = useState('january');
  
  // Invoice settings
  const [invoicePrefix, setInvoicePrefix] = useState('INV-');
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('1001');
  const [paymentTerms, setPaymentTerms] = useState('30');
  const [defaultTaxRate, setDefaultTaxRate] = useState('5');
  
  // Quotation settings
  const [quotePrefix, setQuotePrefix] = useState('QT-');
  const [nextQuoteNumber, setNextQuoteNumber] = useState('1001');
  const [quoteValidityDays, setQuoteValidityDays] = useState('30');
  
  // Notification settings (Push only - Email/SMS will be added later)
  const [invoiceReminders, setInvoiceReminders] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  
  // Security settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [passwordExpiry, setPasswordExpiry] = useState('90');
  const [ipRestriction, setIpRestriction] = useState(false);
  
  // Update local state when settings are fetched
  useEffect(() => {
    if (settings) {
      // Company info
      setCompanyName(settings.name || '');
      setCompanyEmail(settings.email || '');
      setCompanyPhone(settings.phone || '');
      setCompanyAddress(settings.address || '');
      setCompanyCity(settings.city || '');
      setCompanyCountry(settings.country || '');
      setCompanyZip(settings.zip || '');
      
      // Regional settings
      setCurrency(settings.base_currency || 'AED');
      setTimeZone(settings.timezone || 'Asia/Dubai');
      setFiscalYearStart(settings.fiscal_year_start || 'january');
      setDateFormat(settings.date_format || 'DD/MM/YYYY');
      
      // Invoice settings
      setInvoicePrefix(settings.invoice_prefix || 'INV-');
      setNextInvoiceNumber(String(settings.next_invoice_number || 1001));
      setPaymentTerms(String(settings.payment_terms_days || 30));
      setDefaultTaxRate(settings.default_tax_rate || '5');
      
      // Quotation settings
      setQuotePrefix(settings.quote_prefix || 'QT-');
      setNextQuoteNumber(String(settings.next_quote_number || 1001));
      setQuoteValidityDays(String(settings.quote_validity_days || 30));
      
      // Notification settings (Push only)
      setInvoiceReminders(settings.invoice_reminders ?? true);
      setPaymentAlerts(settings.payment_alerts ?? true);
      setLowStockAlerts(settings.low_stock_alerts ?? true);
      
      // Security settings
      setTwoFactorAuth(settings.two_factor_required ?? false);
      setSessionTimeout(String(settings.session_timeout_minutes || 30));
      setPasswordExpiry(String(settings.password_expiry_days || 90));
      setIpRestriction(settings.ip_restriction_enabled ?? false);
    }
  }, [settings]);
  
  // Mutation to save settings
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<CompanySettings>) => {
      const response = await apiRequest('PUT', '/api/settings/company', data);
      return response.json();
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/company'] });
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      
      // If base_currency was updated, refresh the session to update user.activeCompany
      if (variables.base_currency) {
        await refreshSession();
        // Also invalidate currency-related queries
        queryClient.invalidateQueries({ queryKey: ['/api/currencies/live-rates'] });
      }
      
      toast({
        title: t('common.settingsSaved'),
        description: t('common.settingsUpdated'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('common.errorSaving'),
        variant: 'destructive',
      });
    },
  });

  const handleSaveSettings = (section: string) => {
    let data: Partial<CompanySettings> = {};
    
    if (section === 'Company') {
      data = {
        name: companyName,
        email: companyEmail,
        phone: companyPhone,
        address: companyAddress,
        city: companyCity,
        country: companyCountry,
        zip: companyZip,
      };
    } else if (section === 'Regional') {
      data = {
        base_currency: currency,
        timezone: timeZone,
        fiscal_year_start: fiscalYearStart,
        date_format: dateFormat,
      };
    } else if (section === 'Invoice') {
      data = {
        invoice_prefix: invoicePrefix,
        next_invoice_number: parseInt(nextInvoiceNumber),
        quote_prefix: quotePrefix,
        next_quote_number: parseInt(nextQuoteNumber),
        quote_validity_days: parseInt(quoteValidityDays),
        payment_terms_days: parseInt(paymentTerms),
        default_tax_rate: defaultTaxRate,
      };
    } else if (section === 'Notification') {
      data = {
        invoice_reminders: invoiceReminders,
        payment_alerts: paymentAlerts,
        low_stock_alerts: lowStockAlerts,
      };
    } else if (section === 'Security') {
      data = {
        two_factor_required: twoFactorAuth,
        session_timeout_minutes: parseInt(sessionTimeout),
        password_expiry_days: parseInt(passwordExpiry),
        ip_restriction_enabled: ipRestriction,
      };
    }
    
    saveMutation.mutate(data);
  };

  const handleUploadLogo = () => {
    toast({
      title: t('settings.logoUploaded'),
      description: t('settings.logoUploadedDesc'),
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">{t('common.errorLoading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('settings.general.title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('settings.general.description')}
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="company" className="space-y-4">
        <TabsList
          className="flex flex-wrap w-full h-auto min-h-10 items-start content-start gap-3 bg-muted/70 backdrop-blur rounded-lg px-4 py-4 mb-4 shadow-sm border border-border"
          style={{ height: 'auto' }}
        >
          <TabsTrigger value="company">{t('settings.tabs.company')}</TabsTrigger>
          <TabsTrigger value="regional">{t('settings.tabs.regional')}</TabsTrigger>
          <TabsTrigger value="invoice">{t('settings.tabs.invoice')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('settings.tabs.notifications')}</TabsTrigger>
          <TabsTrigger value="security">{t('settings.tabs.security')}</TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.company.title')}</CardTitle>
              <CardDescription>
                {t('settings.company.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <Label>{t('settings.company.logo')}</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('settings.company.logoHelp')}
                  </p>
                  <Button variant="outline" onClick={handleUploadLogo} className="w-full sm:w-auto">
                    <Upload className="h-4 w-4 me-2" />
                    {t('settings.company.uploadLogo')}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Company Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">{t('settings.company.name')}</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    data-testid="input-company-name"
                    className="min-w-0 w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="tax-id">{t('settings.company.taxId')}</Label>
                  <Input
                    id="tax-id"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    data-testid="input-tax-id"
                    className="min-w-0 w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="company-email">{t('settings.company.email')}</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    data-testid="input-company-email"
                    className="min-w-0 w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="company-phone">{t('settings.company.phone')}</Label>
                  <Input
                    id="company-phone"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    data-testid="input-company-phone"
                    className="min-w-0 w-full"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="company-address">{t('settings.company.address')}</Label>
                  <Input
                    id="company-address"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    data-testid="input-company-address"
                    className="min-w-0 w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="company-city">{t('settings.company.city')}</Label>
                  <Input
                    id="company-city"
                    value={companyCity}
                    onChange={(e) => setCompanyCity(e.target.value)}
                    data-testid="input-company-city"
                    className="min-w-0 w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="parent-company">{t('settings.company.parentCompany')}</Label>
                  <Input
                    id="parent-company"
                    placeholder={t('settings.company.parentCompanyPlaceholder')}
                    className="min-w-0 w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('settings.company.parentCompanyHelp')}
                  </p>
                </div>
                <div>
                  <Label htmlFor="company-country">{t('settings.company.country')}</Label>
                  <Select value={companyCountry} onValueChange={setCompanyCountry}>
                    <SelectTrigger id="company-country" data-testid="select-country">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {/* Middle East */}
                      <SelectItem value="United Arab Emirates">{t('countries.uae')}</SelectItem>
                      <SelectItem value="Saudi Arabia">{t('countries.saudiArabia')}</SelectItem>
                      <SelectItem value="Qatar">{t('countries.qatar')}</SelectItem>
                      <SelectItem value="Kuwait">{t('countries.kuwait')}</SelectItem>
                      <SelectItem value="Bahrain">{t('countries.bahrain')}</SelectItem>
                      <SelectItem value="Oman">{t('countries.oman')}</SelectItem>
                      <SelectItem value="Jordan">{t('countries.jordan')}</SelectItem>
                      <SelectItem value="Lebanon">{t('countries.lebanon')}</SelectItem>
                      <SelectItem value="Egypt">{t('countries.egypt')}</SelectItem>
                      <SelectItem value="Iraq">{t('countries.iraq')}</SelectItem>
                      <SelectItem value="Syria">{t('countries.syria')}</SelectItem>
                      <SelectItem value="Palestine">{t('countries.palestine')}</SelectItem>
                      <SelectItem value="Yemen">{t('countries.yemen')}</SelectItem>
                      {/* North Africa */}
                      <SelectItem value="Morocco">{t('countries.morocco')}</SelectItem>
                      <SelectItem value="Algeria">{t('countries.algeria')}</SelectItem>
                      <SelectItem value="Tunisia">{t('countries.tunisia')}</SelectItem>
                      <SelectItem value="Libya">{t('countries.libya')}</SelectItem>
                      <SelectItem value="Sudan">{t('countries.sudan')}</SelectItem>
                      {/* Americas */}
                      <SelectItem value="United States">{t('countries.unitedStates')}</SelectItem>
                      <SelectItem value="Canada">{t('countries.canada')}</SelectItem>
                      <SelectItem value="Mexico">{t('countries.mexico')}</SelectItem>
                      <SelectItem value="Brazil">{t('countries.brazil')}</SelectItem>
                      <SelectItem value="Argentina">{t('countries.argentina')}</SelectItem>
                      {/* Europe */}
                      <SelectItem value="United Kingdom">{t('countries.unitedKingdom')}</SelectItem>
                      <SelectItem value="Germany">{t('countries.germany')}</SelectItem>
                      <SelectItem value="France">{t('countries.france')}</SelectItem>
                      <SelectItem value="Italy">{t('countries.italy')}</SelectItem>
                      <SelectItem value="Spain">{t('countries.spain')}</SelectItem>
                      <SelectItem value="Netherlands">{t('countries.netherlands')}</SelectItem>
                      <SelectItem value="Belgium">{t('countries.belgium')}</SelectItem>
                      <SelectItem value="Switzerland">{t('countries.switzerland')}</SelectItem>
                      <SelectItem value="Austria">{t('countries.austria')}</SelectItem>
                      <SelectItem value="Sweden">{t('countries.sweden')}</SelectItem>
                      <SelectItem value="Norway">{t('countries.norway')}</SelectItem>
                      <SelectItem value="Denmark">{t('countries.denmark')}</SelectItem>
                      <SelectItem value="Poland">{t('countries.poland')}</SelectItem>
                      <SelectItem value="Turkey">{t('countries.turkey')}</SelectItem>
                      <SelectItem value="Russia">{t('countries.russia')}</SelectItem>
                      {/* Asia */}
                      <SelectItem value="India">{t('countries.india')}</SelectItem>
                      <SelectItem value="Pakistan">{t('countries.pakistan')}</SelectItem>
                      <SelectItem value="Bangladesh">{t('countries.bangladesh')}</SelectItem>
                      <SelectItem value="China">{t('countries.china')}</SelectItem>
                      <SelectItem value="Japan">{t('countries.japan')}</SelectItem>
                      <SelectItem value="South Korea">{t('countries.southKorea')}</SelectItem>
                      <SelectItem value="Indonesia">{t('countries.indonesia')}</SelectItem>
                      <SelectItem value="Malaysia">{t('countries.malaysia')}</SelectItem>
                      <SelectItem value="Singapore">{t('countries.singapore')}</SelectItem>
                      <SelectItem value="Thailand">{t('countries.thailand')}</SelectItem>
                      <SelectItem value="Philippines">{t('countries.philippines')}</SelectItem>
                      <SelectItem value="Vietnam">{t('countries.vietnam')}</SelectItem>
                      {/* Oceania */}
                      <SelectItem value="Australia">{t('countries.australia')}</SelectItem>
                      <SelectItem value="New Zealand">{t('countries.newZealand')}</SelectItem>
                      {/* Africa */}
                      <SelectItem value="South Africa">{t('countries.southAfrica')}</SelectItem>
                      <SelectItem value="Nigeria">{t('countries.nigeria')}</SelectItem>
                      <SelectItem value="Kenya">{t('countries.kenya')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="company-zip">{t('settings.company.zip')}</Label>
                  <Input
                    id="company-zip"
                    value={companyZip}
                    onChange={(e) => setCompanyZip(e.target.value)}
                    data-testid="input-company-zip"
                    className="min-w-0 w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button onClick={() => handleSaveSettings('Company')} disabled={saveMutation.isPending} className="w-full sm:w-auto">
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 me-2" />
                  )}
                  {t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Settings */}
        <TabsContent value="regional">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.regional.title')}</CardTitle>
              <CardDescription>
                {t('settings.regional.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">{t('settings.regional.currency')}</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency" data-testid="select-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-format">{t('settings.regional.dateFormat')}</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger id="date-format" data-testid="select-date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">{t('settings.regional.timeZone')}</Label>
                  <Select value={timeZone} onValueChange={setTimeZone}>
                    <SelectTrigger id="timezone" data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {/* Middle East */}
                      <SelectItem value="Asia/Dubai">{t('timezones.dubai')}</SelectItem>
                      <SelectItem value="Asia/Riyadh">{t('timezones.riyadh')}</SelectItem>
                      <SelectItem value="Asia/Qatar">{t('timezones.qatar')}</SelectItem>
                      <SelectItem value="Asia/Kuwait">{t('timezones.kuwait')}</SelectItem>
                      <SelectItem value="Asia/Bahrain">{t('timezones.bahrain')}</SelectItem>
                      <SelectItem value="Asia/Muscat">{t('timezones.muscat')}</SelectItem>
                      <SelectItem value="Africa/Cairo">{t('timezones.cairo')}</SelectItem>
                      <SelectItem value="Asia/Amman">{t('timezones.amman')}</SelectItem>
                      <SelectItem value="Asia/Beirut">{t('timezones.beirut')}</SelectItem>
                      <SelectItem value="Asia/Baghdad">{t('timezones.baghdad')}</SelectItem>
                      {/* Americas */}
                      <SelectItem value="America/New_York">{t('timezones.eastern')}</SelectItem>
                      <SelectItem value="America/Chicago">{t('timezones.central')}</SelectItem>
                      <SelectItem value="America/Denver">{t('timezones.mountain')}</SelectItem>
                      <SelectItem value="America/Los_Angeles">{t('timezones.pacific')}</SelectItem>
                      {/* Europe */}
                      <SelectItem value="Europe/London">{t('timezones.london')}</SelectItem>
                      <SelectItem value="Europe/Paris">{t('timezones.paris')}</SelectItem>
                      <SelectItem value="Europe/Berlin">{t('timezones.berlin')}</SelectItem>
                      <SelectItem value="Europe/Moscow">{t('timezones.moscow')}</SelectItem>
                      {/* Asia */}
                      <SelectItem value="Asia/Kolkata">{t('timezones.india')}</SelectItem>
                      <SelectItem value="Asia/Karachi">{t('timezones.pakistan')}</SelectItem>
                      <SelectItem value="Asia/Shanghai">{t('timezones.china')}</SelectItem>
                      <SelectItem value="Asia/Tokyo">{t('timezones.tokyo')}</SelectItem>
                      <SelectItem value="Asia/Singapore">{t('timezones.singapore')}</SelectItem>
                      {/* Oceania */}
                      <SelectItem value="Australia/Sydney">{t('timezones.sydney')}</SelectItem>
                      <SelectItem value="Pacific/Auckland">{t('timezones.auckland')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fiscal-year">{t('settings.regional.fiscalYearStart')}</Label>
                  <Select value={fiscalYearStart} onValueChange={setFiscalYearStart}>
                    <SelectTrigger id="fiscal-year" data-testid="select-fiscal-year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="january">{t('months.january')}</SelectItem>
                      <SelectItem value="february">{t('months.february')}</SelectItem>
                      <SelectItem value="march">{t('months.march')}</SelectItem>
                      <SelectItem value="april">{t('months.april')}</SelectItem>
                      <SelectItem value="may">{t('months.may')}</SelectItem>
                      <SelectItem value="june">{t('months.june')}</SelectItem>
                      <SelectItem value="july">{t('months.july')}</SelectItem>
                      <SelectItem value="august">{t('months.august')}</SelectItem>
                      <SelectItem value="september">{t('months.september')}</SelectItem>
                      <SelectItem value="october">{t('months.october')}</SelectItem>
                      <SelectItem value="november">{t('months.november')}</SelectItem>
                      <SelectItem value="december">{t('months.december')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button onClick={() => handleSaveSettings('Regional')} disabled={saveMutation.isPending} className="w-full sm:w-auto">
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 me-2" />
                  )}
                  {t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Settings */}
        <TabsContent value="invoice">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.invoice.title')}</CardTitle>
              <CardDescription>
                {t('settings.invoice.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Invoice Numbering */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('settings.invoice.invoiceNumbering')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoice-prefix">{t('settings.invoice.prefix')}</Label>
                    <Input
                      id="invoice-prefix"
                      value={invoicePrefix}
                      onChange={(e) => setInvoicePrefix(e.target.value)}
                      data-testid="input-invoice-prefix"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{t('settings.invoice.prefixHelp')}</p>
                  </div>
                  <div>
                    <Label htmlFor="next-invoice">{t('settings.invoice.nextNumber')}</Label>
                    <Input
                      id="next-invoice"
                      type="number"
                      value={nextInvoiceNumber}
                      onChange={(e) => setNextInvoiceNumber(e.target.value)}
                      data-testid="input-next-invoice"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{t('settings.invoice.nextNumberHelp')}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Quotation Numbering */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('settings.invoice.quotationNumbering')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quote-prefix">{t('settings.invoice.quotePrefix')}</Label>
                    <Input
                      id="quote-prefix"
                      value={quotePrefix}
                      onChange={(e) => setQuotePrefix(e.target.value)}
                      data-testid="input-quote-prefix"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{t('settings.invoice.quotePrefixHelp')}</p>
                  </div>
                  <div>
                    <Label htmlFor="next-quote">{t('settings.invoice.nextQuoteNumber')}</Label>
                    <Input
                      id="next-quote"
                      type="number"
                      value={nextQuoteNumber}
                      onChange={(e) => setNextQuoteNumber(e.target.value)}
                      data-testid="input-next-quote"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{t('settings.invoice.nextQuoteNumberHelp')}</p>
                  </div>
                  <div>
                    <Label htmlFor="quote-validity">{t('settings.invoice.quoteValidityDays')}</Label>
                    <Select value={quoteValidityDays} onValueChange={setQuoteValidityDays}>
                      <SelectTrigger id="quote-validity" data-testid="select-quote-validity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">{t('settings.invoice.days', { count: 7 })}</SelectItem>
                        <SelectItem value="14">{t('settings.invoice.days', { count: 14 })}</SelectItem>
                        <SelectItem value="30">{t('settings.invoice.days', { count: 30 })}</SelectItem>
                        <SelectItem value="45">{t('settings.invoice.days', { count: 45 })}</SelectItem>
                        <SelectItem value="60">{t('settings.invoice.days', { count: 60 })}</SelectItem>
                        <SelectItem value="90">{t('settings.invoice.days', { count: 90 })}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">{t('settings.invoice.quoteValidityHelp')}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment & Tax Settings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('settings.invoice.paymentSettings')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment-terms">{t('settings.invoice.paymentTerms')}</Label>
                    <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                      <SelectTrigger id="payment-terms" data-testid="select-payment-terms">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">{t('paymentTerms.dueOnReceipt')}</SelectItem>
                        <SelectItem value="15">{t('paymentTerms.net15')}</SelectItem>
                        <SelectItem value="30">{t('paymentTerms.net30')}</SelectItem>
                        <SelectItem value="45">{t('paymentTerms.net45')}</SelectItem>
                        <SelectItem value="60">{t('paymentTerms.net60')}</SelectItem>
                        <SelectItem value="90">{t('paymentTerms.net90')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tax-rate">{t('settings.invoice.taxRate')}</Label>
                    <Input
                      id="tax-rate"
                      type="number"
                      step="0.1"
                      value={defaultTaxRate}
                      onChange={(e) => setDefaultTaxRate(e.target.value)}
                      data-testid="input-tax-rate"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button onClick={() => handleSaveSettings('Invoice')} disabled={saveMutation.isPending} className="w-full sm:w-auto">
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 me-2" />
                  )}
                  {t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.notifications.title')}</CardTitle>
              <CardDescription>
                {t('settings.notifications.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notifications.invoiceReminders')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.notifications.invoiceRemindersDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={invoiceReminders}
                    onCheckedChange={setInvoiceReminders}
                    data-testid="switch-invoice-reminders"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notifications.paymentAlerts')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.notifications.paymentAlertsDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={paymentAlerts}
                    onCheckedChange={setPaymentAlerts}
                    data-testid="switch-payment-alerts"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notifications.lowStockAlerts')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.notifications.lowStockAlertsDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={lowStockAlerts}
                    onCheckedChange={setLowStockAlerts}
                    data-testid="switch-low-stock-alerts"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button onClick={() => handleSaveSettings('Notification')} disabled={saveMutation.isPending} className="w-full sm:w-auto">
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 me-2" />
                  )}
                  {t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.security.title')}</CardTitle>
              <CardDescription>
                {t('settings.security.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.security.2fa')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.security.2faDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={twoFactorAuth}
                    onCheckedChange={setTwoFactorAuth}
                    data-testid="switch-2fa"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.security.ipRestriction')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.security.ipRestrictionDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={ipRestriction}
                    onCheckedChange={setIpRestriction}
                    data-testid="switch-ip-restriction"
                  />
                </div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="session-timeout">{t('settings.security.sessionTimeout')}</Label>
                    <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                      <SelectTrigger id="session-timeout" data-testid="select-session-timeout">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">{t('time.minutes', { count: 15 })}</SelectItem>
                        <SelectItem value="30">{t('time.minutes', { count: 30 })}</SelectItem>
                        <SelectItem value="60">{t('time.hours', { count: 1 })}</SelectItem>
                        <SelectItem value="120">{t('time.hours', { count: 2 })}</SelectItem>
                        <SelectItem value="480">{t('time.hours', { count: 8 })}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="password-expiry">{t('settings.security.passwordExpiry')}</Label>
                    <Select value={passwordExpiry} onValueChange={setPasswordExpiry}>
                      <SelectTrigger id="password-expiry" data-testid="select-password-expiry">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">{t('time.days', { count: 30 })}</SelectItem>
                        <SelectItem value="60">{t('time.days', { count: 60 })}</SelectItem>
                        <SelectItem value="90">{t('time.days', { count: 90 })}</SelectItem>
                        <SelectItem value="180">{t('time.days', { count: 180 })}</SelectItem>
                        <SelectItem value="365">{t('time.years', { count: 1 })}</SelectItem>
                        <SelectItem value="0">{t('common.never')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button onClick={() => handleSaveSettings('Security')} disabled={saveMutation.isPending} className="w-full sm:w-auto">
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 me-2" />
                  )}
                  {t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}