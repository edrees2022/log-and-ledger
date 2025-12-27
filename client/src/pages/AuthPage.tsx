import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, DollarSign, Globe, Calculator, Languages, Moon, Sun } from 'lucide-react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { mapCurrencies } from '@/lib/currencies';
import { useTheme } from '@/components/ThemeProvider';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Schema and types will be created dynamically inside component

// Demo companies removed: app operates only with real API data now

// Currency and month arrays will be created inside component to use translations

export default function AuthPage() {
  const { login, loginWithGoogle, register, isLoading } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('login');

  // Available languages with their native names
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  ];

  // Dynamic schemas using translations - memoized to update when language changes
  const loginSchema = useMemo(() => z.object({
    email: z.string().email(t('auth.validationErrors.emailInvalid')),
    password: z.string().min(6, t('auth.validationErrors.passwordMinLength')),
  }), [t, i18n.resolvedLanguage]);

  const registerSchema = useMemo(() => z.object({
    // Company info
    companyName: z.string().min(2, t('auth.validationErrors.companyNameMinLength')),
    baseCurrency: z.string().min(3, t('auth.validationErrors.selectCurrency')),
    fiscalYearStart: z.string(),
    
    // User info
    username: z.string().min(3, t('auth.validationErrors.usernameMinLength')),
    email: z.string().email(t('auth.validationErrors.emailInvalid')),
    password: z.string().min(6, t('auth.validationErrors.passwordMinLength')),
    fullName: z.string().min(2, t('auth.validationErrors.fullNameMinLength')),
  }), [t, i18n.resolvedLanguage]);

  type LoginForm = z.infer<typeof loginSchema>;
  type RegisterForm = z.infer<typeof registerSchema>;

  // Get comprehensive currency list from shared utility
  const currencies = useMemo(() => mapCurrencies(t, 'auth.currencies'), [t, i18n.resolvedLanguage]);

  const months = [
    { value: '1', label: t('auth.months.january') },
    { value: '4', label: t('auth.months.april') },
    { value: '7', label: t('auth.months.july') },
    { value: '10', label: t('auth.months.october') },
  ];

  // Create resolvers based on current schemas
  const loginResolver = useMemo(() => zodResolver(loginSchema), [loginSchema, i18n.resolvedLanguage]);
  const registerResolver = useMemo(() => zodResolver(registerSchema), [registerSchema, i18n.resolvedLanguage]);

  const loginForm = useForm<LoginForm>({
    resolver: loginResolver,
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: registerResolver,
    defaultValues: {
      companyName: '',
      baseCurrency: 'USD',
      fiscalYearStart: '1',
      username: '',
      email: '',
      password: '',
      fullName: '',
    },
  });

  // Reset forms when language changes to update error messages with new resolver
  useEffect(() => {
    // Reset both forms to apply new resolvers when language changes
    const loginValues = loginForm.getValues();
    const registerValues = registerForm.getValues();
    
    // Reset forms to apply new resolver and clear any existing validation state
    loginForm.reset(loginValues, { keepValues: true });
    registerForm.reset(registerValues, { keepValues: true });
  }, [loginResolver, registerResolver, loginForm, registerForm]);

  const onLogin = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      
      // Pre-fetch CSRF token after successful login
      try {
        const { getCsrfToken } = await import('@/lib/queryClient');
        await getCsrfToken();
      } catch (err) {
        console.warn('Failed to pre-fetch CSRF token:', err);
      }
      
      toast({
        title: t('auth.loginSuccess'),
        description: t('auth.signInToContinue'),
      });
    } catch (error: any) {
      toast({
        title: t('auth.loginError'),
        description: error.message || t('auth.invalidCredentials'),
        variant: 'destructive',
      });
    }
  };

  const onGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      
      // Pre-fetch CSRF token after successful login
      try {
        const { getCsrfToken } = await import('@/lib/queryClient');
        await getCsrfToken();
      } catch (err) {
        console.warn('Failed to pre-fetch CSRF token:', err);
      }
      
      toast({
        title: t('auth.loginSuccess'),
        description: t('auth.signInToContinue'),
      });
    } catch (error: any) {
      toast({
        title: t('auth.loginError'),
        description: error.message || t('auth.googleLoginError'),
        variant: 'destructive',
      });
    }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      // Register user and create company in one step
      await register({
        username: data.username,
        email: data.email,
        password: data.password,
        company_name: data.companyName,
        company_base_currency: data.baseCurrency,
        company_fiscal_year_start: parseInt(data.fiscalYearStart),
      });
      
      toast({
        title: t('common.success'),
        description: t('auth.createNewCompany'),
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('forms.validationError'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language and Theme Toggle Buttons - Top Right */}
        <div className="flex items-center justify-end gap-2 mb-4">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={i18n.language === lang.code ? 'bg-accent' : ''}
                >
                  <span className="flex items-center gap-2">
                    {lang.nativeName}
                    {i18n.language === lang.code && <span className="ms-auto text-xs">✓</span>}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="me-2 h-4 w-4" />
                {t('settings.general.lightMode')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="me-2 h-4 w-4" />
                {t('settings.general.darkMode')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Calculator className="me-2 h-4 w-4" />
                {t('settings.general.autoMode')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Log & Ledger Pro</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {t('app.tagline')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Globe className="h-3 w-3 me-1" />
              {t('common.multiLanguage')}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <DollarSign className="h-3 w-3 me-1" />
              {t('common.multiCurrency')}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Calculator className="h-3 w-3 me-1" />
              {t('common.fullAccounting')}
            </Badge>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">
              {activeTab === 'login' ? t('auth.existingAccount') : t('auth.createAccount')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="tab-login">{t('auth.login')}</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">{t('auth.register')}</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4 mt-6" key={`login-${i18n.resolvedLanguage}`}>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.email')}</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder={t('auth.email')} 
                              data-testid="input-login-email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.password')}</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder={t('auth.password')} 
                              data-testid="input-login-password"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                      data-testid="button-login"
                    >
                      {isLoading ? t('common.loading') : t('auth.login')}
                    </Button>
                  </form>
                </Form>

                {/* Google Sign-In - Web & Mobile */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t('auth.orContinueWith') || 'Or continue with'}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={onGoogleLogin}
                  disabled={isLoading}
                >
                  <svg className="me-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {t('auth.signInWithGoogle') || 'Sign in with Google'}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <p>{t('auth.createAccountPrompt')}</p>
                </div>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4 mt-6" key={`register-${i18n.resolvedLanguage}`}>
                {/* Info Badge */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium mb-1">{t('auth.firstUserNote') || '📌 First user becomes Owner'}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">{t('auth.firstUserNoteDesc') || 'The first user to register will be assigned the Owner role with full permissions.'}</p>
                </div>
                
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    {/* Company Section */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">{t('auth.companyInformation')}</h3>
                      
                      <FormField
                        control={registerForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.companyName')}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={t('auth.companyNamePlaceholder')} 
                                data-testid="input-company-name"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={registerForm.control}
                          name="baseCurrency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('auth.currency')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-currency">
                                    <SelectValue placeholder={t('auth.selectCurrency')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {currencies.map((currency) => (
                                    <SelectItem key={currency.code} value={currency.code}>
                                      {currency.code} - {currency.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="fiscalYearStart"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('auth.fiscalYear')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-fiscal-year">
                                    <SelectValue placeholder={t('auth.selectMonth')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {months.map((month) => (
                                    <SelectItem key={month.value} value={month.value}>
                                      {month.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* User Section */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">{t('auth.userInformation')}</h3>
                      
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.fullName')}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={t('auth.fullNamePlaceholder')} 
                                data-testid="input-full-name"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.username')}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={t('auth.usernamePlaceholder')} 
                                data-testid="input-username"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.email')}</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder={t('auth.emailPlaceholder')} 
                                data-testid="input-register-email"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.password')}</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder={t('auth.passwordPlaceholder')} 
                                data-testid="input-register-password"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                      data-testid="button-register"
                    >
                      {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>© 2024 Log & Ledger - Professional Accounting Software</p>
          <p>{t('ui.multiLanguageSupport')}</p>
        </div>
      </div>
    </div>
  );
}