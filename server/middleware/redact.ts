// Utility to redact sensitive fields before logging
export function redactSensitive(input: any, seen = new WeakSet()): any {
  try {
    if (input === null || input === undefined) return input;
    if (typeof input !== 'object') return input;
    if (seen.has(input)) return '[Circular]';
    seen.add(input);

    const SENSITIVE_KEYS = new Set([
      'password',
      'password_hash',
      'token',
      'idToken',
      'access_token',
      'refresh_token',
      'authorization',
      'Authorization',
      'auth',
      'client_secret',
      'firebaseToken',
    ]);

    if (Array.isArray(input)) {
      return input.map((v) => redactSensitive(v, seen));
    }

    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      if (SENSITIVE_KEYS.has(k)) {
        out[k] = '[REDACTED]';
      } else if (typeof v === 'object' && v !== null) {
        out[k] = redactSensitive(v as any, seen);
      } else {
        out[k] = v;
      }
    }
    return out;
  } catch {
    // Best-effort redaction; if anything goes wrong, return a safe placeholder
    return '[UNREDACTABLE]';
  }
}
