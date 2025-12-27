import { Link } from "wouter";
import { useTranslation } from "react-i18next";

import PageContainer from "@/components/layout/PageContainer";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background shrink-0 w-full max-w-full mb-14 md:mb-24">
      <PageContainer className="py-2">
        {/* Compact footer for all screen sizes */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-start min-w-0">
          {/* Links */}
          <div className="flex items-center gap-2 text-xs">
            <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.terms')}</a>
            <span className="text-muted-foreground">•</span>
            <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.privacy')}</a>
            <span className="text-muted-foreground">•</span>
            <a href="/disclaimer" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.disclaimer')}</a>
          </div>
          {/* Copyright */}
          <p className="text-xs text-muted-foreground">{t('footer.copyright', { year: currentYear })}</p>
        </div>
      </PageContainer>
    </footer>
  );
}
