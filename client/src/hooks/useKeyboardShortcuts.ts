/**
 * Enterprise Keyboard Shortcuts Hook
 * Provides global keyboard shortcuts for power users
 */
import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
  scope?: 'global' | 'page';
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts?: ShortcutConfig[];
}

// Default global shortcuts
const defaultShortcuts: Omit<ShortcutConfig, 'action'>[] = [
  { key: 'n', ctrl: true, shift: true, description: 'New Invoice', scope: 'global' },
  { key: 'b', ctrl: true, shift: true, description: 'New Bill', scope: 'global' },
  { key: 'j', ctrl: true, shift: true, description: 'New Journal Entry', scope: 'global' },
  { key: 'c', ctrl: true, shift: true, description: 'New Contact', scope: 'global' },
  { key: '/', ctrl: true, description: 'Quick Search', scope: 'global' },
  { key: 's', ctrl: true, description: 'Save', scope: 'page' },
  { key: 'Escape', description: 'Close Dialog/Cancel', scope: 'page' },
  { key: 'd', ctrl: true, description: 'Dashboard', scope: 'global' },
  { key: 'h', ctrl: true, shift: true, description: 'Show Shortcuts Help', scope: 'global' },
];

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true, shortcuts = [] } = options;
  const [, navigate] = useLocation();
  const helpDialogRef = useRef<(() => void) | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || 
                   target.tagName === 'TEXTAREA' || 
                   target.isContentEditable;

    // Allow Escape in inputs
    if (isInput && event.key !== 'Escape') return;

    // Check custom shortcuts first
    for (const shortcut of shortcuts) {
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }

    // Default global shortcuts
    // Ctrl+Shift+N: New Invoice
    if (event.ctrlKey && event.shiftKey && event.key === 'N') {
      event.preventDefault();
      navigate('/sales/invoices/new');
      return;
    }

    // Ctrl+Shift+B: New Bill
    if (event.ctrlKey && event.shiftKey && event.key === 'B') {
      event.preventDefault();
      navigate('/purchases/bills/new');
      return;
    }

    // Ctrl+Shift+J: New Journal Entry
    if (event.ctrlKey && event.shiftKey && event.key === 'J') {
      event.preventDefault();
      navigate('/journals/new');
      return;
    }

    // Ctrl+Shift+C: New Contact
    if (event.ctrlKey && event.shiftKey && event.key === 'C') {
      event.preventDefault();
      navigate('/contacts');
      return;
    }

    // Ctrl+D: Dashboard
    if (event.ctrlKey && !event.shiftKey && event.key === 'd') {
      event.preventDefault();
      navigate('/');
      return;
    }

    // Ctrl+/: Quick Search (focus search box)
    if (event.ctrlKey && event.key === '/') {
      event.preventDefault();
      const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
      searchInput?.focus();
      return;
    }

    // Ctrl+Shift+H: Show shortcuts help
    if (event.ctrlKey && event.shiftKey && event.key === 'H') {
      event.preventDefault();
      helpDialogRef.current?.();
      return;
    }
  }, [enabled, shortcuts, navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts: [...defaultShortcuts, ...shortcuts.map(s => ({ 
      key: s.key, 
      ctrl: s.ctrl, 
      alt: s.alt, 
      shift: s.shift, 
      description: s.description,
      scope: s.scope,
    }))],
    setHelpDialogHandler: (handler: () => void) => {
      helpDialogRef.current = handler;
    },
  };
}

function matchesShortcut(event: KeyboardEvent, shortcut: ShortcutConfig): boolean {
  const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
  const altMatch = shortcut.alt ? event.altKey : !event.altKey;
  const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
  const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
  
  return ctrlMatch && altMatch && shiftMatch && keyMatch;
}

// Format shortcut for display
export function formatShortcut(shortcut: Omit<ShortcutConfig, 'action'>): string {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('⌘');
  if (shortcut.alt) parts.push('⌥');
  if (shortcut.shift) parts.push('⇧');
  parts.push(shortcut.key.toUpperCase());
  return parts.join('');
}
