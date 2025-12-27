import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { computeCompleteness, toPreviewRows, type ExtractionKind, type AnyExtraction } from '@shared/aiSchemas';

type BestMatch = {
  label: string;
  name: string;
  actionLabel: string;
  onUse: () => void;
};

export interface ExtractionPreviewProps {
  extraction: AnyExtraction;
  kind: ExtractionKind;
  requiredFields?: string[];
  // Map extraction field -> current form field name to compare differences
  fieldMap?: Record<string, string>;
  currentValues?: Record<string, any>;
  // Optional apply toggles (rendered as a compact list)
  applyToggles?: Record<string, boolean>;
  onToggle?: (key: string, value: boolean) => void;
  toggleLabels?: Record<string, string>;
  // Suggested entity (e.g., supplier or customer)
  bestMatch?: BestMatch | null;
}

export const ExtractionPreview: React.FC<ExtractionPreviewProps> = ({
  extraction,
  kind,
  requiredFields = ['invoice_number','date','due_date','total'],
  fieldMap,
  currentValues,
  applyToggles,
  onToggle,
  toggleLabels,
  bestMatch,
}) => {
  const { t } = useTranslation();
  const rows = toPreviewRows(extraction, kind);
  const { count, total, percent } = computeCompleteness(extraction as any, requiredFields);

  const isLong = (v: any) => typeof v === 'string' && v.length > 80;
  const toKey = (k: string) => (fieldMap?.[k] || k);
  const differs = (k: string, v: any) => {
    const formKey = toKey(k);
    const cur = currentValues?.[formKey];
    if (cur === undefined || cur === null || cur === '') return false;
    return String(cur) !== String(v ?? '');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-xs">{t('ai.complete', { count, total, percent })}</Badge>
        {extraction?.meta?.mode && (
          <span className="text-xs text-muted-foreground">{t('ai.source', { mode: extraction.meta.mode })}</span>
        )}
      </div>

      {bestMatch && (
        <div className="rounded-md border p-3 flex items-center justify-between gap-3 bg-muted/50">
          <div className="text-sm">
            <div className="font-medium">{bestMatch.label}</div>
            <div className="text-muted-foreground">{bestMatch.name}</div>
          </div>
          <Button size="sm" variant="secondary" onClick={bestMatch.onUse}>{bestMatch.actionLabel}</Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {rows.map(r => (
          <div key={r.key} className="space-y-1">
            <div className="flex items-center justify-between">
              <Label>{r.label}</Label>
              {typeof r.confidence === 'number' && (
                <Badge variant="outline" className="text-[10px]">{Math.round(r.confidence * 100)}%</Badge>
              )}
            </div>
            {isLong(r.value) ? (
              <Textarea readOnly rows={3} value={String(r.value)} className={differs(r.key, r.value) ? 'bg-emerald-50 border-emerald-300' : ''} />
            ) : (
              <Input readOnly value={String(r.value ?? '')} className={differs(r.key, r.value) ? 'bg-emerald-50 border-emerald-300' : ''} />
            )}
            {differs(r.key, r.value) && (
              <p className="text-xs text-muted-foreground">{t('ai.current', { value: String(currentValues?.[toKey(r.key)] ?? '') })}</p>
            )}
          </div>
        ))}
      </div>

      {/* Phase 6: Line Items Display */}
      {extraction && 'line_items' in extraction && Array.isArray((extraction as any).line_items) && (extraction as any).line_items.length > 0 && (
        <div className="space-y-2 pt-2">
          <Label>{t('ai.lineItems', 'Line Items')}</Label>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-2 text-left font-medium text-muted-foreground">{t('common.description', 'Description')}</th>
                  <th className="p-2 text-right font-medium text-muted-foreground w-16">{t('common.qty', 'Qty')}</th>
                  <th className="p-2 text-right font-medium text-muted-foreground w-24">{t('common.price', 'Price')}</th>
                  <th className="p-2 text-right font-medium text-muted-foreground w-24">{t('common.total', 'Total')}</th>
                </tr>
              </thead>
              <tbody>
                {(extraction as any).line_items.map((item: any, idx: number) => (
                  <tr key={idx} className="border-t last:border-0">
                    <td className="p-2">{item.description || '-'}</td>
                    <td className="p-2 text-right">{item.quantity || 1}</td>
                    <td className="p-2 text-right">{item.unit_price || '-'}</td>
                    <td className="p-2 text-right">{item.total || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {applyToggles && onToggle && (
        <div className="rounded-md border p-2">
          <div className="text-xs font-medium mb-2">{t('ai.applyToForm')}</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(applyToggles).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <Checkbox id={`apply-${k}`} checked={!!v} onCheckedChange={(val: any) => onToggle(k, !!val)} />
                <Label htmlFor={`apply-${k}`} className="text-xs text-muted-foreground">
                  {toggleLabels?.[k] || k}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray((extraction as any)?.meta?.warnings) && (extraction as any).meta.warnings.length > 0 && (
        <div className="rounded-md border p-2 text-xs text-amber-700 bg-amber-50">
          {(extraction as any).meta.warnings.join(' • ')}
        </div>
      )}
    </div>
  );
};

export default ExtractionPreview;
