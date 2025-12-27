/**
 * Keyboard Shortcuts Help Dialog
 * Shows all available keyboard shortcuts
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { Keyboard } from 'lucide-react';
import { formatShortcut } from '@/hooks/useKeyboardShortcuts';

interface ShortcutInfo {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  scope?: 'global' | 'page';
}

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts: ShortcutInfo[] = [
  // Navigation
  { key: 'd', ctrl: true, description: 'shortcuts.dashboard', scope: 'global' },
  { key: '/', ctrl: true, description: 'shortcuts.search', scope: 'global' },
  
  // Quick Create
  { key: 'n', ctrl: true, shift: true, description: 'shortcuts.newInvoice', scope: 'global' },
  { key: 'b', ctrl: true, shift: true, description: 'shortcuts.newBill', scope: 'global' },
  { key: 'j', ctrl: true, shift: true, description: 'shortcuts.newJournal', scope: 'global' },
  { key: 'c', ctrl: true, shift: true, description: 'shortcuts.newContact', scope: 'global' },
  
  // Actions
  { key: 's', ctrl: true, description: 'shortcuts.save', scope: 'page' },
  { key: 'Escape', description: 'shortcuts.closeCancel', scope: 'page' },
  { key: 'p', ctrl: true, description: 'shortcuts.print', scope: 'page' },
  
  // Help
  { key: 'h', ctrl: true, shift: true, description: 'shortcuts.showHelp', scope: 'global' },
];

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const { t } = useTranslation();

  const globalShortcuts = shortcuts.filter(s => s.scope === 'global');
  const pageShortcuts = shortcuts.filter(s => s.scope === 'page');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            {t('shortcuts.title', 'Keyboard Shortcuts')}
          </DialogTitle>
          <DialogDescription>
            {t('shortcuts.description', 'Use these shortcuts to navigate faster')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Global Shortcuts */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-3">
              {t('shortcuts.global', 'Global')}
            </h4>
            <div className="space-y-2">
              {globalShortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-1">
                  <span className="text-sm">{t(shortcut.description, shortcut.description)}</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Page Shortcuts */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-3">
              {t('shortcuts.pageSpecific', 'Page Specific')}
            </h4>
            <div className="space-y-2">
              {pageShortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-1">
                  <span className="text-sm">{t(shortcut.description, shortcut.description)}</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
          {t('shortcuts.tip', 'Tip: Press ⌘⇧H anytime to show this dialog')}
        </div>
      </DialogContent>
    </Dialog>
  );
}
