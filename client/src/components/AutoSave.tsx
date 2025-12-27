import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  CloudOff,
  Check,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Trash2,
} from "lucide-react";

interface AutoSaveConfig {
  key: string;
  data: any;
  onRestore?: (data: any) => void;
  debounceMs?: number;
  maxAge?: number; // Max age in minutes before draft expires
}

interface DraftData {
  data: any;
  savedAt: number;
  version: number;
}

type SaveStatus = "idle" | "saving" | "saved" | "error" | "offline";

export function useAutoSave({
  key,
  data,
  onRestore,
  debounceMs = 2000,
  maxAge = 60 * 24, // 24 hours default
}: AutoSaveConfig) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftAge, setDraftAge] = useState<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const versionRef = useRef(0);
  const isOnlineRef = useRef(navigator.onLine);

  const storageKey = `autosave_${key}`;

  // Check if online
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      setStatus((prev) => (prev === "offline" ? "idle" : prev));
    };
    const handleOffline = () => {
      isOnlineRef.current = false;
      setStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Check for existing draft on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const draft: DraftData = JSON.parse(stored);
        const ageMinutes = (Date.now() - draft.savedAt) / (1000 * 60);

        if (ageMinutes > maxAge) {
          // Draft is too old, remove it
          localStorage.removeItem(storageKey);
          setHasDraft(false);
        } else {
          setHasDraft(true);
          versionRef.current = draft.version;
          updateDraftAge(draft.savedAt);
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey, maxAge]);

  // Update draft age display
  const updateDraftAge = useCallback(
    (savedAt: number) => {
      const ageMinutes = Math.floor((Date.now() - savedAt) / (1000 * 60));
      if (ageMinutes < 1) {
        setDraftAge(t("autoSave.justNow"));
      } else if (ageMinutes < 60) {
        setDraftAge(t("autoSave.minutesAgo", { minutes: ageMinutes }));
      } else {
        const hours = Math.floor(ageMinutes / 60);
        setDraftAge(t("autoSave.hoursAgo", { hours }));
      }
    },
    [t]
  );

  // Save to localStorage
  const saveDraft = useCallback(() => {
    if (!isOnlineRef.current) {
      setStatus("offline");
    }

    try {
      setStatus("saving");
      versionRef.current += 1;

      const draft: DraftData = {
        data,
        savedAt: Date.now(),
        version: versionRef.current,
      };

      localStorage.setItem(storageKey, JSON.stringify(draft));
      setLastSaved(new Date());
      setStatus("saved");
      setHasDraft(true);

      // Reset to idle after a short delay
      setTimeout(() => {
        setStatus((prev) => (prev === "saved" ? "idle" : prev));
      }, 2000);
    } catch (error) {
      setStatus("error");
      console.error("Auto-save failed:", error);
    }
  }, [data, storageKey]);

  // Debounced auto-save when data changes
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't save if data is empty or null
    if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
      return;
    }

    timeoutRef.current = setTimeout(saveDraft, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, debounceMs, saveDraft]);

  // Restore draft
  const restoreDraft = useCallback(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const draft: DraftData = JSON.parse(stored);
        onRestore?.(draft.data);
        toast({
          title: t("autoSave.restored"),
          description: t("autoSave.restoredDesc"),
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: t("autoSave.restoreFailed"),
          description: t("autoSave.restoreFailedDesc"),
        });
      }
    }
  }, [storageKey, onRestore, toast, t]);

  // Clear draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    setHasDraft(false);
    setLastSaved(null);
    versionRef.current = 0;
    toast({
      title: t("autoSave.cleared"),
      description: t("autoSave.clearedDesc"),
    });
  }, [storageKey, toast, t]);

  // Force save
  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveDraft();
  }, [saveDraft]);

  return {
    status,
    lastSaved,
    hasDraft,
    draftAge,
    restoreDraft,
    clearDraft,
    forceSave,
  };
}

// Auto-Save Status Indicator Component
interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSaved: Date | null;
  onForceSave?: () => void;
}

export function AutoSaveIndicator({
  status,
  lastSaved,
  onForceSave,
}: AutoSaveIndicatorProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const getStatusIcon = () => {
    switch (status) {
      case "saving":
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case "saved":
        return <Check className="h-3 w-3 text-green-500" />;
      case "error":
        return <AlertTriangle className="h-3 w-3 text-destructive" />;
      case "offline":
        return <CloudOff className="h-3 w-3 text-yellow-500" />;
      default:
        return <Cloud className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "saving":
        return t("autoSave.saving");
      case "saved":
        return t("autoSave.saved");
      case "error":
        return t("autoSave.error");
      case "offline":
        return t("autoSave.offline");
      default:
        if (lastSaved) {
          const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
          if (seconds < 60) {
            return t("autoSave.savedJustNow");
          }
          const minutes = Math.floor(seconds / 60);
          return t("autoSave.savedMinutesAgo", { minutes });
        }
        return t("autoSave.notSaved");
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "saved":
        return "border-green-500/50 bg-green-500/10";
      case "error":
        return "border-destructive/50 bg-destructive/10";
      case "offline":
        return "border-yellow-500/50 bg-yellow-500/10";
      case "saving":
        return "border-blue-500/50 bg-blue-500/10";
      default:
        return "";
    }
  };

  return (
    <div
      className={`flex items-center gap-2 text-xs ${isRTL ? "flex-row-reverse" : ""}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Badge variant="outline" className={`gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        {getStatusText()}
      </Badge>
      {status === "error" && onForceSave && (
        <Button variant="ghost" size="sm" className="h-6 px-2" onClick={onForceSave}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// Draft Recovery Banner Component
interface DraftRecoveryBannerProps {
  hasDraft: boolean;
  draftAge: string;
  onRestore: () => void;
  onDiscard: () => void;
}

export function DraftRecoveryBanner({
  hasDraft,
  draftAge,
  onRestore,
  onDiscard,
}: DraftRecoveryBannerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  if (!hasDraft) return null;

  return (
    <div
      className="flex items-center justify-between p-3 mb-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <div>
          <p className="font-medium text-sm">{t("autoSave.foundDraft")}</p>
          <p className="text-xs text-muted-foreground">
            {t("autoSave.savedAgo", { time: draftAge })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onDiscard}>
          <Trash2 className="h-4 w-4 mr-1" />
          {t("autoSave.discard")}
        </Button>
        <Button size="sm" onClick={onRestore}>
          <RefreshCw className="h-4 w-4 mr-1" />
          {t("autoSave.restore")}
        </Button>
      </div>
    </div>
  );
}

// Form with Auto-Save wrapper
interface AutoSaveFormProps {
  formKey: string;
  children: React.ReactNode;
  formData: any;
  onRestoreData: (data: any) => void;
  showIndicator?: boolean;
  showBanner?: boolean;
}

export function AutoSaveForm({
  formKey,
  children,
  formData,
  onRestoreData,
  showIndicator = true,
  showBanner = true,
}: AutoSaveFormProps) {
  const {
    status,
    lastSaved,
    hasDraft,
    draftAge,
    restoreDraft,
    clearDraft,
    forceSave,
  } = useAutoSave({
    key: formKey,
    data: formData,
    onRestore: onRestoreData,
  });

  return (
    <div>
      {showBanner && (
        <DraftRecoveryBanner
          hasDraft={hasDraft}
          draftAge={draftAge}
          onRestore={restoreDraft}
          onDiscard={clearDraft}
        />
      )}
      {children}
      {showIndicator && (
        <div className="mt-4 flex justify-end">
          <AutoSaveIndicator
            status={status}
            lastSaved={lastSaved}
            onForceSave={forceSave}
          />
        </div>
      )}
    </div>
  );
}
