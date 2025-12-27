/**
 * Export Dialog Component
 * Professional multi-format export with options
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  FileSpreadsheet, 
  FileText, 
  File, 
  Download,
  Settings2
} from 'lucide-react';
import { exportData, type ExportFormat, type ExportColumn, type ExportOptions } from '@/utils/dataExport';
import { useCompanyCurrency } from '@/hooks/use-company-currency';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Record<string, any>[];
  columns: ExportColumn[];
  defaultFilename?: string;
  title?: string;
}

const formatOptions = [
  { value: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet, description: 'Best for data analysis' },
  { value: 'pdf', label: 'PDF', icon: FileText, description: 'Best for printing' },
  { value: 'csv', label: 'CSV', icon: File, description: 'Universal format' },
] as const;

export function ExportDialog({ 
  open, 
  onOpenChange, 
  data, 
  columns,
  defaultFilename = 'export',
  title
}: ExportDialogProps) {
  const { t, i18n } = useTranslation();
  const currency = useCompanyCurrency();
  
  const [format, setFormat] = useState<ExportFormat>('excel');
  const [filename, setFilename] = useState(defaultFilename);
  const [includeTitle, setIncludeTitle] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const options: ExportOptions = {
        filename,
        title: includeTitle ? title : undefined,
        currency,
        language: i18n.language,
        orientation: columns.length > 6 ? 'landscape' : 'portrait',
      };

      exportData(format, data, columns, options);
      
      onOpenChange(false);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t('export.title', 'Export Data')}
          </DialogTitle>
          <DialogDescription>
            {t('export.description', 'Choose export format and options')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>{t('export.format', 'Format')}</Label>
            <RadioGroup 
              value={format} 
              onValueChange={(v) => setFormat(v as ExportFormat)}
              className="space-y-2"
            >
              {formatOptions.map((opt) => (
                <div 
                  key={opt.value}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    format === opt.value ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setFormat(opt.value)}
                >
                  <RadioGroupItem value={opt.value} id={opt.value} />
                  <opt.icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Label htmlFor={opt.value} className="font-medium cursor-pointer">
                      {opt.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{t(`export.${opt.value}Desc`, opt.description)}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Filename */}
          <div className="space-y-2">
            <Label htmlFor="filename">{t('export.filename', 'Filename')}</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder={t('export.filenamePlaceholder', 'Enter filename')}
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              {t('export.options', 'Options')}
            </Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeTitle"
                checked={includeTitle}
                onCheckedChange={(checked) => setIncludeTitle(checked as boolean)}
              />
              <Label htmlFor="includeTitle" className="text-sm font-normal cursor-pointer">
                {t('export.includeTitle', 'Include report title')}
              </Label>
            </div>
          </div>

          {/* Summary */}
          <div className="p-3 rounded-lg bg-muted text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('export.rows', 'Rows')}</span>
              <span className="font-medium">{data.length}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">{t('export.columns', 'Columns')}</span>
              <span className="font-medium">{columns.length}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleExport} disabled={isExporting || !filename.trim()}>
            {isExporting ? (
              <>
                <span className="animate-spin me-2">⏳</span>
                {t('export.exporting', 'Exporting...')}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 me-2" />
                {t('export.export', 'Export')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
