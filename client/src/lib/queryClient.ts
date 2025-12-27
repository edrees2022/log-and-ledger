import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { Capacitor } from '@capacitor/core';

// Backend URL - use environment variable or Railway domain
// For native mobile apps, hardcode the production API URL
// For Web (Production & Dev), use relative path to leverage proxies (Vite or Vercel)
export const API_URL = Capacitor.isNativePlatform()
  ? 'https://log-and-ledger.onrender.com'
  : ''; 

// CSRF Token cache
let csrfToken: string = '';
let csrfTokenPromise: Promise<string> | null = null;

export async function getCsrfToken(): Promise<string> {
  // Return cached token if available
  if (csrfToken) return csrfToken;
  
  // If already fetching, wait for it
  if (csrfTokenPromise) return csrfTokenPromise;
  
  // Fetch new token
  csrfTokenPromise = fetch(`${API_URL}/api/csrf-token`, {
    credentials: 'include'
  })
    .then(res => res.json())
    .then(data => {
      csrfToken = data.csrfToken || data.data?.csrfToken || '';
      csrfTokenPromise = null;
      return csrfToken;
    })
    .catch(err => {
      console.error('Failed to fetch CSRF token:', err);
      csrfTokenPromise = null;
      return '';
    });
  
  return csrfTokenPromise;
}

// Clear CSRF token (call after logout or on 403 errors)
export function clearCsrfToken() {
  csrfToken = '';
  csrfTokenPromise = null;
}

// Small utility to retry transient network errors (Render cold starts, 502/503/504)
async function fetchWithRetry(url: string, init: RequestInit, retries = 2, baseDelayMs = 600, perAttemptTimeoutMs = 15000): Promise<Response> {
  let attempt = 0;
  // Ensure we don't accidentally send undefined body when method is GET
  const cleanInit: RequestInit = { ...init };
  if ((cleanInit.method || 'GET').toUpperCase() === 'GET') delete (cleanInit as any).body;
  const methodUpper = (cleanInit.method || 'GET').toUpperCase();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // Per-attempt timeout using AbortController to avoid hanging spinners
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), perAttemptTimeoutMs);
      const res = await fetch(url, { ...cleanInit, signal: controller.signal });
      clearTimeout(timeout);
      // Retry only on transient upstream errors
      const retryableStatuses = methodUpper === 'GET' ? [500, 502, 503, 504] : [502, 503, 504];
      if (retryableStatuses.includes(res.status) && attempt < retries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, delay));
        attempt++;
        continue;
      }
      return res;
    } catch (err) {
      // If aborted due to timeout, convert to a clearer error message
      if ((err as any)?.name === 'AbortError') {
        if (attempt < retries) {
          const delay = baseDelayMs * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, delay));
          attempt++;
          continue;
        }
        throw new Error(`Request timed out after ${perAttemptTimeoutMs}ms`);
      }
      // Network errors (TypeError: Failed to fetch)
      if (attempt < retries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, delay));
        attempt++;
        continue;
      }
      throw err;
    }
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get Firebase auth token if available
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const { auth } = await import('@/lib/firebase');
      if (auth.currentUser) {
        return await auth.currentUser.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const token = await getAuthToken();
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Add CSRF token for state-changing requests
  const methodUpper = method.toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(methodUpper)) {
    const csrf = await getCsrfToken();
    if (csrf) {
      headers['X-CSRF-Token'] = csrf;
    }
  }

  // Build full URL (add API_URL prefix if URL doesn't start with http)
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;

  let res = await fetchWithRetry(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // If CSRF token is invalid (403), refresh and retry once
  if (res.status === 403 && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(methodUpper)) {
    // Read from a clone so the original response body remains readable later
    const errorText = await res.clone().text().catch(() => '');
    if (errorText.toLowerCase().includes('csrf')) {
      console.log('🔄 CSRF token invalid, refreshing and retrying...');
      clearCsrfToken();
      const newCsrf = await getCsrfToken();
      if (newCsrf) {
        headers['X-CSRF-Token'] = newCsrf;
        res = await fetchWithRetry(fullUrl, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
          credentials: "include",
        });
      }
    }
  }

  await throwIfResNotOk(res);
  // Monkey-patch json() to transparently unwrap { data }
  const originalJson = res.json.bind(res);
  (res as any).json = async () => {
    const payload = await originalJson();
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  };
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get Firebase auth token if available
    const getAuthToken = async (): Promise<string | null> => {
      try {
        const { auth } = await import('@/lib/firebase');
        if (auth.currentUser) {
          return await auth.currentUser.getIdToken();
        }
        return null;
      } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
      }
    };

    const token = await getAuthToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Build full URL (add API_URL prefix if URL doesn't start with http)
    const url = queryKey.join("/") as string;
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;

    const res = await fetchWithRetry(fullUrl, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const payload = await res.json();
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return (payload as any).data;
    }
    return payload as any;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
