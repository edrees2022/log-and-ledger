/**
 * Multi-Step Form Wizard Component
 * Enterprise wizard for complex multi-step forms
 */
import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Circle,
  Loader2,
} from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  optional?: boolean;
  validate?: () => boolean | Promise<boolean>;
}

interface WizardContextValue {
  currentStep: number;
  steps: WizardStep[];
  data: Record<string, any>;
  updateData: (key: string, value: any) => void;
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
  goToStep: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
  isCompleted: boolean;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a FormWizard');
  }
  return context;
}

interface FormWizardProps {
  steps: WizardStep[];
  children: ReactNode;
  onComplete: (data: Record<string, any>) => void | Promise<void>;
  className?: string;
  showProgress?: boolean;
  showStepNumbers?: boolean;
  allowSkipAhead?: boolean;
  initialData?: Record<string, any>;
}

export function FormWizard({
  steps,
  children,
  onComplete,
  className,
  showProgress = true,
  showStepNumbers = true,
  allowSkipAhead = false,
  initialData = {},
}: FormWizardProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Record<string, any>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const isCompleted = completedSteps.size === steps.length;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const updateData = useCallback((key: string, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const validateStep = async (stepIndex: number): Promise<boolean> => {
    const step = steps[stepIndex];
    if (step.validate) {
      const result = step.validate();
      return result instanceof Promise ? await result : result;
    }
    return true;
  };

  const nextStep = useCallback(async (): Promise<boolean> => {
    const isValid = await validateStep(currentStep);
    if (!isValid) return false;

    setCompletedSteps(prev => {
      const arr = Array.from(prev);
      arr.push(currentStep);
      return new Set(arr);
    });

    if (isLast) {
      setIsSubmitting(true);
      try {
        await onComplete(data);
        return true;
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      return true;
    }
  }, [currentStep, isLast, data, onComplete, steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((index: number) => {
    if (index < 0 || index >= steps.length) return;
    if (!allowSkipAhead && index > currentStep && !completedSteps.has(currentStep)) return;
    setCurrentStep(index);
  }, [steps.length, allowSkipAhead, currentStep, completedSteps]);

  const contextValue: WizardContextValue = {
    currentStep,
    steps,
    data,
    updateData,
    nextStep,
    prevStep,
    goToStep,
    isFirst,
    isLast,
    isCompleted,
  };

  return (
    <WizardContext.Provider value={contextValue}>
      <div className={cn("space-y-6", className)}>
        {/* Progress Bar */}
        {showProgress && (
          <Progress value={progress} className="h-2" />
        )}

        {/* Step Indicators */}
        {showStepNumbers && (
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isComplete = completedSteps.has(index);
              const isClickable = allowSkipAhead || index <= currentStep || completedSteps.has(index - 1);

              return (
                <div key={step.id} className="flex-1 flex items-center">
                  <button
                    onClick={() => isClickable && goToStep(index)}
                    disabled={!isClickable}
                    className={cn(
                      "flex items-center gap-2 transition-colors",
                      isClickable && "cursor-pointer hover:text-primary",
                      !isClickable && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                        isComplete && "bg-primary border-primary text-primary-foreground",
                        isActive && !isComplete && "border-primary text-primary",
                        !isActive && !isComplete && "border-muted-foreground text-muted-foreground"
                      )}
                    >
                      {isComplete ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        step.icon || <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className={cn(
                        "text-sm font-medium",
                        isActive && "text-primary"
                      )}>
                        {step.title}
                      </p>
                      {step.description && (
                        <p className="text-xs text-muted-foreground">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </button>

                  {index < steps.length - 1 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-4",
                      isComplete ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Step Content */}
        <div className="min-h-[300px]">
          {children}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={isFirst || isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('wizard.previous', 'Previous')}
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {t('wizard.stepOf', 'Step {{current}} of {{total}}', {
              current: currentStep + 1,
              total: steps.length,
            })}
          </div>

          <Button
            onClick={nextStep}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('wizard.submitting', 'Submitting...')}
              </>
            ) : isLast ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                {t('wizard.complete', 'Complete')}
              </>
            ) : (
              <>
                {t('wizard.next', 'Next')}
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </WizardContext.Provider>
  );
}

/**
 * Individual wizard step component
 */
interface WizardStepContentProps {
  stepId: string;
  children: ReactNode;
}

export function WizardStepContent({ stepId, children }: WizardStepContentProps) {
  const { currentStep, steps } = useWizard();
  const stepIndex = steps.findIndex(s => s.id === stepId);

  if (stepIndex !== currentStep) {
    return null;
  }

  return <>{children}</>;
}
