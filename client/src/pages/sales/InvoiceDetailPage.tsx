import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowLeft, DollarSign, AlertCircle, CheckCircle, Clock, Send, XCircle, User, FileText, Pencil, Download, Mail, Copy, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { generateInvoicePDF, previewInvoicePDF, type InvoicePDFData } from '@/utils/invoicePDF';

const statusConfig: Record<string, { icon: any; color: any }> = {
  draft: { icon: XCircle, color: 'secondary' },
  sent: { icon: Send, color: 'default' },
  paid: { icon: CheckCircle, color: 'success' },
  partially_paid: { icon: Clock, color: 'warning' },
  overdue: { icon: AlertCircle, color: 'destructive' },
  cancelled: { icon: XCircle, color: 'secondary' },
};

export default function InvoiceDetailPage() {
  const [, params] = useRoute('/sales/invoices/:id');
  const id = params?.id as string;
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['/api/sales/invoices', id],
    enabled: !!id,
    select: (d: any) => d,
  });

  // Fetch company settings for PDF
  const { data: companySettings } = useQuery<any>({
    queryKey: ['/api/settings/company'],
  });

  // Fetch customer details
  const { data: customerData } = useQuery<any>({
    queryKey: ['/api/contacts', invoice?.customer_id],
    enabled: !!invoice?.customer_id,
  });

  const { data: allocations = [], isLoading: allocLoading } = useQuery({
    queryKey: ['/api/sales/invoices', id, 'allocations'],
    enabled: !!id,
    select: (rows: any[]) => rows || [],
  });

  const unmatch = useMutation({
    mutationFn: async (allocationId: string) => apiRequest('DELETE', `/api/banking/reconciliation/allocations/${allocationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/invoices', id, 'allocations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/banking/reconciliation/allocations/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/invoices'] });
      toast({ title: t('common.success'), description: t('banking.unmatchedSuccessfully') });
    },
    onError: (e: any) => toast({ title: t('common.error'), description: e?.message || t('banking.unmatchFailed'), variant: 'destructive' }),
  });

  // Send invoice mutation
  const sendInvoice = useMutation({
    mutationFn: async () => apiRequest('POST', `/api/sales/invoices/${id}/send`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/invoices', id] });
      toast({ title: t('common.success'), description: t('sales.invoices.emailQueued') });
    },
    onError: (e: any) => toast({ title: t('common.error'), description: e?.message || t('sales.invoices.sendFailed'), variant: 'destructive' }),
  });

  const formatCurrency = (amount: number, currency: string) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency }).format(amount || 0);

  // Generate PDF data from invoice
  const buildPDFData = (): InvoicePDFData => {
    const currency = invoice?.currency || 'USD';
    const lines = invoice?.lines || [];
    
    return {
      invoiceNumber: invoice?.invoice_number || id,
      issueDate: invoice?.date ? new Date(invoice.date).toLocaleDateString(i18n.language) : '',
      dueDate: invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString(i18n.language) : '',
      status: invoice?.status,
      poNumber: invoice?.po_number,
      reference: invoice?.reference,
      company: {
        name: companySettings?.company_name || companySettings?.name || 'Company',
        legalName: companySettings?.legal_name,
        taxNumber: companySettings?.tax_number,
        registrationNumber: companySettings?.registration_number,
        address: companySettings?.address ? (typeof companySettings.address === 'string' ? JSON.parse(companySettings.address) : companySettings.address) : undefined,
        phone: companySettings?.phone,
        email: companySettings?.email,
        website: companySettings?.website,
      },
      customer: {
        name: invoice?.customer_name || customerData?.name || '',
        email: customerData?.email,
        phone: customerData?.phone,
        taxNumber: customerData?.tax_number,
        billingAddress: customerData?.billing_address ? (typeof customerData.billing_address === 'string' ? JSON.parse(customerData.billing_address) : customerData.billing_address) : undefined,
        shippingAddress: customerData?.shipping_address ? (typeof customerData.shipping_address === 'string' ? JSON.parse(customerData.shipping_address) : customerData.shipping_address) : undefined,
      },
      items: lines.map((line: any) => ({
        description: line.description || '',
        quantity: Number(line.quantity || 1),
        unitPrice: Number(line.unit_price || 0),
        discount: Number(line.discount_percentage || 0),
        taxRate: Number(line.tax_rate || 0),
        amount: Number(line.amount || 0),
        itemCode: line.item_code,
      })),
      subtotal: Number(invoice?.subtotal || 0),
      discountTotal: Number(invoice?.discount_total || 0),
      taxTotal: Number(invoice?.tax_total || 0),
      shippingFee: Number(invoice?.shipping_fee || 0),
      handlingFee: Number(invoice?.handling_fee || 0),
      total: Number(invoice?.total_amount || invoice?.total || 0),
      paidAmount: Number(invoice?.paid_amount || 0),
      outstanding: Math.max(0, Number(invoice?.total_amount || invoice?.total || 0) - Number(invoice?.paid_amount || 0)),
      currency,
      notes: invoice?.notes,
      termsAndConditions: companySettings?.terms_and_conditions || invoice?.terms_and_conditions,
      paymentInstructions: companySettings?.payment_instructions || invoice?.payment_instructions,
      bankDetails: companySettings?.bank_details ? (typeof companySettings.bank_details === 'string' ? JSON.parse(companySettings.bank_details) : companySettings.bank_details) : undefined,
    };
  };

  const handleDownloadPDF = async () => {
    try {
      const pdfData = buildPDFData();
      await generateInvoicePDF(pdfData, {
        language: i18n.language,
        filename: `invoice-${invoice?.invoice_number || id}.pdf`,
        download: true,
      });
      toast({ title: t('common.success'), description: t('sales.invoices.pdfDownloaded', { defaultValue: 'PDF downloaded' }) });
    } catch (error: any) {
      toast({ title: t('common.error'), description: error?.message || 'Failed to generate PDF', variant: 'destructive' });
    }
  };

  const handlePreviewPDF = async () => {
    try {
      const pdfData = buildPDFData();
      await previewInvoicePDF(pdfData, { language: i18n.language });
    } catch (error: any) {
      toast({ title: t('common.error'), description: error?.message || 'Failed to preview PDF', variant: 'destructive' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDuplicate = async () => {
    try {
      // Navigate to new invoice form with data pre-filled
      // Store invoice data in sessionStorage for the form to pick up
      sessionStorage.setItem('duplicateInvoice', JSON.stringify({
        customer_id: invoice?.customer_id,
        currency: invoice?.currency,
        notes: invoice?.notes,
        lines: invoice?.lines,
      }));
      navigate('/sales/invoices/new?duplicate=true');
    } catch (error: any) {
      toast({ title: t('common.error'), description: error?.message, variant: 'destructive' });
    }
  };

  const Status = ({ status }: { status?: string }) => {
    if (!status) return null;
    const cfg = statusConfig[status] || statusConfig.draft;
    const Icon = cfg.icon;
    return (
      <Badge variant={cfg.color} className="gap-1">
        <Icon className="h-3 w-3" /> {t(`sales.invoices.${status}`)}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">{t('common.loading')}</div>;
  }
  if (error || !invoice) {
    return (
      <div className="p-6">
        <AlertCircle className="h-6 w-6 text-destructive inline me-2" />
        {t('common.errorLoadingData')}
      </div>
    );
  }

  const currency = invoice.currency || 'USD';
  const total = Number(invoice.total_amount || invoice.total || 0);
  const paid = Number(invoice.paid_amount || 0);
  const outstanding = Math.max(0, total - paid);

  return (
    <div className="space-y-4">
      {/* Header with back button and actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/sales/invoices">
            <ArrowLeft className="h-4 w-4 me-2" /> {t('common.back')}
          </Link>
        </Button>
        
        <div className="flex flex-wrap items-center gap-2">
          <Status status={invoice.status} />
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 ms-2">
            {/* Edit - only for draft invoices */}
            {invoice.status === 'draft' && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/sales/invoices/${id}/edit`}>
                  <Pencil className="h-4 w-4 me-2" /> {t('common.edit')}
                </Link>
              </Button>
            )}
            
            {/* Send - for draft or unsent invoices */}
            {(invoice.status === 'draft') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => sendInvoice.mutate()}
                disabled={sendInvoice.isPending}
              >
                <Send className="h-4 w-4 me-2" /> {t('sales.invoices.send', { defaultValue: 'Send' })}
              </Button>
            )}
            
            {/* Download PDF */}
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 me-2" /> {t('sales.invoices.downloadPDF', { defaultValue: 'PDF' })}
            </Button>
            
            {/* Print */}
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 me-2" /> {t('common.print', { defaultValue: 'Print' })}
            </Button>
            
            {/* Duplicate */}
            <Button variant="ghost" size="sm" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 me-2" /> {t('common.duplicate', { defaultValue: 'Duplicate' })}
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> {invoice.invoice_number || id}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">{t('common.customer')}</div>
            <div className="flex items-center gap-2"><User className="h-4 w-4" />{invoice.customer_name || '-'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{t('common.issueDate')}</div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{invoice.date ? new Date(invoice.date).toLocaleDateString(i18n.language) : '-'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{t('sales.invoices.dueDate')}</div>
            <div>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString(i18n.language) : '-'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{t('common.total')}</div>
            <div className="font-semibold">{formatCurrency(total, currency)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{t('common.paid')}</div>
            <div className="text-green-600">{formatCurrency(paid, currency)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{t('sales.invoices.outstanding')}</div>
            <div className="text-orange-600">{formatCurrency(outstanding, currency)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('forms.lineItems')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start min-w-[450px]">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-start">{t('forms.description')}</th>
                  <th className="px-4 py-3 font-medium w-24 text-end">{t('forms.quantity')}</th>
                  <th className="px-4 py-3 font-medium w-32 text-end">{t('forms.rate')}</th>
                  <th className="px-4 py-3 font-medium w-24 text-end">{t('forms.tax')}</th>
                  <th className="px-4 py-3 font-medium w-32 text-end">{t('forms.amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.lines?.map((item: any, i: number) => (
                  <tr key={i} className="bg-card hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium text-start">{item.description}</td>
                    <td className="px-4 py-3 text-end">{item.quantity}</td>
                    <td className="px-4 py-3 text-end">{formatCurrency(Number(item.unit_price), currency)}</td>
                    <td className="px-4 py-3 text-end">{item.tax_rate}%</td>
                    <td className="px-4 py-3 text-end font-mono">{formatCurrency(Number(item.amount), currency)}</td>
                  </tr>
                ))}
                {(!invoice.lines || invoice.lines.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      {t('forms.noItems')}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-muted/50 font-medium">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-end">{t('forms.subtotal')}</td>
                  <td className="px-4 py-3 text-end font-mono">{formatCurrency(Number(invoice.subtotal || 0), currency)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-end">{t('forms.tax')}</td>
                  <td className="px-4 py-3 text-end font-mono">{formatCurrency(Number(invoice.tax_total || 0), currency)}</td>
                </tr>
                <tr className="text-base border-t-2 border-border">
                  <td colSpan={4} className="px-4 py-3 text-end font-bold">{t('forms.total')}</td>
                  <td className="px-4 py-3 text-end font-bold font-mono">{formatCurrency(total, currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('banking.allocations')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {allocLoading ? (
            <p className="text-muted-foreground">{t('common.loading')}</p>
          ) : allocations.length === 0 ? (
            <p className="text-muted-foreground">{t('banking.noAllocations')}</p>
          ) : (
            <div className="divide-y border rounded-md">
              {allocations.map((a: any) => {
                const amt = Number((a.allocated_amount as any)?.toString?.() || a.allocated_amount || 0);
                const dt = a.allocation_date ? new Date(a.allocation_date) : null;
                const pay = a.payment_details || {};
                const payRef = a.payment_type === 'receipt' ? pay.receipt_number : pay.payment_number;
                const payDate = pay.date ? new Date(pay.date) : null;
                return (
                  <div key={a.id} className="p-3 flex items-center justify-between gap-3">
                    <div className="text-sm">
                      <div className="font-medium">
                        {formatCurrency(amt, currency)}
                        <span className="ms-2 text-muted-foreground">· {a.payment_type}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dt ? new Date(dt).toLocaleDateString(i18n.language) : ''}
                        {payRef ? ` • ${payRef}` : ''}
                        {payDate ? ` • ${new Date(payDate).toLocaleDateString(i18n.language)}` : ''}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => unmatch.mutate(a.id)}>
                      {t('banking.unmatch')}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
