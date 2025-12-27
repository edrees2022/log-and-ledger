import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LegalConsentDialogProps {
  open: boolean;
  onAccept: () => void;
}

export function LegalConsentDialog({ open, onAccept }: LegalConsentDialogProps) {
  const { t } = useTranslation();
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  const allChecked = termsChecked && privacyChecked && disclaimerChecked;

  const consentVersion = (import.meta as any)?.env?.VITE_LEGAL_CONSENT_VERSION || '2025-11-01';

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {t('consentDialog.welcome')}
          </DialogTitle>
          <DialogDescription>
            {t('consentDialog.reviewTerms')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Important Notice */}
          <div className="bg-blue-50 dark:bg-blue-950 border-2 border-blue-400 dark:border-blue-600 rounded-lg p-4">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              {t('consentDialog.importantInfo')}
            </h3>
            <p className="text-sm">
              <strong>{t('consentDialog.softwareToolOnly')}</strong>.{" "}
              {t('consentDialog.notSubstitute')}.
            </p>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={termsChecked}
              onChange={(e) => {
                setTermsChecked(e.target.checked);
              }}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <div className="space-y-1 leading-none flex-1">
              <div className="text-sm font-medium leading-none">
                {t('consentDialog.readAndAgree')}{" "}
                <a 
                  href="/terms" 
                  className="text-primary hover:underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('footer.terms')}
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('consentDialog.termsDesc')}
              </p>
            </div>
          </div>

          {/* Privacy Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="privacy"
              checked={privacyChecked}
              onChange={(e) => {
                setPrivacyChecked(e.target.checked);
              }}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <div className="space-y-1 leading-none flex-1">
              <div className="text-sm font-medium leading-none">
                {t('consentDialog.readAndAgree')}{" "}
                <a 
                  href="/privacy" 
                  className="text-primary hover:underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('footer.privacy')}
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('consentDialog.privacyDesc')}
              </p>
            </div>
          </div>

          {/* Disclaimer Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="disclaimer"
              checked={disclaimerChecked}
              onChange={(e) => {
                setDisclaimerChecked(e.target.checked);
              }}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <div className="space-y-1 leading-none flex-1">
              <div className="text-sm font-medium leading-none">
                {t('consentDialog.readAndUnderstand')}{" "}
                <a 
                  href="/disclaimer" 
                  className="text-primary hover:underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('footer.disclaimer')}
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('consentDialog.disclaimerDesc')}
              </p>
            </div>
          </div>

          {/* Key Points Summary */}
          <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
            <p className="font-semibold">{t('consentDialog.byAccepting')}</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>{t('consentDialog.toolNotAdvice')}</li>
              <li>{t('consentDialog.responsibleForData')}</li>
              <li>{t('consentDialog.consultAccountant')}</li>
              <li>{t('consentDialog.limitedLiability')}</li>
              <li>{t('consentDialog.agreeToPrivacy')}</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-col">
          <Button
            onClick={() => {
              if (allChecked) {
                onAccept();
              } else {
                alert(t('consentDialog.alertCheckAll'));
              }
            }}
            disabled={!allChecked}
            className="w-full"
            size="lg"
          >
            {allChecked ? t('consentDialog.acceptContinue') : t('consentDialog.checkAll')}
          </Button>
          
          <Button
            onClick={async () => {
              try {
                const { auth } = await import('@/lib/firebase');
                const { signOut } = await import('firebase/auth');
                await signOut(auth);
                window.location.href = '/';
              } catch (error) {
                console.error('Sign out error:', error);
                window.location.href = '/';
              }
            }}
            variant="outline"
            className="w-full"
            size="sm"
          >
            {t('consentDialog.signOutSwitch')}
          </Button>
        </DialogFooter>

        <p className="text-xs text-center text-muted-foreground mt-2">
          {t('consentDialog.mustAccept', { version: consentVersion })}
        </p>
      </DialogContent>
    </Dialog>
  );
}
