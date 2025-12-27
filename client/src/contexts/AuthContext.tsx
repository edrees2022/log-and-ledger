import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import i18n from 'i18next';
import { probeReact } from '@/lib/reactProbe';
import { useMutation } from '@tanstack/react-query';
import { queryClient, API_URL, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { 
  auth,
  onAuthStateChange, 
  signInWithEmail, 
  createUserWithEmail, 
  signOutUser,
  signInWithGoogle,
  FirebaseUser,
  getDocument,
  createDocument,
  checkFirestoreHealth
} from '@/lib/firebase';

interface Company {
  id: string;
  name: string;
  base_currency: string;
  fiscal_year_start: number;
}

interface User {
  id: string;
  company_id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  language: string;
  timezone: string;
  theme: string;
  is_active: boolean;
  legal_consent_accepted: boolean;
  legal_consent_date: string | null;
  legal_consent_version?: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  activeCompany?: Company;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isFirestoreHealthy: boolean;
  authOnlyMode: boolean;
  lastSSORequestId: string | null;
  ssoTimeline: { stage: string; at: string }[];
  // When the backend session (server-bound) was established; null if still auth-only
  sessionStartAt: string | null;
  // When the client session (Firebase auth detected) started; useful fallback for diagnostics
  clientSessionStartAt: string;
  retrySSO: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  switchCompany: (companyId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  retryFirestoreSetup: () => Promise<void>;
  acceptLegalConsent: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  company_name: string;
  company_base_currency?: string;
  company_fiscal_year_start?: number;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Probe React identity/version from within a deep module
probeReact('AuthContext module init');

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  // Disable Firestore - using PostgreSQL backend only
  const [isFirestoreHealthy, setIsFirestoreHealthy] = useState<boolean>(false);
  const [authOnlyMode, setAuthOnlyMode] = useState<boolean>(true); // Always use auth-only mode
  const { toast } = useToast();
  const ssoAttemptedRef = useRef(false);
  const lastRequestIdRef = useRef<string | null>(null);
  const [lastSSORequestId, setLastSSORequestId] = useState<string | null>(null);
  const [ssoTimeline, setSsoTimeline] = useState<{ stage: string; at: string }[]>([]);
  const addTimeline = (stage: string) => setSsoTimeline(prev => [...prev, { stage, at: new Date().toISOString() }]);
  // Timestamps for diagnostics
  const [clientSessionStartAt] = useState<string>(() => new Date().toISOString());
  const [sessionStartAt, setSessionStartAt] = useState<string | null>(null);

  // Helper for translated toast
  const showToast = (titleKey: string, descKey: string, fallbackTitle: string, fallbackDesc: string) => {
    const title = i18n.t(titleKey, { defaultValue: fallbackTitle });
    const desc = i18n.t(descKey, { defaultValue: fallbackDesc });
    toast({ title, description: desc });
  };



  // No longer need redirect handling - Native Plugin handles it automatically

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        if (isFirestoreHealthy) {
          try {
            // Get user profile from Firestore
            const userProfile = await getDocument('users', fbUser.uid);
            console.log('User profile from Firestore:', userProfile ? 'found' : 'not found');
            if (userProfile) {
              setUser(userProfile as User);
            } else {
              console.warn('User profile not found in Firestore for UID:', fbUser.uid);
              setUser({
                id: fbUser.uid,
                email: fbUser.email || '',
                full_name: fbUser.email?.split('@')[0] || 'User',
                username: fbUser.email?.split('@')[0] || 'user',
                company_id: 'auth-only',
                role: 'owner',
                language: 'en',
                timezone: 'UTC',
                theme: 'auto',
                is_active: true,
                legal_consent_accepted: false,
                legal_consent_date: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_login_at: new Date().toISOString(),
              });
            }
          } catch (error) {
            console.error('Error fetching user profile from Firestore:', error);
            // Fallback to auth-only mode
            setAuthOnlyMode(true);
            setUser({
              id: fbUser.uid,
              email: fbUser.email || '',
              full_name: fbUser.email?.split('@')[0] || 'User',
              username: fbUser.email?.split('@')[0] || 'user',
              company_id: 'auth-only',
              role: 'owner',
              language: 'en',
              timezone: 'UTC',
              theme: 'auto',
              is_active: true,
              legal_consent_accepted: false,
              legal_consent_date: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_login_at: new Date().toISOString(),
            });
          }
        } else {
          // Auth-only mode – establish backend session via SSO without blocking UI
          addTimeline('auth_only_initial');

          // Set a basic user so the app can render while SSO completes
          const basicUser: User = {
            id: fbUser.uid,
            email: fbUser.email || '',
            full_name: fbUser.email?.split('@')[0] || 'User',
            username: fbUser.email?.split('@')[0] || 'user',
            company_id: 'auth-only',
            role: 'owner',
            language: 'en',
            timezone: 'UTC',
            theme: 'auto',
            is_active: true,
            legal_consent_accepted: false,
            legal_consent_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login_at: new Date().toISOString(),
          };
          setUser((prev) => prev ?? basicUser);

          // Background SSO with backoff and non-overlap
          (async () => {
            if (ssoAttemptedRef.current) return;
            ssoAttemptedRef.current = true;
            const API_URL = import.meta.env.VITE_API_URL || '';
            let attempt = 0;
            const maxAttempts = 2;
            let lastFailureDetail: any = null;
            let successNotified = false;
            const doAttempt = async () => {
              attempt++;
              try {
                addTimeline(`sso_attempt_${attempt}_start`);
                const idToken = await fbUser.getIdToken();
                addTimeline(`sso_attempt_${attempt}_token_acquired`);
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 12000);
                const response = await fetch(`${API_URL}/api/auth/sso-login`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                  signal: controller.signal,
                });
                clearTimeout(timeout);
                if (response.ok) {
                  const rawResponse = await response.json();
                  
                  // Handle wrapped response (in case of proxy/middleware wrapping)
                  const ssoUser = rawResponse.data || rawResponse;
                  
                  lastRequestIdRef.current = ssoUser?.requestId || null;
                  setLastSSORequestId(lastRequestIdRef.current);
                  setUser(ssoUser);
                  setAuthOnlyMode(false);
                  // Mark backend session start for diagnostics
                  setSessionStartAt(new Date().toISOString());
                  addTimeline(`sso_attempt_${attempt}_success`);
                  queryClient.invalidateQueries();
                  if (!successNotified) {
                    successNotified = true;
                    showToast('toast.connectedToServer', 'toast.sessionEstablished', 'Connected to server', 'Session established successfully. Full features enabled.');
                  }
                  return true;
                }
                let detail: any = null;
                try { detail = await response.json(); } catch {}
                if (detail?.requestId) {
                  lastRequestIdRef.current = detail.requestId;
                  setLastSSORequestId(lastRequestIdRef.current);
                }
                console.warn('SSO session establishment failed', { status: response.status, detail, attempt });
                lastFailureDetail = detail || { status: response.status };
                addTimeline(`sso_attempt_${attempt}_failure`);
                return false;
              } catch (error: any) {
                const verbose = import.meta.env.DEV;
                if (error?.name === 'AbortError') {
                  (verbose ? console.warn : console.debug)('SSO request timed out; continuing in auth-only mode');
                } else {
                  (verbose ? console.error : console.debug)('SSO session establishment failed:', error);
                }
                lastFailureDetail = lastFailureDetail || { error: String(error?.message || error) };
                addTimeline(`sso_attempt_${attempt}_error`);
                return false;
              }
            };

            const ok = await doAttempt();
            if (!ok && attempt < maxAttempts) {
              const backoffMs = 1200 * Math.pow(2, attempt - 1);
              await new Promise(r => setTimeout(r, backoffMs));
              const retry = await doAttempt();
              if (retry) {
                console.log('✅ SSO retry succeeded on attempt', attempt + 1);
                return; // Success - don't show error
              }
            }
            
            // Only show error if ALL attempts failed
            if (!ok) {
              const stage = lastFailureDetail?.stage ? ` (stage: ${lastFailureDetail.stage})` : '';
              const code = lastFailureDetail?.code ? ` code:${lastFailureDetail.code}` : '';
              const constraint = lastFailureDetail?.constraint ? ` constraint:${lastFailureDetail.constraint}` : '';
              const shortId = lastRequestIdRef.current ? ` • ${lastRequestIdRef.current.slice(0,8)}` : '';
              
              // Only show error in development or if it's a critical error
              const isDev = import.meta.env.DEV;
              if (isDev) {
                toast({
                  title: 'Working in auth-only mode',
                  description: `Could not bind session to server${stage}. You can continue using the app; some data may be limited until connection resumes.${shortId}${code}${constraint}`,
                  variant: 'destructive'
                });
              } else {
                // In production, just log silently unless it's a critical error
                console.warn('Auth-only mode: SSO session binding failed', { stage, code, constraint });
              }
            }
          })();
        }
      } else {
        setUser(null);
      }
      // Do not block on SSO; ensure loading finishes now
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isFirestoreHealthy]);

  // Manual retry for SSO binding
  const retrySSO = async () => {
    if (!firebaseUser || !authOnlyMode) return;
    // Force a new attempt even if previous failed; reset guard
    ssoAttemptedRef.current = false;
    toast({ title: 'Retrying server bind', description: 'Attempting to establish backend session…' });
    addTimeline('retry_initiated');
    // Re-run the auth-only branch logic by simulating conditions
    const fbUser = firebaseUser;
    const basicUser = {
      id: fbUser.uid,
      email: fbUser.email || '',
      full_name: fbUser.email?.split('@')[0] || 'User',
      username: fbUser.email?.split('@')[0] || 'user',
      company_id: 'auth-only',
      role: 'owner',
      language: 'en',
      timezone: 'UTC',
      theme: 'auto',
      is_active: true,
      legal_consent_accepted: false,
      legal_consent_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    } as User;
    setUser(prev => prev ?? basicUser);
    // Trigger background attempt identical to initial path
    (async () => {
      if (ssoAttemptedRef.current) return;
      ssoAttemptedRef.current = true;
      const API_URL = import.meta.env.VITE_API_URL || '';
      let attempt = 0;
      const maxAttempts = 2;
      let lastFailureDetail: any = null;
      const doAttempt = async () => {
        attempt++;
        try {
          addTimeline(`retry_attempt_${attempt}_start`);
          const idToken = await fbUser.getIdToken(true);
          addTimeline(`retry_attempt_${attempt}_token_acquired`);
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 12000);
          const response = await fetch(`${API_URL}/api/auth/sso-login`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
            credentials: 'include',
            signal: controller.signal,
          });
          clearTimeout(timeout);
          if (response.ok) {
            const rawResponse = await response.json();
            console.log('📦 Raw SSO response (retry) from server:', rawResponse);
            
            // Handle wrapped response (in case of proxy/middleware wrapping)
            const ssoUser = rawResponse.data || rawResponse;
            
            lastRequestIdRef.current = ssoUser?.requestId || null;
            setLastSSORequestId(lastRequestIdRef.current);
            setUser(ssoUser);
            setAuthOnlyMode(false);
            // Mark backend session start for diagnostics
            setSessionStartAt(new Date().toISOString());
            addTimeline(`retry_attempt_${attempt}_success`);
            queryClient.invalidateQueries();
            showToast('toast.reconnectedToServer', 'toast.sessionBound', 'Reconnected to server', 'Session bound successfully.');
            return true;
          }
          let detail: any = null;
          try { detail = await response.json(); } catch {}
            if (detail?.requestId) {
              lastRequestIdRef.current = detail.requestId;
              setLastSSORequestId(lastRequestIdRef.current);
            }
          lastFailureDetail = detail || { status: response.status };
          addTimeline(`retry_attempt_${attempt}_failure`);
          return false;
        } catch (e: any) {
          lastFailureDetail = lastFailureDetail || { error: String(e?.message || e) };
          addTimeline(`retry_attempt_${attempt}_error`);
          return false;
        }
      };
      const ok = await doAttempt();
      if (!ok && attempt < maxAttempts) {
        const backoffMs = 1200 * Math.pow(2, attempt - 1);
        await new Promise(r => setTimeout(r, backoffMs));
        const retry = await doAttempt();
        if (retry) {
          console.log('✅ SSO retry succeeded on manual retry');
          return; // Success
        }
      }
      
      // Only show error if retry actually failed
      if (!ok) {
        const stage = lastFailureDetail?.stage ? ` (stage: ${lastFailureDetail.stage})` : '';
        const code = lastFailureDetail?.code ? ` code:${lastFailureDetail.code}` : '';
        const constraint = lastFailureDetail?.constraint ? ` constraint:${lastFailureDetail.constraint}` : '';
        const shortId = lastRequestIdRef.current ? ` • ${lastRequestIdRef.current.slice(0,8)}` : '';
        
        // Only show in dev mode
        if (import.meta.env.DEV) {
          toast({ 
            title: 'Still auth-only', 
            description: `Retry failed${stage}.${shortId}${code}${constraint}`, 
            variant: 'destructive' 
          });
        }
      }
    })();
  };

  // Login mutation with Backend (local DB) + Firebase fallback
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      console.log('🔐 Starting login process for:', email);
      console.log('🌐 API_URL:', API_URL);
      
      // Step 1: Try Backend authentication first (for users created via Users page)
      console.log('🔄 Attempting backend authentication...');
      try {
        const loginUrl = `${API_URL}/api/auth/login`;
        console.log('📡 Calling:', loginUrl);
        
        const response = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          credentials: 'include'
        });

        console.log('📥 Backend response status:', response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log('✅ Backend login successful:', userData.id, userData.email);
          setSessionStartAt(new Date().toISOString());
          setUser(userData);
          setAuthOnlyMode(false);
          return { isBackendAuth: true, user: userData };
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.log('❌ Backend authentication failed:', response.status, errorData);
          console.log('🔄 Trying Firebase fallback...');
        }
      } catch (error) {
        console.log('❌ Backend authentication error:', error);
        console.log('🔄 Trying Firebase fallback...');
      }
      
      // Step 2: Fallback to Firebase authentication (for Firebase users)
      console.log('🔥 Attempting Firebase authentication...');
      try {
        const userCredential = await signInWithEmail(email, password);
        console.log('✅ Firebase login successful:', userCredential.user.uid);
        return { isBackendAuth: false, user: userCredential.user };
      } catch (firebaseError: any) {
        console.error('❌ Firebase authentication also failed:', firebaseError.code, firebaseError.message);
        throw new Error('Invalid email or password');
      }
    },
    retry: false, // Don't retry login attempts
    onSuccess: () => {
      console.log('Login mutation completed successfully');
      // Firebase auth state change will handle user state update
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Login mutation failed:', error);
    },
  });

  // Google Sign-In mutation
  const googleLoginMutation = useMutation({
    mutationFn: async () => {
      console.log('🚀 Starting Google Sign-In process...');
      console.log('📱 User Agent:', navigator.userAgent);
      console.log('🌐 Platform:', window.location.hostname);
      
      try {
        const result = await signInWithGoogle();
        console.log('✅ Google Sign-In successful:', result?.user?.uid);
        console.log('👤 User Email:', result?.user?.email);
        return result?.user;
      } catch (error: any) {
        console.error('❌ Google Sign-In FAILED in AuthContext:', {
          message: error.message,
          code: error.code,
          name: error.name,
          fullError: error
        });
        
        // Re-throw with more details
        throw new Error(error.message || 'حدث خطأ أثناء تسجيل الدخول بجوجل');
      }
    },
    retry: false,
    onSuccess: () => {
      console.log('✅ Google login mutation completed successfully');
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      console.error('❌ Google login mutation failed:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      setIsLoading(false); // Ensure loading state is reset on error
      
      // Show user-friendly error
      alert(`خطأ في تسجيل الدخول:\n${error.message || 'حدث خطأ غير معروف. الرجاء المحاولة مرة أخرى.'}`);
    },
  });

  // Logout mutation with Firebase + Backend session cleanup
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('🚪 Starting logout process...');
      
      // Step 1: Clear CSRF token
      try {
        const { clearCsrfToken } = await import('@/lib/queryClient');
        clearCsrfToken();
        console.log('✅ CSRF token cleared');
      } catch (err) {
        console.warn('⚠️ Failed to clear CSRF token:', err);
      }
      
      // Step 2: Clear backend session
      try {
        const response = await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log('✅ Backend session cleared successfully');
        } else {
          console.warn('⚠️ Backend logout returned:', response.status);
        }
      } catch (error) {
        console.warn('⚠️ Backend session cleanup failed:', error);
        // Continue anyway - this is not critical
      }
      
      // Step 3: Firebase logout
      try {
        await signOutUser();
        console.log('✅ Firebase logout successful');
      } catch (error) {
        console.error('❌ Firebase logout failed:', error);
        // Force logout anyway
      }
      
      // Step 4: Clear local state
      setUser(null);
      setFirebaseUser(null);
      setAuthOnlyMode(true);
      setSessionStartAt(null);
      ssoAttemptedRef.current = false;
      lastRequestIdRef.current = null;
      setLastSSORequestId(null);
      setSsoTimeline([]);
      console.log('✅ Local state cleared');
    },
    onSuccess: () => {
      console.log('✅ Logout completed successfully');
      // Clear all queries
      queryClient.clear();
      // Force navigation to login
      window.location.href = '/';
    },
    onError: (error) => {
      console.error('❌ Logout error:', error);
      // Force logout even on error
      setUser(null);
      setFirebaseUser(null);
      queryClient.clear();
      window.location.href = '/';
    },
  });

  // Register mutation with Firebase
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      console.log('Starting registration process for:', userData.email);
      
      try {
        // Create Firebase user
        console.log('Creating Firebase user...');
        const userCredential = await createUserWithEmail(userData.email, userData.password);
        console.log('Firebase user created successfully:', userCredential.user.uid);
        
        if (isFirestoreHealthy) {
          // Create company in Firestore with better error handling
          console.log('Creating company in Firestore...');
          let company;
          try {
            company = await createDocument('companies', {
              name: userData.company_name,
              base_currency: userData.company_base_currency || 'USD',
              fiscal_year_start: userData.company_fiscal_year_start || 1,
              user_id: userCredential.user.uid,
              created_at: new Date().toISOString(),
            });
            console.log('Company created successfully:', company.id);
          } catch (firestoreError: any) {
            console.error('Firestore company creation failed:', {
              error: firestoreError,
              message: firestoreError?.message,
              code: firestoreError?.code,
              details: firestoreError?.details
            });
            throw new Error(`Failed to create company: ${firestoreError?.message || 'Unknown Firestore error'}`);
          }
          
          // Create user profile in Firestore with better error handling
          console.log('Creating user profile in Firestore...');
          let userProfile;
          try {
            userProfile = await createDocument('users', {
              company_id: company.id,
              username: userData.username,
              email: userData.email,
              full_name: userData.username, // Using username as full_name for now
              role: 'owner',
              language: 'en',
              timezone: 'UTC',
              theme: 'auto',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_login_at: new Date().toISOString(),
              activeCompany: company,
            }, userCredential.user.uid);
            console.log('User profile created successfully');
          } catch (firestoreError: any) {
            console.error('Firestore user profile creation failed:', {
              error: firestoreError,
              message: firestoreError?.message,
              code: firestoreError?.code,
              details: firestoreError?.details
            });
            throw new Error(`Failed to create user profile: ${firestoreError?.message || 'Unknown Firestore error'}`);
          }
          
          return userProfile;
        } else {
          // Auth-only mode - skip Firestore operations
          console.log('Auth-only mode: Skipping Firestore profile creation');
          return {
            id: userCredential.user.uid,
            email: userData.email,
            full_name: userData.username,
            username: userData.username,
            company_id: 'auth-only',
            role: 'owner',
            language: 'en',
            timezone: 'UTC',
            theme: 'auto',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login_at: new Date().toISOString(),
          };
        }
      } catch (error: any) {
        console.error('Registration failed:', {
          error,
          message: error?.message,
          code: error?.code
        });
        // Don't retry on registration failures
        throw error;
      }
    },
    retry: false, // Don't retry registration attempts
    onSuccess: () => {
      console.log('Registration completed successfully');
      // Firebase auth state change will handle user state update
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Registration mutation failed:', error);
      setIsLoading(false); // Ensure loading state is reset on error
    },
  });

  // Switch company mutation - now implemented with real API call
  const switchCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      const response = await apiRequest('POST', '/api/auth/switch-company', { companyId });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to switch company');
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('Company switched successfully:', data);
      // Update user state with new active company
      if (data.user) {
        setUser(data.user);
      }
      // Invalidate all queries to refresh data for new company
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Failed to switch company:', error);
    }
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const loginWithGoogle = async () => {
    await googleLoginMutation.mutateAsync();
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const register = async (userData: RegisterData) => {
    await registerMutation.mutateAsync(userData);
  };

  const switchCompany = async (companyId: string) => {
    await switchCompanyMutation.mutateAsync(companyId);
  };

  // Refresh session to get updated user/company data
  const refreshSession = async () => {
    try {
      const response = await apiRequest('GET', '/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  };

  const retryFirestoreSetup = async () => {
    console.log('Retrying Firestore setup...');
    const healthy = await checkFirestoreHealth();
    setIsFirestoreHealthy(healthy);
    setAuthOnlyMode(!healthy);
    if (healthy) {
      console.log('Firestore is now healthy!');
    } else {
      console.log('Firestore is still not accessible');
    }
  };

  // Persist user's acceptance of legal consent in backend and locally
  const acceptLegalConsent = async () => {
    try {
      // Get Firebase token for authentication
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await currentUser.getIdToken();
      
      const requestUrl = `${API_URL}/api/users/accept-legal-consent`;
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to accept legal consent: ${response.status}`);
      }

      const data = await response.json();
      
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser((prev) => prev ? { ...prev, legal_consent_accepted: true, legal_consent_date: new Date().toISOString() } as User : prev);
      }

      const u = data?.user || user;
      if (u) {
        try {
          localStorage.setItem(`legal_consent_${u.id}`, 'true');
          if (u.email) localStorage.setItem(`legal_consent_${u.email}`, 'true');
          localStorage.setItem(`legal_consent_${u.id}_date`, new Date().toISOString());
        } catch {}
      }
    } catch (error) {
      console.error('Error persisting legal consent:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading: isLoading || loginMutation.isPending || googleLoginMutation.isPending || logoutMutation.isPending || registerMutation.isPending || switchCompanyMutation.isPending,
    isAuthenticated: !!user, // User exists from either Firebase or Backend
    isFirestoreHealthy,
    authOnlyMode,
    lastSSORequestId,
    ssoTimeline,
    sessionStartAt,
    clientSessionStartAt,
    retrySSO,
    login,
    loginWithGoogle,
    logout,
    register,
    switchCompany,
    refreshSession,
    retryFirestoreSetup,
    acceptLegalConsent,
  };

  // Add timeout to prevent infinite loading
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (registerMutation.isPending) {
      timeout = setTimeout(() => {
        console.error('Registration timeout - forcing loading state reset');
        setIsLoading(false);
      }, 30000); // 30 second timeout
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [registerMutation.isPending]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}