/**
 * Form Auto-Save Hook
 * Automatically saves form data to localStorage and restores on mount
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface AutoSaveOptions {
  key: string;
  debounceMs?: number;
  enabled?: boolean;
  onRestore?: (data: any) => void;
  excludeFields?: string[];
}

export function useAutoSave<T extends Record<string, any>>(
  data: T,
  options: AutoSaveOptions
) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { 
    key, 
    debounceMs = 1000, 
    enabled = true,
    onRestore,
    excludeFields = [],
  } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [hasRestoredData, setHasRestoredData] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Storage key with prefix
  const storageKey = `autosave_${key}`;

  // Save data to localStorage
  const save = useCallback(() => {
    if (!enabled) return;
    
    try {
      const dataToSave = { ...data };
      excludeFields.forEach(field => delete dataToSave[field]);
      
      const saveData = {
        data: dataToSave,
        timestamp: new Date().toISOString(),
      };
      
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      setSavedAt(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [data, storageKey, enabled, excludeFields]);

  // Debounced save
  useEffect(() => {
    if (!enabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(save, debounceMs);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, save, debounceMs, enabled]);

  // Restore saved data on mount
  const restore = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { data: savedData, timestamp } = JSON.parse(saved);
        return savedData;
      }
    } catch (error) {
      console.error('Failed to restore auto-saved data:', error);
    }
    return null;
  }, [storageKey]);

  // Clear saved data
  const clear = useCallback(() => {
    localStorage.removeItem(storageKey);
    setSavedAt(null);
    setHasRestoredData(false);
  }, [storageKey]);

  // Check if there's saved data
  const hasSavedData = useCallback((): boolean => {
    return localStorage.getItem(storageKey) !== null;
  }, [storageKey]);

  // Get saved timestamp
  const getSavedTimestamp = useCallback((): Date | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { timestamp } = JSON.parse(saved);
        return new Date(timestamp);
      }
    } catch {
      return null;
    }
    return null;
  }, [storageKey]);

  // Prompt to restore on mount
  useEffect(() => {
    if (!enabled || hasRestoredData) return;
    
    const savedTimestamp = getSavedTimestamp();
    if (savedTimestamp) {
      const savedData = restore();
      if (savedData && onRestore) {
        // Show toast with restore option
        const timeDiff = Date.now() - savedTimestamp.getTime();
        const minutes = Math.floor(timeDiff / 60000);
        const timeText = minutes < 1 
          ? t('autoSave.justNow', 'just now')
          : t('autoSave.minutesAgo', '{{minutes}} minutes', { minutes });
        
        toast({
          title: t('autoSave.foundDraft', 'Draft found'),
          description: `${t('autoSave.savedAgo', 'Saved {{time}} ago', { time: timeText })} - ${t('autoSave.clickToRestore', 'Check your form to restore')}`,
        });
        
        // Auto-restore the data
        onRestore(savedData);
        setHasRestoredData(true);
      }
    }
  }, [enabled, hasRestoredData, getSavedTimestamp, restore, onRestore, toast, t]);

  return {
    save,
    restore,
    clear,
    hasSavedData,
    getSavedTimestamp,
    savedAt,
  };
}

/**
 * Simple draft storage without auto-save
 */
export function useDraftStorage<T>(key: string) {
  const storageKey = `draft_${key}`;

  const saveDraft = useCallback((data: T) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
      }));
      return true;
    } catch {
      return false;
    }
  }, [storageKey]);

  const loadDraft = useCallback((): { data: T; timestamp: Date } | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { data, timestamp } = JSON.parse(saved);
        return { data, timestamp: new Date(timestamp) };
      }
    } catch {}
    return null;
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const hasDraft = useCallback(() => {
    return localStorage.getItem(storageKey) !== null;
  }, [storageKey]);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
  };
}
