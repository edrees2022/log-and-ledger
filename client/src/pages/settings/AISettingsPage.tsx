import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2, RefreshCcw, KeyRound, Settings, Edit } from 'lucide-react';

const PROVIDERS = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'openrouter', label: 'OpenRouter' },
  { id: 'google', label: 'Google (Gemini)' },
  { id: 'anthropic', label: 'Anthropic (Claude)' },
  { id: 'azure', label: 'Azure OpenAI' },
  { id: 'groq', label: 'Groq' },
  { id: 'mistral', label: 'Mistral AI' },
  { id: 'xai', label: 'xAI (Grok)' },
  { id: 'together', label: 'Together AI' },
  { id: 'cohere', label: 'Cohere' },
  { id: 'deepseek', label: 'DeepSeek' },
  { id: 'ollama', label: 'Ollama (Local)' },
  { id: 'lmstudio', label: 'LM Studio (Local)' },
  { id: 'custom', label: 'Custom (OpenAI Compatible)' },
];

export default function AISettingsPage() {
  const isMobile = useIsMobile();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  // List configured providers
  const providersQuery = useQuery({
    queryKey: ['/api/ai/providers'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/ai/providers');
      return await res.json();
    },
  });
  type ProviderRow = {
    id: string;
    company_id: string;
    provider: string;
    label: string | null;
    base_url: string | null;
    api_key: string | null; // masked from server
    organization: string | null;
    default_model: string | null;
    embeddings_model: string | null;
    vision_model: string | null;
  };
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [provider, setProvider] = useState<string>('openai');
  const [labelStr, setLabelStr] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  const [defaultModel, setDefaultModel] = useState<string>('');
  const [embeddingsModel, setEmbeddingsModel] = useState<string>('');
  const [visionModel, setVisionModel] = useState<string>('');

  const resetForm = () => {
    setEditingId(null);
    setProvider('openai');
    setLabelStr('');
    setBaseUrl('');
    setApiKey('');
    setOrganization('');
    setDefaultModel('');
    setEmbeddingsModel('');
    setVisionModel('');
  };

  // Models catalog for the selected provider
  const [models, setModels] = useState<string[]>([]);
  const loadModels = async (opts?: { providerId?: string; providerName?: string }) => {
    try {
      const qs = new URLSearchParams();
      if (opts?.providerId) qs.set('providerId', opts.providerId);
      if (opts?.providerName) qs.set('provider', opts.providerName);
      const res = await apiRequest('GET', `/api/ai/models?${qs.toString()}`);
      const data = (await res.json()) as { id: string }[];
      setModels(data.map(m => m.id));
      if (!defaultModel && data[0]?.id) setDefaultModel(data[0].id);
    } catch (e: any) {
      toast({ title: t('settings.ai.failedToLoadModels'), description: e?.message || t('common.retry'), variant: 'destructive' });
    }
  };

  // Populate form for editing
  const onEdit = (row: ProviderRow) => {
    setEditingId(row.id);
    setProvider(row.provider || 'openai');
    setLabelStr(row.label || '');
    setBaseUrl(row.base_url || '');
    setApiKey(''); // never prefill full key in client
    setOrganization(row.organization || '');
    setDefaultModel(row.default_model || '');
    setEmbeddingsModel(row.embeddings_model || '');
    setVisionModel(row.vision_model || '');
    // Load models for this provider id to help pick latest
    loadModels({ providerId: row.id });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        id: editingId || undefined,
        provider,
        label: labelStr || null,
        base_url: baseUrl || null,
        api_key: apiKey || undefined, // undefined means "no change" on update
        organization: organization || null,
        default_model: defaultModel || null,
        embeddings_model: embeddingsModel || null,
        vision_model: visionModel || null,
      };
      const res = await apiRequest('POST', '/api/ai/providers', payload);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: t('common.settingsSaved') });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/providers'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: t('settings.ai.failedToSaveProvider'), description: error?.message || t('common.retry'), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/ai/providers/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: t('settings.ai.providerDeleted') });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/providers'] });
      if (editingId) resetForm();
    },
    onError: (error: any) => {
      toast({ title: t('settings.ai.failedToDelete'), description: error?.message || t('common.retry'), variant: 'destructive' });
    }
  });

  const onLoadModelsClick = () => {
    if (editingId) return loadModels({ providerId: editingId });
    return loadModels({ providerName: provider });
  };

  const providerOptions = useMemo(() => PROVIDERS, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 md:h-7 md:w-7" /> {t('settings.ai.title')}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {t('settings.ai.description')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Providers List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.ai.configuredProviders')}</CardTitle>
            <CardDescription>{t('settings.ai.configuredProvidersDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table View */}
            {!isMobile && (
              <div className="overflow-x-auto px-6 pb-6">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.provider')}</TableHead>
                      <TableHead>{t('common.label')}</TableHead>
                      <TableHead>{t('common.baseUrl')}</TableHead>
                      <TableHead>{t('common.apiKey')}</TableHead>
                      <TableHead className="text-end">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(providersQuery.data as ProviderRow[] | undefined)?.map(row => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.provider}</TableCell>
                        <TableCell>{row.label || '-'}</TableCell>
                        <TableCell className="max-w-[180px] truncate">{row.base_url || '-'}</TableCell>
                        <TableCell className="font-mono text-xs">{row.api_key || '-'}</TableCell>
                        <TableCell className="text-end space-x-2">
                          <Button size="sm" variant="outline" onClick={() => onEdit(row)}>{t('common.edit')}</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(row.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {providersQuery.isLoading && (
                      <TableRow><TableCell colSpan={5}>{t('common.loading')}</TableCell></TableRow>
                    )}
                    {!providersQuery.isLoading && (!providersQuery.data || (providersQuery.data as any[]).length === 0) && (
                      <TableRow><TableCell colSpan={5} className="text-muted-foreground">{t('common.noData')}</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Mobile Card View */}
            {isMobile && (
              <div className="space-y-3 px-4 pb-4">
                {providersQuery.isLoading && (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    {t('common.loading')}
                  </div>
                )}
                {!providersQuery.isLoading && (!providersQuery.data || (providersQuery.data as any[]).length === 0) ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    {t('common.noData')}
                  </div>
                ) : (
                  (providersQuery.data as ProviderRow[] | undefined)?.map(row => (
                    <Card key={row.id} className="border">
                      <CardContent className="p-4 space-y-3">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-primary text-primary-foreground">{row.provider}</Badge>
                              {row.label && <span className="text-sm font-medium truncate">{row.label}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onEdit(row)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteMutation.mutate(row.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-sm">
                          {row.base_url && (
                            <div>
                              <div className="text-xs text-muted-foreground">{t('common.baseUrl')}</div>
                              <div className="truncate">{row.base_url}</div>
                            </div>
                          )}
                          {row.api_key && (
                            <div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <KeyRound className="h-3 w-3" /> {t('common.apiKey')}
                              </div>
                              <code className="text-xs bg-muted px-2 py-1 rounded block truncate">{row.api_key}</code>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? t('settings.ai.editProvider') : t('settings.ai.addProvider')}</CardTitle>
            <CardDescription>{t('settings.ai.formHelp')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label>{t('common.provider')}</Label>
                <Select value={provider} onValueChange={setProvider} disabled={!!editingId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.selectProvider') as string} />
                  </SelectTrigger>
                  <SelectContent>
                    {providerOptions.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Helper text for local providers */}
                {(provider === 'ollama' || provider === 'lmstudio' || provider === 'local' || provider === 'custom') && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {provider === 'ollama' && t('settings.ai.ollamaHint', { defaultValue: 'Default: http://localhost:11434 - Make sure Ollama is running locally' })}
                    {provider === 'lmstudio' && t('settings.ai.lmstudioHint', { defaultValue: 'Default: http://localhost:1234 - Make sure LM Studio is running with API server enabled' })}
                    {provider === 'local' && t('settings.ai.localHint', { defaultValue: 'Enter the base URL of your local AI server (OpenAI-compatible API)' })}
                    {provider === 'custom' && t('settings.ai.customHint', { defaultValue: 'Enter the base URL for any OpenAI-compatible API endpoint' })}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label>{t('common.label')}</Label>
                <Input value={labelStr} onChange={e => setLabelStr(e.target.value)} placeholder={t('common.optional')} />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label>{t('common.baseUrl')}</Label>
                <Input 
                  value={baseUrl} 
                  onChange={e => setBaseUrl(e.target.value)} 
                  placeholder={
                    provider === 'ollama' ? 'http://localhost:11434' :
                    provider === 'lmstudio' ? 'http://localhost:1234' :
                    provider === 'local' ? 'http://localhost:8080' :
                    'https://api.openai.com/v1'
                  } 
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label>{t('common.organization')}</Label>
                <Input value={organization} onChange={e => setOrganization(e.target.value)} placeholder={t('common.optional')} />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label className="flex items-center gap-2">
                  {t('common.apiKey')} <KeyRound className="h-4 w-4" />
                  {(provider === 'ollama' || provider === 'lmstudio' || provider === 'local') && (
                    <span className="text-xs text-muted-foreground">({t('common.optional')})</span>
                  )}
                </Label>
                <Input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-..." type="password" />
                <p className="text-xs text-muted-foreground">{t('settings.ai.keyHint')}</p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between">
                  <Label>{t('settings.ai.defaultModel')}</Label>
                  <Button type="button" size="sm" variant="outline" onClick={onLoadModelsClick}>
                    <RefreshCcw className="h-4 w-4 me-1" /> {t('settings.ai.loadModels')}
                  </Button>
                </div>
                <Select value={defaultModel} onValueChange={setDefaultModel}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.ai.chooseDefaultModel') as string} />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{t('settings.ai.defaultModelHint')}</p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label>{t('settings.ai.embeddingsModel')}</Label>
                <Select value={embeddingsModel} onValueChange={setEmbeddingsModel}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.ai.chooseEmbeddingsModel') as string} />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{t('settings.ai.embeddingsModelHint')}</p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label>{t('settings.ai.visionModel')}</Label>
                <Select value={visionModel} onValueChange={setVisionModel}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.ai.chooseVisionModel') as string} />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{t('settings.ai.visionModelHint')}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  <Save className="h-4 w-4 me-1" /> {editingId ? t('common.saveChanges') : t('common.add')}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>{t('common.cancel')}</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
