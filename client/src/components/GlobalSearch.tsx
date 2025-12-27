import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  FileText,
  Users,
  Package,
  Receipt,
  CreditCard,
  Building2,
  Wallet,
  Settings,
  BarChart3,
  Calculator,
  Clock,
  ArrowRight,
  Command,
  Loader2,
  X,
  FileBarChart,
  Landmark,
  Briefcase,
  Scale,
} from "lucide-react";

interface SearchResult {
  id: string;
  type: "invoice" | "contact" | "item" | "account" | "expense" | "payment" | "journal" | "report" | "setting" | "page";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  route: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Static pages and navigation
const staticResults: SearchResult[] = [
  // Pages
  { id: "page-dashboard", type: "page", title: "globalSearch.pages.dashboard", subtitle: "globalSearch.pages.dashboardDesc", icon: <BarChart3 className="h-4 w-4" />, route: "/dashboard" },
  { id: "page-invoices", type: "page", title: "globalSearch.pages.invoices", subtitle: "globalSearch.pages.invoicesDesc", icon: <FileText className="h-4 w-4" />, route: "/invoices" },
  { id: "page-contacts", type: "page", title: "globalSearch.pages.contacts", subtitle: "globalSearch.pages.contactsDesc", icon: <Users className="h-4 w-4" />, route: "/contacts" },
  { id: "page-inventory", type: "page", title: "globalSearch.pages.inventory", subtitle: "globalSearch.pages.inventoryDesc", icon: <Package className="h-4 w-4" />, route: "/inventory" },
  { id: "page-expenses", type: "page", title: "globalSearch.pages.expenses", subtitle: "globalSearch.pages.expensesDesc", icon: <Receipt className="h-4 w-4" />, route: "/expenses" },
  { id: "page-accounts", type: "page", title: "globalSearch.pages.accounts", subtitle: "globalSearch.pages.accountsDesc", icon: <Calculator className="h-4 w-4" />, route: "/accounts" },
  { id: "page-journal", type: "page", title: "globalSearch.pages.journal", subtitle: "globalSearch.pages.journalDesc", icon: <FileBarChart className="h-4 w-4" />, route: "/journal" },
  { id: "page-banking", type: "page", title: "globalSearch.pages.banking", subtitle: "globalSearch.pages.bankingDesc", icon: <Landmark className="h-4 w-4" />, route: "/banking" },
  { id: "page-reports", type: "page", title: "globalSearch.pages.reports", subtitle: "globalSearch.pages.reportsDesc", icon: <BarChart3 className="h-4 w-4" />, route: "/reports" },
  { id: "page-tax", type: "page", title: "globalSearch.pages.tax", subtitle: "globalSearch.pages.taxDesc", icon: <Scale className="h-4 w-4" />, route: "/tax" },
  { id: "page-fixed-assets", type: "page", title: "globalSearch.pages.fixedAssets", subtitle: "globalSearch.pages.fixedAssetsDesc", icon: <Building2 className="h-4 w-4" />, route: "/fixed-assets" },
  { id: "page-projects", type: "page", title: "globalSearch.pages.projects", subtitle: "globalSearch.pages.projectsDesc", icon: <Briefcase className="h-4 w-4" />, route: "/projects" },
  { id: "page-settings", type: "page", title: "globalSearch.pages.settings", subtitle: "globalSearch.pages.settingsDesc", icon: <Settings className="h-4 w-4" />, route: "/settings" },
  { id: "page-quick-entry", type: "page", title: "globalSearch.pages.quickEntry", subtitle: "globalSearch.pages.quickEntryDesc", icon: <Clock className="h-4 w-4" />, route: "/quick-entry" },
  // Reports
  { id: "report-profit-loss", type: "report", title: "globalSearch.reports.profitLoss", subtitle: "globalSearch.reports.profitLossDesc", icon: <FileBarChart className="h-4 w-4" />, route: "/reports?report=profit-loss" },
  { id: "report-balance-sheet", type: "report", title: "globalSearch.reports.balanceSheet", subtitle: "globalSearch.reports.balanceSheetDesc", icon: <FileBarChart className="h-4 w-4" />, route: "/reports?report=balance-sheet" },
  { id: "report-cash-flow", type: "report", title: "globalSearch.reports.cashFlow", subtitle: "globalSearch.reports.cashFlowDesc", icon: <FileBarChart className="h-4 w-4" />, route: "/reports?report=cash-flow" },
  { id: "report-trial-balance", type: "report", title: "globalSearch.reports.trialBalance", subtitle: "globalSearch.reports.trialBalanceDesc", icon: <FileBarChart className="h-4 w-4" />, route: "/reports?report=trial-balance" },
  { id: "report-aging", type: "report", title: "globalSearch.reports.aging", subtitle: "globalSearch.reports.agingDesc", icon: <FileBarChart className="h-4 w-4" />, route: "/reports?report=aging" },
];

export default function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const isRTL = i18n.language === "ar";

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Search invoices
  const { data: invoices = [] } = useQuery<any[]>({
    queryKey: ["/api/sales/invoices"],
    enabled: query.length >= 2,
  });

  // Search contacts
  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ["/api/contacts"],
    enabled: query.length >= 2,
  });

  // Search items
  const { data: items = [] } = useQuery<any[]>({
    queryKey: ["/api/items"],
    enabled: query.length >= 2,
  });

  // Search accounts
  const { data: accounts = [] } = useQuery<any[]>({
    queryKey: ["/api/accounts"],
    enabled: query.length >= 2,
  });

  // Build search results
  const searchResults = useCallback((): SearchResult[] => {
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    if (!query) {
      // Show recent searches and popular pages
      return staticResults.slice(0, 8);
    }

    // Search static pages
    staticResults.forEach((item) => {
      const title = t(item.title).toLowerCase();
      const subtitle = item.subtitle ? t(item.subtitle).toLowerCase() : "";
      if (title.includes(lowerQuery) || subtitle.includes(lowerQuery)) {
        results.push({
          ...item,
          title: t(item.title),
          subtitle: item.subtitle ? t(item.subtitle) : undefined,
        });
      }
    });

    // Search invoices
    invoices
      .filter((inv: any) =>
        inv.invoiceNumber?.toLowerCase().includes(lowerQuery) ||
        inv.contactName?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5)
      .forEach((inv: any) => {
        results.push({
          id: `invoice-${inv.id}`,
          type: "invoice",
          title: `${t("common.invoice")} #${inv.invoiceNumber}`,
          subtitle: inv.contactName,
          icon: <FileText className="h-4 w-4" />,
          route: `/invoices/${inv.id}`,
          badge: inv.status,
          badgeVariant: inv.status === "paid" ? "default" : inv.status === "overdue" ? "destructive" : "secondary",
        });
      });

    // Search contacts
    contacts
      .filter((contact: any) =>
        contact.name?.toLowerCase().includes(lowerQuery) ||
        contact.email?.toLowerCase().includes(lowerQuery) ||
        contact.phone?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5)
      .forEach((contact: any) => {
        results.push({
          id: `contact-${contact.id}`,
          type: "contact",
          title: contact.name,
          subtitle: contact.email || contact.phone,
          icon: <Users className="h-4 w-4" />,
          route: `/contacts/${contact.id}`,
          badge: contact.type,
        });
      });

    // Search items
    items
      .filter((item: any) =>
        item.name?.toLowerCase().includes(lowerQuery) ||
        item.sku?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5)
      .forEach((item: any) => {
        results.push({
          id: `item-${item.id}`,
          type: "item",
          title: item.name,
          subtitle: item.sku ? `SKU: ${item.sku}` : undefined,
          icon: <Package className="h-4 w-4" />,
          route: `/inventory?item=${item.id}`,
          badge: item.quantity ? `${item.quantity} ${t("common.inStock")}` : undefined,
        });
      });

    // Search accounts
    accounts
      .filter((acc: any) =>
        acc.name?.toLowerCase().includes(lowerQuery) ||
        acc.code?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5)
      .forEach((acc: any) => {
        results.push({
          id: `account-${acc.id}`,
          type: "account",
          title: acc.name,
          subtitle: acc.code ? `${t("common.code")}: ${acc.code}` : undefined,
          icon: <Calculator className="h-4 w-4" />,
          route: `/accounts?id=${acc.id}`,
          badge: acc.type,
        });
      });

    return results;
  }, [query, invoices, contacts, items, accounts, t]);

  const results = searchResults();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case "Escape":
          onOpenChange(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, results, selectedIndex, onOpenChange]);

  // Handle selection
  const handleSelect = (result: SearchResult) => {
    // Save to recent searches
    if (query) {
      const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    }

    onOpenChange(false);
    setLocation(result.route);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const getTypeLabel = (type: SearchResult["type"]) => {
    const labels: Record<string, string> = {
      invoice: t("common.invoice"),
      contact: t("common.contact"),
      item: t("common.item"),
      account: t("common.account"),
      expense: t("common.expense"),
      payment: t("common.payment"),
      journal: t("common.journal"),
      report: t("common.report"),
      setting: t("common.setting"),
      page: t("common.page"),
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">{t("globalSearch.title")}</DialogTitle>
          <div className="relative">
            <Search className="absolute top-3 left-3 h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder={t("globalSearch.placeholder")}
              className="pl-10 pr-10 h-12 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="border-t">
          {/* Recent searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t("globalSearch.recentSearches")}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={clearRecentSearches}
                >
                  {t("common.clear")}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="h-7"
                    onClick={() => setQuery(search)}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Search results */}
          <ScrollArea className="max-h-[400px]">
            <div className="p-2">
              {results.length === 0 && query ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">{t("globalSearch.noResults")}</p>
                  <p className="text-sm">{t("globalSearch.noResultsDesc")}</p>
                </div>
              ) : (
                results.map((result, index) => (
                  <button
                    key={result.id}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      index === selectedIndex
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        index === selectedIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{result.title}</span>
                        {result.badge && (
                          <Badge variant={result.badgeVariant || "secondary"} className="text-xs">
                            {result.badge}
                          </Badge>
                        )}
                      </div>
                      {result.subtitle && (
                        <p className="text-sm text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer with shortcuts */}
          <div className="border-t p-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↓</kbd>
                {t("globalSearch.navigate")}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↵</kbd>
                {t("globalSearch.select")}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">esc</kbd>
                {t("globalSearch.close")}
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Command className="h-3 w-3" />K
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
