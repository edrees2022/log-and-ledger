import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { auth } from '@/lib/firebase';
import { Capacitor } from '@capacitor/core';

export default function LegalSettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, acceptLegalConsent } = useAuth();
  const [serverVersion, setServerVersion] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [consentMeta, setConsentMeta] = useState<{ last_ip?: string|null; last_user_agent?: string|null }|null>(null);
  const [localStorageConsent, setLocalStorageConsent] = useState<{ accepted: boolean; date: string | null }>({ accepted: false, date: null });

  const clientVersion = (import.meta as any)?.env?.VITE_LEGAL_CONSENT_VERSION || '2025-11-01';

  useEffect(() => {
    // Check localStorage for mobile consent
    if (user && Capacitor.isNativePlatform()) {
      const keyById = `legal_consent_${user.id}`;
      const keyByEmail = user.email ? `legal_consent_${user.email}` : '';
      const hasAccepted = (localStorage.getItem(keyById) === 'true') || (keyByEmail && localStorage.getItem(keyByEmail) === 'true');
      const acceptedDate = localStorage.getItem(`legal_consent_${user.id}_date`);
      
      setLocalStorageConsent({ 
        accepted: Boolean(hasAccepted), 
        date: acceptedDate 
      });
      
      console.log('📱 Mobile localStorage consent:', { hasAccepted, acceptedDate });
    }
    
    (async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        
        const idToken = await currentUser.getIdToken();
        
        const res = await fetch('/api/legal/info', { 
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${idToken}`,
          }
        });
        if (res.ok) {
          const data = await res.json();
          setServerVersion(data?.consent_version || null);
        }
      } catch {}
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        
        const idToken = await currentUser.getIdToken();
        
        const res2 = await fetch('/api/users/consent', { 
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${idToken}`,
          }
        });
        if (res2.ok) {
          const data2 = await res2.json();
          setConsentMeta({ last_ip: data2?.last_ip || null, last_user_agent: data2?.last_user_agent || null });
        }
      } catch {}
    })();
  }, []);

  const version = serverVersion || clientVersion;

  // On mobile, use localStorage as source of truth if backend hasn't synced yet
  const isMobile = Capacitor.isNativePlatform();
  const accepted = isMobile && localStorageConsent.accepted 
    ? true 
    : (user?.legal_consent_accepted === true);
    
  const acceptedAt = isMobile && localStorageConsent.date
    ? new Date(localStorageConsent.date).toLocaleString(i18n.language)
    : (user?.legal_consent_date ? new Date(user.legal_consent_date).toLocaleString(i18n.language) : null);

  const handlePrintAck = () => {
    const now = new Date();
    
    // Debug: Check user data
    console.log('🖨️ Printing acknowledgment with user data:', {
      user,
      full_name: user?.full_name,
      email: user?.email,
      id: user?.id,
      company_id: user?.company_id,
      consentMeta
    });
    
    // Ensure we have user data
    if (!user) {
      alert(t('settings.legal.userDataNotAvailable'));
      return;
    }
    
    const w = window.open('', '_blank');
    if (!w) {
      alert(t('settings.legal.popupBlocked'));
      return;
    }
    
    // Format dates nicely
    const acceptedDate = acceptedAt || 'Not yet accepted';
    const generatedDate = now.toLocaleDateString(i18n.language, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    // Prepare data with fallbacks
    const userData = {
      fullName: user.full_name || user.email?.split('@')[0] || 'Unknown User',
      email: user.email || 'No email provided',
      userId: user.id || 'No ID',
      companyId: user.company_id || 'No Company ID'
    };
    
    console.log('📄 Prepared user data for print:', userData);
    
    const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Log & Ledger Pro - Legal Consent Acknowledgment</title>
        <style>
          @media print {
            @page { margin: 2cm; }
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
          
          * { box-sizing: border-box; }
          
          body { 
            font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; 
            margin: 0;
            padding: 40px;
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            color: #1a1a1a;
            line-height: 1.6;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
          }
          
          .logo {
            font-size: 32px;
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          
          .subtitle {
            font-size: 18px;
            color: #64748b;
            font-weight: 500;
          }
          
          h1 { 
            font-size: 28px; 
            margin: 30px 0 10px 0;
            color: #1e293b;
            font-weight: 700;
          }
          
          h2 { 
            font-size: 20px; 
            margin-top: 30px;
            margin-bottom: 15px;
            color: #334155;
            font-weight: 600;
            border-inline-start: 4px solid #2563eb;
            padding-inline-start: 12px;
          }
          
          .info-section {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          
          .info-row {
            display: flex;
            flex-direction: column;
            margin-bottom: 12px;
          }
          
          .info-label {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          
          .info-value {
            font-size: 15px;
            color: #1e293b;
            font-weight: 500;
          }
          
          code { 
            background: #e0e7ff; 
            color: #3730a3;
            padding: 3px 8px; 
            border-radius: 6px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            font-weight: 600;
          }
          
          .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            background: #10b981;
            color: white;
          }
          
          .summary-box {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
          }
          
          .summary-box ul {
            margin: 12px 0;
            padding-inline-start: 24px;
          }
          
          .summary-box li {
            margin: 10px 0;
            color: #334155;
            line-height: 1.7;
          }
          
          .consent-items {
            display: grid;
            gap: 12px;
            margin: 20px 0;
          }
          
          .consent-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            background: #f0fdf4;
            border: 2px solid #86efac;
            border-radius: 8px;
          }
          
          .consent-item::before {
            content: '✓';
            display: inline-block;
            width: 24px;
            height: 24px;
            background: #10b981;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 24px;
            margin-inline-end: 12px;
            font-weight: bold;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 13px;
          }
          
          .footer-note {
            background: #fef3c7;
            border: 2px solid #fbbf24;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            color: #92400e;
            font-size: 13px;
          }
          
          .signature-section {
            margin-top: 40px;
            padding: 20px;
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
            background: #f8fafc;
          }
          
          @media print {
            .info-grid { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Log & Ledger Pro</div>
          <div class="subtitle">Accounting & Financial Management Platform</div>
        </div>

        <h1>Legal Consent Acknowledgment</h1>
        
        <div class="info-section">
          <h2 style="margin-top: 0; border: none; padding: 0;">User Information</h2>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Full Name</span>
              <span class="info-value">${userData.fullName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email Address</span>
              <span class="info-value">${userData.email}</span>
            </div>
            <div class="info-row">
              <span class="info-label">User ID</span>
              <span class="info-value"><code>${userData.userId}</code></span>
            </div>
            <div class="info-row">
              <span class="info-label">Company ID</span>
              <span class="info-value"><code>${userData.companyId}</code></span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2 style="margin-top: 0; border: none; padding: 0;">Consent Details</h2>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Status</span>
              <span class="info-value"><span class="status-badge">${accepted ? '✓ Accepted' : '✗ Not Accepted'}</span></span>
            </div>
            <div class="info-row">
              <span class="info-label">Accepted Date & Time</span>
              <span class="info-value">${acceptedDate}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Legal Version</span>
              <span class="info-value"><code>${user?.legal_consent_version || version}</code></span>
            </div>
            <div class="info-row">
              <span class="info-label">Document Generated</span>
              <span class="info-value">${generatedDate}</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2 style="margin-top: 0; border: none; padding: 0;">Technical Details (Audit Trail)</h2>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">IP Address</span>
              <span class="info-value">${consentMeta?.last_ip || 'Not recorded'}</span>
            </div>
            <div class="info-row" style="grid-column: 1 / -1;">
              <span class="info-label">User Agent (Browser/Device)</span>
              <span class="info-value" style="font-size: 12px; word-break: break-all;">${consentMeta?.last_user_agent || navigator.userAgent}</span>
            </div>
          </div>
        </div>

        <h2>Items Accepted</h2>
        <div class="consent-items">
          <div class="consent-item">
            <strong>Terms of Service</strong> — Service usage terms and conditions
          </div>
          <div class="consent-item">
            <strong>Privacy Policy</strong> — Data collection and protection practices
          </div>
          <div class="consent-item">
            <strong>Disclaimer</strong> — Limitation of liability and service scope
          </div>
        </div>

        <h2>Key Acknowledgments</h2>
        <div class="summary-box">
          <p><strong>By accepting, the user acknowledges that:</strong></p>
          <ul>
            <li><strong>Software Tool:</strong> Log & Ledger Pro is a comprehensive accounting and financial management platform designed to assist with bookkeeping and financial tracking.</li>
            <li><strong>User Responsibility:</strong> Users maintain full responsibility for the accuracy of data entered and business decisions made based on information from the platform.</li>
            <li><strong>Professional Consultation:</strong> We strongly recommend consulting with certified accountants, tax professionals, or legal advisors for tax compliance, financial planning, and regulatory matters.</li>
            <li><strong>Service Terms:</strong> Our Terms of Service clearly outline service provisions, user responsibilities, and the scope of our platform's capabilities.</li>
            <li><strong>Data Privacy:</strong> Your data privacy and security are protected under our comprehensive Privacy Policy, which details how we collect, use, and safeguard your information.</li>
            <li><strong>No Financial Advice:</strong> This platform does not provide financial, tax, or legal advice. All features are tools for data management and reporting only.</li>
          </ul>
        </div>

        <div class="footer-note">
          <strong>⚠️ Legal Notice:</strong> This document serves as a record of legal consent acceptance. It is legally binding and should be retained for compliance and audit purposes. The timestamp and technical details provide proof of consent.
        </div>

        <div class="signature-section">
          <p style="margin: 0 0 8px 0;"><strong>Digital Signature:</strong></p>
          <p style="margin: 0; color: #64748b; font-size: 13px;">
            By accepting the terms on ${acceptedDate}, the user electronically signed this agreement.
            This constitutes a legally binding electronic signature under applicable e-signature laws.
          </p>
        </div>

        <div class="footer">
          <p style="margin: 8px 0;"><strong>Log & Ledger Pro</strong></p>
          <p style="margin: 4px 0;">© ${now.getFullYear()} All Rights Reserved</p>
          <p style="margin: 4px 0; font-size: 11px;">
            Document ID: ${userData.userId !== 'No ID' ? `LGL-${userData.userId.substring(0, 8).toUpperCase()}-${now.getTime()}` : `LGL-${now.getTime()}`}
          </p>
        </div>

        <script>
          // Auto-print when page loads
          window.onload = () => {
            setTimeout(() => window.print(), 500);
          };
        </script>
      </body>
      </html>`;
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('settings.legal.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('settings.legal.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.legal.consentStatus')}</CardTitle>
          <CardDescription>
            {t('settings.legal.currentLegalVersion')}: <code>{version}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border p-4 bg-muted/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-sm text-muted-foreground">{t('settings.legal.status')}</div>
                <div className="text-base font-medium">
                  {accepted ? t('settings.legal.accepted') : t('settings.legal.notAccepted')}
                </div>
                {acceptedAt && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {t('settings.legal.acceptedAt')}: {acceptedAt}
                  </div>
                )}
                {user?.legal_consent_version && (
                  <div className="text-sm text-muted-foreground">
                    {t('settings.legal.acceptedVersion')}: <code>{user.legal_consent_version}</code>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {!accepted && (
                  <Button onClick={async () => { setPending(true); try { await acceptLegalConsent(); window.location.reload(); } finally { setPending(false); } }} disabled={pending}>
                    {pending ? t('common.saving') : t('settings.legal.acceptNow')}
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={async () => {
                    setPending(true);
                    try {
                      const currentUser = auth.currentUser;
                      if (!currentUser) {
                        alert(t('settings.legal.pleaseSignIn'));
                        return;
                      }
                      
                      const idToken = await currentUser.getIdToken();
                      const response = await fetch('/api/users/sync-from-firebase', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${idToken}`,
                          'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                      });
                      
                      if (response.ok) {
                        alert(t('settings.legal.syncSuccess'));
                        window.location.reload();
                      } else {
                        const error = await response.json();
                        alert(`${t('settings.legal.syncError')}: ${error.message || 'Unknown error'}`);
                      }
                    } catch (error) {
                      console.error('Sync error:', error);
                      alert(t('settings.legal.syncError'));
                    } finally {
                      setPending(false);
                    }
                  }}
                  disabled={pending}
                >
                  🔄 {t('settings.legal.syncFromGoogle')}
                </Button>
                <Button variant="secondary" onClick={handlePrintAck}>
                  {t('settings.legal.downloadAck')}
                </Button>
                <Button variant="outline" asChild>
                  <a href="/terms" target="_blank" rel="noopener noreferrer">{t('settings.legal.viewTerms')}</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/privacy" target="_blank" rel="noopener noreferrer">{t('settings.legal.viewPrivacy')}</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/disclaimer" target="_blank" rel="noopener noreferrer">{t('settings.legal.viewDisclaimer')}</a>
                </Button>
                {import.meta.env.DEV && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      if (user) {
                        localStorage.removeItem(`legal_consent_${user.id}`);
                        if (user.email) localStorage.removeItem(`legal_consent_${user.email}`);
                        localStorage.removeItem(`legal_consent_${user.id}_date`);
                        alert('localStorage cleared. Refresh to test.');
                      }
                    }}
                  >
                    🧪 Clear localStorage (Dev)
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.legal.summary')}</CardTitle>
          <CardDescription>{t('settings.consentDialog.byAccepting')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>{t('settings.consentDialog.toolNotAdvice')}</li>
            <li>{t('settings.consentDialog.responsibleForData')}</li>
            <li>{t('settings.consentDialog.consultAccountant')}</li>
            <li>{t('settings.consentDialog.limitedLiability')}</li>
            <li>{t('settings.consentDialog.agreeToPrivacy')}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
