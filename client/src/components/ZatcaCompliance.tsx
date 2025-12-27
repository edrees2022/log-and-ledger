import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileCheck,
  Shield,
  QrCode,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
  Download,
  RefreshCw,
  Settings,
  FileText,
  Key,
  Lock,
  Unlock,
  Globe,
  Server,
  Zap,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { 
  generateZatcaQR, 
  validateVatNumber, 
  formatVatNumber,
  ZatcaComplianceStatus 
} from '@/utils/zatcaIntegration';

// Types
interface ZatcaConfig {
  isEnabled: boolean;
  environment: 'sandbox' | 'production';
  apiUrl: string;
  certificatePath?: string;
  privateKeyPath?: string;
  organizationId: string;
  vatNumber: string;
  sellerName: string;
  sellerAddress: {
    street: string;
    buildingNumber: string;
    district: string;
    city: string;
    postalCode: string;
  };
  phase: 1 | 2;
  autoSubmit: boolean;
  qrCodeEnabled: boolean;
}

interface SubmissionLog {
  id: string;
  invoiceNumber: string;
  invoiceType: 'standard' | 'simplified' | 'credit' | 'debit';
  submittedAt: Date;
  status: ZatcaComplianceStatus;
  responseCode?: string;
  responseMessage?: string;
  qrCode?: string;
  hash?: string;
}

// Sample logs
const sampleLogs: SubmissionLog[] = [
  { id: '1', invoiceNumber: 'INV-2024-0156', invoiceType: 'standard', submittedAt: new Date('2024-11-20T10:30:00'), status: 'cleared', responseCode: 'CLEARED', qrCode: 'QR123...', hash: 'abc123...' },
  { id: '2', invoiceNumber: 'INV-2024-0157', invoiceType: 'simplified', submittedAt: new Date('2024-11-20T11:00:00'), status: 'reported', responseCode: 'REPORTED', qrCode: 'QR456...' },
  { id: '3', invoiceNumber: 'INV-2024-0158', invoiceType: 'standard', submittedAt: new Date('2024-11-20T11:30:00'), status: 'rejected', responseCode: 'REJECT_001', responseMessage: 'Invalid VAT calculation' },
  { id: '4', invoiceNumber: 'CN-2024-0025', invoiceType: 'credit', submittedAt: new Date('2024-11-20T12:00:00'), status: 'pending' },
];

// Status config
const statusConfig: Record<ZatcaComplianceStatus, { color: string; icon: React.ElementType; label: string }> = {
  pending: { color: 'yellow', icon: RefreshCw, label: 'قيد الإرسال' },
  submitted: { color: 'blue', icon: Upload, label: 'تم الإرسال' },
  cleared: { color: 'green', icon: CheckCircle, label: 'تمت المصادقة' },
  reported: { color: 'green', icon: FileCheck, label: 'تم الإبلاغ' },
  rejected: { color: 'red', icon: XCircle, label: 'مرفوض' },
};

export function ZatcaCompliance() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [config, setConfig] = useState<ZatcaConfig>({
    isEnabled: true,
    environment: 'sandbox',
    apiUrl: 'https://gw-fatoora.zatca.gov.sa',
    organizationId: '',
    vatNumber: '',
    sellerName: '',
    sellerAddress: {
      street: '',
      buildingNumber: '',
      district: '',
      city: '',
      postalCode: '',
    },
    phase: 1,
    autoSubmit: true,
    qrCodeEnabled: true,
  });
  const [logs] = useState<SubmissionLog[]>(sampleLogs);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Stats
  const stats = {
    total: logs.length,
    cleared: logs.filter(l => l.status === 'cleared').length,
    reported: logs.filter(l => l.status === 'reported').length,
    rejected: logs.filter(l => l.status === 'rejected').length,
    pending: logs.filter(l => l.status === 'pending').length,
  };

  // Handlers
  const handleConfigChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      sellerAddress: {
        ...prev.sellerAddress,
        [field]: value,
      },
    }));
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (config.environment === 'sandbox') {
      setTestResult({
        success: true,
        message: 'تم الاتصال بنجاح ببيئة الاختبار (Sandbox)',
      });
    } else {
      setTestResult({
        success: false,
        message: 'فشل الاتصال: يرجى التحقق من الشهادة والمفتاح الخاص',
      });
    }
    
    setIsLoading(false);
  };

  const handleGenerateQR = () => {
    if (!config.vatNumber || !config.sellerName) {
      toast({
        title: 'بيانات ناقصة',
        description: 'يرجى إدخال اسم البائع والرقم الضريبي',
        variant: 'destructive',
      });
      return;
    }

    const qrData = {
      sellerName: config.sellerName,
      vatNumber: formatVatNumber(config.vatNumber),
      timestamp: new Date().toISOString(),
      totalWithVat: '1000.00',
      vatAmount: '150.00',
    };

    const qrCode = generateZatcaQR(qrData);
    
    toast({
      title: 'تم إنشاء رمز QR',
      description: 'تم إنشاء رمز QR بنجاح وفقاً لمعايير ZATCA',
    });

    console.log('Generated QR:', qrCode);
  };

  const handleSaveConfig = () => {
    // Validate VAT number
    if (config.vatNumber && !validateVatNumber(config.vatNumber)) {
      toast({
        title: 'رقم ضريبي غير صحيح',
        description: 'يجب أن يكون الرقم الضريبي السعودي مكوناً من 15 رقم يبدأ بـ 3',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'تم حفظ الإعدادات',
      description: 'تم حفظ إعدادات ZATCA بنجاح',
    });
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            {t('zatca.title', 'الفوترة الإلكترونية - ZATCA')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('zatca.subtitle', 'إعدادات وإدارة الامتثال لنظام الفوترة الإلكترونية')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={config.environment === 'production' ? 'default' : 'secondary'} className="gap-1">
            <Server className="h-3 w-3" />
            {config.environment === 'production' ? 'الإنتاج' : 'اختبار'}
          </Badge>
          <Badge variant={config.phase === 2 ? 'default' : 'outline'} className="gap-1">
            المرحلة {config.phase}
          </Badge>
        </div>
      </div>

      {/* Alert */}
      {config.environment === 'sandbox' && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>بيئة الاختبار</AlertTitle>
          <AlertDescription>
            أنت تعمل حالياً في بيئة الاختبار (Sandbox). الفواتير لن يتم إرسالها فعلياً إلى هيئة الزكاة والضريبة.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">إجمالي الفواتير</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.cleared}</p>
              <p className="text-sm text-muted-foreground">تمت المصادقة</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.reported}</p>
              <p className="text-sm text-muted-foreground">تم الإبلاغ</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">مرفوض</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">قيد الانتظار</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          <TabsTrigger value="certificates">الشهادات</TabsTrigger>
          <TabsTrigger value="logs">سجل الإرسال</TabsTrigger>
          <TabsTrigger value="help">المساعدة</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  حالة الامتثال
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium">المرحلة الأولى</p>
                      <p className="text-sm text-muted-foreground">إنشاء QR Code</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">مكتمل</Badge>
                </div>
                <div className={`flex items-center justify-between p-4 rounded-lg ${config.phase === 2 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                  <div className="flex items-center gap-3">
                    {config.phase === 2 ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    )}
                    <div>
                      <p className="font-medium">المرحلة الثانية</p>
                      <p className="text-sm text-muted-foreground">التكامل والربط</p>
                    </div>
                  </div>
                  <Badge className={config.phase === 2 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    {config.phase === 2 ? 'مفعّل' : 'غير مفعّل'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  إجراءات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" onClick={() => setIsTestDialogOpen(true)}>
                  <Server className="h-4 w-4 ml-2" />
                  اختبار الاتصال
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={handleGenerateQR}>
                  <QrCode className="h-4 w-4 ml-2" />
                  إنشاء رمز QR تجريبي
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 ml-2" />
                  تحميل دليل التكامل
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ExternalLink className="h-4 w-4 ml-2" />
                  بوابة ZATCA
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>آخر عمليات الإرسال</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.slice(0, 5).map(log => {
                    const status = statusConfig[log.status];
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.invoiceNumber}</TableCell>
                        <TableCell>
                          {log.invoiceType === 'standard' ? 'قياسية' :
                           log.invoiceType === 'simplified' ? 'مبسطة' :
                           log.invoiceType === 'credit' ? 'إشعار دائن' : 'إشعار مدين'}
                        </TableCell>
                        <TableCell>{format(log.submittedAt, 'dd/MM/yyyy HH:mm')}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`bg-${status.color}-50 text-${status.color}-700`}>
                            <status.icon className="h-3 w-3 ml-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>تفعيل ZATCA</Label>
                    <p className="text-sm text-muted-foreground">تفعيل الربط مع هيئة الزكاة والضريبة</p>
                  </div>
                  <Switch
                    checked={config.isEnabled}
                    onCheckedChange={(v) => handleConfigChange('isEnabled', v)}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>البيئة</Label>
                  <Select
                    value={config.environment}
                    onValueChange={(v) => handleConfigChange('environment', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">بيئة الاختبار (Sandbox)</SelectItem>
                      <SelectItem value="production">بيئة الإنتاج (Production)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المرحلة</Label>
                  <Select
                    value={config.phase.toString()}
                    onValueChange={(v) => handleConfigChange('phase', parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">المرحلة الأولى (QR Code)</SelectItem>
                      <SelectItem value="2">المرحلة الثانية (التكامل)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>الإرسال التلقائي</Label>
                    <p className="text-sm text-muted-foreground">إرسال الفواتير تلقائياً عند الإصدار</p>
                  </div>
                  <Switch
                    checked={config.autoSubmit}
                    onCheckedChange={(v) => handleConfigChange('autoSubmit', v)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Seller Information */}
            <Card>
              <CardHeader>
                <CardTitle>بيانات البائع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>اسم المنشأة</Label>
                  <Input
                    value={config.sellerName}
                    onChange={(e) => handleConfigChange('sellerName', e.target.value)}
                    placeholder="أدخل اسم المنشأة"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الرقم الضريبي (VAT)</Label>
                  <Input
                    value={config.vatNumber}
                    onChange={(e) => handleConfigChange('vatNumber', e.target.value)}
                    placeholder="3XXXXXXXXXX00003"
                    dir="ltr"
                  />
                  {config.vatNumber && !validateVatNumber(config.vatNumber) && (
                    <p className="text-sm text-red-500">رقم ضريبي غير صحيح</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>معرف المنشأة</Label>
                  <Input
                    value={config.organizationId}
                    onChange={(e) => handleConfigChange('organizationId', e.target.value)}
                    placeholder="Organization ID"
                    dir="ltr"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>عنوان المنشأة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>الشارع</Label>
                    <Input
                      value={config.sellerAddress.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم المبنى</Label>
                    <Input
                      value={config.sellerAddress.buildingNumber}
                      onChange={(e) => handleAddressChange('buildingNumber', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الحي</Label>
                    <Input
                      value={config.sellerAddress.district}
                      onChange={(e) => handleAddressChange('district', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>المدينة</Label>
                    <Input
                      value={config.sellerAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الرمز البريدي</Label>
                    <Input
                      value={config.sellerAddress.postalCode}
                      onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveConfig}>
                  حفظ الإعدادات
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Certificates */}
        <TabsContent value="certificates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                الشهادات والمفاتيح
              </CardTitle>
              <CardDescription>
                إدارة شهادة CSID والمفتاح الخاص للمرحلة الثانية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertTitle>أمان الشهادات</AlertTitle>
                <AlertDescription>
                  يتم تخزين الشهادات والمفاتيح بشكل آمن ومشفر. لا تشارك هذه المعلومات مع أي شخص.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <FileCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">شهادة CSID (Compliance)</p>
                        <p className="text-sm text-muted-foreground">صالحة حتى: 31 ديسمبر 2025</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">صالحة</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 ml-2" />
                      تحميل
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 ml-2" />
                      تجديد
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Key className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">المفتاح الخاص (Private Key)</p>
                        <p className="text-sm text-muted-foreground">ECDSA P-256</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowPrivateKey(!showPrivateKey)}>
                      {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {showPrivateKey && (
                    <div className="p-3 bg-muted rounded font-mono text-xs">
                      -----BEGIN EC PRIVATE KEY-----<br/>
                      MHQCAQEEICl...REDACTED...AoGCCqGSM49<br/>
                      -----END EC PRIVATE KEY-----
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">رفع شهادة جديدة</h4>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>ملف الشهادة (.pem, .crt)</Label>
                    <Input type="file" accept=".pem,.crt,.cer" className="mt-2" />
                  </div>
                  <div className="flex-1">
                    <Label>ملف المفتاح الخاص (.pem, .key)</Label>
                    <Input type="file" accept=".pem,.key" className="mt-2" />
                  </div>
                </div>
                <Button>
                  <Upload className="h-4 w-4 ml-2" />
                  رفع الشهادات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs */}
        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>سجل عمليات الإرسال</CardTitle>
              <CardDescription>جميع الفواتير المرسلة إلى ZATCA</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الرد</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map(log => {
                    const status = statusConfig[log.status];
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.invoiceNumber}</TableCell>
                        <TableCell>
                          {log.invoiceType === 'standard' ? 'قياسية' :
                           log.invoiceType === 'simplified' ? 'مبسطة' :
                           log.invoiceType === 'credit' ? 'إشعار دائن' : 'إشعار مدين'}
                        </TableCell>
                        <TableCell>{format(log.submittedAt, 'dd/MM/yyyy HH:mm')}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`bg-${status.color}-50 text-${status.color}-700`}>
                            <status.icon className="h-3 w-3 ml-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {log.responseMessage || log.responseCode || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {log.qrCode && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <QrCode className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>عرض QR</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
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

        {/* Help */}
        <TabsContent value="help" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  الأسئلة الشائعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { q: 'ما هي المرحلة الأولى والثانية؟', a: 'المرحلة الأولى تتطلب إنشاء QR Code للفواتير، بينما المرحلة الثانية تتطلب الربط المباشر مع ZATCA.' },
                  { q: 'كيف أحصل على شهادة CSID؟', a: 'يمكنك الحصول على الشهادة من بوابة هيئة الزكاة والضريبة والجمارك بعد التسجيل.' },
                  { q: 'ما هو الفرق بين الفاتورة القياسية والمبسطة؟', a: 'الفاتورة القياسية للمعاملات B2B وتتطلب بيانات المشتري، بينما المبسطة للمعاملات B2C.' },
                ].map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-muted">
                    <p className="font-medium mb-2">{faq.q}</p>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  روابط مفيدة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href="https://zatca.gov.sa" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">بوابة هيئة الزكاة والضريبة</p>
                    <p className="text-sm text-muted-foreground">zatca.gov.sa</p>
                  </div>
                </a>
                <a href="https://sandbox.zatca.gov.sa" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted">
                  <Server className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">بيئة الاختبار (Sandbox)</p>
                    <p className="text-sm text-muted-foreground">sandbox.zatca.gov.sa</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">دليل التكامل الفني</p>
                    <p className="text-sm text-muted-foreground">PDF - 2.5 MB</p>
                  </div>
                </a>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Test Connection Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>اختبار الاتصال</DialogTitle>
            <DialogDescription>التحقق من الاتصال مع خوادم ZATCA</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            {isLoading ? (
              <div className="text-center">
                <RefreshCw className="h-12 w-12 mx-auto text-primary animate-spin" />
                <p className="mt-4">جاري الاتصال...</p>
              </div>
            ) : testResult ? (
              <div className={`text-center p-6 rounded-lg ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                {testResult.success ? (
                  <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                ) : (
                  <XCircle className="h-12 w-12 mx-auto text-red-600" />
                )}
                <p className={`mt-4 font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResult.message}
                </p>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>اضغط على "اختبار" للتحقق من الاتصال</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>إغلاق</Button>
            <Button onClick={handleTestConnection} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                  جاري الاختبار...
                </>
              ) : (
                'اختبار'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ZatcaCompliance;
