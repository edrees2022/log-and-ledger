import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, FileText } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AdBanner } from "@/components/AdBanner";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/portal/logout');
    },
    onSuccess: () => {
      setLocation('/portal/login');
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-primary">{t("portal.clientPortal", "Client Portal")}</h1>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/portal/dashboard">
              <span className={`flex items-center gap-2 cursor-pointer hover:text-primary ${location === '/portal/dashboard' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                <LayoutDashboard className="h-4 w-4" />
                {t("portal.dashboard", "Dashboard")}
              </span>
            </Link>
            <Link href="/portal/documents">
              <span className={`flex items-center gap-2 cursor-pointer hover:text-primary ${location === '/portal/documents' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                <FileText className="h-4 w-4" />
                {t("portal.documents", "Documents")}
              </span>
            </Link>
          </nav>
        </div>
        <Button variant="ghost" size="sm" onClick={() => logoutMutation.mutate()}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("portal.logout", "Logout")}
        </Button>
      </header>

      {/* Content */}
      <main className="container mx-auto py-8 px-4 pb-20">
        {children}
      </main>

      {/* Ad Banner at bottom */}
      <AdBanner />
    </div>
  );
}
