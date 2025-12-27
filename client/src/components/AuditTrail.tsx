import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Eye,
  User,
  Calendar,
  Clock,
  FileText,
  Edit,
  Trash2,
  Plus,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Database,
  Lock,
  Unlock,
  Globe,
  Laptop,
  Smartphone,
  Building2,
  Receipt,
  Users,
  Package,
  CreditCard,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, subDays, subHours, isToday, isYesterday } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Types
type AuditAction = 'create' | 'update' | 'delete' | 'view' | 'export' | 'login' | 'logout' | 'approve' | 'reject' | 'send' | 'print' | 'restore';
type EntityType = 'invoice' | 'contact' | 'item' | 'transaction' | 'account' | 'journal_entry' | 'user' | 'settings' | 'report' | 'payment' | 'organization';
type SeverityLevel = 'info' | 'warning' | 'critical';

interface AuditChange {
  field: string;
  oldValue: string | number | boolean | null;
  newValue: string | number | boolean | null;
}

interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  entityName?: string;
  changes?: AuditChange[];
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    device?: 'desktop' | 'mobile' | 'tablet';
    location?: string;
    sessionId?: string;
  };
  severity: SeverityLevel;
  description?: string;
}

interface AuditTrailProps {
  organizationId?: number;
  entityType?: EntityType;
  entityId?: string;
  compact?: boolean;
}

// Action icons and colors
const actionConfig: Record<AuditAction, { icon: React.ElementType; color: string; bgColor: string }> = {
  create: { icon: Plus, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  update: { icon: Edit, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  delete: { icon: Trash2, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  view: { icon: Eye, color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/30' },
  export: { icon: Download, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  login: { icon: Unlock, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  logout: { icon: Lock, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  approve: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  reject: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  send: { icon: ArrowUpRight, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  print: { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/30' },
  restore: { icon: RefreshCw, color: 'text-teal-600', bgColor: 'bg-teal-100 dark:bg-teal-900/30' }
};

// Entity icons
const entityIcons: Record<EntityType, React.ElementType> = {
  invoice: Receipt,
  contact: Users,
  item: Package,
  transaction: CreditCard,
  account: Building2,
  journal_entry: FileSpreadsheet,
  user: User,
  settings: Settings,
  report: FileText,
  payment: CreditCard,
  organization: Building2
};

// Severity config
const severityConfig: Record<SeverityLevel, { color: string; icon: React.ElementType }> = {
  info: { color: 'text-blue-500', icon: Info },
  warning: { color: 'text-yellow-500', icon: AlertTriangle },
  critical: { color: 'text-red-500', icon: Shield }
};

// Device icons
const deviceIcons: Record<string, React.ElementType> = {
  desktop: Laptop,
  mobile: Smartphone,
  tablet: Smartphone
};

export function AuditTrail({ 
  organizationId, 
  entityType: filterEntityType, 
  entityId: filterEntityId,
  compact = false 
}: AuditTrailProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<AuditAction | 'all'>('all');
  const [selectedEntity, setSelectedEntity] = useState<EntityType | 'all'>(filterEntityType || 'all');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'all'>('all');
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | '90days' | 'all'>('7days');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = compact ? 5 : 20;

  // Sample audit data
  const sampleAuditEntries: AuditEntry[] = useMemo(() => [
    {
      id: '1',
      timestamp: subHours(new Date(), 1),
      userId: 'user1',
      userName: 'أحمد محمد',
      userEmail: 'ahmed@example.com',
      action: 'create',
      entityType: 'invoice',
      entityId: 'INV-2024-001',
      entityName: 'فاتورة #INV-2024-001',
      severity: 'info',
      metadata: {
        ipAddress: '192.168.1.100',
        device: 'desktop',
        location: 'الرياض، السعودية'
      },
      description: 'Created new invoice for Acme Corp'
    },
    {
      id: '2',
      timestamp: subHours(new Date(), 3),
      userId: 'user1',
      userName: 'أحمد محمد',
      userEmail: 'ahmed@example.com',
      action: 'update',
      entityType: 'contact',
      entityId: 'CNT-001',
      entityName: 'شركة الأمل',
      changes: [
        { field: 'email', oldValue: 'old@email.com', newValue: 'new@email.com' },
        { field: 'phone', oldValue: '+966501234567', newValue: '+966509876543' }
      ],
      severity: 'info',
      metadata: {
        ipAddress: '192.168.1.100',
        device: 'mobile'
      }
    },
    {
      id: '3',
      timestamp: subHours(new Date(), 5),
      userId: 'user2',
      userName: 'سارة أحمد',
      userEmail: 'sara@example.com',
      action: 'delete',
      entityType: 'item',
      entityId: 'ITEM-050',
      entityName: 'منتج قديم',
      severity: 'warning',
      metadata: {
        ipAddress: '192.168.1.105',
        device: 'desktop'
      }
    },
    {
      id: '4',
      timestamp: subHours(new Date(), 8),
      userId: 'user1',
      userName: 'أحمد محمد',
      userEmail: 'ahmed@example.com',
      action: 'approve',
      entityType: 'invoice',
      entityId: 'INV-2024-002',
      entityName: 'فاتورة #INV-2024-002',
      severity: 'info',
      metadata: {
        device: 'desktop'
      }
    },
    {
      id: '5',
      timestamp: subDays(new Date(), 1),
      userId: 'user3',
      userName: 'خالد عبدالله',
      userEmail: 'khalid@example.com',
      action: 'login',
      entityType: 'user',
      entityId: 'user3',
      severity: 'info',
      metadata: {
        ipAddress: '10.0.0.55',
        device: 'mobile',
        location: 'جدة، السعودية'
      }
    },
    {
      id: '6',
      timestamp: subDays(new Date(), 1),
      userId: 'user2',
      userName: 'سارة أحمد',
      userEmail: 'sara@example.com',
      action: 'export',
      entityType: 'report',
      entityId: 'RPT-2024-11',
      entityName: 'تقرير المبيعات الشهري',
      severity: 'info',
      metadata: {
        device: 'desktop'
      }
    },
    {
      id: '7',
      timestamp: subDays(new Date(), 2),
      userId: 'admin',
      userName: 'مدير النظام',
      userEmail: 'admin@example.com',
      action: 'update',
      entityType: 'settings',
      entityId: 'org-settings',
      entityName: 'إعدادات المنظمة',
      changes: [
        { field: 'tax_rate', oldValue: '15%', newValue: '15.5%' },
        { field: 'currency', oldValue: 'SAR', newValue: 'USD' }
      ],
      severity: 'critical',
      metadata: {
        ipAddress: '192.168.1.1',
        device: 'desktop'
      }
    },
    {
      id: '8',
      timestamp: subDays(new Date(), 3),
      userId: 'user1',
      userName: 'أحمد محمد',
      userEmail: 'ahmed@example.com',
      action: 'send',
      entityType: 'invoice',
      entityId: 'INV-2024-001',
      entityName: 'فاتورة #INV-2024-001',
      severity: 'info',
      description: 'Sent invoice via email to customer@acme.com'
    },
    {
      id: '9',
      timestamp: subDays(new Date(), 5),
      userId: 'user2',
      userName: 'سارة أحمد',
      userEmail: 'sara@example.com',
      action: 'create',
      entityType: 'journal_entry',
      entityId: 'JE-2024-150',
      entityName: 'قيد يومية #150',
      severity: 'info'
    },
    {
      id: '10',
      timestamp: subDays(new Date(), 7),
      userId: 'admin',
      userName: 'مدير النظام',
      userEmail: 'admin@example.com',
      action: 'restore',
      entityType: 'invoice',
      entityId: 'INV-2024-003',
      entityName: 'فاتورة #INV-2024-003',
      severity: 'warning',
      description: 'Restored deleted invoice from trash'
    }
  ], []);

  // Filter entries
  const filteredEntries = useMemo(() => {
    let entries = sampleAuditEntries;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      entries = entries.filter(e => 
        e.userName.toLowerCase().includes(query) ||
        e.userEmail.toLowerCase().includes(query) ||
        e.entityName?.toLowerCase().includes(query) ||
        e.entityId.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query)
      );
    }

    // Action filter
    if (selectedAction !== 'all') {
      entries = entries.filter(e => e.action === selectedAction);
    }

    // Entity filter
    if (selectedEntity !== 'all') {
      entries = entries.filter(e => e.entityType === selectedEntity);
    }

    // Entity ID filter (for specific entity view)
    if (filterEntityId) {
      entries = entries.filter(e => e.entityId === filterEntityId);
    }

    // Severity filter
    if (selectedSeverity !== 'all') {
      entries = entries.filter(e => e.severity === selectedSeverity);
    }

    // Date filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      switch (dateRange) {
        case 'today': startDate = new Date(now.setHours(0, 0, 0, 0)); break;
        case '7days': startDate = subDays(now, 7); break;
        case '30days': startDate = subDays(now, 30); break;
        case '90days': startDate = subDays(now, 90); break;
        default: startDate = new Date(0);
      }
      entries = entries.filter(e => e.timestamp >= startDate);
    }

    return entries;
  }, [sampleAuditEntries, searchQuery, selectedAction, selectedEntity, selectedSeverity, dateRange, filterEntityId]);

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / pageSize);
  const paginatedEntries = filteredEntries.slice((page - 1) * pageSize, page * pageSize);

  // Format timestamp
  const formatTimestamp = useCallback((date: Date): string => {
    if (isToday(date)) {
      return `${t('audit.today')} ${format(date, 'HH:mm', { locale: dateLocale })}`;
    } else if (isYesterday(date)) {
      return `${t('audit.yesterday')} ${format(date, 'HH:mm', { locale: dateLocale })}`;
    }
    return format(date, 'PP HH:mm', { locale: dateLocale });
  }, [t, dateLocale]);

  // Get relative time
  const getRelativeTime = useCallback((date: Date): string => {
    return formatDistanceToNow(date, { addSuffix: true, locale: dateLocale });
  }, [dateLocale]);

  // Export audit log
  const handleExport = useCallback(() => {
    const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity', 'Severity', 'IP Address'];
    const rows = filteredEntries.map(e => [
      format(e.timestamp, 'yyyy-MM-dd HH:mm:ss'),
      e.userName,
      e.action,
      e.entityType,
      e.entityName || e.entityId,
      e.severity,
      e.metadata?.ipAddress || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_log_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: t('audit.exportSuccess') });
  }, [filteredEntries, t, toast]);

  // View entry details
  const viewDetails = useCallback((entry: AuditEntry) => {
    setSelectedEntry(entry);
    setDetailsOpen(true);
  }, []);

  // Copy to clipboard
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t('audit.copied') });
  }, [t, toast]);

  // Render entry row
  const renderEntryRow = (entry: AuditEntry) => {
    const actionCfg = actionConfig[entry.action];
    const ActionIcon = actionCfg.icon;
    const EntityIcon = entityIcons[entry.entityType];
    const DeviceIcon = entry.metadata?.device ? deviceIcons[entry.metadata.device] : Laptop;
    const SeverityIcon = severityConfig[entry.severity].icon;

    return (
      <TableRow key={entry.id} className="group hover:bg-muted/50">
        <TableCell>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", actionCfg.bgColor)}>
              <ActionIcon className={cn("h-4 w-4", actionCfg.color)} />
            </div>
            <div>
              <p className="font-medium">{t(`audit.actions.${entry.action}`)}</p>
              <p className="text-xs text-muted-foreground">{getRelativeTime(entry.timestamp)}</p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{entry.userName}</p>
              <p className="text-xs text-muted-foreground">{entry.userEmail}</p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <EntityIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{entry.entityName || entry.entityId}</p>
              <p className="text-xs text-muted-foreground">{t(`audit.entities.${entry.entityType}`)}</p>
            </div>
          </div>
        </TableCell>
        {!compact && (
          <>
            <TableCell>
              <div className="flex items-center gap-2">
                <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                {entry.metadata?.ipAddress && (
                  <span className="text-sm text-muted-foreground font-mono">
                    {entry.metadata.ipAddress}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <SeverityIcon className={cn("h-4 w-4", severityConfig[entry.severity].color)} />
                  </TooltipTrigger>
                  <TooltipContent>{t(`audit.severity.${entry.severity}`)}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
          </>
        )}
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100"
            onClick={() => viewDetails(entry)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {/* Header */}
      {!compact && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <History className="h-6 w-6" />
              {t('audit.title')}
            </h2>
            <p className="text-muted-foreground">{t('audit.description')}</p>
          </div>
          
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {t('audit.export')}
          </Button>
        </div>
      )}

      {/* Filters */}
      <Card className={compact ? "border-0 shadow-none" : ""}>
        <CardContent className={compact ? "p-0" : "pt-6"}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-48">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('audit.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-9"
                />
              </div>
            </div>

            {!compact && (
              <>
                <Select value={selectedAction} onValueChange={(v) => setSelectedAction(v as AuditAction | 'all')}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder={t('audit.filterAction')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('audit.allActions')}</SelectItem>
                    {Object.keys(actionConfig).map(action => (
                      <SelectItem key={action} value={action}>
                        {t(`audit.actions.${action}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedEntity} onValueChange={(v) => setSelectedEntity(v as EntityType | 'all')}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder={t('audit.filterEntity')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('audit.allEntities')}</SelectItem>
                    {Object.keys(entityIcons).map(entity => (
                      <SelectItem key={entity} value={entity}>
                        {t(`audit.entities.${entity}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder={t('audit.dateRange')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">{t('audit.ranges.today')}</SelectItem>
                    <SelectItem value="7days">{t('audit.ranges.7days')}</SelectItem>
                    <SelectItem value="30days">{t('audit.ranges.30days')}</SelectItem>
                    <SelectItem value="90days">{t('audit.ranges.90days')}</SelectItem>
                    <SelectItem value="all">{t('audit.ranges.all')}</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            <Badge variant="secondary" className="gap-1">
              {filteredEntries.length} {t('audit.entries')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card className={compact ? "border-0 shadow-none" : ""}>
        <CardContent className={compact ? "p-0" : ""}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('audit.table.action')}</TableHead>
                <TableHead>{t('audit.table.user')}</TableHead>
                <TableHead>{t('audit.table.entity')}</TableHead>
                {!compact && (
                  <>
                    <TableHead>{t('audit.table.details')}</TableHead>
                    <TableHead>{t('audit.table.severity')}</TableHead>
                  </>
                )}
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEntries.map(renderEntryRow)}
              
              {paginatedEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={compact ? 4 : 6} className="text-center py-8">
                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">{t('audit.noEntries')}</p>
                    <p className="text-muted-foreground">{t('audit.noEntriesDesc')}</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <CardContent className="border-t pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t('audit.showing', { 
                  from: (page - 1) * pageSize + 1, 
                  to: Math.min(page * pageSize, filteredEntries.length),
                  total: filteredEntries.length 
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
                <span className="text-sm">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t('audit.detailsTitle')}
            </DialogTitle>
          </DialogHeader>

          {selectedEntry && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6">
                {/* Action Summary */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className={cn("p-3 rounded-lg", actionConfig[selectedEntry.action].bgColor)}>
                    {React.createElement(actionConfig[selectedEntry.action].icon, {
                      className: cn("h-6 w-6", actionConfig[selectedEntry.action].color)
                    })}
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      {selectedEntry.userName} {t(`audit.actions.${selectedEntry.action}`)} {selectedEntry.entityName || selectedEntry.entityId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimestamp(selectedEntry.timestamp)}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">{t('audit.details.user')}</Label>
                    <p className="font-medium">{selectedEntry.userName}</p>
                    <p className="text-sm text-muted-foreground">{selectedEntry.userEmail}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">{t('audit.details.timestamp')}</Label>
                    <p className="font-medium">{format(selectedEntry.timestamp, 'PPpp', { locale: dateLocale })}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">{t('audit.details.entity')}</Label>
                    <p className="font-medium">{t(`audit.entities.${selectedEntry.entityType}`)}</p>
                    <p className="text-sm text-muted-foreground font-mono">{selectedEntry.entityId}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">{t('audit.details.severity')}</Label>
                    <Badge className={cn("gap-1", 
                      selectedEntry.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      selectedEntry.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    )}>
                      {t(`audit.severity.${selectedEntry.severity}`)}
                    </Badge>
                  </div>
                </div>

                {/* Metadata */}
                {selectedEntry.metadata && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground mb-2 block">{t('audit.details.metadata')}</Label>
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                        {selectedEntry.metadata.ipAddress && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{selectedEntry.metadata.ipAddress}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(selectedEntry.metadata!.ipAddress!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        {selectedEntry.metadata.device && (
                          <div className="flex items-center gap-2">
                            {React.createElement(deviceIcons[selectedEntry.metadata.device], {
                              className: "h-4 w-4 text-muted-foreground"
                            })}
                            <span className="text-sm">{t(`audit.devices.${selectedEntry.metadata.device}`)}</span>
                          </div>
                        )}
                        {selectedEntry.metadata.location && (
                          <div className="flex items-center gap-2 col-span-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedEntry.metadata.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Changes */}
                {selectedEntry.changes && selectedEntry.changes.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground mb-2 block">{t('audit.details.changes')}</Label>
                      <div className="space-y-2">
                        {selectedEntry.changes.map((change, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                            <span className="font-medium min-w-24">{change.field}</span>
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-red-500 line-through">{String(change.oldValue)}</span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <span className="text-green-500">{String(change.newValue)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Description */}
                {selectedEntry.description && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground mb-2 block">{t('audit.details.description')}</Label>
                      <p className="text-sm">{selectedEntry.description}</p>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AuditTrail;
