import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface AIIngestDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title?: string;
  onExtract: (payload: any) => Promise<void> | void;
  allowPdf?: boolean;
  autoCloseOnExtract?: boolean;
  locale?: string;
}

export default function AIIngestDialog({ open, onOpenChange, title, onExtract, allowPdf = true, autoCloseOnExtract = false, locale }: AIIngestDialogProps) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [scanText, setScanText] = useState('');
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanPrompt, setScanPrompt] = useState('');
  const [pdfPages, setPdfPages] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [refineLLM, setRefineLLM] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const qc = useQueryClient();

  // AI providers
  const { data: aiProviders = [] } = useQuery<any[]>({ queryKey: ['/api/ai/providers'] });
  const selectedProvider = useMemo(() => aiProviders.find((p: any) => p.id === selectedProviderId), [aiProviders, selectedProviderId]);
  const providerKey = (selectedProvider?.provider || selectedProvider?.name || '').toString().toLowerCase();
  const { data: modelOptions = [], isLoading: modelsLoading } = useQuery<any[]>({
    queryKey: ['/api/ai/models', providerKey, selectedProviderId],
    enabled: !!providerKey,
    queryFn: async () => {
      const url = `/api/ai/models?provider=${encodeURIComponent(providerKey)}${selectedProviderId ? `&providerId=${encodeURIComponent(selectedProviderId)}` : ''}`;
      const res = await apiRequest('GET', url);
      return await res.json();
    }
  });

  // Persist provider/model between sessions
  useEffect(() => {
    try {
      const pid = localStorage.getItem('ai.providerId');
      const mdl = localStorage.getItem('ai.model');
      if (pid) setSelectedProviderId(pid);
      if (mdl) setSelectedModel(mdl);
    } catch {}
  }, []);
  useEffect(() => { try { if (selectedProviderId) localStorage.setItem('ai.providerId', selectedProviderId); } catch {} }, [selectedProviderId]);
  useEffect(() => { try { if (selectedModel) localStorage.setItem('ai.model', selectedModel); } catch {} }, [selectedModel]);

  const buildPayload = async (): Promise<any> => {
    if (!scanText.trim() && !scanFile) {
      throw new Error(t('ai.provideTextOrImage', { defaultValue: 'Please paste text or upload an image.' }));
    }
    const payload: any = {};
    if (scanText.trim()) payload.text = scanText.trim();
    if (scanFile) {
      if (scanFile.size > 10 * 1024 * 1024) {
        throw new Error(t('ai.fileTooLarge', { defaultValue: 'File is too large (>10MB).' }));
      }
      const b64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const idx = result.indexOf(',');
          resolve(idx >= 0 ? result.slice(idx + 1) : result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(scanFile);
      });
      payload.image_base64 = b64;
      payload.mime_type = scanFile.type || 'image/png';
      if (allowPdf && /pdf/i.test(scanFile.type || '')) {
        if (pdfPages.trim()) payload.page_range = pdfPages.trim();
      }
    }
    if (selectedProviderId) payload.provider_id = selectedProviderId;
    if (selectedProvider?.provider) payload.provider = selectedProvider.provider;
    if (selectedModel) payload.model = selectedModel;
    if (scanPrompt.trim()) payload.prompt = scanPrompt.trim();
    payload.locale = locale || i18n?.language || 'en';
    if (refineLLM) payload.refine_llm = true;
    return payload;
  };

  const handleExtract = async () => {
    try {
      setScanLoading(true);
      const payload = await buildPayload();
      await onExtract(payload);
      if (autoCloseOnExtract) onOpenChange(false);
    } catch (err) {
      console.error(err);
      // Optionally could surface toasts here; defer to parent for now
    } finally {
      setScanLoading(false);
    }
  };

  const clearAll = () => {
    setScanText('');
    setScanFile(null);
    setPdfPages('');
    // Clear simulation cache so it recomputes cleanly
    qc.invalidateQueries({ queryKey: ['ai.pipeline.sim'] }).catch(() => {});
  };

  // Pipeline simulation: preview planned mode/steps based on current inputs
  const wantsVision = true; // future: toggle in UI if needed
  const simKey = useMemo(() => {
    const mt = scanFile?.type || (scanFile ? 'application/octet-stream' : undefined);
    return ['ai.pipeline.sim', mt, !!scanFile, pdfPages, selectedProviderId, selectedModel, locale || i18n?.language || 'en'];
  }, [scanFile, pdfPages, selectedProviderId, selectedModel, locale, i18n?.language]);
  const { data: sim, isLoading: simLoading } = useQuery({
    queryKey: simKey,
    enabled: open && (!!scanFile || !!scanText),
    queryFn: async () => {
      const body: any = {
        mime_type: scanFile?.type || undefined,
        size_bytes: scanFile?.size || undefined,
        pages_count: undefined, // unknown until parsed; backend handles heuristics
        image_provided: !!scanFile,
        wants_vision: wantsVision,
        locale: locale || i18n?.language || 'en'
      };
      const res = await apiRequest('POST', '/api/ai/providers/pipeline-simulate', body);
      return await res.json();
    }
  });
  const plan = sim?.plan as any | undefined;
  // Consent (backend + local fallback)
  const [consent, setConsent] = useState<boolean>(() => {
    try { return localStorage.getItem('ai.consent') === 'true'; } catch { return false; }
  });
  const [consentLoading, setConsentLoading] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        setConsentLoading(true);
        const r = await fetch('/api/ai/consent', { credentials: 'include' });
        if (r.ok) {
          const data = await r.json();
            if (data?.accepted) {
              setConsent(true);
              try { localStorage.setItem('ai.consent', 'true'); } catch {}
            }
        }
      } catch (e) {
        // silent
      } finally {
        setConsentLoading(false);
      }
    })();
  }, []);
  useEffect(() => { try { localStorage.setItem('ai.consent', consent ? 'true' : 'false'); } catch {} }, [consent]);

  const persistConsent = async () => {
    try {
      const r = await fetch('/api/ai/consent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({}) });
      if (r.ok) {
        setConsent(true);
        return;
      }
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title || t('ai.pasteInvoiceText', { defaultValue: 'Paste invoice text' })}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor="scan-text">{t('ai.invoiceText', { defaultValue: 'Invoice text' })}</Label>
          <Textarea id="scan-text" value={scanText} onChange={(e) => setScanText(e.target.value)} rows={8} placeholder={t('ai.pasteHere', { defaultValue: 'Paste recognized text here...' })} />
          {!import.meta.env.PROD && (
            <div>
              <Button type="button" variant="outline" size="sm" onClick={() => setScanText(`ACME Corp\nInvoice No: INV-2024-015\nDate: 2024-10-05\nDue Date: 2024-11-04\nSubtotal: $950.00\nVAT: $50.00\nTotal: $1,000.00`)}>
                {t('ai.trySample', { defaultValue: 'Try sample' })}
              </Button>
            </div>
          )}
          {/* Provider/Model (optional) */}
          {aiProviders.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label>{t('ai.provider', { defaultValue: 'AI Provider (optional)' })}</Label>
                <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('ai.selectProvider', { defaultValue: 'Select provider' })} />
                  </SelectTrigger>
                  <SelectContent>
                    {aiProviders.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {(p.name || p.provider || 'Provider')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('ai.model', { defaultValue: 'Model (optional)' })}</Label>
                {modelOptions.length > 0 ? (
                  <Select value={selectedModel} onValueChange={setSelectedModel} disabled={modelsLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('ai.selectModel', { defaultValue: 'Select model' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions.map((m: any) => {
                        const id = m?.id || m?.name || String(m);
                        return <SelectItem key={id} value={id}>{id}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input placeholder={t('ai.enterModel', { defaultValue: 'Enter model (optional)' })} value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} />
                )}
              </div>
              {/* Planned pipeline hint */}
              {(!!scanFile || !!scanText) && (
                <div className="rounded-md border p-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>
                      {t('ai.plannedMode', { defaultValue: 'Planned mode' })}: {simLoading ? t('common.loading') : (plan?.mode || t('common.unknown', { defaultValue: 'Unknown' }))}
                    </span>
                    {plan?.steps?.length ? (
                      <span className="inline-flex items-center gap-1">
                        {t('ai.steps', { defaultValue: 'Steps' })}:
                        {plan.steps.map((s: string, i: number) => (
                          <span key={s + i} className="px-1 py-0.5 rounded bg-muted text-[10px]">{s}</span>
                        ))}
                      </span>
                    ) : null}
                  </div>
                  {plan?.provider?.provider && (
                    <div className="mt-1">
                      {t('ai.providerShort', { defaultValue: 'Provider' })}: {String(plan.provider.provider)}{plan?.model ? ` • ${String(plan.model)}` : ''}
                    </div>
                  )}
                  {Array.isArray(plan?.warnings) && plan.warnings.length > 0 && (
                    <ul className="mt-1 list-disc ps-4">
                      {plan.warnings.map((w: string, i: number) => (
                        <li key={i} className="text-amber-700 dark:text-amber-400">{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col gap-3">
            <div
              className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer ${dragOver ? 'bg-muted' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer?.files?.[0];
                if (f) setScanFile(f);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {!scanFile ? (
                <p className="text-sm text-muted-foreground">{t('ai.dragDrop',{defaultValue:'Drag & drop an image or PDF here, or click to select'})}</p>
              ) : (
                <p className="text-sm">{t('ai.selectedFile',{defaultValue:'Selected'})}: {scanFile.name} ({Math.round(scanFile.size/1024)} KB)</p>
              )}
            </div>
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept={isMobile ? "image/*" : allowPdf ? "image/*,application/pdf,.pdf" : "image/*"}
              {...(isMobile ? { capture: 'environment' as any } : {})}
              onChange={(e) => setScanFile(e.target.files?.[0] || null)}
            />
            {allowPdf && scanFile && /pdf/i.test(scanFile.type || '') && (
              <div className="grid grid-cols-1 gap-2">
                <Label>{t('ai.pages', { defaultValue: 'Pages (optional)' })}</Label>
                <Input value={pdfPages} onChange={(e) => setPdfPages(e.target.value)} placeholder={t('ai.pagesPlaceholder', { defaultValue: 'e.g., 1-2,4' })} />
                <p className="text-xs text-muted-foreground">{t('ai.pagesHelp', { defaultValue: 'Specify pages to parse (1-indexed). Ranges and commas supported.' })}</p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdvanced(s => !s)}>
              {showAdvanced ? t('common.hide', { defaultValue: 'Hide' }) : t('common.advanced', { defaultValue: 'Advanced' })}
            </Button>
            {showAdvanced && (
              <div className="space-y-2">
                <Label>{t('ai.customPrompt', { defaultValue: 'Custom prompt (optional)' })}</Label>
                <Textarea rows={3} value={scanPrompt} onChange={(e) => setScanPrompt(e.target.value)} placeholder={t('ai.promptPlaceholder', { defaultValue: 'Guide the extraction with extra instructions' })} />
                <div className="flex items-center gap-2">
                  <input id="refine-llm" type="checkbox" className="h-4 w-4" checked={refineLLM} onChange={(e) => setRefineLLM(e.target.checked)} />
                  <Label htmlFor="refine-llm" className="text-sm">
                    {t('ai.refineWithLLM', { defaultValue: 'Use LLM refinement for text/PDF' })}
                  </Label>
                </div>
              </div>
            )}
          </div>
          {!consent && (
            <div className="rounded-md border p-3 space-y-2 bg-amber-50 dark:bg-amber-950/30">
              <p className="text-xs leading-relaxed">
                {t('ai.consentNotice',{ defaultValue: 'By enabling AI extraction you agree to send the provided text/image to the selected provider for processing. Redaction is applied to sensitive tokens before LLM refinement. Enable consent to proceed.' })}
              </p>
              <div className="flex items-center gap-2">
                <input id="ai-consent" type="checkbox" className="h-4 w-4" checked={consent} disabled={consentLoading} onChange={async (e)=>{ const v = e.target.checked; setConsent(v); if (v) await persistConsent(); }} />
                <Label htmlFor="ai-consent" className="text-xs font-medium">
                  {t('ai.consentAgree',{ defaultValue: 'I understand and consent to AI processing.' })}
                </Label>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 justify-end mt-2">
            <Button type="button" variant="secondary" onClick={clearAll}>{t('common.clear',{defaultValue:'Clear'})}</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleExtract} disabled={scanLoading || !consent}>{scanLoading ? t('common.loading') : t('ai.extractFields', { defaultValue: 'Extract fields' })}</Button>
          </div>
          <p className="text-xs text-muted-foreground">{t('ai.scanDisclaimer', { defaultValue: 'Paste text, or upload an image or PDF for AI extraction.' })}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
