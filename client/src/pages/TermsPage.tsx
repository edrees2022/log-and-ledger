import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, Shield, Scale, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TermsPage() {
  const currentYear = new Date().getFullYear();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl font-bold">{t('termsPage.title')}</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t('termsPage.lastUpdated')}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <Building2 className="inline h-4 w-4 me-1" />
            {t('termsPage.providedBy')} <strong>TibrCode Software Development</strong>
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8 py-8">
          {/* 1. Agreement */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Scale className="h-6 w-6" />
              {t('termsPage.sections.agreement.title')}
            </h2>
            <p className="mb-4 leading-relaxed">
              {t('termsPage.sections.agreement.content1')}
            </p>
            <p className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('termsPage.sections.agreement.content2') }} />
            <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 rounded-r-lg p-4">
              <p className="text-sm font-semibold mb-2">{t('termsPage.sections.agreement.noticeTitle')}</p>
              <p className="text-sm">
                {t('termsPage.sections.agreement.noticeContent')}
              </p>
            </div>
          </section>

          {/* 2. Service Description */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {t('termsPage.sections.serviceDescription.title')}
            </h2>
            <p className="mb-4 leading-relaxed">
              {t('termsPage.sections.serviceDescription.intro')}
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              {(t('termsPage.sections.serviceDescription.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4">
              <Shield className="inline h-5 w-5 text-primary me-2" />
              <span className="font-semibold">{t('termsPage.sections.serviceDescription.professionalSoftware.title')}</span> {t('termsPage.sections.serviceDescription.professionalSoftware.content')}
            </div>
          </section>

          {/* 3. Nature of Service - Critical Legal Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              {t('termsPage.sections.natureOfService.title')}
            </h2>
            <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-600 rounded-lg p-5 mb-4">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {t('termsPage.sections.natureOfService.critical.title')}
              </h3>
              <div className="space-y-3 text-sm">
                <p dangerouslySetInnerHTML={{ __html: t('termsPage.sections.natureOfService.critical.intro') }} />
                <ul className="list-disc pl-6 space-y-1">
                  {(t('termsPage.sections.natureOfService.critical.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <p className="mb-4 leading-relaxed">
              <strong>{t('termsPage.sections.natureOfService.noAdvice.title')}</strong> {t('termsPage.sections.natureOfService.noAdvice.content')}
            </p>
            
            <p className="mb-4 leading-relaxed">
              <strong>{t('termsPage.sections.natureOfService.userResponsibility.title')}</strong> {t('termsPage.sections.natureOfService.userResponsibility.intro')}
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              {(t('termsPage.sections.natureOfService.userResponsibility.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-400 dark:border-red-600 rounded-lg p-4">
              <p className="text-sm font-bold mb-2">{t('termsPage.sections.natureOfService.consultation.title')}</p>
              <p className="text-sm">
                {t('termsPage.sections.natureOfService.consultation.content')}
              </p>
            </div>
          </section>

          {/* 4. User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('termsPage.sections.userResponsibilities.title')}</h2>
            
            <h3 className="font-semibold text-lg mb-2">{t('termsPage.sections.userResponsibilities.accountSecurity.title')}</h3>
            <p className="mb-4">{t('termsPage.sections.userResponsibilities.accountSecurity.content')}</p>

            <h3 className="font-semibold text-lg mb-2">{t('termsPage.sections.userResponsibilities.dataAccuracy.title')}</h3>
            <p className="mb-4">{t('termsPage.sections.userResponsibilities.dataAccuracy.content')}</p>

            <h3 className="font-semibold text-lg mb-2">{t('termsPage.sections.userResponsibilities.legalCompliance.title')}</h3>
            <p className="mb-4">{t('termsPage.sections.userResponsibilities.legalCompliance.intro')}</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              {(t('termsPage.sections.userResponsibilities.legalCompliance.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3 className="font-semibold text-lg mb-2">{t('termsPage.sections.userResponsibilities.prohibitedUses.title')}</h3>
            <p className="mb-2">{t('termsPage.sections.userResponsibilities.prohibitedUses.intro')}</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              {(t('termsPage.sections.userResponsibilities.prohibitedUses.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* 5. Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('termsPage.sections.limitationOfLiability.title')}</h2>
            
            <div className="bg-gray-100 dark:bg-gray-800 border-2 border-gray-400 rounded-lg p-5 mb-4">
              <p className="font-bold mb-3">{t('termsPage.sections.limitationOfLiability.legalLimitation.title')}</p>
              <p className="mb-3">
                {t('termsPage.sections.limitationOfLiability.legalLimitation.intro')}
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                {(t('termsPage.sections.limitationOfLiability.legalLimitation.items', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <h3 className="font-semibold text-lg mb-2">{t('termsPage.sections.limitationOfLiability.maximumLiability.title')}</h3>
            <p className="mb-4">{t('termsPage.sections.limitationOfLiability.maximumLiability.content')}</p>

            <h3 className="font-semibold text-lg mb-2">{t('termsPage.sections.limitationOfLiability.basisOfBargain.title')}</h3>
            <p className="mb-4">{t('termsPage.sections.limitationOfLiability.basisOfBargain.content')}</p>
          </section>

          {/* 6. Warranties and Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('termsPage.sections.warranties.title')}</h2>
            
            <p className="mb-4 leading-relaxed">
              {t('termsPage.sections.warranties.disclaimer')}
            </p>

            <p className="mb-4 leading-relaxed">
              {t('termsPage.sections.warranties.noWarranties.intro')}
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              {(t('termsPage.sections.warranties.noWarranties.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* 7. Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('termsPage.sections.intellectualProperty.title')}</h2>
            
            <p className="mb-4 leading-relaxed">
              <strong>{t('termsPage.sections.intellectualProperty.ownership.title')}</strong> {t('termsPage.sections.intellectualProperty.ownership.content')}
            </p>

            <p className="mb-4 leading-relaxed">
              <strong>{t('termsPage.sections.intellectualProperty.license.title')}</strong> {t('termsPage.sections.intellectualProperty.license.content')}
            </p>

            <p className="mb-4 leading-relaxed">
              <strong>{t('termsPage.sections.intellectualProperty.userData.title')}</strong> {t('termsPage.sections.intellectualProperty.userData.content')}
            </p>
          </section>

          {/* 8. Termination */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('termsPage.sections.termination.title')}</h2>
            
            <p className="mb-4 leading-relaxed">
              <strong>{t('termsPage.sections.termination.byYou.title')}</strong> {t('termsPage.sections.termination.byYou.content')}
            </p>

            <p className="mb-4 leading-relaxed">
              <strong>{t('termsPage.sections.termination.byTibrCode.title')}</strong> {t('termsPage.sections.termination.byTibrCode.content')}
            </p>

            <p className="mb-4 leading-relaxed">
              <strong>{t('termsPage.sections.termination.effect.title')}</strong> {t('termsPage.sections.termination.effect.content')}
            </p>
          </section>

          {/* 9. Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('termsPage.sections.modifications.title')}</h2>
            
            <p className="mb-4 leading-relaxed">
              {t('termsPage.sections.modifications.content')}
            </p>
          </section>

          {/* 10. Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('termsPage.sections.governingLaw.title')}</h2>
            
            <p className="mb-4 leading-relaxed">
              <strong>{t('termsPage.sections.governingLaw.law.title')}</strong> {t('termsPage.sections.governingLaw.law.content')}
            </p>

            <p className="mb-4 leading-relaxed">
              <strong>{t('termsPage.sections.governingLaw.dispute.title')}</strong> {t('termsPage.sections.governingLaw.dispute.content')}
            </p>
          </section>

          {/* 11. General Provisions */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('termsPage.sections.generalProvisions.title')}</h2>
            
            <p className="mb-2 leading-relaxed"><strong>{t('termsPage.sections.generalProvisions.entireAgreement.title')}</strong> {t('termsPage.sections.generalProvisions.entireAgreement.content')}</p>
            <p className="mb-2 leading-relaxed"><strong>{t('termsPage.sections.generalProvisions.severability.title')}</strong> {t('termsPage.sections.generalProvisions.severability.content')}</p>
            <p className="mb-2 leading-relaxed"><strong>{t('termsPage.sections.generalProvisions.waiver.title')}</strong> {t('termsPage.sections.generalProvisions.waiver.content')}</p>
            <p className="mb-4 leading-relaxed"><strong>{t('termsPage.sections.generalProvisions.assignment.title')}</strong> {t('termsPage.sections.generalProvisions.assignment.content')}</p>
          </section>

          {/* 12. Contact */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('termsPage.sections.contact.title')}</h2>
            <p className="mb-2">{t('termsPage.sections.contact.intro')}</p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <p className="font-bold">{t('termsPage.sections.contact.details.company')}</p>
              <p>{t('termsPage.sections.contact.details.email')}</p>
              <p>{t('termsPage.sections.contact.details.support')}</p>
            </div>
          </section>


          {/* Footer */}
          <div className="mt-12 pt-6 border-t text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('termsPage.footer.rights', { year: currentYear })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('termsPage.footer.trademark')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
