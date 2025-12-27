import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";

// Validation rule types
export type ValidationRule<T = any> = {
  type: "required" | "minLength" | "maxLength" | "min" | "max" | "pattern" | "email" | "phone" | "url" | "custom" | "iban" | "taxNumber" | "decimal" | "integer" | "date" | "future" | "past" | "unique";
  value?: any;
  message?: string;
  validator?: (value: T, allValues?: Record<string, any>) => boolean | Promise<boolean>;
};

export type FieldValidation = {
  rules: ValidationRule[];
  dependsOn?: string[];
};

export type ValidationSchema = Record<string, FieldValidation>;

export type ValidationError = {
  field: string;
  rule: string;
  message: string;
  severity: "error" | "warning" | "info";
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  fieldErrors: Record<string, ValidationError[]>;
};

// Email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone regex (international format)
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
// URL regex
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
// IBAN regex (simplified)
const IBAN_REGEX = /^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/;
// Tax number patterns by country
const TAX_PATTERNS: Record<string, RegExp> = {
  SA: /^\d{15}$/, // Saudi Arabia VAT
  AE: /^[0-9]{15}$/, // UAE TRN
  EG: /^\d{9}$/, // Egypt Tax ID
  US: /^\d{2}-\d{7}$/, // US EIN
  UK: /^GB\d{9}$/, // UK VAT
};

// Built-in validators
const validators: Record<string, (value: any, param?: any) => boolean> = {
  required: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },
  minLength: (value, min) => {
    if (!value) return true;
    return String(value).length >= min;
  },
  maxLength: (value, max) => {
    if (!value) return true;
    return String(value).length <= max;
  },
  min: (value, min) => {
    if (value === null || value === undefined || value === "") return true;
    return Number(value) >= min;
  },
  max: (value, max) => {
    if (value === null || value === undefined || value === "") return true;
    return Number(value) <= max;
  },
  pattern: (value, pattern) => {
    if (!value) return true;
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    return regex.test(String(value));
  },
  email: (value) => {
    if (!value) return true;
    return EMAIL_REGEX.test(String(value));
  },
  phone: (value) => {
    if (!value) return true;
    return PHONE_REGEX.test(String(value).replace(/[\s()-]/g, ""));
  },
  url: (value) => {
    if (!value) return true;
    return URL_REGEX.test(String(value));
  },
  iban: (value) => {
    if (!value) return true;
    return IBAN_REGEX.test(String(value).replace(/\s/g, "").toUpperCase());
  },
  taxNumber: (value, countryCode) => {
    if (!value) return true;
    const pattern = TAX_PATTERNS[countryCode] || /^.+$/;
    return pattern.test(String(value));
  },
  decimal: (value, decimals = 2) => {
    if (!value) return true;
    const regex = new RegExp(`^-?\\d+(\\.\\d{1,${decimals}})?$`);
    return regex.test(String(value));
  },
  integer: (value) => {
    if (!value) return true;
    return /^-?\d+$/.test(String(value));
  },
  date: (value) => {
    if (!value) return true;
    const date = new Date(value);
    return !isNaN(date.getTime());
  },
  future: (value) => {
    if (!value) return true;
    const date = new Date(value);
    return date > new Date();
  },
  past: (value) => {
    if (!value) return true;
    const date = new Date(value);
    return date < new Date();
  },
};

// Default error messages
const defaultMessages: Record<string, (param?: any) => string> = {
  required: () => "validation.required",
  minLength: (min) => `validation.minLength`,
  maxLength: (max) => `validation.maxLength`,
  min: (min) => `validation.min`,
  max: (max) => `validation.max`,
  pattern: () => "validation.pattern",
  email: () => "validation.email",
  phone: () => "validation.phone",
  url: () => "validation.url",
  iban: () => "validation.iban",
  taxNumber: () => "validation.taxNumber",
  decimal: () => "validation.decimal",
  integer: () => "validation.integer",
  date: () => "validation.date",
  future: () => "validation.future",
  past: () => "validation.past",
  custom: () => "validation.invalid",
  unique: () => "validation.unique",
};

// Hook for form validation
export function useFormValidation(schema: ValidationSchema) {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<Record<string, ValidationError[]>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [showAllErrors, setShowAllErrors] = useState(false);

  // Validate a single field
  const validateField = useCallback(
    async (
      field: string,
      value: any,
      allValues: Record<string, any> = {}
    ): Promise<ValidationError[]> => {
      const fieldValidation = schema[field];
      if (!fieldValidation) return [];

      const fieldErrors: ValidationError[] = [];

      for (const rule of fieldValidation.rules) {
        let isValid = true;

        if (rule.type === "custom" && rule.validator) {
          isValid = await rule.validator(value, allValues);
        } else {
          const validator = validators[rule.type];
          if (validator) {
            isValid = validator(value, rule.value);
          }
        }

        if (!isValid) {
          const messageKey = rule.message || defaultMessages[rule.type]?.(rule.value);
          fieldErrors.push({
            field,
            rule: rule.type,
            message: t(messageKey, { value: rule.value, field: t(`fields.${field}`, field) }),
            severity: "error",
          });
        }
      }

      return fieldErrors;
    },
    [schema, t]
  );

  // Validate all fields
  const validateAll = useCallback(
    async (values: Record<string, any>): Promise<ValidationResult> => {
      const allErrors: ValidationError[] = [];
      const fieldErrors: Record<string, ValidationError[]> = {};

      for (const [field, validation] of Object.entries(schema)) {
        const value = values[field];
        const errors = await validateField(field, value, values);

        if (errors.length > 0) {
          allErrors.push(...errors);
          fieldErrors[field] = errors;
        }
      }

      const result: ValidationResult = {
        isValid: allErrors.filter((e) => e.severity === "error").length === 0,
        errors: allErrors.filter((e) => e.severity === "error"),
        warnings: allErrors.filter((e) => e.severity === "warning"),
        fieldErrors,
      };

      setErrors(fieldErrors);
      setShowAllErrors(true);

      return result;
    },
    [schema, validateField]
  );

  // Handle field blur (mark as touched)
  const handleBlur = useCallback(
    async (field: string, value: any, allValues?: Record<string, any>) => {
      setTouched((prev) => new Set(prev).add(field));
      const fieldErrors = await validateField(field, value, allValues);
      setErrors((prev) => ({
        ...prev,
        [field]: fieldErrors,
      }));
    },
    [validateField]
  );

  // Handle field change (validate if touched)
  const handleChange = useCallback(
    async (field: string, value: any, allValues?: Record<string, any>) => {
      if (touched.has(field) || showAllErrors) {
        const fieldErrors = await validateField(field, value, allValues);
        setErrors((prev) => ({
          ...prev,
          [field]: fieldErrors,
        }));
      }
    },
    [touched, showAllErrors, validateField]
  );

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched(new Set());
    setShowAllErrors(false);
  }, []);

  // Get field error
  const getFieldError = useCallback(
    (field: string): string | undefined => {
      const fieldErrors = errors[field];
      if (!fieldErrors || fieldErrors.length === 0) return undefined;
      if (!touched.has(field) && !showAllErrors) return undefined;
      return fieldErrors[0].message;
    },
    [errors, touched, showAllErrors]
  );

  // Check if field has error
  const hasError = useCallback(
    (field: string): boolean => {
      return (touched.has(field) || showAllErrors) && (errors[field]?.length || 0) > 0;
    },
    [errors, touched, showAllErrors]
  );

  return {
    errors,
    validateField,
    validateAll,
    handleBlur,
    handleChange,
    clearErrors,
    getFieldError,
    hasError,
    touched,
    setShowAllErrors,
  };
}

// Field Error Display Component
interface FieldErrorProps {
  error?: string;
  className?: string;
}

export function FieldError({ error, className = "" }: FieldErrorProps) {
  if (!error) return null;

  return (
    <p className={`text-sm text-destructive flex items-center gap-1 mt-1 ${className}`}>
      <AlertCircle className="h-3 w-3" />
      {error}
    </p>
  );
}

// Validation Summary Component
interface ValidationSummaryProps {
  result: ValidationResult | null;
  showWarnings?: boolean;
  onFieldClick?: (field: string) => void;
}

export function ValidationSummary({
  result,
  showWarnings = true,
  onFieldClick,
}: ValidationSummaryProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  if (!result || (result.errors.length === 0 && result.warnings.length === 0)) {
    return null;
  }

  return (
    <div
      className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex items-center gap-2 mb-3">
        <XCircle className="h-5 w-5 text-destructive" />
        <h4 className="font-medium text-destructive">
          {t("validation.errorsFound", { count: result.errors.length })}
        </h4>
      </div>

      <ul className="space-y-2">
        {result.errors.map((error, index) => (
          <li
            key={`${error.field}-${index}`}
            className="flex items-start gap-2 text-sm cursor-pointer hover:underline"
            onClick={() => onFieldClick?.(error.field)}
          >
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <span>{error.message}</span>
          </li>
        ))}
      </ul>

      {showWarnings && result.warnings.length > 0 && (
        <>
          <div className="flex items-center gap-2 mt-4 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <h5 className="font-medium text-yellow-700 dark:text-yellow-400 text-sm">
              {t("validation.warnings", { count: result.warnings.length })}
            </h5>
          </div>
          <ul className="space-y-1">
            {result.warnings.map((warning, index) => (
              <li
                key={`warning-${warning.field}-${index}`}
                className="flex items-start gap-2 text-sm text-yellow-700 dark:text-yellow-400"
              >
                <Info className="h-3 w-3 shrink-0 mt-0.5" />
                <span>{warning.message}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// Input with Validation Indicator
interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  isValid?: boolean;
  showValidIndicator?: boolean;
}

export function ValidatedInputWrapper({
  children,
  error,
  isValid,
  showValidIndicator = true,
}: {
  children: React.ReactNode;
  error?: string;
  isValid?: boolean;
  showValidIndicator?: boolean;
}) {
  return (
    <div className="relative">
      <div className="relative">
        {children}
        {showValidIndicator && (
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            {error && <AlertCircle className="h-4 w-4 text-destructive" />}
            {!error && isValid && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </div>
        )}
      </div>
      <FieldError error={error} />
    </div>
  );
}

// Real-time Validation Status Badge
interface ValidationStatusProps {
  totalFields: number;
  validFields: number;
  errorCount: number;
}

export function ValidationStatus({
  totalFields,
  validFields,
  errorCount,
}: ValidationStatusProps) {
  const { t } = useTranslation();

  const percentage = totalFields > 0 ? Math.round((validFields / totalFields) * 100) : 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={errorCount > 0 ? "destructive" : percentage === 100 ? "default" : "secondary"}
            className="gap-1"
          >
            {errorCount > 0 ? (
              <>
                <AlertCircle className="h-3 w-3" />
                {t("validation.errorsCount", { count: errorCount })}
              </>
            ) : percentage === 100 ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                {t("validation.allValid")}
              </>
            ) : (
              <>
                <Info className="h-3 w-3" />
                {percentage}%
              </>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {t("validation.progress", { valid: validFields, total: totalFields })}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Predefined validation schemas
export const commonValidations = {
  email: {
    rules: [
      { type: "required" as const },
      { type: "email" as const },
      { type: "maxLength" as const, value: 255 },
    ],
  },
  phone: {
    rules: [
      { type: "phone" as const },
      { type: "maxLength" as const, value: 20 },
    ],
  },
  requiredText: (minLength = 1, maxLength = 255) => ({
    rules: [
      { type: "required" as const },
      { type: "minLength" as const, value: minLength },
      { type: "maxLength" as const, value: maxLength },
    ],
  }),
  optionalText: (maxLength = 255) => ({
    rules: [{ type: "maxLength" as const, value: maxLength }],
  }),
  amount: (min = 0, max?: number) => ({
    rules: [
      { type: "required" as const },
      { type: "decimal" as const, value: 2 },
      { type: "min" as const, value: min },
      ...(max ? [{ type: "max" as const, value: max }] : []),
    ],
  }),
  quantity: (min = 0) => ({
    rules: [
      { type: "required" as const },
      { type: "integer" as const },
      { type: "min" as const, value: min },
    ],
  }),
  date: (required = true) => ({
    rules: [
      ...(required ? [{ type: "required" as const }] : []),
      { type: "date" as const },
    ],
  }),
  futureDate: {
    rules: [
      { type: "required" as const },
      { type: "date" as const },
      { type: "future" as const },
    ],
  },
  iban: {
    rules: [
      { type: "required" as const },
      { type: "iban" as const },
    ],
  },
  taxNumber: (countryCode: string) => ({
    rules: [
      { type: "required" as const },
      { type: "taxNumber" as const, value: countryCode },
    ],
  }),
};
