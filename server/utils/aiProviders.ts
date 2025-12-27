import { redactForAI } from '../ai/redaction';
import { calcCost } from '../ai/costing';

/**
 * AI Provider Abstraction Layer
 * Supports multiple AI providers:
 * - OpenAI (and OpenAI-compatible: OpenRouter, Groq, Mistral, Together, xAI, Cohere, DeepSeek, Ollama, etc.)
 * - Anthropic Claude
 * - Google Gemini
 * - Azure OpenAI
 * - Any custom OpenAI-compatible endpoint
 */

// Providers that use OpenAI-compatible API format
const OPENAI_COMPATIBLE_PROVIDERS = [
  'openai',
  'openrouter',
  'groq',
  'mistral',
  'together',
  'xai',
  'cohere',
  'deepseek',
  'ollama',
  'lmstudio',
  'local',
  'custom',
] as const;

// Default base URLs for known providers
const PROVIDER_BASE_URLS: Record<string, string> = {
  openai: 'https://api.openai.com',
  openrouter: 'https://openrouter.ai/api',
  groq: 'https://api.groq.com/openai',
  mistral: 'https://api.mistral.ai',
  together: 'https://api.together.xyz',
  xai: 'https://api.x.ai',
  cohere: 'https://api.cohere.ai/compatibility',
  deepseek: 'https://api.deepseek.com',
  anthropic: 'https://api.anthropic.com',
  google: 'https://generativelanguage.googleapis.com',
  ollama: 'http://localhost:11434',
  lmstudio: 'http://localhost:1234',
};

// Default models for known providers
const PROVIDER_DEFAULT_MODELS: Record<string, string> = {
  openai: 'gpt-4o-mini',
  openrouter: 'openai/gpt-4o-mini',
  groq: 'llama-3.1-70b-versatile',
  mistral: 'mistral-large-latest',
  together: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
  xai: 'grok-beta',
  cohere: 'command-r-plus',
  deepseek: 'deepseek-chat',
  anthropic: 'claude-3-5-sonnet-20241022',
  google: 'gemini-1.5-flash',
  ollama: 'llama3.2',
  lmstudio: 'local-model',
};

type ProviderType = 'openai' | 'anthropic' | 'google' | 'azure' | 'openai-compatible' | string;

interface AIProviderConfig {
  provider: ProviderType;
  apiKey: string;
  baseUrl?: string;
  model?: string;
  organizationId?: string; // For OpenAI
  deploymentId?: string;   // For Azure
}

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | AIMessageContent[];
}

interface AIMessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  provider: string;
  cost?: {
    totalUSD: number;
    currency: string;
  };
  redaction?: {
    redacted: boolean;
    count: number;
  };
}

/**
 * OpenAI and OpenAI-Compatible Providers
 * Supports: OpenAI, OpenRouter, Groq, Mistral, Together, xAI, Cohere, DeepSeek, Ollama, LM Studio, etc.
 */
async function callOpenAICompatible(config: AIProviderConfig, messages: AIMessage[], providerName: string = 'openai'): Promise<AIResponse> {
  // Get the base URL - use custom if provided, otherwise use default for provider
  const baseUrl = config.baseUrl || PROVIDER_BASE_URLS[providerName] || PROVIDER_BASE_URLS.openai;
  const model = config.model || PROVIDER_DEFAULT_MODELS[providerName] || 'gpt-4o-mini';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
  };

  // Provider-specific headers
  if (config.organizationId && providerName === 'openai') {
    headers['OpenAI-Organization'] = config.organizationId;
  }

  // OpenRouter specific headers
  if (providerName === 'openrouter') {
    headers['HTTP-Referer'] = 'https://log-and-ledger.app';
    headers['X-Title'] = 'Log & Ledger';
  }

  // Build the API endpoint
  let endpoint = `${baseUrl}/v1/chat/completions`;
  
  // Some providers have different endpoint paths
  if (providerName === 'ollama') {
    endpoint = `${baseUrl}/v1/chat/completions`;
  } else if (providerName === 'lmstudio') {
    endpoint = `${baseUrl}/v1/chat/completions`;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text().catch(() => response.statusText);
      throw new Error(`${providerName} API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage,
      model: data.model || model,
      provider: providerName,
    };
  } catch (error) {
    // Add helpful error message for local providers
    if (providerName === 'ollama' || providerName === 'lmstudio' || providerName === 'local') {
      throw new Error(`Failed to connect to ${providerName}. Make sure the local server is running at ${baseUrl}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    throw error;
  }
}

/**
 * Legacy wrapper for backward compatibility
 */
async function callOpenAI(config: AIProviderConfig, messages: AIMessage[]): Promise<AIResponse> {
  return callOpenAICompatible(config, messages, 'openai');
}

/**
 * Anthropic Claude Provider
 */
async function callAnthropic(config: AIProviderConfig, messages: AIMessage[]): Promise<AIResponse> {
  const baseUrl = config.baseUrl || 'https://api.anthropic.com';
  const model = config.model || 'claude-3-5-sonnet-20241022';

  // Convert messages to Anthropic format
  const systemMessage = messages.find(m => m.role === 'system');
  const conversationMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: typeof m.content === 'string' 
        ? m.content 
        : m.content.map(c => {
            if (c.type === 'text') return { type: 'text', text: c.text };
            if (c.type === 'image_url') {
              // Extract base64 from data URL
              const match = c.image_url?.url.match(/^data:image\/([\w]+);base64,(.+)$/);
              if (match) {
                return {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: `image/${match[1]}`,
                    data: match[2],
                  },
                };
              }
            }
            return { type: 'text', text: '' };
          }),
    }));

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      system: systemMessage?.content || undefined,
      messages: conversationMessages,
    }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => response.statusText);
    throw new Error(`Anthropic API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text || '';
  
  return {
    content,
    usage: {
      prompt_tokens: data.usage?.input_tokens || 0,
      completion_tokens: data.usage?.output_tokens || 0,
      total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    },
    model: data.model,
    provider: 'anthropic',
  };
}

/**
 * Google Gemini Provider
 */
async function callGoogleGemini(config: AIProviderConfig, messages: AIMessage[]): Promise<AIResponse> {
  const baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com';
  const model = config.model || 'gemini-1.5-flash';

  // Convert messages to Gemini format
  const systemMessage = messages.find(m => m.role === 'system');
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: typeof m.content === 'string'
        ? [{ text: m.content }]
        : m.content.map(c => {
            if (c.type === 'text') return { text: c.text };
            if (c.type === 'image_url') {
              // Extract base64 and mime type from data URL
              const match = c.image_url?.url.match(/^data:(image\/[\w]+);base64,(.+)$/);
              if (match) {
                return {
                  inline_data: {
                    mime_type: match[1],
                    data: match[2],
                  },
                };
              }
            }
            return { text: '' };
          }),
    }));

  const response = await fetch(`${baseUrl}/v1beta/models/${model}:generateContent?key=${config.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4000,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => response.statusText);
    throw new Error(`Google Gemini API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return {
    content,
    usage: {
      prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
      completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
      total_tokens: data.usageMetadata?.totalTokenCount || 0,
    },
    model,
    provider: 'google',
  };
}

/**
 * Azure OpenAI Provider
 */
async function callAzureOpenAI(config: AIProviderConfig, messages: AIMessage[]): Promise<AIResponse> {
  if (!config.baseUrl || !config.deploymentId) {
    throw new Error('Azure OpenAI requires baseUrl and deploymentId');
  }

  const url = `${config.baseUrl}/openai/deployments/${config.deploymentId}/chat/completions?api-version=2024-02-15-preview`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey,
    },
    body: JSON.stringify({
      messages,
      temperature: 0.1,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => response.statusText);
    throw new Error(`Azure OpenAI API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || '',
    usage: data.usage,
    model: config.deploymentId,
    provider: 'azure',
  };
}

/**
 * Main AI Provider Interface
 */
export async function callAIProvider(
  config: AIProviderConfig,
  messages: AIMessage[]
): Promise<AIResponse> {
  // 1. Redaction (Phase 2)
  let redactedCount = 0;
  const redactedMessages = messages.map(msg => {
    if (msg.role === 'system') return msg; // Skip system prompt redaction for now

    if (typeof msg.content === 'string') {
      const { text, entries } = redactForAI(msg.content);
      redactedCount += entries.length;
      return { ...msg, content: text };
    } else if (Array.isArray(msg.content)) {
      const newContent = msg.content.map(c => {
        if (c.type === 'text' && c.text) {
          const { text, entries } = redactForAI(c.text);
          redactedCount += entries.length;
          return { ...c, text };
        }
        return c;
      });
      return { ...msg, content: newContent };
    }
    return msg;
  });

  let response: AIResponse;

  // Check if provider is OpenAI-compatible
  const isOpenAICompatible = OPENAI_COMPATIBLE_PROVIDERS.includes(config.provider as any) ||
    config.provider.endsWith('-compatible') ||
    config.provider === 'custom';

  switch (config.provider) {
    // Native implementations
    case 'anthropic':
      response = await callAnthropic(config, redactedMessages);
      break;
    case 'google':
      response = await callGoogleGemini(config, redactedMessages);
      break;
    case 'azure':
      response = await callAzureOpenAI(config, redactedMessages);
      break;
    
    // OpenAI and OpenAI-compatible providers
    case 'openai':
    case 'openrouter':
    case 'groq':
    case 'mistral':
    case 'together':
    case 'xai':
    case 'cohere':
    case 'deepseek':
    case 'ollama':
    case 'lmstudio':
    case 'local':
    case 'custom':
      response = await callOpenAICompatible(config, redactedMessages, config.provider);
      break;
    
    default:
      // For any unknown provider, try OpenAI-compatible API
      // This allows users to add any provider that supports OpenAI format
      if (config.baseUrl) {
        console.log(`Unknown provider "${config.provider}", attempting OpenAI-compatible API with custom baseUrl`);
        response = await callOpenAICompatible(config, redactedMessages, config.provider);
      } else {
        throw new Error(`Unsupported AI provider: ${config.provider}. Please provide a baseUrl for custom providers.`);
      }
  }

  // 2. Cost Estimation (Phase 1.5)
  if (response.usage) {
    const cost = calcCost(
      response.provider,
      response.model,
      response.usage.prompt_tokens,
      response.usage.completion_tokens
    );
    
    response.cost = {
      totalUSD: cost.totalUSD,
      currency: 'USD'
    };
  }

  response.redaction = {
    redacted: redactedCount > 0,
    count: redactedCount
  };

  return response;
}

/**
 * Helper: Build invoice extraction messages
 */
export function buildInvoiceExtractionMessages(
  text?: string,
  imageBase64?: string,
  mimeType?: string,
  customPrompt?: string
): AIMessage[] {
  const systemPrompt = customPrompt || `You are an expert at extracting structured data from invoices. 
Extract the following fields from the invoice and return them as a valid JSON object:
{
  "invoice_number": "string",
  "invoice_date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD",
  "vendor_name": "string",
  "vendor_tax_id": "string",
  "subtotal": "number",
  "tax_amount": "number",
  "total": "number",
  "currency": "string (3-letter code)",
  "line_items": [
    {
      "description": "string",
      "quantity": "number",
      "unit_price": "number",
      "total": "number"
    }
  ]
}
Return ONLY the JSON object, no additional text.`;

  const messages: AIMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ];

  if (imageBase64 && mimeType) {
    // Vision message
    messages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Extract invoice data from this image:',
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${imageBase64}`,
          },
        },
      ],
    });
  } else if (text) {
    // Text message
    messages.push({
      role: 'user',
      content: `Extract invoice data from this text:\n\n${text}`,
    });
  }

  return messages;
}

export type { AIProviderConfig, AIMessage, AIResponse };
