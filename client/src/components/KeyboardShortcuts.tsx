import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  Keyboard,
  Search,
  Plus,
  Home,
  FileText,
  Users,
  Package,
  Settings,
  Moon,
  Sun,
  Globe,
  Save,
  Printer,
  X,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  BarChart3,
  Receipt,
  Calculator,
  FileBarChart,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface ShortcutGroup {
  title: string;
  shortcuts: Shortcut[];
}

interface Shortcut {
  keys: string[];
  description: string;
  action?: () => void;
  icon?: React.ReactNode;
}

interface KeyboardShortcutsProps {
  onOpenSearch?: () => void;
  onNewInvoice?: () => void;
  onNewContact?: () => void;
  onNewItem?: () => void;
  onSave?: () => void;
  onPrint?: () => void;
}

export default function KeyboardShortcuts({
  onOpenSearch,
  onNewInvoice,
  onNewContact,
  onNewItem,
  onSave,
  onPrint,
}: KeyboardShortcutsProps) {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const [showHelp, setShowHelp] = useState(false);
  const isRTL = i18n.language === "ar";
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKey = isMac ? "⌘" : "Ctrl";

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Toggle language
  const toggleLanguage = useCallback(() => {
    i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
  }, [i18n]);

  // Define shortcuts
  const shortcutGroups: ShortcutGroup[] = [
    {
      title: t("shortcuts.navigation"),
      shortcuts: [
        {
          keys: [modKey, "K"],
          description: t("shortcuts.openSearch"),
          action: onOpenSearch,
          icon: <Search className="h-4 w-4" />,
        },
        {
          keys: [modKey, "H"],
          description: t("shortcuts.goHome"),
          action: () => setLocation("/dashboard"),
          icon: <Home className="h-4 w-4" />,
        },
        {
          keys: [modKey, "1"],
          description: t("shortcuts.goToInvoices"),
          action: () => setLocation("/invoices"),
          icon: <FileText className="h-4 w-4" />,
        },
        {
          keys: [modKey, "2"],
          description: t("shortcuts.goToContacts"),
          action: () => setLocation("/contacts"),
          icon: <Users className="h-4 w-4" />,
        },
        {
          keys: [modKey, "3"],
          description: t("shortcuts.goToInventory"),
          action: () => setLocation("/inventory"),
          icon: <Package className="h-4 w-4" />,
        },
        {
          keys: [modKey, "4"],
          description: t("shortcuts.goToExpenses"),
          action: () => setLocation("/expenses"),
          icon: <Receipt className="h-4 w-4" />,
        },
        {
          keys: [modKey, "5"],
          description: t("shortcuts.goToAccounts"),
          action: () => setLocation("/accounts"),
          icon: <Calculator className="h-4 w-4" />,
        },
        {
          keys: [modKey, "6"],
          description: t("shortcuts.goToReports"),
          action: () => setLocation("/reports"),
          icon: <BarChart3 className="h-4 w-4" />,
        },
        {
          keys: [modKey, ","],
          description: t("shortcuts.goToSettings"),
          action: () => setLocation("/settings"),
          icon: <Settings className="h-4 w-4" />,
        },
      ],
    },
    {
      title: t("shortcuts.actions"),
      shortcuts: [
        {
          keys: [modKey, "N"],
          description: t("shortcuts.newInvoice"),
          action: onNewInvoice,
          icon: <Plus className="h-4 w-4" />,
        },
        {
          keys: [modKey, "Shift", "C"],
          description: t("shortcuts.newContact"),
          action: onNewContact,
          icon: <Users className="h-4 w-4" />,
        },
        {
          keys: [modKey, "Shift", "I"],
          description: t("shortcuts.newItem"),
          action: onNewItem,
          icon: <Package className="h-4 w-4" />,
        },
        {
          keys: [modKey, "S"],
          description: t("shortcuts.save"),
          action: onSave,
          icon: <Save className="h-4 w-4" />,
        },
        {
          keys: [modKey, "P"],
          description: t("shortcuts.print"),
          action: onPrint,
          icon: <Printer className="h-4 w-4" />,
        },
      ],
    },
    {
      title: t("shortcuts.appearance"),
      shortcuts: [
        {
          keys: [modKey, "Shift", "D"],
          description: t("shortcuts.toggleTheme"),
          action: toggleTheme,
          icon: theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
        },
        {
          keys: [modKey, "Shift", "L"],
          description: t("shortcuts.toggleLanguage"),
          action: toggleLanguage,
          icon: <Globe className="h-4 w-4" />,
        },
      ],
    },
    {
      title: t("shortcuts.general"),
      shortcuts: [
        {
          keys: ["Esc"],
          description: t("shortcuts.closeDialog"),
          icon: <X className="h-4 w-4" />,
        },
        {
          keys: [modKey, "?"],
          description: t("shortcuts.showHelp"),
          action: () => setShowHelp(true),
          icon: <HelpCircle className="h-4 w-4" />,
        },
        {
          keys: isRTL ? ["←"] : ["→"],
          description: t("shortcuts.next"),
          icon: isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />,
        },
        {
          keys: isRTL ? ["→"] : ["←"],
          description: t("shortcuts.previous"),
          icon: isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />,
        },
      ],
    },
  ];

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // Prevent default for our shortcuts
      if (mod) {
        // Search: Cmd/Ctrl + K
        if (e.key === "k" && !e.shiftKey) {
          e.preventDefault();
          onOpenSearch?.();
          return;
        }

        // Home: Cmd/Ctrl + H
        if (e.key === "h" && !e.shiftKey) {
          e.preventDefault();
          setLocation("/dashboard");
          return;
        }

        // Navigation: Cmd/Ctrl + 1-6
        if (!e.shiftKey) {
          const routes: Record<string, string> = {
            "1": "/invoices",
            "2": "/contacts",
            "3": "/inventory",
            "4": "/expenses",
            "5": "/accounts",
            "6": "/reports",
          };
          if (routes[e.key]) {
            e.preventDefault();
            setLocation(routes[e.key]);
            return;
          }
        }

        // Settings: Cmd/Ctrl + ,
        if (e.key === ",") {
          e.preventDefault();
          setLocation("/settings");
          return;
        }

        // New invoice: Cmd/Ctrl + N
        if (e.key === "n" && !e.shiftKey) {
          e.preventDefault();
          onNewInvoice?.();
          return;
        }

        // New contact: Cmd/Ctrl + Shift + C
        if (e.key === "c" && e.shiftKey) {
          e.preventDefault();
          onNewContact?.();
          return;
        }

        // New item: Cmd/Ctrl + Shift + I
        if (e.key === "i" && e.shiftKey) {
          e.preventDefault();
          onNewItem?.();
          return;
        }

        // Save: Cmd/Ctrl + S
        if (e.key === "s" && !e.shiftKey) {
          e.preventDefault();
          onSave?.();
          return;
        }

        // Print: Cmd/Ctrl + P
        if (e.key === "p" && !e.shiftKey) {
          e.preventDefault();
          onPrint?.();
          return;
        }

        // Toggle theme: Cmd/Ctrl + Shift + D
        if (e.key === "d" && e.shiftKey) {
          e.preventDefault();
          toggleTheme();
          return;
        }

        // Toggle language: Cmd/Ctrl + Shift + L
        if (e.key === "l" && e.shiftKey) {
          e.preventDefault();
          toggleLanguage();
          return;
        }

        // Help: Cmd/Ctrl + ?
        if (e.key === "/" && e.shiftKey) {
          e.preventDefault();
          setShowHelp(true);
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isMac,
    onOpenSearch,
    onNewInvoice,
    onNewContact,
    onNewItem,
    onSave,
    onPrint,
    toggleTheme,
    toggleLanguage,
    setLocation,
  ]);

  return (
    <Dialog open={showHelp} onOpenChange={setShowHelp}>
      <DialogContent className="max-w-2xl" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            {t("shortcuts.title")}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {shortcutGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, shortcutIndex) => (
                    <div
                      key={shortcutIndex}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                          {shortcut.icon}
                        </div>
                        <span className="text-sm">{shortcut.description}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-muted rounded text-xs font-medium min-w-[24px] text-center">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {groupIndex < shortcutGroups.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-center gap-2 pt-4 border-t text-sm text-muted-foreground">
          <Badge variant="outline" className="gap-1">
            <Command className="h-3 w-3" />
            {modKey}
          </Badge>
          <span>+</span>
          <Badge variant="outline">?</Badge>
          <span>{t("shortcuts.toOpenHelp")}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for keyboard shortcuts
export function useKeyboardShortcuts() {
  const [showSearch, setShowSearch] = useState(false);

  return {
    showSearch,
    setShowSearch,
    openSearch: () => setShowSearch(true),
  };
}
