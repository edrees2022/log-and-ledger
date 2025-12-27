/*
  React runtime probe (now trimmed for production).
  Original verbose diagnostics removed after resolving hook misuse issue.
*/
import * as React from 'react';

// Augment the Window type for our probe marker
declare global {
  interface Window {
    __reactProbeSet?: Set<any>;
  }
}

export function probeReact(_source: string) {
  try {
    if (typeof window === 'undefined') return;
    if (!window.__reactProbeSet) window.__reactProbeSet = new Set();
    // Use the imported React namespace object as the identity for this bundle's runtime
    window.__reactProbeSet.add(React);
  } catch {
    // no-op
  }
}

// Extra dispatcher-focused probe to help diagnose null dispatcher issues in production
// Safe to import in production; reads React internals if available and logs a compact summary
// Dispatcher introspection removed for production cleanliness.

// Lightweight side-log on module load to understand dispatcher timing across modules
// Initial dispatcher log removed.

// Temporary hook-guard: surface a clear stack if hooks are invoked before React dispatcher is ready
// Hook guard removed after fixing module-scope hook misuse.

export function getReactProbeInfo() {
  try {
    const instances = typeof window !== 'undefined' && window.__reactProbeSet ? window.__reactProbeSet.size : 0;
    const version = (React as any)?.version as string | undefined;
    return { instances, version };
  } catch {
    return { instances: 0, version: undefined };
  }
}
