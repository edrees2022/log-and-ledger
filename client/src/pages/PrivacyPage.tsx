import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Lock, Shield, Eye, Database, UserCheck, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl font-bold">{t('privacyPage.title')}</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t('privacyPage.lastUpdated')}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <Building2 className="inline h-4 w-4 me-1" />
            {t('privacyPage.providedBy')} <strong>TibrCode Software Development</strong>
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8 py-8">
          {/* 1. Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              {t('privacyPage.sections.introduction.title')}
            </h2>
            <p className="mb-4 leading-relaxed">
              {t('privacyPage.sections.introduction.content1')}
            </p>
            <p className="mb-4 leading-relaxed">
              {t('privacyPage.sections.introduction.content2')}
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 rounded-r-lg p-4">
              <p className="text-sm font-semibold mb-2">{t('privacyPage.sections.introduction.rightsTitle')}</p>
              <p className="text-sm">
                {t('privacyPage.sections.introduction.rightsContent')}
              </p>
            </div>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Database className="h-6 w-6" />
              {t('privacyPage.sections.informationCollected.title')}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* What We Collect */}
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-5">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  {t('privacyPage.sections.informationCollected.whatWeCollect.title')}
                </h3>
                <ul className="space-y-2 text-sm">
                  {(t('privacyPage.sections.informationCollected.whatWeCollect.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ul>
              </div>

              {/* What We DON'T Collect */}
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-5">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  {t('privacyPage.sections.informationCollected.whatWeDontCollect.title')}
                </h3>
                <ul className="space-y-2 text-sm">
                  {(t('privacyPage.sections.informationCollected.whatWeDontCollect.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <h3 className="font-semibold text-lg mb-2">{t('privacyPage.sections.informationCollected.dataYouProvide.title')}</h3>
            <p className="mb-4">
              {t('privacyPage.sections.informationCollected.dataYouProvide.content')}
            </p>

            <h3 className="font-semibold text-lg mb-2">{t('privacyPage.sections.informationCollected.dataCollectedAutomatically.title')}</h3>
            <p className="mb-4">
              {t('privacyPage.sections.informationCollected.dataCollectedAutomatically.content')}
            </p>

            <h3 className="font-semibold text-lg mb-2">{t('privacyPage.sections.informationCollected.cookies.title')}</h3>
            <p className="mb-4">
              {t('privacyPage.sections.informationCollected.cookies.content')}
            </p>
          </section>

          {/* 3. How We Use Your Data */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('privacyPage.sections.howWeUseData.title')}</h2>
            
            <p className="mb-4">{t('privacyPage.sections.howWeUseData.intro')}</p>
            
            <div className="space-y-3">
              {(t('privacyPage.sections.howWeUseData.purposes', { returnObjects: true }) as any[]).map((purpose, index) => (
                <div key={index} className="bg-muted rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{purpose.title}</h4>
                  <p className="text-sm">{purpose.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400 rounded-lg p-4 mt-4">
              <p className="text-sm font-semibold mb-2">{t('privacyPage.sections.howWeUseData.weDoNot.title')}</p>
              <ul className="text-sm space-y-1">
                {(t('privacyPage.sections.howWeUseData.weDoNot.items', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* 4. Legal Basis (GDPR) */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Globe className="h-6 w-6" />
              {t('privacyPage.sections.legalBasis.title')}
            </h2>
            
            <p className="mb-4">{t('privacyPage.sections.legalBasis.intro')}</p>
            
            <ul className="space-y-3">
              {(t('privacyPage.sections.legalBasis.items', { returnObjects: true }) as any[]).map((item, index) => (
                <li key={index} className="flex gap-3">
                  <span className="font-semibold min-w-[140px]">{item.title}</span>
                  <span>{item.desc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 5. Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('privacyPage.sections.dataSharing.title')}</h2>
            
            <p className="mb-4">{t('privacyPage.sections.dataSharing.intro')}</p>

            <h3 className="font-semibold text-lg mb-2">{t('privacyPage.sections.dataSharing.serviceProviders.title')}</h3>
            <p className="mb-4">
              {t('privacyPage.sections.dataSharing.serviceProviders.intro')}
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              {(t('privacyPage.sections.dataSharing.serviceProviders.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>

            <h3 className="font-semibold text-lg mb-2">{t('privacyPage.sections.dataSharing.legalRequirements.title')}</h3>
            <p className="mb-4">
              {t('privacyPage.sections.dataSharing.legalRequirements.content')}
            </p>

            <h3 className="font-semibold text-lg mb-2">{t('privacyPage.sections.dataSharing.businessTransfers.title')}</h3>
            <p className="mb-4">
              {t('privacyPage.sections.dataSharing.businessTransfers.content')}
            </p>

            <h3 className="font-semibold text-lg mb-2">{t('privacyPage.sections.dataSharing.withConsent.title')}</h3>
            <p className="mb-4">
              {t('privacyPage.sections.dataSharing.withConsent.content')}
            </p>
          </section>

          {/* 6. Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6" />
              {t('privacyPage.sections.dataSecurity.title')}
            </h2>
            
            <p className="mb-4 leading-relaxed">
              {t('privacyPage.sections.dataSecurity.intro')}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t('privacyPage.sections.dataSecurity.technical.title')}
                </h4>
                <ul className="text-sm space-y-1">
                  {(t('privacyPage.sections.dataSecurity.technical.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  {t('privacyPage.sections.dataSecurity.organizational.title')}
                </h4>
                <ul className="text-sm space-y-1">
                  {(t('privacyPage.sections.dataSecurity.organizational.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-400 rounded-lg p-4 mt-4">
              <p className="text-sm font-bold mb-2">{t('privacyPage.sections.dataSecurity.notice.title')}</p>
              <p className="text-sm">
                {t('privacyPage.sections.dataSecurity.notice.content')}
              </p>
            </div>
          </section>

          {/* 7. Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('privacyPage.sections.dataRetention.title')}</h2>
            
            <p className="mb-4">{t('privacyPage.sections.dataRetention.intro')}</p>
            
            <ul className="space-y-2 mb-4">
              {(t('privacyPage.sections.dataRetention.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          </section>

          {/* 8. Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('privacyPage.sections.yourRights.title')}</h2>
            
            <p className="mb-4">{t('privacyPage.sections.yourRights.intro')}</p>

            <div className="space-y-3">
              {(t('privacyPage.sections.yourRights.rights', { returnObjects: true }) as any[]).map((right, index) => (
                <div key={index} className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4">
                  <h4 className="font-semibold mb-1">{right.title}</h4>
                  <p className="text-sm">{right.desc}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm" dangerouslySetInnerHTML={{ __html: t('privacyPage.sections.yourRights.contact') }} />
          </section>

          {/* 9. International Transfers */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('privacyPage.sections.internationalTransfers.title')}</h2>
            
            <p className="mb-4">
              {t('privacyPage.sections.internationalTransfers.content')}
            </p>
          </section>

          {/* 10. Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('privacyPage.sections.childrensPrivacy.title')}</h2>
            
            <p className="mb-4">
              {t('privacyPage.sections.childrensPrivacy.content')}
            </p>
          </section>

          {/* 11. Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('privacyPage.sections.changesToPolicy.title')}</h2>
            
            <p className="mb-4">
              {t('privacyPage.sections.changesToPolicy.content')}
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('privacyPage.sections.contactUs.title')}</h2>
            <p className="mb-4">{t('privacyPage.sections.contactUs.intro')}</p>
            <div className="bg-muted rounded-lg p-5">
              <p className="font-semibold mb-2">{t('privacyPage.sections.contactUs.details.company')}</p>
              <p className="mb-1" dangerouslySetInnerHTML={{ __html: t('privacyPage.sections.contactUs.details.dpo') }} />
              <p className="mb-1" dangerouslySetInnerHTML={{ __html: t('privacyPage.sections.contactUs.details.support') }} />
              <p className="mb-3" dangerouslySetInnerHTML={{ __html: t('privacyPage.sections.contactUs.details.legal') }} />
              <p className="text-sm text-muted-foreground">
                {t('privacyPage.sections.contactUs.details.responseTime')}
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('privacyPage.footer.rights', { year: currentYear })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('privacyPage.footer.compliance')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
