import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
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
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  MinusCircle,
  Calendar,
  User,
  X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

// Credit note form schema
const getCreditNoteSchema = (t: any) => z.object({
  customer_id: z.string().min(1, t('validation.customerRequired')),
  invoice_id: z.string().min(1, t('validation.invoiceRequired')),
  amount: z.string().min(1, t('validation.amountRequired')),
  reason: z.string().min(2, t('validation.reasonMinLength')),
  notes: z.string().optional(),
  issue_date: z.string().min(1, t('validation.issueDateRequired')),
});

type CreditNoteForm = z.infer<ReturnType<typeof getCreditNoteSchema>>;

export default function CreditNotesPage() {
  const { t, i18n } = useTranslation();
  
  const statusConfig = {
    draft: { label: t('common.draft'), icon: Edit, color: 'secondary' },
    pending: { label: t('common.pending'), icon: Clock, color: 'default' },
    applied: { label: t('common.applied'), icon: CheckCircle, color: 'success' },
    partially_applied: { label: t('common.partiallyApplied'), icon: MinusCircle, color: 'warning' },
    void: { label: t('common.void'), icon: AlertCircle, color: 'destructive' },
  };
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [applyDialog, setApplyDialog] = useState<{open: boolean, noteId: string | null}>({open: false, noteId: null});
  const [applyAmount, setApplyAmount] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const isMobile = useIsMobile();

  // Fetch contacts (customers)
  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ['/api/contacts'],
  });

  // Fetch invoices
  const { data: invoices = [] } = useQuery<any[]>({
    queryKey: ['/api/sales/invoices'],
  });

  const customers = contacts.filter(contact => 
    contact.type === 'customer' || contact.type === 'both'
  );

  // Fetch existing credit notes
  const { data: creditNotes = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/sales/credit-notes'],
  });

  // Create credit note mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreditNoteForm) => {
      const processedData = {
        ...data,
        subtotal: data.amount, // Send as string
        total: data.amount,    // Send as string
        tax_total: '0',
        remaining_amount: data.amount,
        issue_date: data.issue_date, // Map date to issue_date
        status: 'draft',
      };
      return await apiRequest('POST', '/api/sales/credit-notes', processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/credit-notes'] });
      setShowDialog(false);
      toast({
        title: t('common.createSuccess'),
        description: t('sales.creditNotes.creditNoteCreatedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('sales.creditNotes.creditNoteCreateError'),
        variant: 'destructive',
      });
    },
  });

  // Update credit note mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<any> }) => {
      return await apiRequest('PUT', `/api/sales/credit-notes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/credit-notes'] });
      toast({
        title: t('common.saved'),
        description: t('sales.creditNotes.creditNoteUpdatedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('sales.creditNotes.creditNoteUpdateError'),
        variant: 'destructive',
      });
    },
  });

  // Delete credit note mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/sales/credit-notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/credit-notes'] });
      toast({
        title: t('common.deleted'),
        description: t('sales.creditNotes.creditNoteDeletedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('sales.creditNotes.creditNoteDeleteError'),
        variant: 'destructive',
      });
    },
  });

  // Apply credit note mutation
  const applyMutation = useMutation({
    mutationFn: async ({ id, invoiceId, amount }: { id: string; invoiceId: string; amount: string }) => {
      return await apiRequest('POST', `/api/sales/credit-notes/${id}/apply`, { invoice_id: invoiceId, amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/credit-notes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/invoices'] });
      setApplyDialog({ open: false, noteId: null });
      setApplyAmount('');
      setSelectedInvoiceId('');
      toast({
        title: t('sales.creditNotes.creditApplied'),
        description: t('sales.creditNotes.creditAppliedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('sales.creditNotes.creditNoteApplyError'),
        variant: 'destructive',
      });
    },
  });

  // Form
  const form = useForm<CreditNoteForm>({
    resolver: zodResolver(getCreditNoteSchema(t)),
    defaultValues: {
      customer_id: '',
      invoice_id: '',
      amount: '',
      reason: '',
      notes: '',
      issue_date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: CreditNoteForm) => {
    createMutation.mutate(data);
  };

  // creditNotes comes from query

  // Filter credit notes
  const filteredCreditNotes = creditNotes.filter((note) => {
    const matchesSearch = 
      note.credit_note_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case 'draft':
        return note.status === 'draft';
      case 'pending':
        return note.status === 'pending';
      case 'applied':
        return note.status === 'applied' || note.status === 'partially_applied';
      case 'void':
        return note.status === 'void';
      default:
        return true;
    }
  });

  // Calculate statistics
  const stats = {
    total: creditNotes.length,
    totalAmount: creditNotes.reduce((sum, n: any) => sum + (parseFloat(n.total_amount || n.amount || '0') || 0), 0),
    applied: creditNotes
      .filter((n: any) => n.status === 'applied' || n.status === 'partially_applied')
      .reduce((sum: number, n: any) => sum + (parseFloat(n.total_amount || '0') || 0), 0),
    pending: creditNotes
      .filter((n: any) => n.status === 'draft' || n.status === 'pending')
      .reduce((sum: number, n: any) => sum + (parseFloat(n.total_amount || '0') || 0), 0),
  };

  const handleApplyToInvoice = (id: string) => {
    setApplyDialog({ open: true, noteId: id });
  };

  const handleSend = (id: string) => {
    toast({
      title: t('sales.creditNotes.creditNoteSent'),
      description: t('sales.creditNotes.creditNoteSentSuccess'),
    });
  };

  const handleVoid = (id: string) => {
    if (confirm(t('sales.creditNotes.confirmVoid'))) {
      updateMutation.mutate({ id, data: { status: 'void' } });
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    updateMutation.mutate({ id, data: { status } });
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
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

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('sales.creditNotes.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('sales.creditNotes.description')}
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto" data-testid="button-new-credit-note">
              <Plus className="h-4 w-4 me-2" />
              {t('sales.creditNotes.addCreditNote')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('sales.createNewCreditNote')}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customer_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common.customer')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('placeholders.selectCustomer')} />
                          </SelectTrigger>
                        </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
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
                    name="invoice_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.relatedInvoice')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('placeholders.selectInvoice')} />
                          </SelectTrigger>
                        </FormControl>
                          <SelectContent>
                            {invoices.map((invoice) => (
                              <SelectItem key={invoice.id} value={invoice.id}>
                                {invoice.invoice_number} - {invoice.customer_reference}
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

                  <FormField
                    control={form.control}
                    name="issue_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.issueDate')}</FormLabel>
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
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('sales.creditNotes.reason')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('placeholders.enterReason')} {...field} />
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
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowDialog(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? t('common.creating') : t('common.create')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('sales.creditNotes.totalCreditNotes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('common.thisMonth')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('sales.creditNotes.totalAmount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalAmount, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('sales.creditNotes.creditIssued')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('common.applied')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.applied, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('sales.creditNotes.toInvoices')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('common.pending')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.pending, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('sales.creditNotes.toBeApplied')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder={t('placeholders.searchCreditNotes')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
            data-testid="input-search-credit-notes"
          />
        </div>
      </div>

      {/* Tabs and Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="flex flex-wrap w-full h-auto min-h-10 items-start content-start gap-3 bg-muted/70 backdrop-blur rounded-lg px-4 py-4 mb-4 shadow-sm border border-border"
          style={{ height: 'auto' }}
        >
          <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
          <TabsTrigger value="draft">{t('common.draft')}</TabsTrigger>
          <TabsTrigger value="pending">{t('common.pending')}</TabsTrigger>
          <TabsTrigger value="applied">{t('common.applied')}</TabsTrigger>
          <TabsTrigger value="void">{t('common.void')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('sales.creditNotes.creditNoteNumber')}</TableHead>
                      <TableHead>{t('common.customer')}</TableHead>
                      <TableHead>{t('sales.creditNotes.invoiceNumber')}</TableHead>
                      <TableHead>{t('common.issueDate')}</TableHead>
                      <TableHead>{t('sales.creditNotes.reason')}</TableHead>
                      <TableHead>{t('common.amount')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead className="text-end">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {filteredCreditNotes.map((note) => (
                    <TableRow key={note.id} data-testid={`row-credit-note-${note.id}`}>
                      <TableCell className="font-medium" data-label={t('sales.creditNote')}>
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-muted-foreground" />
                          {note.credit_note_number}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('common.customer')}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {note.customer_name}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('sales.relatedInvoice')}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {note.invoice_number}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('common.issueDate')}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(note.issue_date).toLocaleDateString(i18n.language)}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('sales.creditNotes.reason')}>{note.reason}</TableCell>
                      <TableCell className="font-semibold text-red-600" data-label={t('common.amount')}>
                        -{formatCurrency(note.total_amount, note.currency)}
                      </TableCell>
                      <TableCell data-label={t('common.status')}>{getStatusBadge(note.status)}</TableCell>
                      <TableCell className="text-end" data-label={t('common.actions')}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-actions-${note.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 me-2" />
                              {t('common.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 me-2" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 me-2" />
                              {t('common.duplicate')}
                            </DropdownMenuItem>
                            {note.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleSend(note.id)}>
                                <Send className="h-4 w-4 me-2" />
                                {t('common.send')}
                              </DropdownMenuItem>
                            )}
                            {note.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleApplyToInvoice(note.id)}>
                                <CheckCircle className="h-4 w-4 me-2" />
                                {t('sales.creditNotes.applyToInvoice')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 me-2" />
                              {t('common.downloadPDF')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {note.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(note.id, 'pending')}>
                                <Clock className="h-4 w-4 me-2" />
                                {t('common.pending')}
                              </DropdownMenuItem>
                            )}
                            {note.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusChange(note.id, 'applied')}>
                                  <CheckCircle className="h-4 w-4 me-2" />
                                  {t('common.applied')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(note.id, 'partially_applied')}>
                                  <MinusCircle className="h-4 w-4 me-2" />
                                  {t('common.partiallyApplied')}
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            {note.status !== 'void' && (
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleVoid(note.id)}
                              >
                                <AlertCircle className="h-4 w-4 me-2" />
                                {t('sales.creditNotes.voidCreditNote')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(note.id)}
                            >
                              <MinusCircle className="h-4 w-4 me-2" />
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

      {/* Apply Credit Note Dialog */}
      <Dialog open={applyDialog.open} onOpenChange={(open) => setApplyDialog({ open, noteId: open ? applyDialog.noteId : null })}>
        <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('sales.creditNotes.applyCreditNote')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('sales.creditNotes.creditNote')}</Label>
              <div className="flex items-center justify-between bg-muted p-4 rounded-md border">
                <span className="font-medium">{applyDialog.noteId && creditNotes.find(note => note.id === applyDialog.noteId)?.credit_note_number}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setApplyDialog({ open: false, noteId: null })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>{t('sales.relatedInvoice')}</Label>
                <Select 
                  value={selectedInvoiceId} 
                  onValueChange={setSelectedInvoiceId}
                  disabled={applyMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('placeholders.selectInvoice')} />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.invoice_number} - {invoice.customer_reference}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('common.amount')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={applyAmount}
                  onChange={(e) => setApplyAmount(e.target.value)}
                  disabled={applyMutation.isPending}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button 
                onClick={() => setApplyDialog({ open: false, noteId: null })} 
                variant="outline"
                disabled={applyMutation.isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={() => {
                  if (selectedInvoiceId && applyAmount) {
                    applyMutation.mutate({ id: applyDialog.noteId!, invoiceId: selectedInvoiceId, amount: applyAmount });
                  }
                }} 
                disabled={applyMutation.isPending || !selectedInvoiceId || !applyAmount}
              >
                {applyMutation.isPending ? t('common.applying') : t('sales.creditNotes.apply')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}