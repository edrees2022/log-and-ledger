import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  FileText, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Copy,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Calendar,
  User,
  AlertCircle,
  Loader2,
  Trash2,
  DollarSign,
  TrendingUp,
  Package,
  Building2,
  Mail,
  Phone,
  FileDown,
  Printer,
  Share2,
  Percent,
  Tag
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

// Quotation form schema with line items
const quotationSchemaFactory = (t: (key: string) => string) => z.object({
  quote_number: z.string().optional(),
  customer_id: z.string().min(1, t('validation.selectCustomer')),
  date: z.string().min(1, t('validation.dateRequired')),
  valid_until: z.string().min(1, t('validation.validUntilRequired')),
  currency: z.string().default('USD'),
  fx_rate: z.coerce.number().min(0).default(1),
  terms: z.string().optional(),
  notes: z.string().optional(),
  project_id: z.string().optional(),
  lines: z.array(z.object({
    description: z.string().min(1),
    quantity: z.coerce.number().min(1),
    unit_price: z.coerce.number().min(0),
    tax_id: z.string().optional(),
    tax_rate: z.coerce.number().min(0).max(100).default(0),
    discount_percentage: z.coerce.number().min(0).max(100).default(0),
    item_id: z.string().optional(),
  })).min(1, t('validation.atLeastOneLine')),
});

type QuotationForm = z.infer<ReturnType<typeof quotationSchemaFactory>>;

export default function QuotationsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const statusConfig = {
    draft: { label: t('common.draft'), icon: Edit, color: 'secondary', bgColor: 'bg-gray-100 dark:bg-gray-800' },
    sent: { label: t('common.sent'), icon: Send, color: 'default', bgColor: 'bg-blue-100 dark:bg-blue-900' },
    accepted: { label: t('sales.quotations.accepted'), icon: CheckCircle, color: 'success', bgColor: 'bg-green-100 dark:bg-green-900' },
    rejected: { label: t('sales.quotations.rejected'), icon: XCircle, color: 'destructive', bgColor: 'bg-red-100 dark:bg-red-900' },
    expired: { label: t('sales.quotations.expired'), icon: Clock, color: 'secondary', bgColor: 'bg-orange-100 dark:bg-orange-900' },
  };
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editingQuoteNumber, setEditingQuoteNumber] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Get company base currency
  const baseCurrency = user?.activeCompany?.base_currency || 'AED';

  // Fetch company settings for quote numbering
  const { data: companySettings } = useQuery<any>({
    queryKey: ['/api/settings/company'],
  });

  // Get next quote number
  const quotePrefix = companySettings?.quote_prefix || 'QT-';
  const nextQuoteNumber = companySettings?.next_quote_number || 1;

  // Fetch exchange rates from database (correct endpoint)
  const { data: exchangeRates = [] } = useQuery<any[]>({
    queryKey: ['/api/currencies/rates'],
  });

  // Fetch contacts (customers)
  const { data: contacts = [], isLoading: loadingContacts } = useQuery<any[]>({
    queryKey: ['/api/contacts'],
  });

  const customers = contacts.filter(contact => 
    contact.type === 'customer' || contact.type === 'both'
  );

  // Fetch items for line items
  const { data: items = [] } = useQuery<any[]>({
    queryKey: ['/api/items'],
  });

  // Fetch taxes
  const { data: taxes = [] } = useQuery<any[]>({
    queryKey: ['/api/taxes'],
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  // Form with line items
  const form = useForm<QuotationForm>({
    resolver: zodResolver(quotationSchemaFactory(t)),
    defaultValues: {
      quote_number: '',
      customer_id: '',
      date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: baseCurrency,
      fx_rate: 1,
      terms: '',
      notes: '',
      project_id: '',
      lines: [{ description: '', quantity: 1, unit_price: 0, tax_id: '', tax_rate: 0, discount_percentage: 0, item_id: '' }],
    },
  });

  // Watch selected currency
  const selectedCurrency = form.watch('currency');

  // Update exchange rate when currency changes
  useEffect(() => {
    if (selectedCurrency === baseCurrency) {
      setExchangeRate(1.0);
      form.setValue('fx_rate', 1);
    } else if (selectedCurrency) {
      // Find exchange rate from database
      const rate = exchangeRates.find((r: any) => 
        r.from_currency === baseCurrency && r.to_currency === selectedCurrency
      );
      if (rate) {
        const rateValue = parseFloat(rate.rate);
        setExchangeRate(rateValue);
        form.setValue('fx_rate', rateValue);
      } else {
        // Default exchange rates relative to AED (approximate)
        const ratesVsAED: { [key: string]: number } = {
          'AED': 1,
          'USD': 0.27,
          'EUR': 0.25,
          'GBP': 0.22,
          'SAR': 1.02,
          'KWD': 0.083,
          'BHD': 0.103,
          'OMR': 0.105,
          'QAR': 0.99,
          'EGP': 8.4,
          'JOD': 0.19,
          'LBP': 24400,
          'SYP': 3500,
          'IQD': 357,
          'MAD': 2.7,
          'TND': 0.85,
          'DZD': 36.5,
          'LYD': 1.3,
          'SDG': 163,
          'YER': 68,
          'TRY': 7.8,
          'INR': 22.7,
          'PKR': 75.6,
          'CNY': 1.97,
          'JPY': 40.8,
          'CHF': 0.24,
          'CAD': 0.37,
          'AUD': 0.42,
        };
        
        // Calculate rate from base currency to selected currency
        const baseToAED = baseCurrency === 'AED' ? 1 : (1 / (ratesVsAED[baseCurrency] || 1));
        const aedToSelected = ratesVsAED[selectedCurrency] || 1;
        const calculatedRate = baseToAED * aedToSelected;
        setExchangeRate(calculatedRate);
        form.setValue('fx_rate', calculatedRate);
      }
    }
  }, [selectedCurrency, baseCurrency, exchangeRates, form]);

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'lines',
  });

  // Watch lines to calculate totals
  const watchedLines = form.watch('lines');
  
  // Calculate line totals with discount
  const calculateLineTotal = (line: any) => {
    const qty = Number(line.quantity) || 0;
    const price = Number(line.unit_price) || 0;
    const discount = Number(line.discount_percentage) || 0;
    const lineSubtotal = qty * price;
    const discountAmount = lineSubtotal * discount / 100;
    return lineSubtotal - discountAmount;
  };

  const calculateLineTax = (line: any) => {
    const lineTotal = calculateLineTotal(line);
    const taxRate = Number(line.tax_rate) || 0;
    return lineTotal * taxRate / 100;
  };

  const subtotal = watchedLines.reduce((sum, line) => sum + calculateLineTotal(line), 0);
  const discountTotal = watchedLines.reduce((sum, line) => {
    const qty = Number(line.quantity) || 0;
    const price = Number(line.unit_price) || 0;
    const discount = Number(line.discount_percentage) || 0;
    return sum + (qty * price * discount / 100);
  }, 0);
  const taxTotal = watchedLines.reduce((sum, line) => sum + calculateLineTax(line), 0);
  const total = subtotal + taxTotal;

  // Calculate in base currency (only if different currency selected)
  const subtotalInBaseCurrency = useMemo(() => {
    if (selectedCurrency === baseCurrency || exchangeRate === 1) return null;
    return subtotal / exchangeRate;
  }, [subtotal, exchangeRate, selectedCurrency, baseCurrency]);

  const totalInBaseCurrency = useMemo(() => {
    if (selectedCurrency === baseCurrency || exchangeRate === 1) return null;
    return total / exchangeRate;
  }, [total, exchangeRate, selectedCurrency, baseCurrency]);

  // Create quotation mutation
  const createMutation = useMutation({
    mutationFn: async (data: QuotationForm) => {
      const processedData = {
        customer_id: data.customer_id,
        quote_number: data.quote_number || null, // Allow custom quote number
        project_id: data.project_id || null,
        date: data.date,
        valid_until: data.valid_until,
        currency: data.currency,
        fx_rate: exchangeRate.toString(),
        status: (data as any).status || 'draft',
        subtotal: subtotal.toString(),
        tax_total: taxTotal.toString(),
        total: total.toString(),
        notes: data.notes || null,
        terms: data.terms || null,
        lines: data.lines.map((line, index) => ({
          description: line.description,
          quantity: line.quantity.toString(),
          unit_price: line.unit_price.toString(),
          discount_percentage: (line.discount_percentage || 0).toString(),
          tax_id: line.tax_id && line.tax_id !== '' ? line.tax_id : null,
          tax_rate: line.tax_rate || 0,
          line_total: calculateLineTotal(line).toString(),
          tax_amount: calculateLineTax(line).toString(),
          item_id: line.item_id && line.item_id !== '' ? line.item_id : null,
          line_number: index + 1,
        })),
      };
      console.log('Sending quotation data:', processedData);
      return await apiRequest('POST', '/api/sales/quotations', processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/quotations'] });
      setShowDialog(false);
      form.reset();
      toast({
        title: t('common.createSuccess'),
        description: t('sales.quotations.quotationCreatedSuccess'),
      });
    },
    onError: (error: any) => {
      console.error('Quotation creation error:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('sales.quotations.quotationCreateError'),
        variant: 'destructive',
      });
    },
  });

  // Update quotation mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: QuotationForm }) => {
      const processedData = {
        customer_id: data.customer_id,
        project_id: data.project_id || null,
        date: data.date,
        valid_until: data.valid_until,
        currency: data.currency,
        fx_rate: exchangeRate.toString(),
        status: (data as any).status || 'draft',
        subtotal: subtotal.toString(),
        tax_total: taxTotal.toString(),
        total: total.toString(),
        notes: data.notes || null,
        terms: data.terms || null,
        lines: data.lines.map((line, index) => ({
          description: line.description,
          quantity: line.quantity.toString(),
          unit_price: line.unit_price.toString(),
          discount_percentage: (line.discount_percentage || 0).toString(),
          tax_id: line.tax_id && line.tax_id !== '' ? line.tax_id : null,
          tax_rate: line.tax_rate || 0,
          line_total: calculateLineTotal(line).toString(),
          tax_amount: calculateLineTax(line).toString(),
          item_id: line.item_id && line.item_id !== '' ? line.item_id : null,
          line_number: index + 1,
        })),
      };
      console.log('Updating quotation data:', processedData);
      return await apiRequest('PUT', `/api/sales/quotations/${id}`, processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/quotations'] });
      setShowDialog(false);
      setIsEditing(false);
      setEditingQuoteId(null);
      form.reset();
      toast({
        title: t('common.updateSuccess'),
        description: t('sales.quotations.quotationUpdatedSuccess'),
      });
    },
    onError: (error: any) => {
      console.error('Quotation update error:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('sales.quotations.quotationUpdateError'),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: QuotationForm) => {
    console.log('Form submitted:', data);
    if (isEditing && editingQuoteId) {
      updateMutation.mutate({ id: editingQuoteId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Handle edit quote - fetch line items and populate form
  const handleEditQuote = async (quote: any) => {
    try {
      console.log('Editing quote:', quote);
      // Fetch existing line items
      const linesResponse = await apiRequest('GET', `/api/sales/document-lines?document_type=quote&document_id=${quote.id}`);
      const fetchedLines = await linesResponse.json(); // Parse JSON from Response!
      console.log('Lines response:', fetchedLines);
      const lines = Array.isArray(fetchedLines) ? fetchedLines : [];
      console.log('Parsed lines:', lines);
      
      // Set editing state first
      setIsEditing(true);
      setEditingQuoteId(quote.id.toString());
      setEditingQuoteNumber(quote.quote_number);
      
      // Set exchange rate from quote
      const fxRate = parseFloat(quote.fx_rate) || 1;
      setExchangeRate(fxRate);
      
      // Prepare lines data with proper number conversion
      const linesFormData = lines.length > 0 ? lines.map((line: any) => {
        console.log('Processing line:', line);
        return {
          description: line.description || '',
          quantity: parseFloat(line.quantity) || 1,
          unit_price: parseFloat(line.unit_price) || 0,
          tax_id: line.tax_id?.toString() || '',
          tax_rate: parseFloat(line.tax_rate) || 0,
          discount_percentage: parseFloat(line.discount_percentage) || 0,
          item_id: line.item_id?.toString() || '',
        };
      }) : [{ description: '', quantity: 1, unit_price: 0, tax_id: '', tax_rate: 0, discount_percentage: 0, item_id: '' }];
      
      console.log('Prepared lines data:', linesFormData);
      
      // First, reset form completely
      form.reset();
      
      // Then set values with a slight delay to ensure form is ready
      setTimeout(() => {
        // Set all form values
        form.setValue('quote_number', quote.quote_number || '');
        form.setValue('customer_id', quote.customer_id?.toString() || '');
        form.setValue('date', quote.date ? new Date(quote.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        form.setValue('valid_until', quote.valid_until ? new Date(quote.valid_until).toISOString().split('T')[0] : '');
        form.setValue('currency', quote.currency || baseCurrency);
        form.setValue('fx_rate', fxRate);
        form.setValue('notes', quote.notes || '');
        form.setValue('project_id', quote.project_id?.toString() || '');
        form.setValue('terms', quote.terms || '');
        
        // Replace field array with loaded lines
        replace(linesFormData);
        
        console.log('Form values after setValue:', form.getValues());
        
        // Open dialog after form is populated
        setShowDialog(true);
      }, 50);
    } catch (error) {
      console.error('Error loading quote for edit:', error);
      toast({
        title: t('common.error'),
        description: t('sales.quotations.errorLoadingQuote'),
        variant: 'destructive',
      });
    }
  };

  // Handle duplicate quote
  const handleDuplicateQuote = async (quote: any) => {
    try {
      // Fetch existing line items
      const linesResponse = await apiRequest('GET', `/api/sales/document-lines?document_type=quote&document_id=${quote.id}`);
      const linesData = await linesResponse.json(); // Parse JSON from Response!
      const lines = Array.isArray(linesData) ? linesData : [];
      
      // Populate form with quote data but as new quote
      form.reset({
        customer_id: quote.customer_id?.toString() || '',
        date: new Date().toISOString().split('T')[0], // Today's date
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        currency: quote.currency || baseCurrency,
        notes: quote.notes || '',
        project_id: quote.project_id?.toString() || '',
        terms: '',
        lines: lines.length > 0 ? lines.map((line: any) => ({
          description: line.description || '',
          quantity: Number(line.quantity) || 1,
          unit_price: Number(line.unit_price) || 0,
          tax_id: line.tax_id?.toString() || '',
          tax_rate: Number(line.tax_rate) || 0,
          discount_percentage: Number(line.discount_percentage) || 0,
          item_id: line.item_id?.toString() || '',
        })) : [{ description: '', quantity: 1, unit_price: 0, tax_id: '', tax_rate: 0, discount_percentage: 0, item_id: '' }],
      });
      
      // Open dialog in create mode (not edit)
      setIsEditing(false);
      setEditingQuoteId(null);
      setShowDialog(true);
      
      toast({
        title: t('common.info'),
        description: t('sales.quotations.quotationDuplicated'),
      });
    } catch (error) {
      console.error('Error duplicating quote:', error);
      toast({
        title: t('common.error'),
        description: t('sales.quotations.errorLoadingQuote'),
        variant: 'destructive',
      });
    }
  };

  // Fetch quotations from API
  const { 
    data: quotations = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/sales/quotations'],
    select: (data: any[]) => {
      if (!data) return [];
      return data.map((quote: any) => ({
        ...quote,
        total: Number(quote.total) || 0,
        subtotal: Number(quote.subtotal) || 0,
        tax_total: Number(quote.tax_total) || 0,
      }));
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      return apiRequest('DELETE', `/api/sales/quotations/${quoteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/quotations'] });
      toast({
        title: t('common.deleteSuccess'),
        description: t('sales.quotations.quotationDeletedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('sales.quotations.quotationDeleteError'),
        variant: 'destructive',
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PUT', `/api/sales/quotations/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/quotations'] });
      toast({
        title: t('common.updateSuccess'),
        description: t('sales.quotations.statusUpdated'),
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

  // Delete handler
  const handleDelete = async (quoteId: string) => {
    if (confirm(t('sales.quotations.confirmDelete'))) {
      deleteMutation.mutate(quoteId);
    }
  };

  // Filter quotations
  const filteredQuotations = quotations.filter((quote: any) => {
    const matchesSearch = 
      quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case 'draft':
        return quote.status === 'draft';
      case 'sent':
        return quote.status === 'sent';
      case 'accepted':
        return quote.status === 'accepted';
      case 'expired':
        return quote.status === 'expired';
      default:
        return true;
    }
  });

  // Calculate statistics (convert all values to base currency)
  const stats = {
    total: quotations.length,
    // Convert each quote total to base currency using its fx_rate
    totalValue: quotations.reduce((sum: number, q: any) => {
      const fxRate = parseFloat(q.fx_rate) || 1;
      const totalInBase = (parseFloat(q.total) || 0) / fxRate;
      return sum + totalInBase;
    }, 0),
    draft: quotations.filter((q: any) => q.status === 'draft').length,
    sent: quotations.filter((q: any) => q.status === 'sent').length,
    accepted: quotations.filter((q: any) => q.status === 'accepted').length,
    acceptedValue: quotations.filter((q: any) => q.status === 'accepted').reduce((sum: number, q: any) => {
      const fxRate = parseFloat(q.fx_rate) || 1;
      const totalInBase = (parseFloat(q.total) || 0) / fxRate;
      return sum + totalInBase;
    }, 0),
    acceptanceRate: quotations.length > 0 ? Math.round((quotations.filter((q: any) => q.status === 'accepted').length / quotations.length) * 100) : 0,
    avgValue: quotations.length > 0 ? quotations.reduce((sum: number, q: any) => {
      const fxRate = parseFloat(q.fx_rate) || 1;
      const totalInBase = (parseFloat(q.total) || 0) / fxRate;
      return sum + totalInBase;
    }, 0) / quotations.length : 0,
    pendingValue: quotations.filter((q: any) => q.status === 'sent').reduce((sum: number, q: any) => {
      const fxRate = parseFloat(q.fx_rate) || 1;
      const totalInBase = (parseFloat(q.total) || 0) / fxRate;
      return sum + totalInBase;
    }, 0),
  };

  // Format currency
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Format date properly
  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      }).format(date);
    } catch {
      return '-';
    }
  };

  // Convert mutation
  const convertMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      return apiRequest('POST', `/api/sales/quotations/${quoteId}/convert`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/quotations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/invoices'] });
      toast({
        title: t('sales.quotations.convertedToInvoice'),
        description: t('sales.quotations.quotationConvertedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('sales.quotations.quotationConvertError'),
        variant: 'destructive',
      });
    },
  });

  // Fetch quote lines/details (must be before any early returns)
  const { data: quoteLines = [], isLoading: loadingLines, refetch: refetchLines, isFetching } = useQuery<any[]>({
    queryKey: ['/api/sales/document-lines', 'quote', selectedQuote?.id],
    queryFn: async (): Promise<any[]> => {
      if (!selectedQuote?.id) {
        console.log('No selectedQuote.id, returning empty array');
        return [];
      }
      console.log('Fetching lines for quote:', selectedQuote.id);
      try {
        const res = await apiRequest('GET', `/api/sales/document-lines?document_type=quote&document_id=${selectedQuote.id}`);
        const data = await res.json(); // Parse JSON from Response!
        console.log('Lines API data:', data);
        const result = Array.isArray(data) ? data : [];
        console.log('Parsed lines result:', result);
        return result;
      } catch (error) {
        console.error('Error fetching lines:', error);
        return [];
      }
    },
    enabled: !!selectedQuote?.id,
    staleTime: 0,
    gcTime: 0, // Don't cache
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
  
  // Refetch lines when view dialog opens or selectedQuote changes
  useEffect(() => {
    if (showViewDialog && selectedQuote?.id) {
      console.log('View dialog opened, refetching lines for:', selectedQuote.id);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/sales/document-lines', 'quote', selectedQuote.id] });
    }
  }, [showViewDialog, selectedQuote?.id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
          <p className="text-lg font-medium mb-2">{t('common.errorLoadingData')}</p>
          <p className="text-muted-foreground mb-4">{t('common.refreshPage')}</p>
          <Button 
            onClick={() => queryClient.refetchQueries({ queryKey: ['/api/sales/quotations'] })}
            data-testid="button-refresh-quotations"
          >
            {t('common.refresh')}
          </Button>
        </div>
      </div>
    );
  }

  const handleConvertToInvoice = (id: string) => {
    if (confirm(t('sales.quotations.confirmConvert'))) {
      convertMutation.mutate(id);
    }
  };

  const handleMarkAsSent = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'sent' });
  };

  const handleMarkAsAccepted = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'accepted' });
  };

  const handleMarkAsRejected = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'rejected' });
  };

  const handleViewQuote = (quote: any) => {
    console.log('Opening view dialog for quote:', quote.id);
    setSelectedQuote(quote);
    setShowViewDialog(true);
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

  // Handle item selection in line items - auto-fill price from item
  // Item prices are stored in base currency, convert to selected currency
  const handleItemSelect = (index: number, itemId: string) => {
    const item = items.find((i: any) => i.id === itemId);
    console.log('Selected item:', item);
    if (item) {
      // Use sales_price (correct field name from schema) - stored in base currency
      let price = Number(item.sales_price) || Number(item.cost_price) || 0;
      
      // Convert price to selected currency if different from base currency
      if (selectedCurrency !== baseCurrency && exchangeRate !== 1) {
        price = price * exchangeRate;
      }
      
      console.log('Setting price:', price, 'Exchange rate:', exchangeRate);
      form.setValue(`lines.${index}.description`, item.name || item.description || '');
      form.setValue(`lines.${index}.unit_price`, Math.round(price * 100) / 100); // Round to 2 decimals
      form.setValue(`lines.${index}.item_id`, itemId);
      // If item has default tax, set it
      if (item.default_tax_id) {
        const tax = taxes.find((t: any) => t.id === item.default_tax_id);
        if (tax) {
          form.setValue(`lines.${index}.tax_id`, tax.id);
          form.setValue(`lines.${index}.tax_rate`, Number(tax.rate) || 0);
        }
      }
    }
  };

  // Handle tax selection
  const handleTaxSelect = (index: number, taxId: string) => {
    console.log('Tax selected:', taxId);
    if (taxId && taxId !== 'none') {
      const tax = taxes.find((t: any) => t.id === taxId);
      console.log('Found tax:', tax);
      if (tax) {
        form.setValue(`lines.${index}.tax_id`, taxId);
        form.setValue(`lines.${index}.tax_rate`, Number(tax.rate) || 0);
      }
    } else {
      form.setValue(`lines.${index}.tax_id`, '');
      form.setValue(`lines.${index}.tax_rate`, 0);
    }
  };

  // Get customer details
  const getCustomerDetails = (customerId: string) => {
    return customers.find(c => c.id === customerId);
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('sales.quotations.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('sales.quotations.description')}
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            form.reset();
            setIsEditing(false);
            setEditingQuoteId(null);
            setEditingQuoteNumber(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto" data-testid="button-new-quotation">
              <Plus className="h-4 w-4 me-2" />
              {t('sales.quotations.addQuotation')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {isEditing ? t('sales.quotations.editQuotation') : t('sales.quotations.addQuotation')}
              </DialogTitle>
              <DialogDescription className="flex items-center justify-between">
                <span>{isEditing ? t('sales.quotations.editQuotationDescription') : t('sales.quotations.createNewQuotation')}</span>
                <Badge variant="outline" className="text-primary font-mono">
                  {isEditing ? editingQuoteNumber : `${quotePrefix}${String(nextQuoteNumber).padStart(6, '0')}`}
                </Badge>
              </DialogDescription>
            </DialogHeader>

            {/* Alert if no customers */}
            {customers.length === 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('common.warning')}</AlertTitle>
                <AlertDescription>
                  {t('sales.quotations.noCustomersWarning')}
                  <Link href="/contacts">
                    <Button variant="ghost" className="p-0 h-auto text-primary underline ms-2">
                      {t('sales.quotations.addCustomerFirst')}
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Customer & Date Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-primary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t('sales.quotations.customerDetails')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="customer_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-red-500">* {t('common.customer')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className={!field.value ? 'border-red-300' : ''}>
                                  <SelectValue placeholder={t('placeholders.selectCustomer')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {customers.length === 0 ? (
                                  <div className="p-4 text-center text-muted-foreground">
                                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>{t('sales.quotations.noCustomersFound')}</p>
                                  </div>
                                ) : (
                                  customers.map((customer) => (
                                    <SelectItem key={customer.id} value={customer.id}>
                                      <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        {customer.name}
                                      </div>
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Show customer details if selected */}
                      {form.watch('customer_id') && (
                        <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                          {(() => {
                            const customer = getCustomerDetails(form.watch('customer_id'));
                            if (!customer) return null;
                            return (
                              <>
                                {customer.email && (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    {customer.email}
                                  </div>
                                )}
                                {customer.phone && (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    {customer.phone}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="project_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('common.project')} ({t('common.optional')})</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('common.selectProject')} />
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
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {t('sales.quotations.dateDetails')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Quote Number - Editable */}
                      <FormField
                        control={form.control}
                        name="quote_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('sales.quotations.quotationNumber')}</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder={isEditing ? editingQuoteNumber || '' : `${quotePrefix}${String(nextQuoteNumber).padStart(6, '0')}`}
                                className="font-mono"
                              />
                            </FormControl>
                            <FormDescription>
                              {t('sales.quotations.quoteNumberDescription')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-red-500">* {t('common.date')}</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="valid_until"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-red-500">* {t('sales.quotations.validUntil')}</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormDescription>
                              {t('sales.quotations.validUntilDescription')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('common.currency')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="AED">AED - درهم إماراتي</SelectItem>
                                <SelectItem value="SAR">SAR - ريال سعودي</SelectItem>
                                <SelectItem value="USD">USD - دولار أمريكي</SelectItem>
                                <SelectItem value="EUR">EUR - يورو</SelectItem>
                                <SelectItem value="GBP">GBP - جنيه إسترليني</SelectItem>
                                <SelectItem value="KWD">KWD - دينار كويتي</SelectItem>
                                <SelectItem value="BHD">BHD - دينار بحريني</SelectItem>
                                <SelectItem value="OMR">OMR - ريال عماني</SelectItem>
                                <SelectItem value="QAR">QAR - ريال قطري</SelectItem>
                                <SelectItem value="EGP">EGP - جنيه مصري</SelectItem>
                                <SelectItem value="JOD">JOD - دينار أردني</SelectItem>
                                <SelectItem value="LBP">LBP - ليرة لبنانية</SelectItem>
                                <SelectItem value="SYP">SYP - ليرة سورية</SelectItem>
                                <SelectItem value="IQD">IQD - دينار عراقي</SelectItem>
                                <SelectItem value="MAD">MAD - درهم مغربي</SelectItem>
                                <SelectItem value="TND">TND - دينار تونسي</SelectItem>
                                <SelectItem value="DZD">DZD - دينار جزائري</SelectItem>
                                <SelectItem value="LYD">LYD - دينار ليبي</SelectItem>
                                <SelectItem value="SDG">SDG - جنيه سوداني</SelectItem>
                                <SelectItem value="YER">YER - ريال يمني</SelectItem>
                                <SelectItem value="TRY">TRY - ليرة تركية</SelectItem>
                                <SelectItem value="INR">INR - روبية هندية</SelectItem>
                                <SelectItem value="PKR">PKR - روبية باكستانية</SelectItem>
                                <SelectItem value="CNY">CNY - يوان صيني</SelectItem>
                                <SelectItem value="JPY">JPY - ين ياباني</SelectItem>
                                <SelectItem value="CHF">CHF - فرنك سويسري</SelectItem>
                                <SelectItem value="CAD">CAD - دولار كندي</SelectItem>
                                <SelectItem value="AUD">AUD - دولار أسترالي</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Exchange Rate - Show when currency differs from base */}
                      {selectedCurrency && selectedCurrency !== baseCurrency && (
                        <FormField
                          control={form.control}
                          name="fx_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('common.exchangeRate')}</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.000001"
                                  {...field}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 1;
                                    field.onChange(value);
                                    setExchangeRate(value);
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                1 {baseCurrency} = {field.value || exchangeRate} {selectedCurrency}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Line Items Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {t('sales.quotations.lineItems')}
                      </CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ description: '', quantity: 1, unit_price: 0, tax_id: '', tax_rate: 0, discount_percentage: 0, item_id: '' })}
                      >
                        <Plus className="h-4 w-4 me-1" />
                        {t('common.addLine')}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Line Items */}
                      {fields.map((field, index) => {
                        const lineTotal = calculateLineTotal(form.watch(`lines.${index}`));
                        const lineTax = calculateLineTax(form.watch(`lines.${index}`));
                        const lineGrandTotal = lineTotal + lineTax;
                        
                        return (
                          <div key={field.id} className="p-4 bg-muted/30 rounded-lg border space-y-4">
                            {/* Row 1: Item selection and description */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                              {/* Item Select */}
                              <div className="md:col-span-3">
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  <Tag className="h-3 w-3 inline me-1" />
                                  {t('common.item')}
                                </Label>
                                <Select onValueChange={(value) => handleItemSelect(index, value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('placeholders.selectItem')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {items.map((item: any) => (
                                      <SelectItem key={item.id} value={item.id}>
                                        <div className="flex justify-between items-center w-full">
                                          <span>{item.name}</span>
                                          <span className="text-muted-foreground text-xs ms-2">
                                            {formatCurrency(Number(item.selling_price) || 0, form.watch('currency'))}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Description */}
                              <div className="md:col-span-5">
                                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.description')}</Label>
                                <FormField
                                  control={form.control}
                                  name={`lines.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          placeholder={t('placeholders.itemDescription')} 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {/* Quantity */}
                              <div className="md:col-span-2">
                                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.quantity')}</Label>
                                <FormField
                                  control={form.control}
                                  name={`lines.${index}.quantity`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          type="number" 
                                          min="1"
                                          className="text-center"
                                          {...field}
                                          onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {/* Unit Price */}
                              <div className="md:col-span-2">
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  <DollarSign className="h-3 w-3 inline me-1" />
                                  {t('common.unitPrice')}
                                </Label>
                                <FormField
                                  control={form.control}
                                  name={`lines.${index}.unit_price`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          type="number" 
                                          step="0.01"
                                          min="0"
                                          className="text-center"
                                          {...field}
                                          onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            {/* Row 2: Tax, Discount, and Total */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                              {/* Tax Selection */}
                              <div className="md:col-span-3">
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  <Percent className="h-3 w-3 inline me-1" />
                                  {t('common.tax')}
                                </Label>
                                <Select 
                                  value={form.watch(`lines.${index}.tax_id`) || 'none'} 
                                  onValueChange={(value) => handleTaxSelect(index, value === 'none' ? '' : value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('sales.quotations.selectTax')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">
                                      {t('common.noTax')}
                                    </SelectItem>
                                    {taxes.map((tax: any) => (
                                      <SelectItem key={tax.id} value={tax.id}>
                                        {tax.name} ({tax.rate}%)
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Discount Percentage */}
                              <div className="md:col-span-2">
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  <Tag className="h-3 w-3 inline me-1" />
                                  {t('sales.quotations.discount')} %
                                </Label>
                                <FormField
                                  control={form.control}
                                  name={`lines.${index}.discount_percentage`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          type="number" 
                                          step="0.01"
                                          min="0"
                                          max="100"
                                          className="text-center"
                                          placeholder="0"
                                          {...field}
                                          onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {/* Line Subtotal */}
                              <div className="md:col-span-2 text-center">
                                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.subtotal')}</Label>
                                <div className="py-2 font-medium">
                                  {formatCurrency(lineTotal, form.watch('currency'))}
                                </div>
                              </div>

                              {/* Tax Amount */}
                              <div className="md:col-span-2 text-center">
                                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.tax')}</Label>
                                <div className="py-2 text-muted-foreground">
                                  {formatCurrency(lineTax, form.watch('currency'))}
                                </div>
                              </div>

                              {/* Line Total */}
                              <div className="md:col-span-2 text-center">
                                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.total')}</Label>
                                <div className="py-2 font-bold text-primary">
                                  {formatCurrency(lineGrandTotal, form.watch('currency'))}
                                </div>
                              </div>

                              {/* Remove Button */}
                              <div className="md:col-span-1 flex justify-end">
                                {fields.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => remove(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Totals Summary */}
                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-end">
                          <div className="w-full md:w-96 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{t('common.subtotal')}</span>
                              <span>{formatCurrency(subtotal + discountTotal, selectedCurrency)}</span>
                            </div>
                            {discountTotal > 0 && (
                              <div className="flex justify-between text-sm text-green-600">
                                <span>{t('common.discount')}</span>
                                <span>- {formatCurrency(discountTotal, selectedCurrency)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{t('sales.quotations.afterDiscount')}</span>
                              <span>{formatCurrency(subtotal, selectedCurrency)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{t('common.tax')}</span>
                              <span>{formatCurrency(taxTotal, selectedCurrency)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                              <span>{t('common.total')}</span>
                              <span className="text-primary">{formatCurrency(total, selectedCurrency)}</span>
                            </div>
                            
                            {/* Show equivalent in base currency if different */}
                            {totalInBaseCurrency !== null && (
                              <>
                                <Separator className="my-2" />
                                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                                  <div className="text-xs text-muted-foreground text-center mb-2">
                                    {t('sales.quotations.equivalentInBaseCurrency', { currency: baseCurrency })}
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('common.subtotal')}</span>
                                    <span>{formatCurrency(subtotalInBaseCurrency || 0, baseCurrency)}</span>
                                  </div>
                                  <div className="flex justify-between font-semibold">
                                    <span>{t('common.total')}</span>
                                    <span className="text-primary">{formatCurrency(totalInBaseCurrency, baseCurrency)}</span>
                                  </div>
                                  <div className="text-xs text-center text-muted-foreground mt-2">
                                    {t('sales.quotations.exchangeRate')}: 1 {selectedCurrency} = {(1/exchangeRate).toFixed(4)} {baseCurrency}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Terms & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common.termsAndConditions')} ({t('common.optional')})</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('placeholders.enterTerms')}
                            className="resize-none"
                            rows={4}
                            {...field}
                          />
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
                        <FormLabel>{t('common.notes')} ({t('common.optional')})</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('placeholders.additionalNotes')}
                            className="resize-none"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowDialog(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button 
                    type="button"
                    variant="secondary"
                    disabled={createMutation.isPending || customers.length === 0}
                    className="gap-2"
                    onClick={() => {
                      form.setValue('status' as any, 'draft');
                      form.handleSubmit(onSubmit)();
                    }}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('common.saving')}
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        {t('sales.quotations.saveAsDraft')}
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button"
                    disabled={createMutation.isPending || customers.length === 0}
                    className="gap-2"
                    onClick={() => {
                      form.setValue('status' as any, 'sent');
                      form.handleSubmit(onSubmit)();
                    }}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('common.sending')}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {t('sales.quotations.saveAndSend')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 end-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {t('sales.quotations.totalQuotations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                {stats.draft} {t('common.draft')}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                {stats.sent} {t('common.sent')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 end-0 w-20 h-20 bg-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              {t('common.totalValue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(stats.totalValue, baseCurrency)}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {t('sales.quotations.pendingValue')}: {formatCurrency(stats.pendingValue, baseCurrency)}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 end-0 w-20 h-20 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              {t('sales.quotations.acceptanceRate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats.acceptanceRate}%
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${stats.acceptanceRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 end-0 w-20 h-20 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              {t('sales.quotations.acceptedValue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(stats.acceptedValue, baseCurrency)}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {stats.accepted} {t('sales.quotations.wonDeals')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder={t('placeholders.searchQuotations')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
            data-testid="input-search-quotations"
          />
        </div>
      </div>

      {/* Tabs and Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="flex flex-wrap w-full h-auto min-h-10 items-start content-start gap-3 bg-muted/70 backdrop-blur rounded-lg px-4 py-4 mb-4 shadow-sm border border-border"
          style={{ height: 'auto' }}
        >
          <TabsTrigger value="all" className="gap-2">
            {t('common.all')}
            <Badge variant="secondary" className="ms-1">{quotations.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="draft" className="gap-2">
            {t('common.draft')}
            <Badge variant="secondary" className="ms-1">{stats.draft}</Badge>
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            {t('common.sent')}
            <Badge variant="secondary" className="ms-1">{stats.sent}</Badge>
          </TabsTrigger>
          <TabsTrigger value="accepted" className="gap-2">
            {t('sales.quotations.accepted')}
            <Badge variant="secondary" className="ms-1">{stats.accepted}</Badge>
          </TabsTrigger>
          <TabsTrigger value="expired" className="gap-2">
            {t('sales.quotations.expired')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredQuotations.length === 0 ? (
            <Card className="py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">{t('sales.quotations.noQuotations')}</h3>
                <p className="text-muted-foreground mb-4">{t('sales.quotations.noQuotationsDescription')}</p>
                <Button onClick={() => setShowDialog(true)}>
                  <Plus className="h-4 w-4 me-2" />
                  {t('sales.quotations.createFirstQuotation')}
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('sales.quotations.quoteNumber')}</TableHead>
                        <TableHead>{t('common.customer')}</TableHead>
                        <TableHead>{t('common.date')}</TableHead>
                        <TableHead>{t('sales.quotations.validUntil')}</TableHead>
                        <TableHead className="text-end">{t('common.amount')}</TableHead>
                        <TableHead>{t('common.status')}</TableHead>
                        <TableHead className="text-end">{t('common.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuotations.map((quote: any) => (
                        <TableRow 
                          key={quote.id} 
                          data-testid={`row-quotation-${quote.id}`}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleViewQuote(quote)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              {quote.quote_number}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <span>{quote.customer_name || t('common.unknown')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(quote.date)}
                          </TableCell>
                          <TableCell>
                            {quote.valid_until ? (
                              <span className={new Date(quote.valid_until) < new Date() ? 'text-red-500' : ''}>
                                {formatDate(quote.valid_until)}
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-end font-semibold">
                            {formatCurrency(quote.total || 0, quote.currency || 'USD')}
                          </TableCell>
                          <TableCell>{getStatusBadge(quote.status)}</TableCell>
                          <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewQuote(quote)}>
                                  <Eye className="h-4 w-4 me-2" />
                                  {t('common.view')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditQuote(quote)}>
                                  <Edit className="h-4 w-4 me-2" />
                                  {t('common.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateQuote(quote)}>
                                  <Copy className="h-4 w-4 me-2" />
                                  {t('common.duplicate')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {quote.status === 'draft' && (
                                  <DropdownMenuItem onClick={() => handleMarkAsSent(quote.id)}>
                                    <Send className="h-4 w-4 me-2" />
                                    {t('sales.quotations.markAsSent')}
                                  </DropdownMenuItem>
                                )}
                                {quote.status === 'sent' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleMarkAsAccepted(quote.id)}>
                                      <CheckCircle className="h-4 w-4 me-2" />
                                      {t('sales.quotations.markAsAccepted')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleMarkAsRejected(quote.id)}>
                                      <XCircle className="h-4 w-4 me-2" />
                                      {t('sales.quotations.markAsRejected')}
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {quote.status === 'accepted' && (
                                  <DropdownMenuItem onClick={() => handleConvertToInvoice(quote.id)}>
                                    <ArrowRight className="h-4 w-4 me-2" />
                                    {t('sales.quotations.convertToInvoice')}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDelete(quote.id)}
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
          )}
        </TabsContent>
      </Tabs>

      {/* View Quote Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          {selectedQuote && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {selectedQuote.quote_number}
                    </DialogTitle>
                    <DialogDescription>
                      {t('sales.quotations.quoteDetails')}
                    </DialogDescription>
                  </div>
                  {getStatusBadge(selectedQuote.status)}
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer Info */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-muted-foreground">{t('common.customer')}</Label>
                        <p className="font-medium">{selectedQuote.customer_name || t('common.unknown')}</p>
                        {selectedQuote.customer_email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {selectedQuote.customer_email}
                          </div>
                        )}
                        {selectedQuote.customer_phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {selectedQuote.customer_phone}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label className="text-muted-foreground">{t('common.date')}</Label>
                        <p className="font-medium">
                          {formatDate(selectedQuote.date)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">{t('sales.quotations.validUntil')}</Label>
                        <p className="font-medium">
                          {formatDate(selectedQuote.valid_until)}
                        </p>
                        {selectedQuote.valid_until && new Date(selectedQuote.valid_until) < new Date() && (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            {t('sales.quotations.expired')}
                          </Badge>
                        )}
                      </div>
                      <div>
                        <Label className="text-muted-foreground">{t('common.currency')}</Label>
                        <p className="font-medium">{selectedQuote.currency || 'USD'}</p>
                        {selectedQuote.fx_rate && selectedQuote.fx_rate !== '1' && (
                          <p className="text-xs text-muted-foreground">
                            {t('common.exchangeRate')}: {selectedQuote.fx_rate}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Project info if exists */}
                    {selectedQuote.project_id && (
                      <div className="mt-4 pt-4 border-t">
                        <Label className="text-muted-foreground">{t('common.project')}</Label>
                        <p className="font-medium">
                          {projects.find((p: any) => p.id === selectedQuote.project_id)?.name || selectedQuote.project_id}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quote Items */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {t('sales.quotations.quoteItems')} ({quoteLines.length})
                      {loadingLines && <Loader2 className="h-4 w-4 animate-spin" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingLines ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : quoteLines.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>{t('common.description')}</TableHead>
                            <TableHead className="text-center">{t('common.quantity')}</TableHead>
                            <TableHead className="text-end">{t('common.unitPrice')}</TableHead>
                            <TableHead className="text-end">{t('sales.quotations.discount')} %</TableHead>
                            <TableHead className="text-end">{t('common.tax')}</TableHead>
                            <TableHead className="text-end">{t('common.total')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {quoteLines.map((line: any, index: number) => (
                            <TableRow key={line.id}>
                              <TableCell className="font-medium">{line.line_number || index + 1}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{line.description}</p>
                                  {line.item_name && line.item_sku && (
                                    <p className="text-xs text-muted-foreground">{line.item_sku}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">{Number(line.quantity)}</TableCell>
                              <TableCell className="text-end">{formatCurrency(Number(line.unit_price), selectedQuote.currency)}</TableCell>
                              <TableCell className="text-end">{Number(line.discount_percentage) || 0}%</TableCell>
                              <TableCell className="text-end">{formatCurrency(Number(line.tax_amount) || 0, selectedQuote.currency)}</TableCell>
                              <TableCell className="text-end font-medium">{formatCurrency(Number(line.line_total), selectedQuote.currency)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        {t('common.noData')}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Totals */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('common.subtotal')}</span>
                        <span>{formatCurrency(selectedQuote.subtotal || 0, selectedQuote.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('common.tax')}</span>
                        <span>{formatCurrency(selectedQuote.tax_total || 0, selectedQuote.currency)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>{t('common.total')}</span>
                        <span className="text-primary">{formatCurrency(selectedQuote.total || 0, selectedQuote.currency)}</span>
                      </div>
                      {/* Show equivalent in base currency if different */}
                      {selectedQuote.currency !== baseCurrency && selectedQuote.fx_rate && (
                        <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
                          <span>{t('sales.quotations.equivalentInBaseCurrency', { currency: baseCurrency })}</span>
                          <span>{formatCurrency((selectedQuote.total || 0) / parseFloat(selectedQuote.fx_rate), baseCurrency)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {selectedQuote.notes && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('common.notes')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedQuote.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Terms and Conditions */}
                {selectedQuote.terms && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('common.termsAndConditions')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedQuote.terms}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 me-2" />
                    {t('common.print')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    toast({
                      title: t('common.info'),
                      description: t('common.featureComingSoon'),
                    });
                  }}>
                    <FileDown className="h-4 w-4 me-2" />
                    {t('common.downloadPDF')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `${t('sales.quotations.title')} - ${selectedQuote.quote_number}`,
                        text: `${t('common.total')}: ${formatCurrency(selectedQuote.total, selectedQuote.currency)}`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast({
                        title: t('common.success'),
                        description: t('common.linkCopied'),
                      });
                    }
                  }}>
                    <Share2 className="h-4 w-4 me-2" />
                    {t('common.share')}
                  </Button>
                  {selectedQuote.status === 'accepted' && (
                    <Button size="sm" onClick={() => handleConvertToInvoice(selectedQuote.id)}>
                      <ArrowRight className="h-4 w-4 me-2" />
                      {t('sales.quotations.convertToInvoice')}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
