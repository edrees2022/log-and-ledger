import { API_URL } from '@/lib/queryClient';
export type ClientErrorPayload = {
  message?: string;
  name?: string;
  stack?: string;
  componentStack?: string;
  url?: string;
  tags?: string[];
  ts?: number;
};

export async function sendClientError(payload: ClientErrorPayload) {
  try {
    // Best-effort, non-blocking; ignore failures
    const url = `${API_URL}/api/logs`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        url: payload.url || (typeof window !== 'undefined' ? window.location.href : ''),
        ts: payload.ts || Date.now(),
      }),
      credentials: 'include',
    });
  } catch {
    // ignore
  }
}
