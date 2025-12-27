import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Send, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Copy,
  Clock
} from 'lucide-react';

interface SendInvoiceEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    invoice_number?: string;
    total_amount?: number | string;
    total?: number | string;
    currency?: string;
    due_date?: string;
    status?: string;
    customer_name?: string;
    customer_email?: string;
    contact?: {
      name?: string;
      email?: string;
    };
  } | null;
  onSuccess?: () => void;
}

export function SendInvoiceEmailDialog({
  open,
  onOpenChange,
  invoice,
  onSuccess,
}: SendInvoiceEmailDialogProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [message, setMessage] = useState('');

  // Reset form when dialog opens with new invoice
  useEffect(() => {
    if (open && invoice) {
      setTo(invoice?.customer_email || invoice?.contact?.email || '');
      setMessage('');
      setCc('');
    }
  }, [open, invoice?.id]);

  // Don't render if no invoice
  if (!invoice) return null;

  // Check email service status
  const { data: emailStatus } = useQuery({
    queryKey: ['/api/sales/email-status'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/sales/email-status');
      return res.json();
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/sales/invoices/${invoice.id}/send-email`, {
        to,
        cc: cc || undefined,
        message: message || undefined,
        language: i18n.language,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: t('email.sendSuccess'),
          description: t('email.invoiceSentTo', { email: to }),
        });
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast({
          title: t('email.sendFailed'),
          description: data.error,
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: t('email.sendFailed'),
        description: error.message || t('email.unknownError'),
        variant: 'destructive',
      });
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/sales/invoices/${invoice.id}/send-reminder`, {
        to,
        language: i18n.language,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: t('email.reminderSuccess'),
          description: t('email.reminderSentTo', { email: to }),
        });
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast({
          title: t('email.sendFailed'),
          description: data.error,
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: t('email.sendFailed'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const formatCurrency = (amount: number | string) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: invoice?.currency || 'USD',
    }).format(value || 0);
  };

  const isLoading = sendMutation.isPending || sendReminderMutation.isPending;
  const isConfigured = emailStatus?.configured;
  const totalAmount = invoice?.total_amount || invoice?.total || 0;
  const customerName = invoice?.customer_name || invoice?.contact?.name || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t('email.sendInvoice')}
          </DialogTitle>
          <DialogDescription>
            {t('email.sendInvoiceDescription')}
          </DialogDescription>
        </DialogHeader>

        {!isConfigured && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {t('email.notConfigured')}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Invoice Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('invoices.invoiceNumber')}</span>
              <Badge variant="outline">{invoice?.invoice_number || invoice?.id}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('invoices.total')}</span>
              <span className="font-semibold">{formatCurrency(totalAmount)}</span>
            </div>
            {invoice?.due_date && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('invoices.dueDate')}</span>
                <span>{new Date(invoice.due_date).toLocaleDateString(i18n.language)}</span>
              </div>
            )}
            {customerName && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('invoices.customer')}</span>
                <span>{customerName}</span>
              </div>
            )}
          </div>

          {/* Recipient */}
          <div className="space-y-2">
            <Label htmlFor="to">{t('email.to')} *</Label>
            <Input
              id="to"
              type="email"
              placeholder="customer@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* CC */}
          <div className="space-y-2">
            <Label htmlFor="cc">{t('email.cc')}</Label>
            <Input
              id="cc"
              type="email"
              placeholder="copy@example.com"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">{t('email.customMessage')}</Label>
            <Textarea
              id="message"
              placeholder={t('email.customMessagePlaceholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {/* Send Reminder button for unpaid/overdue invoices */}
          {(invoice?.status === 'unpaid' || invoice?.status === 'partial' || invoice?.status === 'overdue' || invoice?.status === 'partially_paid') && (
            <Button
              variant="outline"
              onClick={() => sendReminderMutation.mutate()}
              disabled={!to || isLoading || !isConfigured}
              className="gap-2"
            >
              {sendReminderMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              {t('email.sendReminder')}
            </Button>
          )}
          
          <Button
            onClick={() => sendMutation.mutate()}
            disabled={!to || isLoading || !isConfigured}
            className="gap-2"
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {t('email.send')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
