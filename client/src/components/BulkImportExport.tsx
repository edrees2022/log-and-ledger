import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Eye,
  Trash2,
  FileJson,
  Table,
  Loader2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Info
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Entity types that can be imported/exported
type EntityType = 'invoices' | 'contacts' | 'items' | 'transactions' | 'accounts' | 'journal_entries';
type FileFormat = 'csv' | 'xlsx' | 'json';

interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  transform?: 'none' | 'date' | 'number' | 'boolean' | 'uppercase' | 'lowercase';
}

interface ImportValidation {
  row: number;
  field: string;
  value: string;
  error: string;
  severity: 'error' | 'warning';
}

interface ImportPreviewRow {
  id: string;
  data: Record<string, unknown>;
  isValid: boolean;
  errors: ImportValidation[];
  selected: boolean;
}

interface ExportField {
  field: string;
  label: string;
  selected: boolean;
  required?: boolean;
}

interface BulkImportExportProps {
  entityType?: EntityType;
  onImportComplete?: (count: number) => void;
  onExportComplete?: (count: number) => void;
}

// Field definitions for each entity type
const entityFields: Record<EntityType, ExportField[]> = {
  invoices: [
    { field: 'invoice_number', label: 'Invoice Number', selected: true, required: true },
    { field: 'date', label: 'Date', selected: true, required: true },
    { field: 'due_date', label: 'Due Date', selected: true },
    { field: 'contact_name', label: 'Customer Name', selected: true, required: true },
    { field: 'contact_email', label: 'Customer Email', selected: true },
    { field: 'subtotal', label: 'Subtotal', selected: true },
    { field: 'tax_amount', label: 'Tax Amount', selected: true },
    { field: 'total', label: 'Total', selected: true, required: true },
    { field: 'status', label: 'Status', selected: true },
    { field: 'notes', label: 'Notes', selected: false },
  ],
  contacts: [
    { field: 'name', label: 'Name', selected: true, required: true },
    { field: 'email', label: 'Email', selected: true },
    { field: 'phone', label: 'Phone', selected: true },
    { field: 'type', label: 'Type', selected: true, required: true },
    { field: 'company', label: 'Company', selected: true },
    { field: 'address', label: 'Address', selected: true },
    { field: 'city', label: 'City', selected: true },
    { field: 'country', label: 'Country', selected: true },
    { field: 'tax_number', label: 'Tax Number', selected: false },
    { field: 'notes', label: 'Notes', selected: false },
  ],
  items: [
    { field: 'name', label: 'Name', selected: true, required: true },
    { field: 'sku', label: 'SKU', selected: true },
    { field: 'description', label: 'Description', selected: true },
    { field: 'type', label: 'Type', selected: true, required: true },
    { field: 'unit_price', label: 'Unit Price', selected: true, required: true },
    { field: 'cost_price', label: 'Cost Price', selected: true },
    { field: 'quantity', label: 'Quantity', selected: true },
    { field: 'category', label: 'Category', selected: true },
    { field: 'tax_rate', label: 'Tax Rate', selected: false },
    { field: 'is_active', label: 'Active', selected: false },
  ],
  transactions: [
    { field: 'date', label: 'Date', selected: true, required: true },
    { field: 'type', label: 'Type', selected: true, required: true },
    { field: 'amount', label: 'Amount', selected: true, required: true },
    { field: 'description', label: 'Description', selected: true },
    { field: 'account', label: 'Account', selected: true },
    { field: 'category', label: 'Category', selected: true },
    { field: 'reference', label: 'Reference', selected: true },
    { field: 'contact_name', label: 'Contact', selected: false },
    { field: 'notes', label: 'Notes', selected: false },
  ],
  accounts: [
    { field: 'code', label: 'Account Code', selected: true, required: true },
    { field: 'name', label: 'Account Name', selected: true, required: true },
    { field: 'type', label: 'Account Type', selected: true, required: true },
    { field: 'parent_code', label: 'Parent Code', selected: true },
    { field: 'description', label: 'Description', selected: true },
    { field: 'is_active', label: 'Active', selected: true },
    { field: 'opening_balance', label: 'Opening Balance', selected: false },
  ],
  journal_entries: [
    { field: 'date', label: 'Date', selected: true, required: true },
    { field: 'reference', label: 'Reference', selected: true },
    { field: 'account_code', label: 'Account Code', selected: true, required: true },
    { field: 'debit', label: 'Debit', selected: true },
    { field: 'credit', label: 'Credit', selected: true },
    { field: 'description', label: 'Description', selected: true },
    { field: 'contact_name', label: 'Contact', selected: false },
  ],
};

export function BulkImportExport({ 
  entityType: defaultEntity = 'contacts',
  onImportComplete,
  onExportComplete
}: BulkImportExportProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Import state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importEntityType, setImportEntityType] = useState<EntityType>(defaultEntity);
  const [parsedData, setParsedData] = useState<Record<string, unknown>[]>([]);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] }>({ success: 0, failed: 0, errors: [] });
  
  // Export state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportEntityType, setExportEntityType] = useState<EntityType>(defaultEntity);
  const [exportFormat, setExportFormat] = useState<FileFormat>('csv');
  const [exportFields, setExportFields] = useState<ExportField[]>(entityFields[defaultEntity]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFilters, setExportFilters] = useState<{
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }>({});
  
  // Helpers section state
  const [helpOpen, setHelpOpen] = useState(false);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['.csv', '.xlsx', '.xls', '.json'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExt)) {
      toast({
        title: t('bulkImport.invalidFileType'),
        description: t('bulkImport.supportedFormats'),
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);
    parseFile(file);
  }, [t, toast]);

  // Parse uploaded file
  const parseFile = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      
      let data: Record<string, unknown>[] = [];
      
      if (fileExt === 'csv') {
        // Parse CSV
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          throw new Error('File must have at least a header row and one data row');
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        setSourceColumns(headers);
        
        data = lines.slice(1).map((line, idx) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: Record<string, unknown> = {};
          headers.forEach((header, i) => {
            row[header] = values[i] || '';
          });
          return row;
        });
      } else if (fileExt === 'json') {
        // Parse JSON
        data = JSON.parse(text);
        if (!Array.isArray(data)) {
          data = [data];
        }
        if (data.length > 0) {
          setSourceColumns(Object.keys(data[0]));
        }
      }
      
      setParsedData(data);
      
      // Auto-map columns
      autoMapColumns(data);
      
      setImportStep('mapping');
    } catch (error) {
      toast({
        title: t('bulkImport.parseError'),
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  }, [t, toast]);

  // Auto-map columns based on field names
  const autoMapColumns = useCallback((data: Record<string, unknown>[]) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const targetFields = entityFields[importEntityType];
    
    const mappings: ColumnMapping[] = headers.map(header => {
      // Try to find matching target field
      const normalizedHeader = header.toLowerCase().replace(/[_\s-]/g, '');
      const matchedField = targetFields.find(f => {
        const normalizedField = f.field.toLowerCase().replace(/[_\s-]/g, '');
        const normalizedLabel = f.label.toLowerCase().replace(/[_\s-]/g, '');
        return normalizedField === normalizedHeader || normalizedLabel === normalizedHeader;
      });
      
      return {
        sourceColumn: header,
        targetField: matchedField?.field || '',
        transform: 'none' as const
      };
    });
    
    setColumnMappings(mappings);
  }, [importEntityType]);

  // Update column mapping
  const updateMapping = useCallback((sourceColumn: string, targetField: string) => {
    setColumnMappings(prev => 
      prev.map(m => m.sourceColumn === sourceColumn ? { ...m, targetField } : m)
    );
  }, []);

  // Validate and preview data
  const validateAndPreview = useCallback(() => {
    const rows: ImportPreviewRow[] = parsedData.map((row, idx) => {
      const mappedData: Record<string, unknown> = {};
      const errors: ImportValidation[] = [];
      
      columnMappings.forEach(mapping => {
        if (mapping.targetField) {
          let value = row[mapping.sourceColumn];
          
          // Apply transforms
          if (mapping.transform === 'date' && value) {
            // Try to parse date
            const date = new Date(value as string);
            if (isNaN(date.getTime())) {
              errors.push({
                row: idx + 1,
                field: mapping.targetField,
                value: String(value),
                error: t('bulkImport.invalidDate'),
                severity: 'error'
              });
            } else {
              value = date.toISOString().split('T')[0];
            }
          } else if (mapping.transform === 'number' && value) {
            const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
            if (isNaN(num)) {
              errors.push({
                row: idx + 1,
                field: mapping.targetField,
                value: String(value),
                error: t('bulkImport.invalidNumber'),
                severity: 'error'
              });
            } else {
              value = num;
            }
          }
          
          mappedData[mapping.targetField] = value;
        }
      });
      
      // Check required fields
      const requiredFields = entityFields[importEntityType].filter(f => f.required);
      requiredFields.forEach(field => {
        if (!mappedData[field.field]) {
          errors.push({
            row: idx + 1,
            field: field.field,
            value: '',
            error: t('bulkImport.requiredField', { field: field.label }),
            severity: 'error'
          });
        }
      });
      
      return {
        id: `row-${idx}`,
        data: mappedData,
        isValid: errors.filter(e => e.severity === 'error').length === 0,
        errors,
        selected: errors.filter(e => e.severity === 'error').length === 0
      };
    });
    
    setPreviewRows(rows);
    setImportStep('preview');
  }, [parsedData, columnMappings, importEntityType, t]);

  // Toggle row selection
  const toggleRowSelection = useCallback((rowId: string) => {
    setPreviewRows(prev => 
      prev.map(row => row.id === rowId ? { ...row, selected: !row.selected } : row)
    );
  }, []);

  // Select/deselect all valid rows
  const toggleAllSelection = useCallback((selected: boolean) => {
    setPreviewRows(prev => 
      prev.map(row => row.isValid ? { ...row, selected } : row)
    );
  }, []);

  // Execute import
  const executeImport = useCallback(async () => {
    setImportStep('importing');
    setImportProgress(0);
    
    const rowsToImport = previewRows.filter(row => row.selected && row.isValid);
    const total = rowsToImport.length;
    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    
    for (let i = 0; i < rowsToImport.length; i++) {
      const row = rowsToImport[i];
      
      try {
        // Simulate API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 50));
        success++;
      } catch (error) {
        failed++;
        errors.push(`Row ${row.id}: ${(error as Error).message}`);
      }
      
      setImportProgress(Math.round(((i + 1) / total) * 100));
    }
    
    setImportResult({ success, failed, errors });
    setImportStep('complete');
    
    if (onImportComplete) {
      onImportComplete(success);
    }
    
    toast({
      title: t('bulkImport.importComplete'),
      description: t('bulkImport.importSummary', { success, failed })
    });
  }, [previewRows, onImportComplete, t, toast]);

  // Reset import state
  const resetImport = useCallback(() => {
    setImportStep('upload');
    setSelectedFile(null);
    setParsedData([]);
    setSourceColumns([]);
    setColumnMappings([]);
    setPreviewRows([]);
    setImportProgress(0);
    setImportResult({ success: 0, failed: 0, errors: [] });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Handle export
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    
    try {
      // Get selected fields
      const selectedFields = exportFields.filter(f => f.selected);
      
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate sample data for demonstration
      const sampleData = [
        selectedFields.reduce((acc, f) => ({ ...acc, [f.field]: `Sample ${f.label}` }), {})
      ];
      
      // Generate file based on format
      let content: string;
      let mimeType: string;
      let filename: string;
      
      if (exportFormat === 'csv') {
        const headers = selectedFields.map(f => f.label).join(',');
        const rows = sampleData.map((row: Record<string, string>) => 
          selectedFields.map(f => `"${row[f.field] || ''}"`).join(',')
        );
        content = [headers, ...rows].join('\n');
        mimeType = 'text/csv';
        filename = `${exportEntityType}_export_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (exportFormat === 'json') {
        content = JSON.stringify(sampleData, null, 2);
        mimeType = 'application/json';
        filename = `${exportEntityType}_export_${new Date().toISOString().split('T')[0]}.json`;
      } else {
        // For xlsx, you would typically use a library like xlsx
        content = JSON.stringify(sampleData);
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `${exportEntityType}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      }
      
      // Download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      if (onExportComplete) {
        onExportComplete(sampleData.length);
      }
      
      toast({
        title: t('bulkExport.exportComplete'),
        description: t('bulkExport.exportSuccess', { count: sampleData.length })
      });
      
      setExportDialogOpen(false);
    } catch (error) {
      toast({
        title: t('bulkExport.exportFailed'),
        description: (error as Error).message,
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  }, [exportFields, exportFormat, exportEntityType, onExportComplete, t, toast]);

  // Toggle export field
  const toggleExportField = useCallback((field: string) => {
    setExportFields(prev => 
      prev.map(f => f.field === field && !f.required ? { ...f, selected: !f.selected } : f)
    );
  }, []);

  // Download template
  const downloadTemplate = useCallback(() => {
    const fields = entityFields[importEntityType];
    const headers = fields.map(f => f.label).join(',');
    const sampleRow = fields.map(f => f.required ? `Required: ${f.label}` : '').join(',');
    const content = [headers, sampleRow].join('\n');
    
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${importEntityType}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: t('bulkImport.templateDownloaded'),
      description: t('bulkImport.templateDescription')
    });
  }, [importEntityType, t, toast]);

  // Update entity type and fields
  const handleExportEntityChange = useCallback((entity: EntityType) => {
    setExportEntityType(entity);
    setExportFields(entityFields[entity]);
  }, []);

  return (
    <>
      {/* Import/Export Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setImportDialogOpen(true)}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {t('bulkImport.import')}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setExportDialogOpen(true)}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {t('bulkExport.export')}
        </Button>
      </div>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={(open) => {
        setImportDialogOpen(open);
        if (!open) resetImport();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {t('bulkImport.title')}
            </DialogTitle>
            <DialogDescription>
              {t('bulkImport.description')}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center justify-center py-4">
            {['upload', 'mapping', 'preview', 'importing', 'complete'].map((step, idx) => (
              <React.Fragment key={step}>
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                  importStep === step 
                    ? "bg-primary text-primary-foreground" 
                    : ['upload', 'mapping', 'preview', 'importing', 'complete'].indexOf(importStep) > idx
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                )}>
                  {['upload', 'mapping', 'preview', 'importing', 'complete'].indexOf(importStep) > idx ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < 4 && (
                  <div className={cn(
                    "w-16 h-0.5",
                    ['upload', 'mapping', 'preview', 'importing', 'complete'].indexOf(importStep) > idx
                      ? "bg-green-500"
                      : "bg-muted"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>

          <ScrollArea className="flex-1">
            {/* Step 1: Upload */}
            {importStep === 'upload' && (
              <div className="space-y-4 p-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>{t('bulkImport.entityType')}</Label>
                    <Select value={importEntityType} onValueChange={(v) => setImportEntityType(v as EntityType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contacts">{t('bulkImport.entities.contacts')}</SelectItem>
                        <SelectItem value="items">{t('bulkImport.entities.items')}</SelectItem>
                        <SelectItem value="invoices">{t('bulkImport.entities.invoices')}</SelectItem>
                        <SelectItem value="transactions">{t('bulkImport.entities.transactions')}</SelectItem>
                        <SelectItem value="accounts">{t('bulkImport.entities.accounts')}</SelectItem>
                        <SelectItem value="journal_entries">{t('bulkImport.entities.journalEntries')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button variant="outline" onClick={downloadTemplate} className="mt-6 gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    {t('bulkImport.downloadTemplate')}
                  </Button>
                </div>

                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                    "hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">{t('bulkImport.dropzone')}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t('bulkImport.supportedFormats')}</p>
                </div>

                <Collapsible open={helpOpen} onOpenChange={setHelpOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        {t('bulkImport.help')}
                      </span>
                      {helpOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Alert className="mt-2">
                      <Info className="h-4 w-4" />
                      <AlertTitle>{t('bulkImport.helpTitle')}</AlertTitle>
                      <AlertDescription className="mt-2 space-y-2">
                        <p>{t('bulkImport.helpText1')}</p>
                        <ul className="list-disc list-inside text-sm">
                          <li>{t('bulkImport.helpText2')}</li>
                          <li>{t('bulkImport.helpText3')}</li>
                          <li>{t('bulkImport.helpText4')}</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Step 2: Column Mapping */}
            {importStep === 'mapping' && (
              <div className="space-y-4 p-4">
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>{t('bulkImport.fileLoaded')}</AlertTitle>
                  <AlertDescription>
                    {t('bulkImport.rowsFound', { count: parsedData.length })}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>{t('bulkImport.mapColumns')}</Label>
                  <div className="border rounded-lg divide-y max-h-80 overflow-auto">
                    {columnMappings.map(mapping => (
                      <div key={mapping.sourceColumn} className="flex items-center gap-4 p-3">
                        <div className="flex-1">
                          <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                            {mapping.sourceColumn}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <Select 
                            value={mapping.targetField || 'skip'} 
                            onValueChange={(v) => updateMapping(mapping.sourceColumn, v === 'skip' ? '' : v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('bulkImport.skipColumn')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="skip">{t('bulkImport.skipColumn')}</SelectItem>
                              {entityFields[importEntityType].map(field => (
                                <SelectItem key={field.field} value={field.field}>
                                  {field.label} {field.required && <span className="text-destructive">*</span>}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Preview */}
            {importStep === 'preview' && (
              <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {previewRows.filter(r => r.isValid).length} {t('bulkImport.valid')}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <XCircle className="h-3 w-3 text-destructive" />
                      {previewRows.filter(r => !r.isValid).length} {t('bulkImport.invalid')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={previewRows.filter(r => r.isValid).every(r => r.selected)}
                      onCheckedChange={(checked) => toggleAllSelection(!!checked)}
                    />
                    <Label>{t('bulkImport.selectAll')}</Label>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <UITable>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead className="w-16">{t('bulkImport.status')}</TableHead>
                        {columnMappings.filter(m => m.targetField).slice(0, 5).map(m => (
                          <TableHead key={m.targetField}>{m.targetField}</TableHead>
                        ))}
                        <TableHead>{t('bulkImport.errors')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRows.slice(0, 50).map(row => (
                        <TableRow key={row.id} className={cn(!row.isValid && "bg-destructive/5")}>
                          <TableCell>
                            <Checkbox
                              checked={row.selected}
                              onCheckedChange={() => toggleRowSelection(row.id)}
                              disabled={!row.isValid}
                            />
                          </TableCell>
                          <TableCell>
                            {row.isValid ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                          </TableCell>
                          {columnMappings.filter(m => m.targetField).slice(0, 5).map(m => (
                            <TableCell key={m.targetField} className="max-w-32 truncate">
                              {String(row.data[m.targetField] || '')}
                            </TableCell>
                          ))}
                          <TableCell>
                            {row.errors.length > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="destructive" className="gap-1">
                                      <AlertCircle className="h-3 w-3" />
                                      {row.errors.length}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <ul className="text-xs space-y-1">
                                      {row.errors.map((err, i) => (
                                        <li key={i}>{err.field}: {err.error}</li>
                                      ))}
                                    </ul>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </UITable>
                </div>

                {previewRows.length > 50 && (
                  <p className="text-sm text-muted-foreground text-center">
                    {t('bulkImport.showingFirst', { shown: 50, total: previewRows.length })}
                  </p>
                )}
              </div>
            )}

            {/* Step 4: Importing */}
            {importStep === 'importing' && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg font-medium">{t('bulkImport.importing')}</p>
                <div className="w-64">
                  <Progress value={importProgress} />
                </div>
                <p className="text-sm text-muted-foreground">{importProgress}%</p>
              </div>
            )}

            {/* Step 5: Complete */}
            {importStep === 'complete' && (
              <div className="space-y-4 p-4">
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">{t('bulkImport.importComplete')}</h3>
                  <p className="text-muted-foreground mt-2">
                    {t('bulkImport.importSummary', { 
                      success: importResult.success, 
                      failed: importResult.failed 
                    })}
                  </p>
                </div>

                {importResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('bulkImport.someErrors')}</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-2 text-sm space-y-1">
                        {importResult.errors.slice(0, 5).map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                        {importResult.errors.length > 5 && (
                          <li>... {t('bulkImport.andMore', { count: importResult.errors.length - 5 })}</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="border-t pt-4">
            {importStep === 'upload' && (
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
            )}
            
            {importStep === 'mapping' && (
              <>
                <Button variant="outline" onClick={resetImport}>
                  {t('common.back')}
                </Button>
                <Button onClick={validateAndPreview}>
                  {t('bulkImport.continue')}
                </Button>
              </>
            )}
            
            {importStep === 'preview' && (
              <>
                <Button variant="outline" onClick={() => setImportStep('mapping')}>
                  {t('common.back')}
                </Button>
                <Button 
                  onClick={executeImport}
                  disabled={previewRows.filter(r => r.selected).length === 0}
                >
                  {t('bulkImport.importSelected', { 
                    count: previewRows.filter(r => r.selected).length 
                  })}
                </Button>
              </>
            )}
            
            {importStep === 'complete' && (
              <Button onClick={() => setImportDialogOpen(false)}>
                {t('common.close')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              {t('bulkExport.title')}
            </DialogTitle>
            <DialogDescription>
              {t('bulkExport.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('bulkExport.entityType')}</Label>
                <Select value={exportEntityType} onValueChange={(v) => handleExportEntityChange(v as EntityType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contacts">{t('bulkImport.entities.contacts')}</SelectItem>
                    <SelectItem value="items">{t('bulkImport.entities.items')}</SelectItem>
                    <SelectItem value="invoices">{t('bulkImport.entities.invoices')}</SelectItem>
                    <SelectItem value="transactions">{t('bulkImport.entities.transactions')}</SelectItem>
                    <SelectItem value="accounts">{t('bulkImport.entities.accounts')}</SelectItem>
                    <SelectItem value="journal_entries">{t('bulkImport.entities.journalEntries')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>{t('bulkExport.format')}</Label>
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as FileFormat)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        CSV
                      </div>
                    </SelectItem>
                    <SelectItem value="xlsx">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        Excel (XLSX)
                      </div>
                    </SelectItem>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <FileJson className="h-4 w-4" />
                        JSON
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{t('bulkExport.selectFields')}</Label>
              <div className="border rounded-lg p-4 mt-2 grid grid-cols-2 gap-2 max-h-48 overflow-auto">
                {exportFields.map(field => (
                  <div key={field.field} className="flex items-center gap-2">
                    <Checkbox
                      id={field.field}
                      checked={field.selected}
                      onCheckedChange={() => toggleExportField(field.field)}
                      disabled={field.required}
                    />
                    <Label htmlFor={field.field} className="cursor-pointer">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
                  {t('bulkExport.exporting')}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 me-2" />
                  {t('bulkExport.export')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BulkImportExport;
