import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { AuditLog } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/utils/export';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Filters = {
  entity_type: string;
  action: string;
  from: string;
  to: string;
  limit: string;
  actor: string;
  entity_id: string;
  sort: 'asc' | 'desc';
};

const DEFAULT_LIMIT = '200';

export default function AuditLogsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [filters, setFilters] = useState<Filters>({
    entity_type: 'payment_allocation',
    action: '',
    from: '',
    to: '',
    limit: DEFAULT_LIMIT,
    actor: '',
    entity_id: '',
    sort: 'desc',
  });

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.entity_type) p.set('entity_type', filters.entity_type);
    if (filters.action) p.set('action', filters.action);
    if (filters.from) p.set('from', filters.from);
    if (filters.to) p.set('to', filters.to);
    if (filters.limit) p.set('limit', filters.limit);
    if (filters.actor) p.set('actor', filters.actor);
    if (filters.entity_id) p.set('entity_id', filters.entity_id);
    if (filters.sort) p.set('sort', filters.sort);
    return p;
  }, [filters]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const { data: logsPage, isLoading, refetch, isFetching } = useQuery<{ items: AuditLog[]; total: number }>({
    queryKey: ['/api/audit-logs', params.toString(), page, pageSize],
    queryFn: async () => {
      const sp = new URLSearchParams(params);
      sp.set('limit', String(pageSize));
      sp.set('offset', String((page - 1) * pageSize));
      const url = `/api/audit-logs?${sp.toString()}`;
      const res = await apiRequest('GET', url);
      const items: AuditLog[] = await res.json();
      const totalHeader = res.headers.get('x-total-count');
      const total = totalHeader ? parseInt(totalHeader, 10) : items.length;
      return { items, total };
    },
  });
  const logs: AuditLog[] = logsPage?.items ?? [];
  const totalCount: number = logsPage?.total ?? logs.length;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const canView = user?.role === 'owner' || user?.role === 'admin';

  // Pagination UX helpers (server-side): we don't know total count; infer hasNext by page size
  const hasPrev = page > 1;
  const hasNext = page * pageSize < totalCount;
  const startIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);

  const exportCsv = () => {
    const headers = ['timestamp', 'action', 'entity_type', 'entity_id', 'actor_name', 'changes'];
    const rows = logs.map((l: AuditLog) => [
      new Date((l as any).timestamp as any).toISOString(),
      (l as any).action ?? '',
      (l as any).entity_type ?? '',
      (l as any).entity_id ?? '',
      (l as any).actor_name ?? '',
      (l as any).changes ? JSON.stringify((l as any).changes) : '',
    ]);
    exportToCsv('audit-logs.csv', headers, rows);
  };

  const exportAllCsv = async () => {
    const sp = new URLSearchParams(params);
    // Remove pagination params if present; export endpoint ignores them anyway
    sp.delete('limit');
    sp.delete('offset');
    const url = `/api/audit-logs/export?${sp.toString()}`;
    const res = await apiRequest('GET', url);
    const blob = await res.blob();
    const dlUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = dlUrl;
    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    a.download = `audit-logs-${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(dlUrl), 2000);
  };

  const exportXlsx = async () => {
    const headers = ['timestamp', 'action', 'entity_type', 'entity_id', 'actor_name', 'changes'];
    const rows = logs.map((l: AuditLog) => [
      new Date((l as any).timestamp as any).toISOString(),
      (l as any).action ?? '',
      (l as any).entity_type ?? '',
      (l as any).entity_id ?? '',
      (l as any).actor_name ?? '',
      (l as any).changes ? JSON.stringify((l as any).changes) : '',
    ]);
    await exportToXlsx('audit-logs.xlsx', headers, rows, 'Audit Logs');
  };

  const exportPdf = async () => {
    const headers = ['timestamp', 'action', 'entity_type', 'entity_id', 'actor_name', 'changes'];
    const rows = logs.map((l: AuditLog) => [
      new Date((l as any).timestamp as any).toLocaleString(i18n.language),
      (l as any).action ?? '',
      (l as any).entity_type ?? '',
      (l as any).entity_id ?? '',
      (l as any).actor_name ?? '',
      (l as any).changes ? JSON.stringify((l as any).changes) : '',
    ]);
    await exportToPdf('audit-logs.pdf', headers, rows, { title: 'Audit Logs' });
  };

  if (!canView) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t('navigation.auditLogs')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('common.notAuthorized')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-3 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="page-title text-2xl font-bold">{t('navigation.auditLogs')}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="flex-1 sm:flex-none">
            {t('common.refresh')}
          </Button>
          <Button variant="outline" size="sm" onClick={exportAllCsv} disabled={isLoading} className="flex-1 sm:flex-none">
            {t('common.exportAllCsv')}
          </Button>
          <Button size="sm" onClick={exportXlsx} disabled={isLoading || logs.length === 0} className="flex-1 sm:flex-none">
            {t('common.exportXlsx')}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle>{t('common.filters')}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">{t('common.entityType')}</Label>
              <Select value={filters.entity_type || '__any__'} onValueChange={(v) => setFilters((f) => ({ ...f, entity_type: v === '__any__' ? '' : v }))}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder={t('common.select') as string} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__any__">{t('common.any')}</SelectItem>
                  {/* Sales */}
                  <SelectItem value="sales_invoice">{t('auditLogs.entities.salesInvoice', 'فاتورة مبيعات')}</SelectItem>
                  <SelectItem value="sales_quote">{t('auditLogs.entities.salesQuote', 'عرض سعر')}</SelectItem>
                  <SelectItem value="sales_order">{t('auditLogs.entities.salesOrder', 'طلب مبيعات')}</SelectItem>
                  <SelectItem value="sales_credit_note">{t('auditLogs.entities.salesCreditNote', 'إشعار دائن')}</SelectItem>
                  {/* Purchases */}
                  <SelectItem value="bill">{t('auditLogs.entities.bill', 'فاتورة شراء')}</SelectItem>
                  <SelectItem value="purchase_order">{t('auditLogs.entities.purchaseOrder', 'أمر شراء')}</SelectItem>
                  <SelectItem value="purchase_debit_note">{t('auditLogs.entities.purchaseDebitNote', 'إشعار مدين')}</SelectItem>
                  <SelectItem value="expense">{t('auditLogs.entities.expense', 'مصروف')}</SelectItem>
                  {/* Banking */}
                  <SelectItem value="bank_account">{t('auditLogs.entities.bankAccount', 'حساب بنكي')}</SelectItem>
                  <SelectItem value="payment">{t('auditLogs.entities.payment', 'دفعة')}</SelectItem>
                  <SelectItem value="receipt">{t('auditLogs.entities.receipt', 'إيصال')}</SelectItem>
                  <SelectItem value="payment_allocation">{t('auditLogs.entities.paymentAllocation', 'تخصيص دفعة')}</SelectItem>
                  {/* Accounting */}
                  <SelectItem value="journal">{t('auditLogs.entities.journal', 'قيد يومية')}</SelectItem>
                  <SelectItem value="account">{t('auditLogs.entities.account', 'حساب')}</SelectItem>
                  {/* Inventory */}
                  <SelectItem value="item">{t('auditLogs.entities.item', 'منتج')}</SelectItem>
                  <SelectItem value="warehouse">{t('auditLogs.entities.warehouse', 'مستودع')}</SelectItem>
                  <SelectItem value="stock_movement">{t('auditLogs.entities.stockMovement', 'حركة مخزون')}</SelectItem>
                  <SelectItem value="stock_transfer">{t('auditLogs.entities.stockTransfer', 'تحويل مخزون')}</SelectItem>
                  {/* Contacts & Others */}
                  <SelectItem value="contact">{t('auditLogs.entities.contact', 'جهة اتصال')}</SelectItem>
                  <SelectItem value="fixed_asset">{t('auditLogs.entities.fixedAsset', 'أصل ثابت')}</SelectItem>
                  <SelectItem value="project">{t('auditLogs.entities.project', 'مشروع')}</SelectItem>
                  <SelectItem value="budget">{t('auditLogs.entities.budget', 'ميزانية')}</SelectItem>
                  <SelectItem value="exchange_rate">{t('auditLogs.entities.exchangeRate', 'سعر صرف')}</SelectItem>
                  <SelectItem value="users">{t('auditLogs.entities.user', 'مستخدم')}</SelectItem>
                  <SelectItem value="check">{t('auditLogs.entities.check', 'شيك')}</SelectItem>
                  <SelectItem value="cost_center">{t('auditLogs.entities.costCenter', 'مركز تكلفة')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t('common.action')}</Label>
              <Select value={filters.action || '__any__'} onValueChange={(v) => setFilters((f) => ({ ...f, action: v === '__any__' ? '' : v }))}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder={t('common.select') as string} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__any__">{t('common.any')}</SelectItem>
                  <SelectItem value="create">{t('auditLogs.actions.create', 'create')}</SelectItem>
                  <SelectItem value="delete">{t('auditLogs.actions.delete', 'delete')}</SelectItem>
                  <SelectItem value="update">{t('auditLogs.actions.update', 'update')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t('common.sort')}</Label>
              <Select value={filters.sort} onValueChange={(v) => setFilters((f) => ({ ...f, sort: v as 'asc' | 'desc' }))}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder={t('common.select') as string} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">{t('common.newestFirst')}</SelectItem>
                  <SelectItem value="asc">{t('common.oldestFirst')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t('common.from')}</Label>
              <Input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} className="h-9 w-full" />
            </div>
            <div>
              <Label className="text-xs">{t('common.to')}</Label>
              <Input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} className="h-9 w-full" />
            </div>
            <div>
              <Label className="text-xs">{t('common.limit')}</Label>
              <Input type="number" min={1} max={1000} value={filters.limit}
                onChange={(e) => setFilters((f) => ({ ...f, limit: e.target.value }))}
                className="h-9 w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <Label className="text-xs">{t('common.actor')}</Label>
              <Input value={filters.actor} onChange={(e) => setFilters((f) => ({ ...f, actor: e.target.value }))} className="h-9 w-full" />
            </div>
            <div>
              <Label className="text-xs">{t('common.entityId')}</Label>
              <Input value={filters.entity_id} onChange={(e) => setFilters((f) => ({ ...f, entity_id: e.target.value }))} className="h-9 w-full" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                // Trigger refetch using the apiRequest to ensure server recognizes params immediately
                await apiRequest('GET', `/api/audit-logs?${params.toString()}`);
                setPage(1);
                refetch();
              }}
              disabled={isFetching}
              className="flex-1 sm:flex-none"
            >
              {t('common.apply')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ entity_type: 'payment_allocation', action: '', from: '', to: '', limit: DEFAULT_LIMIT, actor: '', entity_id: '', sort: 'desc' })}
              className="flex-1 sm:flex-none"
            >
              {t('common.reset')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-sm font-medium">
            {t('common.results')} · {isLoading ? t('common.loading') : `${totalCount}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="px-4 pb-4">
              <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.timestamp')}</TableHead>
                  <TableHead>{t('common.action')}</TableHead>
                  <TableHead>{t('common.entityType')}</TableHead>
                  <TableHead>{t('common.entityId')}</TableHead>
                  <TableHead>{t('common.actor')}</TableHead>
                  <TableHead>{t('common.details')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((row: AuditLog) => (
                  <TableRow key={(row as any).id} className="cursor-pointer" onClick={() => { setSelected(row); setOpen(true); }}>
                    <TableCell className="whitespace-nowrap">
                      {new Date((row as any).timestamp as any).toLocaleString(i18n.language)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{(row as any).action}</TableCell>
                    <TableCell className="whitespace-nowrap">{(row as any).entity_type}</TableCell>
                    <TableCell className="whitespace-nowrap">{(row as any).entity_id}</TableCell>
                    <TableCell className="whitespace-nowrap">{(row as any).actor_name || '-'}</TableCell>
                    <TableCell className="max-w-xl">
                      <pre className="text-xs whitespace-pre-wrap break-words">
                        {typeof (row as any).changes === 'object' ? JSON.stringify((row as any).changes, null, 2) : String((row as any).changes ?? '')}
                      </pre>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                      {t('common.noData')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          </div>
          {/* Pagination controls (server-side) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 pb-4 pt-2 border-t">
            <div className="text-muted-foreground text-xs sm:text-sm">
              {t('common.showing')} {startIndex} - {endIndex}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs">{t('common.perPage')}</Label>
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(parseInt(v, 10)); setPage(1); }}>
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  {t('common.prev')}
                </Button>
                <div className="px-2 text-sm">{page}</div>
                <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => setPage(p => p + 1)}>
                  {t('common.next')}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('navigation.auditLogs')}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <div><strong>{t('common.timestamp')}:</strong> {new Date((selected as any).timestamp as any).toLocaleString(i18n.language)}</div>
              <div className="grid grid-cols-2 gap-2">
                <div><strong>{t('common.action')}:</strong> {(selected as any).action}</div>
                <div><strong>{t('common.entityType')}:</strong> {(selected as any).entity_type}</div>
                <div><strong>{t('common.entityId')}:</strong> {(selected as any).entity_id}</div>
                <div><strong>{t('common.actor')}:</strong> {(selected as any).actor_name || '-'}</div>
                <div><strong>IP:</strong> {(selected as any).ip_address || '-'}</div>
                <div><strong>User-Agent:</strong> {(selected as any).user_agent || '-'}</div>
              </div>
              <div>
                <strong>{t('common.details')}:</strong>
                <pre className="mt-2 text-xs whitespace-pre-wrap break-words bg-muted p-2 rounded">
                  {typeof (selected as any).changes === 'object' ? JSON.stringify((selected as any).changes, null, 2) : String((selected as any).changes ?? '')}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
