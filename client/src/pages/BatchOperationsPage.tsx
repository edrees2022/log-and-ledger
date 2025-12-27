/**
 * Batch Operations Page
 * Perform bulk actions on multiple records
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  FileSpreadsheet,
  Mail,
  Printer,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  Send,
  Archive,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type RecordType = 'invoices' | 'bills' | 'contacts' | 'items';
type BatchAction = 'export' | 'email' | 'print' | 'delete' | 'archive' | 'updateStatus';

export default function BatchOperationsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [recordType, setRecordType] = useState<RecordType>('invoices');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<BatchAction | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);

  // Map record types to correct API endpoints
  const getEndpointForType = (type: RecordType) => {
    switch (type) {
      case 'invoices': return '/api/sales/invoices';
      case 'bills': return '/api/purchases/bills';
      case 'contacts': return '/api/contacts';
      case 'items': return '/api/items';
      default: return `/api/${type}`;
    }
  };

  // Fetch records based on type
  const { data: records = [], isLoading } = useQuery({
    queryKey: [getEndpointForType(recordType)],
  });

  const recordTypeOptions = [
    { value: 'invoices', label: t('batch.invoices'), endpoint: '/api/sales/invoices' },
    { value: 'bills', label: t('batch.bills'), endpoint: '/api/purchases/bills' },
    { value: 'contacts', label: t('batch.contacts'), endpoint: '/api/contacts' },
    { value: 'items', label: t('batch.items'), endpoint: '/api/items' },
  ];

  const batchActions = [
    {
      id: 'export' as BatchAction,
      label: t('batch.exportSelected'),
      icon: <Download className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-600',
      available: ['invoices', 'bills', 'contacts', 'items'],
    },
    {
      id: 'email' as BatchAction,
      label: t('batch.emailSelected'),
      icon: <Mail className="h-4 w-4" />,
      color: 'bg-green-100 text-green-600',
      available: ['invoices', 'bills'],
    },
    {
      id: 'print' as BatchAction,
      label: t('batch.printSelected'),
      icon: <Printer className="h-4 w-4" />,
      color: 'bg-purple-100 text-purple-600',
      available: ['invoices', 'bills'],
    },
    {
      id: 'archive' as BatchAction,
      label: t('batch.archiveSelected'),
      icon: <Archive className="h-4 w-4" />,
      color: 'bg-yellow-100 text-yellow-600',
      available: ['invoices', 'bills', 'contacts', 'items'],
    },
    {
      id: 'delete' as BatchAction,
      label: t('batch.deleteSelected'),
      icon: <Trash2 className="h-4 w-4" />,
      color: 'bg-red-100 text-red-600',
      available: ['invoices', 'bills', 'contacts', 'items'],
    },
  ];

  const filteredRecords = (records as any[]).filter(record => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      record.name?.toLowerCase().includes(searchLower) ||
      record.invoice_number?.toLowerCase().includes(searchLower) ||
      record.bill_number?.toLowerCase().includes(searchLower) ||
      record.sku?.toLowerCase().includes(searchLower) ||
      record.email?.toLowerCase().includes(searchLower)
    );
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map((r: any) => r.id));
    }
  };

  const initiateAction = (action: BatchAction) => {
    if (selectedIds.length === 0) {
      toast({
        title: t('batch.noSelection'),
        description: t('batch.selectRecordsFirst'),
        variant: 'destructive',
      });
      return;
    }
    setPendingAction(action);
    setShowConfirmDialog(true);
  };

  const executeAction = async () => {
    if (!pendingAction) return;

    setShowConfirmDialog(false);
    setIsProcessing(true);
    setProgress(0);
    setResults(null);

    let success = 0;
    let failed = 0;

    try {
      for (let i = 0; i < selectedIds.length; i++) {
        const id = selectedIds[i];
        try {
          switch (pendingAction) {
            case 'delete':
              await apiRequest('DELETE', `/api/${recordType}/${id}`);
              break;
            case 'archive':
              await apiRequest('PATCH', `/api/${recordType}/${id}`, { status: 'archived' });
              break;
            case 'email':
              await apiRequest('POST', `/api/${recordType}/${id}/send-email`);
              break;
            // Export and print would be handled client-side
          }
          success++;
        } catch {
          failed++;
        }
        setProgress(Math.round(((i + 1) / selectedIds.length) * 100));
      }

      setResults({ success, failed });

      if (success > 0) {
        queryClient.invalidateQueries({ queryKey: [`/api/${recordType}`] });
        toast({
          title: t('batch.operationComplete'),
          description: t('batch.operationSummary', { success, failed }),
        });
      }

      setSelectedIds([]);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setPendingAction(null);
    }
  };

  const getRecordDisplayName = (record: any) => {
    return (
      record.name ||
      record.invoice_number ||
      record.bill_number ||
      record.sku ||
      `#${record.id?.substring(0, 8)}`
    );
  };

  const getRecordBadge = (record: any) => {
    const status = record.status || 'active';
    const variants: Record<string, string> = {
      paid: 'bg-green-100 text-green-700',
      unpaid: 'bg-yellow-100 text-yellow-700',
      overdue: 'bg-red-100 text-red-700',
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-blue-100 text-blue-700',
    };
    return (
      <Badge className={variants[status] || variants.active}>
        {t(`common.${status}`, { defaultValue: status })}
      </Badge>
    );
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('batch.title')}</h1>
          <p className="text-muted-foreground">{t('batch.description')}</p>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label>{t('batch.recordType')}</Label>
                <Select
                  value={recordType}
                  onValueChange={(v) => {
                    setRecordType(v as RecordType);
                    setSelectedIds([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recordTypeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label>{t('common.search')}</Label>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('batch.searchPlaceholder')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {batchActions
                .filter(action => action.available.includes(recordType))
                .map(action => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className={cn('gap-2', action.color)}
                    onClick={() => initiateAction(action.id)}
                    disabled={selectedIds.length === 0 || isProcessing}
                  >
                    {action.icon}
                    {action.label}
                    {selectedIds.length > 0 && (
                      <Badge variant="secondary">{selectedIds.length}</Badge>
                    )}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        {isProcessing && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('batch.processing')}</span>
                </div>
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground">
                  {t('batch.progressStatus', { current: Math.round(progress * selectedIds.length / 100), total: selectedIds.length })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {results.success > 0 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>{t('batch.successCount', { count: results.success })}</span>
                  </div>
                )}
                {results.failed > 0 && (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <span>{t('batch.failedCount', { count: results.failed })}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Records List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {t('batch.records')} ({filteredRecords.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                disabled={isProcessing}
              >
                {selectedIds.length === filteredRecords.length
                  ? t('common.deselectAll')
                  : t('common.selectAll')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredRecords.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t('common.noData')}
              </p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredRecords.map((record: any) => (
                  <div
                    key={record.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                      selectedIds.includes(record.id)
                        ? 'bg-primary/5 border-primary'
                        : 'hover:bg-muted'
                    )}
                  >
                    <Checkbox
                      checked={selectedIds.includes(record.id)}
                      onCheckedChange={() => toggleSelect(record.id)}
                      disabled={isProcessing}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {getRecordDisplayName(record)}
                      </p>
                      {record.email && (
                        <p className="text-sm text-muted-foreground truncate">
                          {record.email}
                        </p>
                      )}
                      {record.total && (
                        <p className="text-sm text-muted-foreground">
                          {Number(record.total).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {getRecordBadge(record)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {t('batch.confirmAction')}
            </DialogTitle>
            <DialogDescription>
              {t('batch.confirmActionDesc', { 
                action: pendingAction,
                count: selectedIds.length 
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant={pendingAction === 'delete' ? 'destructive' : 'default'}
              onClick={executeAction}
            >
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
