import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Info, AlertCircle, Scale, Shield, FileText, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DisclaimerPage() {
  const currentYear = new Date().getFullYear();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl font-bold">{t('disclaimerPage.title')}</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t('disclaimerPage.lastUpdated')}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <Building2 className="inline h-4 w-4 me-1" />
            {t('disclaimerPage.providedBy')} <strong>{t('disclaimerPage.companyName')}</strong>
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8 py-8">
          {/* 1. Important Information */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              {t('disclaimerPage.sections.importantInfo.title')}
            </h2>
            
            <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-600 rounded-lg p-5 mb-4">
              <h3 className="font-bold text-lg mb-3">{t('disclaimerPage.sections.importantInfo.criticalDisclaimer')}</h3>
              <p className="leading-relaxed">
                <strong>{t('disclaimerPage.sections.importantInfo.softwareOnly')}</strong> {t('disclaimerPage.sections.importantInfo.notSubstitute')}
              </p>
            </div>

            <p className="mb-4 leading-relaxed">
              {t('disclaimerPage.sections.importantInfo.acknowledgment')}
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              {(t('disclaimerPage.sections.importantInfo.points', { returnObjects: true }) as string[]).map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </section>

          {/* 2. Service Definition */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Info className="h-6 w-6" />
              {t('disclaimerPage.sections.serviceDefinition.title')}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* What We Provide */}
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-5">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  {t('disclaimerPage.sections.serviceDefinition.whatWeProvide.title')}
                </h3>
                <ul className="space-y-2 text-sm">
                  {(t('disclaimerPage.sections.serviceDefinition.whatWeProvide.points', { returnObjects: true }) as string[]).map((point, index) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: point }} />
                  ))}
                </ul>
              </div>

              {/* What We Are NOT */}
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-5">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-red-600" />
                  {t('disclaimerPage.sections.serviceDefinition.whatWeAreNot.title')}
                </h3>
                <ul className="space-y-2 text-sm">
                  {(t('disclaimerPage.sections.serviceDefinition.whatWeAreNot.points', { returnObjects: true }) as string[]).map((point, index) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: point }} />
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 rounded-r-lg p-4">
              <p className="text-sm font-semibold mb-2">{t('disclaimerPage.sections.serviceDefinition.keyDistinction.title')}</p>
              <p className="text-sm" dangerouslySetInnerHTML={{ __html: t('disclaimerPage.sections.serviceDefinition.keyDistinction.text') }} />
            </div>
          </section>

          {/* 3. Nature of Software */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('disclaimerPage.sections.natureOfSoftware.title')}</h2>
            
            <h3 className="font-semibold text-lg mb-2">{t('disclaimerPage.sections.natureOfSoftware.automatedCalculations.title')}</h3>
            <p className="mb-4">
              {t('disclaimerPage.sections.natureOfSoftware.automatedCalculations.text')}
            </p>

            <h3 className="font-semibold text-lg mb-2">{t('disclaimerPage.sections.natureOfSoftware.reportsAndDocuments.title')}</h3>
            <p className="mb-4">
              {t('disclaimerPage.sections.natureOfSoftware.reportsAndDocuments.text')}
            </p>

            <h3 className="font-semibold text-lg mb-2">{t('disclaimerPage.sections.natureOfSoftware.taxFeatures.title')}</h3>
            <p className="mb-4">
              {t('disclaimerPage.sections.natureOfSoftware.taxFeatures.text')}
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              {(t('disclaimerPage.sections.natureOfSoftware.taxFeatures.points', { returnObjects: true }) as string[]).map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>

            <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-400 rounded-lg p-4">
              <p className="text-sm font-bold mb-2">{t('disclaimerPage.sections.natureOfSoftware.criticalTaxDisclaimer.title')}</p>
              <p className="text-sm" dangerouslySetInnerHTML={{ __html: t('disclaimerPage.sections.natureOfSoftware.criticalTaxDisclaimer.text') }} />
            </div>
          </section>

          {/* 4. User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Users className="h-6 w-6" />
              {t('disclaimerPage.sections.userResponsibilities.title')}
            </h2>
            
            <p className="mb-4">{t('disclaimerPage.sections.userResponsibilities.intro')}</p>

            <div className="space-y-3">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold mb-2">{t('disclaimerPage.sections.userResponsibilities.dataAccuracy.title')}</h4>
                <p className="text-sm">
                  {t('disclaimerPage.sections.userResponsibilities.dataAccuracy.text')}
                </p>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold mb-2">{t('disclaimerPage.sections.userResponsibilities.professionalConsultation.title')}</h4>
                <p className="text-sm">
                  {t('disclaimerPage.sections.userResponsibilities.professionalConsultation.text')}
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  {(t('disclaimerPage.sections.userResponsibilities.professionalConsultation.points', { returnObjects: true }) as string[]).map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold mb-2">{t('disclaimerPage.sections.userResponsibilities.verificationOfOutputs.title')}</h4>
                <p className="text-sm">
                  {t('disclaimerPage.sections.userResponsibilities.verificationOfOutputs.text')}
                </p>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold mb-2">{t('disclaimerPage.sections.userResponsibilities.legalCompliance.title')}</h4>
                <p className="text-sm">
                  {t('disclaimerPage.sections.userResponsibilities.legalCompliance.text')}
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  {(t('disclaimerPage.sections.userResponsibilities.legalCompliance.points', { returnObjects: true }) as string[]).map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold mb-2">{t('disclaimerPage.sections.userResponsibilities.businessDecisions.title')}</h4>
                <p className="text-sm">
                  {t('disclaimerPage.sections.userResponsibilities.businessDecisions.text')}
                </p>
              </div>
            </div>
          </section>

          {/* 5. No Warranties */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('disclaimerPage.sections.noWarranties.title')}</h2>
            
            <div className="bg-gray-100 dark:bg-gray-800 border-2 border-gray-400 rounded-lg p-5 mb-4">
              <p className="font-bold mb-3">{t('disclaimerPage.sections.noWarranties.disclaimer.title')}</p>
              <p className="mb-3">
                {t('disclaimerPage.sections.noWarranties.disclaimer.text')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                {(t('disclaimerPage.sections.noWarranties.disclaimer.points', { returnObjects: true }) as string[]).map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

            <h3 className="font-semibold text-lg mb-2">{t('disclaimerPage.sections.noWarranties.noGuarantee.title')}</h3>
            <p className="mb-4">
              {t('disclaimerPage.sections.noWarranties.noGuarantee.text')}
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              {(t('disclaimerPage.sections.noWarranties.noGuarantee.points', { returnObjects: true }) as string[]).map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>

            <h3 className="font-semibold text-lg mb-2">{t('disclaimerPage.sections.noWarranties.limitations.title')}</h3>
            <p className="mb-4">
              {t('disclaimerPage.sections.noWarranties.limitations.text')}
            </p>
          </section>

          {/* 6. Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              {t('disclaimerPage.sections.limitationOfLiability.title')}
            </h2>
            
            <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-400 rounded-lg p-5">
              <p className="font-bold mb-3">{t('disclaimerPage.sections.limitationOfLiability.importantLimitation.title')}</p>
              <p className="mb-3">
                {t('disclaimerPage.sections.limitationOfLiability.importantLimitation.text')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                {(t('disclaimerPage.sections.limitationOfLiability.importantLimitation.points', { returnObjects: true }) as string[]).map((point, index) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: point }} />
                ))}
              </ul>
            </div>

            <p className="mt-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('disclaimerPage.sections.limitationOfLiability.riskAssumption') }} />
          </section>

          {/* 7. Professional Recommendations */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('disclaimerPage.sections.professionalRecommendations.title')}</h2>
            
            <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 rounded-r-lg p-5 mb-4">
              <h3 className="font-bold text-lg mb-3">{t('disclaimerPage.sections.professionalRecommendations.whenToConsult.title')}</h3>
              <p className="mb-3" dangerouslySetInnerHTML={{ __html: t('disclaimerPage.sections.professionalRecommendations.whenToConsult.text') }} />
              <ul className="space-y-2 text-sm">
                {(t('disclaimerPage.sections.professionalRecommendations.whenToConsult.points', { returnObjects: true }) as string[]).map((point, index) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: point }} />
                ))}
              </ul>
            </div>

            <h3 className="font-semibold text-lg mb-2">{t('disclaimerPage.sections.professionalRecommendations.typesOfProfessionals.title')}</h3>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              {(t('disclaimerPage.sections.professionalRecommendations.typesOfProfessionals.points', { returnObjects: true }) as string[]).map((point, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: point }} />
              ))}
            </ul>
          </section>

          {/* 8. Regulatory Compliance */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('disclaimerPage.sections.regulatoryCompliance.title')}</h2>
            
            <p className="mb-4">
              {t('disclaimerPage.sections.regulatoryCompliance.text1')}
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              {(t('disclaimerPage.sections.regulatoryCompliance.points', { returnObjects: true }) as string[]).map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>

            <p className="mb-4" dangerouslySetInnerHTML={{ __html: t('disclaimerPage.sections.regulatoryCompliance.text2') }} />
          </section>

          {/* 9. Updates and Changes */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('disclaimerPage.sections.updates.title')}</h2>
            
            <p className="mb-4">
              {t('disclaimerPage.sections.updates.text')}
            </p>
          </section>

          {/* 10. Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('disclaimerPage.sections.thirdParty.title')}</h2>
            
            <p className="mb-4">
              {t('disclaimerPage.sections.thirdParty.text')}
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">{t('disclaimerPage.sections.contact.title')}</h2>
            <p className="mb-4">{t('disclaimerPage.sections.contact.text')}</p>
            <div className="bg-muted rounded-lg p-5">
              <p className="font-semibold mb-2">{t('disclaimerPage.companyName')}</p>
              <p className="mb-1"><strong>{t('disclaimerPage.sections.contact.email')}:</strong> legal@tibrcode.com</p>
              <p className="mb-1"><strong>{t('disclaimerPage.sections.contact.support')}:</strong> support@logandledger.com</p>
              <p className="text-sm text-muted-foreground mt-3" dangerouslySetInnerHTML={{ __html: t('disclaimerPage.sections.contact.note') }} />
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('disclaimerPage.sections.footer.copyright', { year: currentYear })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('disclaimerPage.sections.footer.binding')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
