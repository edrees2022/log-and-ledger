import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  FileText,
  DollarSign,
  CreditCard,
  Download,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Receipt,
  MessageSquare,
  Bell,
  Settings,
  User,
  LogOut,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Printer,
  Mail,
  Phone,
  MapPin,
  FileCheck,
  Wallet,
  BarChart3,
  PieChart,
  History,
  HelpCircle,
  Shield,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Types
type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
type PaymentMethod = 'bank_transfer' | 'credit_card' | 'cash' | 'check';

interface PortalInvoice {
  id: string;
  number: string;
  date: Date;
  dueDate: Date;
  amount: number;
  paidAmount: number;
  currency: string;
  status: InvoiceStatus;
  items: { description: string; quantity: number; price: number; total: number }[];
  notes?: string;
}

interface PortalPayment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  date: Date;
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
}

interface PortalStatement {
  id: string;
  period: string;
  openingBalance: number;
  closingBalance: number;
  totalInvoices: number;
  totalPayments: number;
  generatedAt: Date;
}

interface PortalMessage {
  id: string;
  subject: string;
  content: string;
  date: Date;
  read: boolean;
  from: 'company' | 'customer';
}

// Status config
const statusConfig: Record<InvoiceStatus, { color: string; icon: React.ElementType; label: string }> = {
  draft: { color: 'gray', icon: FileText, label: 'مسودة' },
  sent: { color: 'blue', icon: Mail, label: 'مرسلة' },
  viewed: { color: 'purple', icon: Eye, label: 'تم العرض' },
  paid: { color: 'green', icon: CheckCircle, label: 'مدفوعة' },
  overdue: { color: 'red', icon: AlertCircle, label: 'متأخرة' },
  cancelled: { color: 'gray', icon: XCircle, label: 'ملغاة' },
};

// Sample data
const sampleInvoices: PortalInvoice[] = [
  {
    id: '1',
    number: 'INV-2024-0156',
    date: new Date('2024-11-01'),
    dueDate: new Date('2024-12-01'),
    amount: 25000,
    paidAmount: 25000,
    currency: 'SAR',
    status: 'paid',
    items: [
      { description: 'خدمات استشارية', quantity: 10, price: 2000, total: 20000 },
      { description: 'تقرير تحليلي', quantity: 1, price: 5000, total: 5000 },
    ],
  },
  {
    id: '2',
    number: 'INV-2024-0167',
    date: new Date('2024-11-15'),
    dueDate: new Date('2024-12-15'),
    amount: 18500,
    paidAmount: 0,
    currency: 'SAR',
    status: 'sent',
    items: [
      { description: 'صيانة شهرية', quantity: 1, price: 15000, total: 15000 },
      { description: 'دعم فني', quantity: 7, price: 500, total: 3500 },
    ],
  },
  {
    id: '3',
    number: 'INV-2024-0145',
    date: new Date('2024-10-01'),
    dueDate: new Date('2024-10-31'),
    amount: 32000,
    paidAmount: 20000,
    currency: 'SAR',
    status: 'overdue',
    items: [
      { description: 'تطوير برمجيات', quantity: 40, price: 800, total: 32000 },
    ],
  },
];

const samplePayments: PortalPayment[] = [
  { id: '1', invoiceId: '1', invoiceNumber: 'INV-2024-0156', date: new Date('2024-11-15'), amount: 25000, currency: 'SAR', method: 'bank_transfer', reference: 'TRF-789456', status: 'completed' },
  { id: '2', invoiceId: '3', invoiceNumber: 'INV-2024-0145', date: new Date('2024-10-20'), amount: 20000, currency: 'SAR', method: 'bank_transfer', reference: 'TRF-654321', status: 'completed' },
];

const sampleStatements: PortalStatement[] = [
  { id: '1', period: 'نوفمبر 2024', openingBalance: 45000, closingBalance: 30500, totalInvoices: 43500, totalPayments: 58000, generatedAt: new Date('2024-11-30') },
  { id: '2', period: 'أكتوبر 2024', openingBalance: 32000, closingBalance: 45000, totalInvoices: 55000, totalPayments: 42000, generatedAt: new Date('2024-10-31') },
];

const sampleMessages: PortalMessage[] = [
  { id: '1', subject: 'تذكير بموعد الدفع', content: 'نود تذكيركم بأن الفاتورة INV-2024-0145 مستحقة الدفع. يرجى السداد في أقرب وقت.', date: new Date('2024-11-25'), read: false, from: 'company' },
  { id: '2', subject: 'شكراً لسداد الفاتورة', content: 'تم استلام دفعتكم بنجاح للفاتورة INV-2024-0156. شكراً لثقتكم.', date: new Date('2024-11-15'), read: true, from: 'company' },
];

// Invoice View Dialog
function InvoiceViewDialog({ invoice, open, onClose }: { invoice: PortalInvoice | null; open: boolean; onClose: () => void }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;

  if (!invoice) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: invoice.currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const status = statusConfig[invoice.status];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              فاتورة {invoice.number}
            </DialogTitle>
            <Badge className={`bg-${status.color}-100 text-${status.color}-700`}>
              <status.icon className="h-3 w-3 ml-1" />
              {status.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">تاريخ الفاتورة</p>
              <p className="font-medium">{format(invoice.date, 'dd MMMM yyyy', { locale: dateLocale })}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">تاريخ الاستحقاق</p>
              <p className="font-medium">{format(invoice.dueDate, 'dd MMMM yyyy', { locale: dateLocale })}</p>
            </div>
          </div>

          {/* Items Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الوصف</TableHead>
                <TableHead className="text-center">الكمية</TableHead>
                <TableHead className="text-center">السعر</TableHead>
                <TableHead className="text-left">الإجمالي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-center">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-left font-medium">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>الإجمالي</span>
                <span className="font-bold">{formatCurrency(invoice.amount)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>المدفوع</span>
                <span>{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>المتبقي</span>
                <span className={invoice.amount - invoice.paidAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(invoice.amount - invoice.paidAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>إغلاق</Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 ml-2" />
            طباعة
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تحميل PDF
          </Button>
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <Button>
              <CreditCard className="h-4 w-4 ml-2" />
              دفع الآن
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Payment Dialog
function PaymentDialog({ invoice, open, onClose, onSubmit }: { 
  invoice: PortalInvoice | null; 
  open: boolean; 
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [amount, setAmount] = useState('');

  if (!invoice) return null;

  const remaining = invoice.amount - invoice.paidAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: invoice.currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            دفع الفاتورة {invoice.number}
          </DialogTitle>
          <DialogDescription>
            المبلغ المستحق: {formatCurrency(remaining)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>طريقة الدفع</Label>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                <SelectItem value="check">شيك</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>المبلغ</Label>
            <Input
              type="number"
              placeholder={remaining.toString()}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              اتركه فارغاً لدفع المبلغ الكامل
            </p>
          </div>

          {paymentMethod === 'bank_transfer' && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4 text-sm">
                <h4 className="font-medium mb-2">معلومات الحساب البنكي</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>البنك: البنك الأهلي السعودي</p>
                  <p>رقم الحساب: SA1234567890123456789012</p>
                  <p>اسم المستفيد: شركة التقنية المتقدمة</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={() => onSubmit({ paymentMethod, amount: amount || remaining })}>
            <CheckCircle className="h-4 w-4 ml-2" />
            تأكيد الدفع
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CustomerPortal() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [invoices] = useState<PortalInvoice[]>(sampleInvoices);
  const [payments] = useState<PortalPayment[]>(samplePayments);
  const [statements] = useState<PortalStatement[]>(sampleStatements);
  const [messages, setMessages] = useState<PortalMessage[]>(sampleMessages);
  const [selectedInvoice, setSelectedInvoice] = useState<PortalInvoice | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Stats
  const stats = useMemo(() => {
    const totalOutstanding = invoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);
    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);
    const paidThisMonth = payments
      .filter(p => p.date.getMonth() === new Date().getMonth())
      .reduce((sum, p) => sum + p.amount, 0);
    const unreadMessages = messages.filter(m => !m.read).length;

    return { totalOutstanding, overdueAmount, paidThisMonth, unreadMessages };
  }, [invoices, payments, messages]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (searchQuery) {
        return inv.number.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [invoices, statusFilter, searchQuery]);

  // Handlers
  const handleViewInvoice = (invoice: PortalInvoice) => {
    setSelectedInvoice(invoice);
    setIsViewOpen(true);
  };

  const handlePayInvoice = (invoice: PortalInvoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentOpen(true);
  };

  const handlePaymentSubmit = (data: any) => {
    toast({
      title: 'تم إرسال طلب الدفع',
      description: 'سيتم تحديث حالة الفاتورة بعد التحقق من الدفع',
    });
    setIsPaymentOpen(false);
  };

  const formatCurrency = (amount: number, currency = 'SAR') => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">بوابة العميل</h1>
                <p className="text-sm text-muted-foreground">شركة التقنية المتقدمة</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {stats.unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.unreadMessages}
                  </span>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>ع م</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">عميل محترم</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="h-4 w-4 ml-2" />
                    الملف الشخصي
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 ml-2" />
                    الإعدادات
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="h-4 w-4 ml-2" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">المستحق</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalOutstanding)}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">متأخر السداد</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueAmount)}</p>
                </div>
                <div className="p-3 rounded-full bg-red-100">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">المدفوع هذا الشهر</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidThisMonth)}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الفواتير</p>
                  <p className="text-2xl font-bold">{invoices.length}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="invoices">الفواتير</TabsTrigger>
            <TabsTrigger value="payments">المدفوعات</TabsTrigger>
            <TabsTrigger value="statements">كشوف الحساب</TabsTrigger>
            <TabsTrigger value="messages">
              الرسائل
              {stats.unreadMessages > 0 && (
                <Badge variant="destructive" className="mr-2 text-xs">
                  {stats.unreadMessages}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Overdue Alert */}
            {stats.overdueAmount > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    <div className="flex-1">
                      <h3 className="font-medium text-red-800">لديك فواتير متأخرة السداد</h3>
                      <p className="text-sm text-red-600">
                        المبلغ المتأخر: {formatCurrency(stats.overdueAmount)}
                      </p>
                    </div>
                    <Button variant="destructive" onClick={() => setActiveTab('invoices')}>
                      عرض الفواتير
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>آخر الفواتير</CardTitle>
                  <Button variant="ghost" onClick={() => setActiveTab('invoices')}>
                    عرض الكل
                    <ChevronRight className="h-4 w-4 mr-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices.slice(0, 3).map(invoice => {
                    const status = statusConfig[invoice.status];
                    return (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg bg-${status.color}-100`}>
                            <FileText className={`h-5 w-5 text-${status.color}-600`} />
                          </div>
                          <div>
                            <p className="font-medium">{invoice.number}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(invoice.date, 'dd MMM yyyy', { locale: dateLocale })}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-bold">{formatCurrency(invoice.amount)}</p>
                          <Badge variant="outline" className={`bg-${status.color}-50 text-${status.color}-700`}>
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle>آخر المدفوعات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payments.slice(0, 3).map(payment => (
                    <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-green-100">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{payment.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(payment.date, 'dd MMM yyyy', { locale: dateLocale })}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-green-600">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices */}
          <TabsContent value="invoices" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>الفواتير</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="بحث..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-48 pr-9"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="sent">مرسلة</SelectItem>
                        <SelectItem value="paid">مدفوعة</SelectItem>
                        <SelectItem value="overdue">متأخرة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الفاتورة</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الاستحقاق</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map(invoice => {
                      const status = statusConfig[invoice.status];
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.number}</TableCell>
                          <TableCell>{format(invoice.date, 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{format(invoice.dueDate, 'dd/MM/yyyy')}</TableCell>
                          <TableCell className="font-bold">{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`bg-${status.color}-50 text-${status.color}-700`}>
                              <status.icon className="h-3 w-3 ml-1" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                <Button size="sm" onClick={() => handlePayInvoice(invoice)}>
                                  دفع
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>سجل المدفوعات</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الفاتورة</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الطريقة</TableHead>
                      <TableHead>المرجع</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.invoiceNumber}</TableCell>
                        <TableCell>{format(payment.date, 'dd/MM/yyyy')}</TableCell>
                        <TableCell>
                          {payment.method === 'bank_transfer' ? 'تحويل بنكي' :
                           payment.method === 'credit_card' ? 'بطاقة ائتمان' :
                           payment.method === 'check' ? 'شيك' : 'نقدي'}
                        </TableCell>
                        <TableCell>{payment.reference || '-'}</TableCell>
                        <TableCell className="font-bold text-green-600">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <CheckCircle className="h-3 w-3 ml-1" />
                            مكتمل
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statements */}
          <TabsContent value="statements" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>كشوف الحساب</CardTitle>
                <CardDescription>تحميل كشوف الحساب الشهرية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statements.map(statement => (
                    <div key={statement.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <FileCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{statement.period}</p>
                          <p className="text-sm text-muted-foreground">
                            الرصيد النهائي: {formatCurrency(statement.closingBalance)}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">
                        <Download className="h-4 w-4 ml-2" />
                        تحميل
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages */}
          <TabsContent value="messages" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>الرسائل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg border ${!message.read ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{message.subject}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(message.date, { addSuffix: true, locale: dateLocale })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{message.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <InvoiceViewDialog
        invoice={selectedInvoice}
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />
      <PaymentDialog
        invoice={selectedInvoice}
        open={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSubmit={handlePaymentSubmit}
      />
    </div>
  );
}

export default CustomerPortal;
