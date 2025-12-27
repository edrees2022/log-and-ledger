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
  RefreshCcw,
  CheckCircle,
  Clock,
  AlertCircle,
  MinusCircle,
  Calendar,
  Building2,
  X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

type DebitNoteForm = {
  vendor_id: string;
  bill_id: string;
  amount: string;
  reason: string;
  notes?: string;
  issue_date: string;
};

// Now backed by API endpoints for GET/POST

export default function DebitNotesPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [applyDialog, setApplyDialog] = useState<{open: boolean, noteId: string | null}>({open: false, noteId: null});
  const isMobile = useIsMobile();
  const [applyAmount, setApplyAmount] = useState('');
  const [selectedBillId, setSelectedBillId] = useState('');
  
  // Localized form schema
  const debitNoteSchema = z.object({
    vendor_id: z.string().min(1, t('validation.selectVendor')),
    bill_id: z.string().min(1, t('validation.selectRelatedBill')),
    amount: z.string().min(1, t('validation.amountRequired')),
    reason: z.string().min(2, t('validation.reasonMin2')),
    notes: z.string().optional(),
    issue_date: z.string().min(1, t('validation.issueDateRequired')),
  });
  
  const statusConfig = {
    draft: { label: t('common.draft'), icon: Edit, color: 'secondary' },
    pending: { label: t('common.pending'), icon: Clock, color: 'default' },
    applied: { label: t('common.applied'), icon: CheckCircle, color: 'success' },
    partially_applied: { label: t('common.partiallyApplied'), icon: MinusCircle, color: 'warning' },
    void: { label: t('common.void'), icon: AlertCircle, color: 'destructive' },
  };

  // Fetch contacts (vendors)
  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ['/api/contacts'],
  });

  // Fetch bills
  const { data: bills = [] } = useQuery<any[]>({
    queryKey: ['/api/purchases/bills'],
  });

  // Fetch existing debit notes
  const { data: debitNotes = [] } = useQuery<any[]>({
    queryKey: ['/api/purchases/debit-notes'],
  });

  const vendors = contacts.filter(contact => 
    contact.type === 'supplier' || contact.type === 'both'
  );

  // Create debit note mutation
  const createMutation = useMutation({
    mutationFn: async (data: DebitNoteForm) => {
      const processedData = {
        ...data,
        subtotal: data.amount, // Send as string
        total: data.amount,    // Send as string
        tax_total: '0',
        remaining_amount: data.amount,
        issue_date: data.issue_date, // Map date to issue_date
        status: 'draft',
      };
      return await apiRequest('POST', '/api/purchases/debit-notes', processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases/debit-notes'] });
      setShowDialog(false);
      toast({
        title: t('purchases.debitNotes.debitNoteCreated'),
        description: t('purchases.debitNotes.debitNoteCreatedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('purchases.debitNotes.debitNoteCreateError'),
        variant: 'destructive',
      });
    },
  });

  // Update debit note mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<any> }) => {
      return await apiRequest('PUT', `/api/purchases/debit-notes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases/debit-notes'] });
      toast({
        title: t('common.saveSuccess'),
        description: t('purchases.debitNotes.debitNoteUpdated'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('purchases.debitNotes.debitNoteUpdateError'),
        variant: 'destructive',
      });
    },
  });

  // Delete debit note mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/purchases/debit-notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases/debit-notes'] });
      toast({
        title: t('common.deleteSuccess'),
        description: t('purchases.debitNotes.debitNoteDeleted'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('purchases.debitNotes.debitNoteDeleteError'),
        variant: 'destructive',
      });
    },
  });

  // Apply debit note mutation
  const applyMutation = useMutation({
    mutationFn: async ({ id, billId, amount }: { id: string; billId: string; amount: string }) => {
      return await apiRequest('POST', `/api/purchases/debit-notes/${id}/apply`, { bill_id: billId, amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases/debit-notes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/purchases/bills'] });
      setApplyDialog({ open: false, noteId: null });
      setApplyAmount('');
      setSelectedBillId('');
      toast({
        title: t('purchases.debitNotes.debitNoteApplied'),
        description: t('purchases.debitNotes.debitNoteAppliedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('purchases.debitNotes.debitNoteApplyError'),
        variant: 'destructive',
      });
    },
  });

  // Form
  const form = useForm<DebitNoteForm>({
    resolver: zodResolver(debitNoteSchema),
    defaultValues: {
      vendor_id: '',
      bill_id: '',
      amount: '',
      reason: '',
      notes: '',
      issue_date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: DebitNoteForm) => {
    createMutation.mutate(data);
  };

  // debitNotes comes from query

  // Filter debit notes
  const filteredDebitNotes = debitNotes.filter((note) => {
    const matchesSearch = 
      note.debit_note_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.bill_number.toLowerCase().includes(searchTerm.toLowerCase());
    
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
    total: debitNotes.length,
    totalAmount: debitNotes.reduce((sum, n: any) => sum + (parseFloat(n.total_amount || n.amount || '0') || 0), 0),
    applied: debitNotes
      .filter((n: any) => n.status === 'applied' || n.status === 'partially_applied')
      .reduce((sum: number, n: any) => sum + (parseFloat(n.total_amount || '0') || 0), 0),
    pending: debitNotes
      .filter((n: any) => n.status === 'draft' || n.status === 'pending')
      .reduce((sum: number, n: any) => sum + (parseFloat(n.total_amount || '0') || 0), 0),
  };

  const handleApplyToBill = (id: string) => {
    setApplyDialog({ open: true, noteId: id });
  };

  const handleSend = (id: string) => {
    toast({
      title: t('purchases.debitNotes.debitNoteSent'),
      description: t('purchases.debitNotes.debitNoteSentDesc'),
    });
  };

  const handleVoid = (id: string) => {
    if (confirm(t('purchases.debitNotes.confirmVoid'))) {
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('purchases.debitNotes.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('purchases.debitNotes.description')}
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-debit-note" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 me-2" />
              {t('purchases.debitNotes.addDebitNote')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('purchases.debitNotes.addDebitNote')}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vendor_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('purchases.bills.supplier')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('placeholders.selectSupplier')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vendors.map((vendor) => (
                              <SelectItem key={vendor.id} value={vendor.id}>
                                {vendor.name}
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
                    name="bill_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('purchases.debitNotes.relatedBill')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('placeholders.selectBill')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bills.map((bill) => (
                              <SelectItem key={bill.id} value={bill.id}>
                                {bill.bill_number} - {bill.supplier_reference}
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
                      <FormLabel>{t('purchases.debitNotes.reason')}</FormLabel>
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
                      <FormLabel>{`${t('common.notes')} (${t('common.optional')})`}</FormLabel>
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
                    className="w-full sm:w-auto"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
                    {createMutation.isPending ? t('common.creating') : t('purchases.debitNotes.createDebitNote')}
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
            <CardTitle className="text-sm font-medium">{t('purchases.debitNotes.totalDebitNotes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('dashboard.thisMonth')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('purchases.debitNotes.totalAmount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalAmount, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('purchases.debitNotes.debitIssued')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('purchases.debitNotes.applied')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.applied, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('purchases.debitNotes.toBills')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('purchases.debitNotes.pending')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.pending, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('purchases.debitNotes.toBeApplied')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder={t('purchases.debitNotes.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
            data-testid="input-search-debit-notes"
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
                      <TableHead>{t('purchases.debitNotes.debitNote')}</TableHead>
                      <TableHead>{t('purchases.bills.supplier')}</TableHead>
                      <TableHead>{t('purchases.debitNotes.relatedBill')}</TableHead>
                      <TableHead>{t('sales.issueDate')}</TableHead>
                      <TableHead>{t('purchases.debitNotes.reason')}</TableHead>
                      <TableHead>{t('common.amount')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead className="text-end">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {filteredDebitNotes.map((note) => (
                    <TableRow key={note.id} data-testid={`row-debit-note-${note.id}`}>
                      <TableCell className="font-medium" data-label={t('purchases.debitNotes.debitNote')}>
                        <div className="flex items-center gap-2">
                          <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                          {note.debit_note_number}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('purchases.bills.supplier')}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {note.vendor_name}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('purchases.debitNotes.relatedBill')}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {note.bill_number}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('sales.issueDate')}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(note.issue_date).toLocaleDateString(i18n.language)}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('purchases.debitNotes.reason')}>{note.reason}</TableCell>
                      <TableCell className="font-semibold text-green-600" data-label={t('common.amount')}>
                        +{formatCurrency(note.total_amount, note.currency)}
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
                                {t('purchases.debitNotes.send')}
                              </DropdownMenuItem>
                            )}
                            {note.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleApplyToBill(note.id)}>
                                <CheckCircle className="h-4 w-4 me-2" />
                                {t('purchases.debitNotes.applyToBill')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 me-2" />
                              {t('purchases.debitNotes.downloadPDF')}
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
                                {t('common.void')}
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

      {/* Apply Debit Note Dialog */}
      <Dialog open={applyDialog.open} onOpenChange={(open) => setApplyDialog({ open, noteId: open ? applyDialog.noteId : null })}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('purchases.debitNotes.applyDebitNote')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('purchases.debitNotes.debitNote')}</Label>
              <div className="flex items-center justify-between bg-muted p-4 rounded-md border">
                <span className="font-medium">{applyDialog.noteId && debitNotes.find(note => note.id === applyDialog.noteId)?.debit_note_number}</span>
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
                <Label>{t('purchases.debitNotes.relatedBill')}</Label>
                <Select 
                  value={selectedBillId} 
                  onValueChange={setSelectedBillId}
                  disabled={applyMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('placeholders.selectBill')} />
                  </SelectTrigger>
                  <SelectContent>
                    {bills.map((bill) => (
                      <SelectItem key={bill.id} value={bill.id}>
                        {bill.bill_number} - {bill.supplier_reference || bill.supplier_name}
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

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
              <Button 
                onClick={() => setApplyDialog({ open: false, noteId: null })} 
                variant="outline"
                disabled={applyMutation.isPending}
                className="w-full sm:w-auto"
              >
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={() => {
                  if (selectedBillId && applyAmount) {
                    applyMutation.mutate({ id: applyDialog.noteId!, billId: selectedBillId, amount: applyAmount });
                  }
                }} 
                disabled={applyMutation.isPending || !selectedBillId || !applyAmount}
                className="w-full sm:w-auto"
              >
                {applyMutation.isPending ? t('common.applying') : t('common.apply')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}