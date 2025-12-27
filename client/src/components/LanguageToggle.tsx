import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTranslationContext } from "@/contexts/TranslationContext";

export function LanguageToggle() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, availableLanguages, isRTL } = useTranslationContext();

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-language-toggle">
          <Globe className="h-4 w-4 me-2" />
          <span className="text-sm">{currentLanguage.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between"
            data-testid={`option-language-${language.code}`}
          >
            <div className="flex items-center gap-2">
              <span>{language.name}</span>
              {currentLanguage.code === language.code && (
                <Badge variant="default" className="text-xs">{t('common.current')}</Badge>
              )}
            </div>
            {language.direction === "rtl" && (
              <Badge variant="secondary" className="text-xs">{t('common.rtl')}</Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
