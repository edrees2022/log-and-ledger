import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  Package,
  Building2,
  FileText,
  RefreshCw,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';

type ImportType = 'contacts' | 'items' | 'accounts' | 'invoices' | 'bills';

interface ParsedRow {
  data: Record<string, any>;
  errors: string[];
  warnings: string[];
  status: 'valid' | 'warning' | 'error';
}

interface ColumnMapping {
  excelColumn: string;
  systemField: string;
  required: boolean;
}

interface ImportConfig {
  type: ImportType;
  label: string;
  icon: React.ElementType;
  description: string;
  fields: { key: string; label: string; required: boolean; type?: string }[];
  templateData: Record<string, any>[];
}

const importConfigs: ImportConfig[] = [
  {
    type: 'contacts',
    label: 'contacts',
    icon: Users,
    description: 'importContactsDesc',
    fields: [
      { key: 'name', label: 'name', required: true },
      { key: 'email', label: 'email', required: false },
      { key: 'phone', label: 'phone', required: false },
      { key: 'type', label: 'type', required: true },
      { key: 'address', label: 'address', required: false },
      { key: 'city', label: 'city', required: false },
      { key: 'country', label: 'country', required: false },
      { key: 'tax_number', label: 'taxNumber', required: false },
    ],
    templateData: [
      { name: 'John Doe', email: 'john@example.com', phone: '+1234567890', type: 'customer', address: '123 Main St', city: 'New York', country: 'USA', tax_number: '' },
      { name: 'ABC Company', email: 'info@abc.com', phone: '+0987654321', type: 'vendor', address: '456 Oak Ave', city: 'Los Angeles', country: 'USA', tax_number: '123456789' },
    ]
  },
  {
    type: 'items',
    label: 'items',
    icon: Package,
    description: 'importItemsDesc',
    fields: [
      { key: 'name', label: 'name', required: true },
      { key: 'sku', label: 'sku', required: false },
      { key: 'description', label: 'description', required: false },
      { key: 'type', label: 'type', required: true },
      { key: 'unit', label: 'unit', required: false },
      { key: 'sale_price', label: 'salePrice', required: false, type: 'number' },
      { key: 'purchase_price', label: 'purchasePrice', required: false, type: 'number' },
      { key: 'quantity', label: 'quantity', required: false, type: 'number' },
    ],
    templateData: [
      { name: 'Widget A', sku: 'WGT-001', description: 'Standard widget', type: 'product', unit: 'pcs', sale_price: 29.99, purchase_price: 15.00, quantity: 100 },
      { name: 'Consulting Hour', sku: 'SRV-001', description: 'Consulting service', type: 'service', unit: 'hour', sale_price: 150.00, purchase_price: 0, quantity: 0 },
    ]
  },
  {
    type: 'accounts',
    label: 'accounts',
    icon: Building2,
    description: 'importAccountsDesc',
    fields: [
      { key: 'code', label: 'accountCode', required: true },
      { key: 'name', label: 'accountName', required: true },
      { key: 'account_type', label: 'accountType', required: true },
      { key: 'account_subtype', label: 'accountSubtype', required: false },
      { key: 'parent_code', label: 'parentCode', required: false },
      { key: 'description', label: 'description', required: false },
      { key: 'opening_balance', label: 'openingBalance', required: false, type: 'number' },
    ],
    templateData: [
      { code: '1100', name: 'Cash', account_type: 'asset', account_subtype: 'current_asset', parent_code: '', description: 'Cash in hand', opening_balance: 10000 },
      { code: '4000', name: 'Sales Revenue', account_type: 'revenue', account_subtype: '', parent_code: '', description: 'Revenue from sales', opening_balance: 0 },
    ]
  },
];

export default function DataImportPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ImportType>('contacts');
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] }>({ success: 0, failed: 0, errors: [] });
  const [showPreview, setShowPreview] = useState(true);

  const currentConfig = importConfigs.find(c => c.type === activeTab)!;

  // Parse Excel file
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (jsonData.length === 0) {
          toast({
            title: t('import.error'),
            description: t('import.emptyFile'),
            variant: 'destructive',
          });
          return;
        }

        const columns = Object.keys(jsonData[0] as object);
        setExcelColumns(columns);
        setRawData(jsonData);

        // Auto-map columns
        const mappings: ColumnMapping[] = currentConfig.fields.map(field => {
          const matchingColumn = columns.find(col => 
            col.toLowerCase().replace(/[_\s-]/g, '') === field.key.toLowerCase().replace(/[_\s-]/g, '') ||
            col.toLowerCase().includes(field.key.toLowerCase())
          );
          return {
            excelColumn: matchingColumn || '',
            systemField: field.key,
            required: field.required,
          };
        });
        setColumnMappings(mappings);

        setStep('mapping');
        toast({
          title: t('import.fileLoaded'),
          description: t('import.rowsFound', { count: jsonData.length }),
        });
      } catch (error) {
        toast({
          title: t('import.error'),
          description: t('import.invalidFile'),
          variant: 'destructive',
        });
      }
    };
    reader.readAsBinaryString(selectedFile);
  }, [currentConfig, t, toast]);

  // Update column mapping
  const updateMapping = (systemField: string, excelColumn: string) => {
    setColumnMappings(prev => 
      prev.map(m => m.systemField === systemField ? { ...m, excelColumn } : m)
    );
  };

  // Validate and preview data
  const validateData = useCallback(() => {
    const rows: ParsedRow[] = rawData.map((row, idx) => {
      const mappedData: Record<string, any> = {};
      const errors: string[] = [];
      const warnings: string[] = [];

      columnMappings.forEach(mapping => {
        if (mapping.excelColumn) {
          let value = row[mapping.excelColumn];
          
          // Type conversion
          const fieldConfig = currentConfig.fields.find(f => f.key === mapping.systemField);
          if (fieldConfig?.type === 'number' && value !== '') {
            const num = parseFloat(value);
            if (isNaN(num)) {
              warnings.push(t('import.invalidNumber', { field: mapping.systemField, row: idx + 1 }));
              value = 0;
            } else {
              value = num;
            }
          }
          
          mappedData[mapping.systemField] = value;
        } else if (mapping.required) {
          errors.push(t('import.requiredField', { field: mapping.systemField }));
        }
      });

      // Check required fields
      currentConfig.fields.forEach(field => {
        if (field.required && (!mappedData[field.key] || mappedData[field.key] === '')) {
          errors.push(t('import.requiredFieldEmpty', { field: t(`fields.${field.label}`) }));
        }
      });

      return {
        data: mappedData,
        errors,
        warnings,
        status: errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'valid',
      };
    });

    setParsedRows(rows);
    setStep('preview');
  }, [rawData, columnMappings, currentConfig, t]);

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (rows: Record<string, any>[]) => {
      const results = { success: 0, failed: 0, errors: [] as string[] };
      const total = rows.length;

      for (let i = 0; i < rows.length; i++) {
        try {
          await apiRequest('POST', `/api/${activeTab}`, rows[i]);
          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: ${error.message || 'Import failed'}`);
        }
        setImportProgress(Math.round(((i + 1) / total) * 100));
      }

      return results;
    },
    onSuccess: (results) => {
      setImportResults(results);
      setStep('complete');
      queryClient.invalidateQueries({ queryKey: [`/api/${activeTab}`] });
      
      toast({
        title: t('import.complete'),
        description: t('import.completeSummary', { success: results.success, failed: results.failed }),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('import.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Start import
  const startImport = () => {
    const validRows = parsedRows
      .filter(r => r.status !== 'error')
      .map(r => r.data);
    
    if (validRows.length === 0) {
      toast({
        title: t('import.error'),
        description: t('import.noValidRows'),
        variant: 'destructive',
      });
      return;
    }

    setStep('importing');
    setImportProgress(0);
    importMutation.mutate(validRows);
  };

  // Download template
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(currentConfig.templateData);
    XLSX.utils.book_append_sheet(wb, ws, currentConfig.type);
    XLSX.writeFile(wb, `${currentConfig.type}_import_template.xlsx`);
    
    toast({
      title: t('import.templateDownloaded'),
      description: t('import.templateDownloadedDesc'),
    });
  };

  // Reset form
  const resetForm = () => {
    setFile(null);
    setRawData([]);
    setExcelColumns([]);
    setColumnMappings([]);
    setParsedRows([]);
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0, errors: [] });
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validCount = parsedRows.filter(r => r.status === 'valid').length;
  const warningCount = parsedRows.filter(r => r.status === 'warning').length;
  const errorCount = parsedRows.filter(r => r.status === 'error').length;

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('import.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('import.description')}</p>
      </div>

      {/* Import Type Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as ImportType); resetForm(); }}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3">
          {importConfigs.map(config => (
            <TabsTrigger key={config.type} value={config.type} className="gap-2">
              <config.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t(`nav.${config.label}`)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <currentConfig.icon className="h-5 w-5" />
                {t(`import.import${currentConfig.type.charAt(0).toUpperCase() + currentConfig.type.slice(1)}`)}
              </CardTitle>
              <CardDescription>{t(`import.${currentConfig.description}`)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step: Upload */}
              {step === 'upload' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Label htmlFor="file-upload" className="sr-only">{t('import.selectFile')}</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                        <Input
                          ref={fileInputRef}
                          id="file-upload"
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-lg font-medium">{t('import.dragOrClick')}</p>
                          <p className="text-sm text-muted-foreground mt-1">{t('import.supportedFormats')}</p>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                      <Download className="h-4 w-4" />
                      {t('import.downloadTemplate')}
                    </Button>
                    
                    <Alert className="max-w-md">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        {t('import.templateTip')}
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              )}

              {/* Step: Column Mapping */}
              {step === 'mapping' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{t('import.mapColumns')}</h3>
                      <p className="text-sm text-muted-foreground">{t('import.mapColumnsDesc')}</p>
                    </div>
                    <Badge variant="outline">{file?.name}</Badge>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('import.systemField')}</TableHead>
                          <TableHead>{t('import.excelColumn')}</TableHead>
                          <TableHead className="w-20">{t('import.required')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {columnMappings.map((mapping) => (
                          <TableRow key={mapping.systemField}>
                            <TableCell className="font-medium">
                              {t(`fields.${currentConfig.fields.find(f => f.key === mapping.systemField)?.label || mapping.systemField}`)}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={mapping.excelColumn || '_none_'}
                                onValueChange={(v) => updateMapping(mapping.systemField, v === '_none_' ? '' : v)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={t('import.selectColumn')} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="_none_">-- {t('import.notMapped')} --</SelectItem>
                                  {excelColumns.map(col => (
                                    <SelectItem key={col} value={col}>{col}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {mapping.required && <Badge variant="destructive">{t('common.required')}</Badge>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={resetForm}>
                      {t('common.cancel')}
                    </Button>
                    <Button onClick={validateData}>
                      {t('import.validateAndPreview')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step: Preview */}
              {step === 'preview' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {validCount} {t('import.valid')}
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {warningCount} {t('import.warnings')}
                      </Badge>
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        {errorCount} {t('import.errors')}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
                      {showPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      {t('import.togglePreview')}
                    </Button>
                  </div>

                  {showPreview && (
                    <div className="border rounded-lg overflow-auto max-h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead className="w-20">{t('import.status')}</TableHead>
                            {currentConfig.fields.slice(0, 4).map(field => (
                              <TableHead key={field.key}>{t(`fields.${field.label}`)}</TableHead>
                            ))}
                            <TableHead>{t('import.issues')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedRows.slice(0, 50).map((row, idx) => (
                            <TableRow key={idx} className={row.status === 'error' ? 'bg-destructive/10' : row.status === 'warning' ? 'bg-yellow-500/10' : ''}>
                              <TableCell>{idx + 1}</TableCell>
                              <TableCell>
                                {row.status === 'valid' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                {row.status === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                                {row.status === 'error' && <XCircle className="h-4 w-4 text-destructive" />}
                              </TableCell>
                              {currentConfig.fields.slice(0, 4).map(field => (
                                <TableCell key={field.key} className="max-w-[150px] truncate">
                                  {String(row.data[field.key] || '-')}
                                </TableCell>
                              ))}
                              <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                                {[...row.errors, ...row.warnings].join('; ') || '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {parsedRows.length > 50 && (
                    <p className="text-sm text-muted-foreground text-center">
                      {t('import.showingFirst', { count: 50, total: parsedRows.length })}
                    </p>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep('mapping')}>
                      {t('common.back')}
                    </Button>
                    <Button 
                      onClick={startImport} 
                      disabled={validCount === 0}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {t('import.startImport', { count: validCount + warningCount })}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step: Importing */}
              {step === 'importing' && (
                <div className="space-y-4 text-center py-8">
                  <RefreshCw className="h-12 w-12 mx-auto animate-spin text-primary" />
                  <h3 className="text-lg font-medium">{t('import.importing')}</h3>
                  <Progress value={importProgress} className="max-w-md mx-auto" />
                  <p className="text-sm text-muted-foreground">{importProgress}%</p>
                </div>
              )}

              {/* Step: Complete */}
              {step === 'complete' && (
                <div className="space-y-4 text-center py-8">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                  <h3 className="text-xl font-medium">{t('import.complete')}</h3>
                  <div className="flex justify-center gap-4">
                    <Badge variant="default" className="text-lg py-1 px-3">
                      {importResults.success} {t('import.imported')}
                    </Badge>
                    {importResults.failed > 0 && (
                      <Badge variant="destructive" className="text-lg py-1 px-3">
                        {importResults.failed} {t('import.failed')}
                      </Badge>
                    )}
                  </div>

                  {importResults.errors.length > 0 && (
                    <Alert variant="destructive" className="max-w-lg mx-auto text-start">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{t('import.errorDetails')}</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside mt-2 text-sm">
                          {importResults.errors.slice(0, 5).map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                          {importResults.errors.length > 5 && (
                            <li>...{t('import.andMore', { count: importResults.errors.length - 5 })}</li>
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button onClick={resetForm} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    {t('import.importMore')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
