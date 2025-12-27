import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowLeft, DollarSign, AlertCircle, CheckCircle, Clock, XCircle, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export default function BillDetailPage() {
  const [, params] = useRoute('/purchases/bills/:id');
  const id = params?.id as string;
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  const statusConfig: Record<string, { label: string; icon: any; color: any }> = {
    draft: { label: t('common.draft'), icon: XCircle, color: 'secondary' },
    pending: { label: t('common.pending'), icon: Clock, color: 'default' },
    partially_paid: { label: t('common.partiallyPaid'), icon: Clock, color: 'warning' },
    paid: { label: t('common.paid'), icon: CheckCircle, color: 'success' },
    overdue: { label: t('common.overdue'), icon: AlertCircle, color: 'destructive' },
    cancelled: { label: t('common.cancelled'), icon: XCircle, color: 'secondary' },
  };

  const { data: bill, isLoading, error } = useQuery({
    queryKey: ['/api/purchases/bills', id],
    enabled: !!id,
    select: (d: any) => d,
  });

  const { data: allocations = [], isLoading: allocLoading } = useQuery({
    queryKey: ['/api/purchases/bills', id, 'allocations'],
    enabled: !!id,
    select: (rows: any[]) => rows || [],
  });

  const unmatch = useMutation({
    mutationFn: async (allocationId: string) => apiRequest('DELETE', `/api/banking/reconciliation/allocations/${allocationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases/bills', id, 'allocations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/banking/reconciliation/allocations/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/purchases/bills'] });
      toast({ title: t('common.success'), description: t('banking.unmatchedSuccessfully') });
    },
    onError: (e: any) => toast({ title: t('common.error'), description: e?.message || t('banking.unmatchFailed'), variant: 'destructive' }),
  });

  const formatCurrency = (amount: number, currency: string) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency }).format(amount || 0);

  const Status = ({ status }: { status?: string }) => {
    if (!status) return null;
    const cfg = statusConfig[status] || statusConfig.draft;
    const Icon = cfg.icon;
    return (
      <Badge variant={cfg.color} className="gap-1">
        <Icon className="h-3 w-3" /> {cfg.label}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">{t('common.loading')}</div>;
  }
  if (error || !bill) {
    return (
      <div className="p-6">
        <AlertCircle className="h-6 w-6 text-destructive inline me-2" />
        {t('common.errorLoadingData')}
      </div>
    );
  }

  const currency = bill.currency || 'USD';
  const total = Number(bill.total || bill.amount || 0);
  const paid = Number(bill.paid_amount || 0);
  const outstanding = Math.max(0, total - paid);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/purchases/bills">
            <ArrowLeft className="h-4 w-4 me-2" /> {t('common.back')}
          </Link>
        </Button>
        <Status status={bill.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> {bill.bill_number || id}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">{t('purchases.bills.supplier')}</div>
            <div className="flex items-center gap-2"><Building2 className="h-4 w-4" />{bill.supplier_reference || '-'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{t('purchases.bills.billDate')}</div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{bill.date ? new Date(bill.date).toLocaleDateString(i18n.language) : '-'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{t('sales.invoices.dueDate')}</div>
            <div>{bill.due_date ? new Date(bill.due_date).toLocaleDateString(i18n.language) : '-'}</div>
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
            <div className="text-sm text-muted-foreground">{t('purchases.bills.outstanding')}</div>
            <div className="text-orange-600">{formatCurrency(outstanding, currency)}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('common.allocations')}</CardTitle>
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
                const payRef = a.payment_type === 'payment' ? pay.payment_number : pay.receipt_number;
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
                      {t('common.unmatch')}
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
