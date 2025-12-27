import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { format } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { exportToCsv, exportToPdf, exportToXlsx } from '@/utils/export';
import PageContainer from '@/components/layout/PageContainer';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SummaryCategory = {
  category: string;
  total: number;
  accepted: number;
  acceptanceRate: number;
};

type SummaryResponse = {
  total: number;
  categories: SummaryCategory[];
};

type ModeRow = {
  mode: string | null;
  count: number;
  total_cost_usd: number;
  total_tokens_in: number;
};

export default function AIAnalyticsPage() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [provider, setProvider] = useState<string>('');
  const [mode, setMode] = useState<string>('');

  // Initialize filters from URL query (deep-linking)
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const qFrom = sp.get('from') || '';
      const qTo = sp.get('to') || '';
      const qSource = sp.get('source') || '';
      const qProvider = sp.get('provider') || '';
      const qMode = sp.get('mode') || '';
      if (qFrom) setFrom(qFrom);
      if (qTo) setTo(qTo);
      if (qSource) setSource(qSource);
      if (qProvider) setProvider(qProvider);
      if (qMode) setMode(qMode);
    } catch {}
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const querySuffix = useMemo(() => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (source) params.set('source', source);
    if (provider) params.set('provider', provider);
    if (mode) params.set('mode', mode);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [from, to, source, provider, mode]);

  // Keep URL updated when filters change (without page reload)
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.search = querySuffix;
      window.history.replaceState({}, '', url.toString());
    } catch {}
  }, [querySuffix]);

  const { data: summary } = useQuery<SummaryResponse>({
    queryKey: ['/api/ai/feedback/summary' + querySuffix],
  });

  const { data: recent } = useQuery<any[]>({
    queryKey: ['/api/ai/feedback/recent' + querySuffix],
  });

  const { data: trend } = useQuery<any[]>({
    queryKey: ['/api/ai/feedback/trend' + querySuffix],
  });

  // Pipeline daily trend (counts, cost) for overlay/export
  const { data: pipeTrend } = useQuery<any[]>({
    queryKey: ['/api/ai/metrics/pipeline-trend' + querySuffix],
  });

  // Pipeline mode summary (not filtered by from/to for now; could extend backend later)
  const { data: pipeline } = useQuery<{ modes: ModeRow[] }>({
    queryKey: ['/api/ai/metrics/pipeline-summary' + querySuffix],
  });
  const facetsQuerySuffix = useMemo(() => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (source) params.set('source', source);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [from, to, source]);
  const { data: facets, isLoading: facetsLoading } = useQuery<{ providers: string[]; modes: string[] }>({
    queryKey: ['/api/ai/metrics/facets' + facetsQuerySuffix],
  });

  // Hover state for trend tooltip
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const onMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!trend || trend.length === 0) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    // Points are at x = 10 + i*10
    const i = Math.round((relX - 10) / 10);
    const clamped = Math.max(0, Math.min(trend.length - 1, i));
    setHoverIdx(clamped);
  }, [trend]);
  const onLeave = useCallback(() => setHoverIdx(null), []);

  const overallAcceptance = (() => {
    if (!summary || summary.total === 0) return 0;
    const accepted = summary.categories.reduce((acc, c) => acc + c.accepted, 0);
    return accepted / summary.total;
  })();

  // Toggles for chart series visibility
  const [showFeedbackTotal, setShowFeedbackTotal] = useState(true);
  const [showPipeline, setShowPipeline] = useState(true);
  const [showAcceptance, setShowAcceptance] = useState(true);

  const pipelineModes = pipeline?.modes || [];
  const exportPipelineCsv = () => {
    if (!pipelineModes.length) return;
    const headers = [t('reports.aiAnalytics.mode'), t('reports.aiAnalytics.count'), t('reports.aiAnalytics.tokensIn'), t('reports.aiAnalytics.totalCost'), t('reports.aiAnalytics.avgCost')];
    const rows = pipelineModes.map(m => {
      const avg = m.count > 0 ? m.total_cost_usd / m.count : 0;
      return [m.mode || 'unknown', m.count, Math.round(m.total_tokens_in || 0), m.total_cost_usd.toFixed(4), avg.toFixed(4)];
    });
    const suffix = [
      from && `from-${from}`,
      to && `to-${to}`,
      source && `src-${source}`,
      provider && `prov-${provider}`,
      mode && `mode-${mode}`
    ].filter(Boolean).join('_');
    exportToCsv(`ai_pipeline_modes${suffix ? '_' + suffix : ''}.csv`, headers, rows);
  };

  const exportPipelineTrendCsv = () => {
    const rows = (pipeTrend || []).map((d: any) => [
      d.day,
      Number(d.extractions) || 0,
      typeof d.total_cost_usd !== 'undefined' ? Number(d.total_cost_usd).toFixed(4) : '0.0000',
      typeof d.avg_cost_usd !== 'undefined' ? Number(d.avg_cost_usd).toFixed(4) : '0.0000',
      Math.round(Number(d.total_tokens_in) || 0),
    ]);
    const headers = [t('common.date'), t('reports.aiAnalytics.pipelineTotalExtractions'), t('reports.aiAnalytics.totalCost'), t('reports.aiAnalytics.avgCost'), t('reports.aiAnalytics.tokensIn')];
    const suffix = [
      from && `from-${from}`,
      to && `to-${to}`,
      source && `src-${source}`,
      provider && `prov-${provider}`,
      mode && `mode-${mode}`
    ].filter(Boolean).join('_');
    exportToCsv(`ai_pipeline_trend${suffix ? '_' + suffix : ''}.csv`, headers, rows);
  };

  const exportPipelineTrendXlsx = async () => {
    const rows = (pipeTrend || []).map((d: any) => [
      d.day,
      Number(d.extractions) || 0,
      typeof d.total_cost_usd !== 'undefined' ? Number(d.total_cost_usd).toFixed(4) : '0.0000',
      typeof d.avg_cost_usd !== 'undefined' ? Number(d.avg_cost_usd).toFixed(4) : '0.0000',
      Math.round(Number(d.total_tokens_in) || 0),
    ]);
    const headers = [t('common.date'), t('reports.aiAnalytics.pipelineTotalExtractions'), t('reports.aiAnalytics.totalCost'), t('reports.aiAnalytics.avgCost'), t('reports.aiAnalytics.tokensIn')];
    const suffix = [
      from && `from-${from}`,
      to && `to-${to}`,
      source && `src-${source}`,
      provider && `prov-${provider}`,
      mode && `mode-${mode}`
    ].filter(Boolean).join('_');
    await exportToXlsx(`ai_pipeline_trend${suffix ? '_' + suffix : ''}.xlsx`, headers, rows, 'Pipeline Trend');
  };

  const exportPipelineTrendPdf = async () => {
    const rows = (pipeTrend || []).map((d: any) => [
      d.day,
      Number(d.extractions) || 0,
      typeof d.total_cost_usd !== 'undefined' ? Number(d.total_cost_usd).toFixed(4) : '0.0000',
      typeof d.avg_cost_usd !== 'undefined' ? Number(d.avg_cost_usd).toFixed(4) : '0.0000',
      Math.round(Number(d.total_tokens_in) || 0),
    ]);
    const headers = [t('common.date'), t('reports.aiAnalytics.pipelineTotalExtractions'), t('reports.aiAnalytics.totalCost'), t('reports.aiAnalytics.avgCost'), t('reports.aiAnalytics.tokensIn')];
    const suffix = [
      from && `from-${from}`,
      to && `to-${to}`,
      source && `src-${source}`,
      provider && `prov-${provider}`,
      mode && `mode-${mode}`
    ].filter(Boolean).join('_');
    await exportToPdf(`ai_pipeline_trend${suffix ? '_' + suffix : ''}.pdf`, headers, rows, {
      title: 'Pipeline Trend',
      subtitle: from || to ? `Range: ${from || '…'} → ${to || '…'}` : undefined,
    });
  };

  const exportPipelineXlsx = async () => {
    if (!pipelineModes.length) return;
    const headers = [t('reports.aiAnalytics.mode'), t('reports.aiAnalytics.count'), t('reports.aiAnalytics.tokensIn'), t('reports.aiAnalytics.totalCost'), t('reports.aiAnalytics.avgCost')];
    const rows = pipelineModes.map(m => {
      const avg = m.count > 0 ? m.total_cost_usd / m.count : 0;
      return [m.mode || 'unknown', m.count, Math.round(m.total_tokens_in || 0), Number(m.total_cost_usd).toFixed(4), avg.toFixed(4)];
    });
    const suffix = [
      from && `from-${from}`,
      to && `to-${to}`,
      source && `src-${source}`,
      provider && `prov-${provider}`,
      mode && `mode-${mode}`
    ].filter(Boolean).join('_');
    await exportToXlsx(`ai_pipeline_modes${suffix ? '_' + suffix : ''}.xlsx`, headers, rows, 'Pipeline Modes');
  };

  const exportPipelinePdf = async () => {
    if (!pipelineModes.length) return;
    const headers = [t('reports.aiAnalytics.mode'), t('reports.aiAnalytics.count'), t('reports.aiAnalytics.tokensIn'), t('reports.aiAnalytics.totalCost'), t('reports.aiAnalytics.avgCost')];
    const rows = pipelineModes.map(m => {
      const avg = m.count > 0 ? m.total_cost_usd / m.count : 0;
      return [m.mode || 'unknown', m.count, Math.round(m.total_tokens_in || 0), Number(m.total_cost_usd).toFixed(4), avg.toFixed(4)];
    });
    const suffix = [
      from && `from-${from}`,
      to && `to-${to}`,
      source && `src-${source}`,
      provider && `prov-${provider}`,
      mode && `mode-${mode}`
    ].filter(Boolean).join('_');
    await exportToPdf(`ai_pipeline_modes${suffix ? '_' + suffix : ''}.pdf`, headers, rows, {
      title: 'Pipeline Mode Breakdown',
      subtitle: from || to ? `Range: ${from || '…'} → ${to || '…'}` : undefined,
    });
  };

  return (
    <PageContainer className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title text-3xl font-bold text-foreground">
            {t('reports.aiAnalytics.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('reports.aiAnalytics.description')}
          </p>
        </div>
        <div className={`page-actions ${isMobile ? 'grid grid-cols-1 gap-2 w-full' : 'flex flex-wrap gap-2 items-end'}`}>
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground">{t('common.from')}</label>
            <input 
              type="date" 
              value={from} 
              onChange={(e) => setFrom(e.target.value)} 
              className={`border rounded px-2 py-1 text-sm bg-background text-foreground ${isMobile ? 'w-full' : ''}`} 
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground">{t('common.to')}</label>
            <input 
              type="date" 
              value={to} 
              onChange={(e) => setTo(e.target.value)} 
              className={`border rounded px-2 py-1 text-sm bg-background text-foreground ${isMobile ? 'w-full' : ''}`} 
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground">{t('common.source')}</label>
            <select 
              value={source} 
              onChange={(e) => setSource(e.target.value)} 
              className={`border rounded px-2 py-1 text-sm bg-background text-foreground ${isMobile ? 'w-full' : 'min-w-[160px]'}`}
            >
              <option value="">{t('common.all')}</option>
              <option value="bank-statement">bank-statement</option>
              <option value="reconciliation">reconciliation</option>
              <option value="expenses-form">expenses-form</option>
              <option value="payments-form">payments-form</option>
              <option value="receipts-form">receipts-form</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground">{t('reports.aiAnalytics.provider')}</label>
            <select 
              value={provider} 
              onChange={(e) => setProvider(e.target.value)} 
              className={`border rounded px-2 py-1 text-sm bg-background text-foreground ${isMobile ? 'w-full' : 'min-w-[140px]'}`}
            >
              <option value="">{facetsLoading ? t('common.loading') : t('common.all')}</option>
              {(facets?.providers || []).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground">{t('reports.aiAnalytics.mode')}</label>
            <select 
              value={mode} 
              onChange={(e) => setMode(e.target.value)} 
              className={`border rounded px-2 py-1 text-sm bg-background text-foreground ${isMobile ? 'w-full' : 'min-w-[120px]'}`}
            >
              <option value="">{facetsLoading ? t('common.loading') : t('common.all')}</option>
              {(facets?.modes || []).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <Button
            variant="outline"
            className={isMobile ? 'w-full' : undefined}
            onClick={() => {
              setFrom('');
              setTo('');
              setSource('');
              setProvider('');
              setMode('');
            }}
          >
            {t('common.clear')}
          </Button>
          <Button
            variant="outline"
            className={isMobile ? 'w-full' : undefined}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
              } catch (e) {
                // no-op if clipboard not available
              }
            }}
          >
            {t('common.copyLink')}
          </Button>
          <Button
            variant="outline"
            className={isMobile ? 'w-full' : undefined}
            onClick={async () => {
              const headers = [t('common.date'), t('common.source'), t('reports.aiAnalytics.category'), t('reports.aiAnalytics.accepted'), t('reports.aiAnalytics.confidence'), t('common.amount'), t('reports.aiAnalytics.notes')];
              const rows = (recent || []).map((r: any) => [
                r.created_at ? format(new Date(r.created_at), 'yyyy-MM-dd HH:mm') : '',
                r.source || '',
                r.category || '',
                r.accepted ? 'Yes' : 'No',
                typeof r.confidence !== 'undefined' ? Math.round(Number(r.confidence) * 100) + '%' : '',
                typeof r.amount !== 'undefined' ? Number(r.amount).toFixed(2) : '',
                r.notes || ''
              ]);
              const suffix = [
                from && `from-${from}`,
                to && `to-${to}`,
                source && `src-${source}`,
                provider && `prov-${provider}`,
                mode && `mode-${mode}`
              ].filter(Boolean).join('_');
              exportToCsv(`ai_feedback${suffix ? '_' + suffix : ''}.csv`, headers, rows);
            }}
          >
            {t('common.exportCsv')}
          </Button>
          <Button
            variant="outline"
            className={isMobile ? 'w-full' : undefined}
            onClick={async () => {
              const headers = [t('common.date'), t('common.source'), t('reports.aiAnalytics.category'), t('reports.aiAnalytics.accepted'), t('reports.aiAnalytics.confidence'), t('common.amount'), t('reports.aiAnalytics.notes')];
              const rows = (recent || []).map((r: any) => [
                r.created_at ? format(new Date(r.created_at), 'yyyy-MM-dd HH:mm') : '',
                r.source || '',
                r.category || '',
                r.accepted ? 'Yes' : 'No',
                typeof r.confidence !== 'undefined' ? Math.round(Number(r.confidence) * 100) + '%' : '',
                typeof r.amount !== 'undefined' ? Number(r.amount).toFixed(2) : '',
                r.notes || ''
              ]);
              const suffix = [
                from && `from-${from}`,
                to && `to-${to}`,
                source && `src-${source}`,
                provider && `prov-${provider}`,
                mode && `mode-${mode}`
              ].filter(Boolean).join('_');
              await exportToXlsx(`ai_feedback${suffix ? '_' + suffix : ''}.xlsx`, headers, rows, 'AI Feedback');
            }}
          >
            {t('common.exportXlsx')}
          </Button>
          <Button
            variant="outline"
            className={isMobile ? 'w-full' : undefined}
            onClick={async () => {
              const headers = [t('common.date'), t('common.source'), t('reports.aiAnalytics.category'), t('reports.aiAnalytics.accepted'), t('reports.aiAnalytics.confidence'), t('common.amount'), t('reports.aiAnalytics.notes')];
              const rows = (recent || []).map((r: any) => [
                r.created_at ? format(new Date(r.created_at), 'yyyy-MM-dd HH:mm') : '',
                r.source || '',
                r.category || '',
                r.accepted ? 'Yes' : 'No',
                typeof r.confidence !== 'undefined' ? Math.round(Number(r.confidence) * 100) + '%' : '',
                typeof r.amount !== 'undefined' ? Number(r.amount).toFixed(2) : '',
                r.notes || ''
              ]);
              const suffix = [
                from && `from-${from}`,
                to && `to-${to}`,
                source && `src-${source}`,
                provider && `prov-${provider}`,
                mode && `mode-${mode}`
              ].filter(Boolean).join('_');
              await exportToPdf(`ai_feedback${suffix ? '_' + suffix : ''}.pdf`, headers, rows, {
                title: 'AI Feedback',
                subtitle: from || to ? `Range: ${from || '…'} → ${to || '…'}` : undefined,
              });
            }}
          >
            {t('common.exportPdf')}
          </Button>
          <Button
            variant="outline"
            className={isMobile ? 'w-full' : undefined}
            disabled={!trend || trend.length === 0}
            onClick={() => {
              const headers = [t('common.date'), t('reports.aiAnalytics.total'), t('reports.aiAnalytics.accepted'), t('reports.aiAnalytics.acceptanceRate')];
              const rows = (trend || []).map((d: any) => {
                const tot = Number(d.total) || 0;
                const acc = Number(d.accepted) || 0;
                const rate = tot > 0 ? Math.round((acc / tot) * 100) : 0;
                return [d.day, tot, acc, `${rate}%`];
              });
              const suffix = [
                from && `from-${from}`,
                to && `to-${to}`,
                source && `src-${source}`,
                provider && `prov-${provider}`,
                mode && `mode-${mode}`
              ].filter(Boolean).join('_');
              exportToCsv(`ai_trend${suffix ? '_' + suffix : ''}.csv`, headers, rows);
            }}
          >
            {t('reports.aiAnalytics.exportTrendCsv')}
          </Button>
          <Button
            variant="outline"
            className={isMobile ? 'w-full' : undefined}
            disabled={!summary || !summary.categories || summary.categories.length === 0}
            onClick={() => {
              const headers = [t('reports.aiAnalytics.category'), t('reports.aiAnalytics.total'), t('reports.aiAnalytics.accepted'), t('reports.aiAnalytics.acceptanceRate')];
              const rows = (summary?.categories || []).map((c) => [
                c.category,
                c.total,
                c.accepted,
                `${Math.round(c.acceptanceRate * 100)}%`
              ]);
              const suffix = [
                from && `from-${from}`,
                to && `to-${to}`,
                source && `src-${source}`,
                provider && `prov-${provider}`,
                mode && `mode-${mode}`
              ].filter(Boolean).join('_');
              exportToCsv(`ai_summary${suffix ? '_' + suffix : ''}.csv`, headers, rows);
            }}
          >
            {t('reports.aiAnalytics.exportSummaryCsv')}
          </Button>
          <Button
            variant="outline"
            className={isMobile ? 'w-full' : undefined}
            disabled={!pipelineModes.length}
            onClick={exportPipelineCsv}
          >
            {t('reports.aiAnalytics.exportPipelineModesCsv')}
          </Button>
          <Button
            variant="outline"
            className={isMobile ? 'w-full' : undefined}
            disabled={!pipeTrend || pipeTrend.length === 0}
            onClick={exportPipelineTrendCsv}
          >
            {t('reports.aiAnalytics.exportPipelineTrendCsv')}
          </Button>
          <Button
            variant="outline"
            className={isMobile ? 'w-full' : undefined}
            disabled={!pipeTrend || pipeTrend.length === 0}
            onClick={exportPipelineTrendXlsx}
          >
            {t('reports.aiAnalytics.exportPipelineTrendXlsx')}
          </Button>
          <Button
            variant="outline"
            className={isMobile ? 'w-full' : undefined}
            disabled={!pipeTrend || pipeTrend.length === 0}
            onClick={exportPipelineTrendPdf}
          >
            {t('reports.aiAnalytics.exportPipelineTrendPdf')}
          </Button>
          <Button
            variant="outline"
            className={isMobile ? 'w-full' : undefined}
            disabled={!pipelineModes.length}
            onClick={exportPipelineXlsx}
          >
            {t('reports.aiAnalytics.exportPipelineModesXlsx')}
          </Button>
          <Button
            variant="outline"
            className={isMobile ? 'w-full' : undefined}
            disabled={!pipelineModes.length}
            onClick={exportPipelinePdf}
          >
            {t('reports.aiAnalytics.exportPipelineModesPdf')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.aiAnalytics.totalFeedback')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">{t('reports.aiAnalytics.entries')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.aiAnalytics.overallAcceptance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(overallAcceptance * 100)}%</div>
            <Progress value={overallAcceptance * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.aiAnalytics.topCategory')}</CardTitle>
          </CardHeader>
          <CardContent>
            {summary && summary.categories.length > 0 ? (
              <div>
                <div className="text-2xl font-bold">{summary.categories[0].category}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('reports.aiAnalytics.acceptance')}: {Math.round(summary.categories[0].acceptanceRate * 100)}% · {summary.categories[0].accepted}/{summary.categories[0].total}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">{t('common.noData')}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pipeline summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.aiAnalytics.pipelineTotalExtractions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(pipeTrend || []).reduce((sum, d: any) => sum + (Number(d.extractions) || 0), 0)}</div>
            <div className="text-xs text-muted-foreground mt-1">{t('reports.aiAnalytics.total')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.aiAnalytics.pipelineTotalCost')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((pipeTrend || []).reduce((sum, d: any) => sum + (Number(d.total_cost_usd) || 0), 0)).toFixed(4)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.aiAnalytics.pipelineAvgCost')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const totalExt = (pipeTrend || []).reduce((sum, d: any) => sum + (Number(d.extractions) || 0), 0);
                const totalCost = (pipeTrend || []).reduce((sum, d: any) => sum + (Number(d.total_cost_usd) || 0), 0);
                return totalExt > 0 ? `$${(totalCost / totalExt).toFixed(4)}` : '$0.0000';
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.aiAnalytics.byCategory')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(summary?.categories || []).map((c) => (
              <div key={c.category} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{c.category}</div>
                  <div className="text-xs text-muted-foreground">{c.accepted}/{c.total} · {Math.round(c.acceptanceRate * 100)}%</div>
                </div>
                <Progress value={c.acceptanceRate * 100} />
              </div>
            ))}
            {(!summary || (summary.categories || []).length === 0) && (
              <div className="text-sm text-muted-foreground">{t('common.noData')}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('reports.aiAnalytics.trend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trend && trend.length > 0 ? (
              <div className="w-full h-32 relative">
                <svg viewBox={`0 0 ${Math.max(100, trend.length * 10)} 40`} className="w-full h-full" onMouseMove={onMove} onMouseLeave={onLeave}>
                  {(() => {
                    const maxTotal = Math.max(...trend.map((d: any) => Number(d.total) || 0), 1);
                    const pipeMax = Math.max(...(pipeTrend || []).map((d: any) => Number(d.extractions) || 0), 1);
                    // Total (count) series
                    const totalPoints = trend.map((d: any, i: number) => {
                      const x = 10 + i * 10;
                      const y = 35 - (Number(d.total) / maxTotal) * 30;
                      return `${x},${y}`;
                    }).join(' ');

                    // Acceptance rate (0..1) series mapped to same Y space
                    const rateAt = (d: any) => {
                      const tot = Number(d.total) || 0;
                      const acc = Number(d.accepted) || 0;
                      return tot > 0 ? Math.min(1, Math.max(0, acc / tot)) : 0;
                    };
                    const ratePoints = trend.map((d: any, i: number) => {
                      const x = 10 + i * 10;
                      const y = 35 - rateAt(d) * 30;
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <>
                        {/* horizontal gridlines */}
                        <line x1={5} y1={35} x2={Math.max(100, trend.length * 10) - 5} y2={35} stroke="#eee" strokeWidth={1} />
                        <line x1={5} y1={20} x2={Math.max(100, trend.length * 10) - 5} y2={20} stroke="#f3f4f6" strokeWidth={1} />
                        <line x1={5} y1={5} x2={Math.max(100, trend.length * 10) - 5} y2={5} stroke="#eee" strokeWidth={1} />

                        {/* Total count (left scale) */}
                        {showFeedbackTotal && (
                          <>
                            <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={totalPoints} />
                            {trend.map((d: any, i: number) => {
                              const x = 10 + i * 10;
                              const y = 35 - (Number(d.total) / maxTotal) * 30;
                              return <circle key={`t-${i}`} cx={x} cy={y} r={1.5} fill="#3b82f6" />
                            })}
                          </>
                        )}

                        {/* Pipeline extractions (left scale, dashed) */}
                        {showPipeline && (
                          <>
                            {(pipeTrend || []).map((d: any, i: number) => {
                              const x = 10 + i * 10;
                              const y = 35 - (Number(d.extractions) / pipeMax) * 30;
                              return <circle key={`p-${i}`} cx={x} cy={y} r={1.2} fill="#6366f1" />
                            })}
                            <polyline fill="none" stroke="#6366f1" strokeDasharray="3 3" strokeWidth="1.5" points={(pipeTrend || []).map((d: any, i: number) => {
                              const x = 10 + i * 10;
                              const y = 35 - (Number(d.extractions) / pipeMax) * 30;
                              return `${x},${y}`;
                            }).join(' ')} />
                          </>
                        )}

                        {/* Acceptance rate (right scale 0-100%) */}
                        {showAcceptance && (
                          <>
                            <polyline fill="none" stroke="#10b981" strokeWidth="2" points={ratePoints} />
                            {trend.map((d: any, i: number) => {
                              const x = 10 + i * 10;
                              const y = 35 - rateAt(d) * 30;
                              return <circle key={`r-${i}`} cx={x} cy={y} r={1.5} fill="#10b981" />
                            })}
                          </>
                        )}

                        {/* Axes labels */}
                        <text x={0} y={35} fontSize={3} fill="#94a3b8">0</text>
                        <text x={0} y={6} fontSize={3} fill="#94a3b8">{maxTotal}</text>
                        <text x={Math.max(100, trend.length * 10) - 12} y={35} fontSize={3} fill="#94a3b8">0%</text>
                        <text x={Math.max(100, trend.length * 10) - 16} y={21} fontSize={3} fill="#94a3b8">50%</text>
                        <text x={Math.max(100, trend.length * 10) - 14} y={6} fontSize={3} fill="#94a3b8">100%</text>

                        {/* Hover indicator */}
                        {hoverIdx !== null && (
                          <>
                            <line
                              x1={10 + hoverIdx * 10}
                              x2={10 + hoverIdx * 10}
                              y1={5}
                              y2={35}
                              stroke="#e5e7eb"
                              strokeDasharray="2 2"
                              strokeWidth={1}
                            />
                          </>
                        )}
                      </>
                    );
                  })()}
                </svg>
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                  <span>{trend[0]?.day}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 cursor-pointer select-none"><input type="checkbox" className="me-1" checked={showFeedbackTotal} onChange={e=>setShowFeedbackTotal(e.target.checked)} /><span className="inline-block w-3 h-1 rounded-sm" style={{ background: '#3b82f6' }} />{t('reports.aiAnalytics.total')}</label>
                    <label className="flex items-center gap-1 cursor-pointer select-none"><input type="checkbox" className="me-1" checked={showPipeline} onChange={e=>setShowPipeline(e.target.checked)} /><span className="inline-block w-3 h-1 rounded-sm" style={{ background: '#6366f1' }} />{t('reports.aiAnalytics.pipelineExtracts')}</label>
                    <label className="flex items-center gap-1 cursor-pointer select-none"><input type="checkbox" className="me-1" checked={showAcceptance} onChange={e=>setShowAcceptance(e.target.checked)} /><span className="inline-block w-3 h-1 rounded-sm" style={{ background: '#10b981' }} />{t('reports.aiAnalytics.acceptanceRate')}</label>
                  </div>
                  <span>{trend[trend.length - 1]?.day}</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 text-end">{t('reports.aiAnalytics.dualAxisHint')}</div>

                {hoverIdx !== null && trend[hoverIdx] && (
                  <div
                    className="absolute text-[10px] bg-background border rounded px-2 py-1 shadow"
                    style={{
                      left: `calc(${(10 + hoverIdx * 10) / Math.max(100, trend.length * 10) * 100}% + 8px)`,
                      top: 0,
                    }}
                  >
                    <div className="font-medium">{trend[hoverIdx].day}</div>
                    <div>{t('reports.aiAnalytics.total')}: {Number(trend[hoverIdx].total) || 0}</div>
                    <div>
                      {t('reports.aiAnalytics.acceptanceRate')}: {(() => {
                        const tot = Number(trend[hoverIdx].total) || 0;
                        const acc = Number(trend[hoverIdx].accepted) || 0;
                        return tot > 0 ? Math.round((acc / tot) * 100) : 0;
                      })()}%
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">{t('common.noData')}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.aiAnalytics.recentFeedback')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table className="min-w-[450px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.date')}</TableHead>
                  <TableHead>{t('common.category')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead className="text-end">{t('common.amount')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recent || []).map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.created_at ? format(new Date(r.created_at), 'MMM dd, yyyy') : '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{r.category || '-'}</span>
                        {typeof r.confidence !== 'undefined' && (
                          <Badge variant="secondary" className="text-xs">{Math.round(Number(r.confidence) * 100)}%</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{r.source}</div>
                    </TableCell>
                    <TableCell>
                      {r.accepted ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">{t('common.accepted')}</Badge>
                      ) : (
                        <Badge variant="secondary">{t('common.rejected')}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-end">
                      {typeof r.amount !== 'undefined' ? Number(r.amount).toFixed(2) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {(!recent || recent.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">
                      {t('common.noData')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.aiAnalytics.pipelineModes')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reports.aiAnalytics.mode')}</TableHead>
                    <TableHead className="text-end">{t('reports.aiAnalytics.count')}</TableHead>
                    <TableHead className="text-end">{t('reports.aiAnalytics.tokensIn')}</TableHead>
                    <TableHead className="text-end">{t('reports.aiAnalytics.totalCost')}</TableHead>
                    <TableHead className="text-end">{t('reports.aiAnalytics.avgCost')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pipelineModes.map(m => {
                    const avg = m.count > 0 ? m.total_cost_usd / m.count : 0;
                    return (
                      <TableRow key={m.mode || 'unknown'}>
                        <TableCell>{m.mode || t('common.unknown')}</TableCell>
                        <TableCell className="text-end">{m.count}</TableCell>
                        <TableCell className="text-end">{Math.round(m.total_tokens_in || 0)}</TableCell>
                        <TableCell className="text-end">${m.total_cost_usd.toFixed(4)}</TableCell>
                        <TableCell className="text-end">${avg.toFixed(4)}</TableCell>
                      </TableRow>
                    );
                  })}
                  {!pipelineModes.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">
                        {t('common.noData')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
