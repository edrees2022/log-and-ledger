import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  User,
  Calendar,
  FileText,
  Hash,
  Download,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  XCircle,
} from "lucide-react";
import { generateInvoicePDF, type InvoicePDFData } from "@/utils/invoicePDF";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ViewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
  onEdit?: (invoiceId: string) => void;
}

const statusConfig = {
  draft: { icon: Edit, color: "secondary", bg: "bg-gray-100 dark:bg-gray-800" },
  sent: { icon: Send, color: "default", bg: "bg-blue-100 dark:bg-blue-900/30" },
  paid: { icon: CheckCircle, color: "success", bg: "bg-green-100 dark:bg-green-900/30" },
  partially_paid: { icon: Clock, color: "warning", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  overdue: { icon: AlertCircle, color: "destructive", bg: "bg-red-100 dark:bg-red-900/30" },
  cancelled: { icon: XCircle, color: "secondary", bg: "bg-gray-100 dark:bg-gray-800" },
};

export function ViewInvoiceDialog({ open, onOpenChange, invoiceId, onEdit }: ViewInvoiceDialogProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  // Fetch invoice details
  const { data: invoice, isLoading } = useQuery({
    queryKey: ['/api/sales/invoices', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      const res = await apiRequest('GET', `/api/sales/invoices/${invoiceId}`);
      return res.json();
    },
    enabled: !!invoiceId && open,
  });

  // Fetch company settings
  const { data: companySettings } = useQuery<any>({ queryKey: ['/api/settings/company'] });
  const baseCurrency = companySettings?.base_currency || 'AED';

  // Fetch contacts for customer name
  const { data: contactsData = [] } = useQuery<any[]>({ queryKey: ['/api/contacts'] });

  const formatCurrency = (amount: number, curr?: string) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: curr || invoice?.currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return '—';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString(i18n.language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = contactsData.find((c: any) => c.id === customerId);
    return customer?.name || invoice?.customer_name || '—';
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <Badge variant={config.color as any} className="gap-1 text-sm px-3 py-1">
        <Icon className="h-4 w-4" />
        {t(`sales.invoices.${status}`)}
      </Badge>
    );
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    
    try {
      const invoiceDate = invoice.date ? new Date(invoice.date) : new Date();
      const dateStr = invoiceDate.toISOString().split('T')[0];
      const invoiceNum = invoice.invoice_number || invoice.id;

      const pdfData: InvoicePDFData = {
        invoiceNumber: invoiceNum,
        issueDate: invoice.date ? new Date(invoice.date).toLocaleDateString(i18n.language) : '',
        dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString(i18n.language) : '',
        status: invoice.status,
        company: {
          name: companySettings?.company_name || companySettings?.name || 'Company',
          email: companySettings?.email,
          phone: companySettings?.phone,
          taxNumber: companySettings?.tax_number,
        },
        customer: {
          name: getCustomerName(invoice.customer_id),
        },
        items: (invoice.lines || []).map((line: any) => ({
          description: line.description || '',
          quantity: Number(line.quantity || 1),
          unitPrice: Number(line.unit_price || 0),
          discount: Number(line.discount_percentage || 0),
          taxRate: Number(line.tax_rate || 0),
          amount: Number(line.line_total || line.amount || 0),
        })),
        subtotal: Number(invoice.subtotal || 0),
        taxTotal: Number(invoice.tax_total || 0),
        total: Number(invoice.total || 0),
        paidAmount: Number(invoice.paid_amount || 0),
        outstanding: Math.max(0, Number(invoice.total || 0) - Number(invoice.paid_amount || 0)),
        currency: invoice.currency || 'USD',
        baseCurrency: baseCurrency,
        fxRate: Number(invoice.fx_rate || 1),
        totalInBaseCurrency: invoice.currency !== baseCurrency && Number(invoice.fx_rate) !== 1 
          ? Number(invoice.total || 0) * Number(invoice.fx_rate || 1)
          : undefined,
        notes: invoice.notes,
      };

      const cleanInvoiceNum = String(invoiceNum).replace(/[^a-zA-Z0-9-]/g, '_');
      const pdfFilename = `invoice_${cleanInvoiceNum}_${dateStr}.pdf`;

      await generateInvoicePDF(pdfData, {
        language: i18n.language,
        filename: pdfFilename,
        download: true,
      });

      toast({ title: t('common.success'), description: t('sales.invoices.pdfDownloaded', { defaultValue: 'PDF downloaded' }) });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({ title: t('common.error'), description: error?.message || 'Failed to generate PDF', variant: 'destructive' });
    }
  };

  if (!invoiceId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!inset-x-2 sm:!inset-auto sm:!left-1/2 sm:!top-1/2 sm:!-translate-x-1/2 sm:!-translate-y-1/2 w-[calc(100vw-1rem)] sm:w-[90vw] sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <span className="truncate">{t('sales.invoices.invoice')} #{invoice?.invoice_number || '—'}</span>
            </DialogTitle>
            {invoice && getStatusBadge(invoice.status)}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-160px)]">
          {isLoading ? (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="h-24 bg-muted animate-pulse rounded-lg" />
              <div className="h-48 bg-muted animate-pulse rounded-lg" />
            </div>
          ) : invoice ? (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Company & Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Company Info */}
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">
                      <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      {t('settings.company.companyDetails', { defaultValue: 'Company Details' })}
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-base sm:text-lg">{companySettings?.company_name || companySettings?.name || '—'}</p>
                      {companySettings?.tax_number && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {t('settings.company.taxNumber', { defaultValue: 'Tax Number' })}: {companySettings.tax_number}
                        </p>
                      )}
                      {companySettings?.email && (
                        <p className="text-xs sm:text-sm text-muted-foreground">{companySettings.email}</p>
                      )}
                      {companySettings?.phone && (
                        <p className="text-xs sm:text-sm text-muted-foreground">{companySettings.phone}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Info */}
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      {t('sales.invoices.customer')}
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-base sm:text-lg">{getCustomerName(invoice.customer_id)}</p>
                      {invoice.customer_email && (
                        <p className="text-xs sm:text-sm text-muted-foreground">{invoice.customer_email}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Invoice Details */}
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                        <Hash className="h-3 w-3" />
                        {t('sales.invoices.invoiceNumber')}
                      </div>
                      <p className="font-semibold text-sm sm:text-base truncate">{invoice.invoice_number}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3" />
                        {t('sales.invoices.invoiceDate')}
                      </div>
                      <p className="font-semibold text-sm sm:text-base">{formatDate(invoice.date)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3" />
                        {t('sales.invoices.dueDate')}
                      </div>
                      <p className="font-semibold text-sm sm:text-base">{formatDate(invoice.due_date)}</p>
                    </div>
                    {invoice.po_number && (
                      <div>
                        <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                          {t('sales.invoices.poNumber', { defaultValue: 'PO Number' })}
                        </div>
                        <p className="font-semibold text-sm sm:text-base">{invoice.po_number}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Line Items - Mobile Friendly */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold text-xs sm:text-sm min-w-[120px]">{t('common.description')}</TableHead>
                          <TableHead className="text-center font-semibold text-xs sm:text-sm">{t('common.quantity', { defaultValue: 'Qty' })}</TableHead>
                          <TableHead className="text-end font-semibold text-xs sm:text-sm">{t('common.unitPrice', { defaultValue: 'Unit Price' })}</TableHead>
                          <TableHead className="text-center font-semibold text-xs sm:text-sm hidden sm:table-cell">{t('common.discount')}</TableHead>
                          <TableHead className="text-center font-semibold text-xs sm:text-sm hidden sm:table-cell">{t('common.tax')}</TableHead>
                          <TableHead className="text-end font-semibold text-xs sm:text-sm">{t('common.amount')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(invoice.lines || []).map((line: any, index: number) => (
                          <TableRow key={line.id || index}>
                            <TableCell className="font-medium text-xs sm:text-sm">{line.description || '—'}</TableCell>
                            <TableCell className="text-center text-xs sm:text-sm">{line.quantity || 1}</TableCell>
                            <TableCell className="text-end text-xs sm:text-sm">
                              {formatCurrency(Number(line.unit_price || 0))}
                            </TableCell>
                            <TableCell className="text-center text-xs sm:text-sm hidden sm:table-cell">
                              {line.discount_percentage ? `${line.discount_percentage}%` : '—'}
                            </TableCell>
                            <TableCell className="text-center text-xs sm:text-sm hidden sm:table-cell">
                              {line.tax_rate ? `${line.tax_rate}%` : '—'}
                            </TableCell>
                            <TableCell className="text-end font-semibold text-xs sm:text-sm">
                              {formatCurrency(Number(line.line_total || line.amount || 0))}
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
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">{t('common.subtotal')}</span>
                      <span>{formatCurrency(Number(invoice.subtotal || 0))}</span>
                    </div>
                    {Number(invoice.discount_total || 0) > 0 && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">{t('common.discount')}</span>
                        <span className="text-red-500">-{formatCurrency(Number(invoice.discount_total || 0))}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">{t('common.tax')}</span>
                      <span>{formatCurrency(Number(invoice.tax_total || 0))}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base sm:text-lg font-bold">
                      <span>{t('common.total')}</span>
                      <span>{formatCurrency(Number(invoice.total || 0))}</span>
                    </div>
                    
                    {/* Base currency equivalent */}
                    {invoice.currency !== baseCurrency && Number(invoice.fx_rate || 1) !== 1 && (
                      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        <span>{t('sales.invoices.equivalentAmount', { currency: baseCurrency, defaultValue: `Equivalent (${baseCurrency})` })}</span>
                        <span>{formatCurrency(Number(invoice.total || 0) * Number(invoice.fx_rate || 1), baseCurrency)}</span>
                      </div>
                    )}
                    
                    {Number(invoice.paid_amount || 0) > 0 && (
                      <>
                        <Separator />
                        <div className="flex justify-between text-xs sm:text-sm text-green-600">
                          <span>{t('sales.invoices.paidAmount')}</span>
                          <span>{formatCurrency(Number(invoice.paid_amount || 0))}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm font-semibold text-orange-600">
                          <span>{t('sales.invoices.outstanding')}</span>
                          <span>{formatCurrency(Math.max(0, Number(invoice.total || 0) - Number(invoice.paid_amount || 0)))}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {invoice.notes && (
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">{t('common.notes')}</div>
                    <p className="text-xs sm:text-sm whitespace-pre-wrap">{invoice.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="p-4 sm:p-6 text-center text-muted-foreground">
              {t('sales.invoices.invoiceNotFound', { defaultValue: 'Invoice not found' })}
            </div>
          )}
        </ScrollArea>

        {/* Actions Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-3 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="order-last sm:order-first">
            {t('common.close')}
          </Button>
          <div className="flex gap-2">
            {onEdit && invoice && (
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(invoice.id);
                }}
              >
                <Edit className="h-4 w-4 me-2" />
                {t('common.edit')}
              </Button>
            )}
            <Button onClick={handleDownloadPDF} disabled={!invoice} className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 me-2" />
              {t('common.downloadPDF')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ViewInvoiceDialog;
