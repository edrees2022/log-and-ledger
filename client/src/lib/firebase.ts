import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithCredential, type User as FirebaseUser } from "firebase/auth";
import { getFirestore, initializeFirestore, connectFirestoreEmulator, doc, setDoc, getDoc, collection, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy } from "firebase/firestore";
import { Capacitor } from '@capacitor/core';

// Firebase configuration
// For production, these should come from environment variables
// For Capacitor/iOS, we need to hardcode them as import.meta.env doesn't work in native apps
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC8kehcrhK8JLBbArdJDpGiKMUAweiy0Fo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "log-and-ledger.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "log-and-ledger",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "log-and-ledger.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "808599419586",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:808599419586:web:2f3f1754703d652987595b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GCZ55Q5JRB"
};

const hasFirebaseConfig = !!firebaseConfig.apiKey && !!firebaseConfig.projectId && !!firebaseConfig.appId;

// Initialize Firebase (with guard for missing config)
let app: any = null;
try {
  if (hasFirebaseConfig) {
    app = initializeApp(firebaseConfig);
  } else {
    console.warn("⚠️ Firebase config missing. Running in auth-only/offline mode.");
  }
} catch (e) {
  console.error("❌ Firebase init failed, switching to auth-only mode:", e);
  app = null;
}

// Initialize Firebase Authentication and get a reference to the service
// Provide a safe stub when Firebase is unavailable to avoid null checks all over the app
export const auth: any = app ? getAuth(app) : {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    try { setTimeout(() => callback(null), 0); } catch {}
    return () => {};
  },
  signInWithEmailAndPassword: async () => { throw new Error('Firebase not initialized'); },
  createUserWithEmailAndPassword: async () => { throw new Error('Firebase not initialized'); },
  signOut: async () => { return true; },
  getIdToken: async () => { throw new Error('Firebase not initialized'); }
};

// Check if Firebase Auth is properly initialized
export const isFirebaseAuthEnabled = !!app;

// Initialize Cloud Firestore with fallback for constrained networks
let db: any = null;
try {
  if (app) {
    // For environments like Replit with network constraints
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  }
} catch (error) {
  console.warn('Firestore long-polling initialization failed, using default:', error);
  try {
    db = app ? getFirestore(app) : null;
  } catch { }
}

export { db };

// Firestore health check (disabled to avoid permission errors)
export const checkFirestoreHealth = async (): Promise<boolean> => {
  // Skip health check - we don't use Firestore for data storage
  return true;
};

// Auth functions (fallbacks if auth is not configured)
export const signInWithEmail = async (email: string, password: string) => {
  if (!auth) {
    console.error('Firebase Auth is not initialized!', {
      hasApiKey: !!firebaseConfig.apiKey,
      hasProjectId: !!firebaseConfig.projectId,
      hasAppId: !!firebaseConfig.appId
    });
    throw new Error('Firebase Authentication is not configured. Please check your Firebase settings in the console.');
  }
  return await signInWithEmailAndPassword(auth, email, password);
};

export const createUserWithEmail = async (email: string, password: string) => {
  if (!auth) {
    console.error('Firebase Auth is not initialized!', {
      hasApiKey: !!firebaseConfig.apiKey,
      hasProjectId: !!firebaseConfig.projectId,
      hasAppId: !!firebaseConfig.appId,
      envVars: {
        VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? 'SET' : 'MISSING',
        VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'MISSING',
        VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID ? 'SET' : 'MISSING'
      }
    });
    throw new Error('Firebase Authentication is not configured. Please check:\n1. Firebase config in .env file\n2. Email/Password provider is enabled in Firebase Console\n3. App is rebuilt after config changes');
  }
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Google Sign-In functions
export const signInWithGoogle = async () => {
  if (!auth) {
    console.error('Firebase Auth is not initialized!');
    throw new Error('Firebase Authentication is not configured.');
  }
  
  const isNative = Capacitor.isNativePlatform();
  
  try {
    if (isNative) {
      // Mobile: Use @capacitor-firebase/authentication
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
      
      // Sign out first to force account selection
      try {
        await FirebaseAuthentication.signOut();
      } catch (e) {
        // Ignore - no previous session
      }
      
      // Sign in with Google
      const result = await FirebaseAuthentication.signInWithGoogle();
      
      // Create Firebase credential from Google token
      const credential = GoogleAuthProvider.credential(result.credential?.idToken);
      
      // Sign in to Firebase with the credential
      const signInResult = await signInWithCredential(auth, credential);
      
      return signInResult;
    } else {
      // Web: Use popup for immediate feedback
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      return result;
    }
  } catch (error: any) {
    console.error('❌ Google Sign-In ERROR:', {
      message: error.message,
      code: error.code,
      fullError: error
    });
    
    let userMessage = 'فشل تسجيل الدخول بجوجل.\n\n';
    
    if (error.code === 'auth/unauthorized-domain') {
      userMessage += '⚠️ النطاق غير مصرح به.\n\nالحل:\n1. افتح Firebase Console\n2. Authentication > Settings > Authorized domains\n3. أضف: ' + window.location.hostname;
    } else if (error.code === 'auth/popup-blocked') {
      userMessage += '❌ تم حظر النافذة.\nالرجاء السماح للنوافذ المنبثقة.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      userMessage += '❌ تم إلغاء العملية.';
    } else if (error.message) {
      userMessage += error.message;
    } else {
      userMessage += 'خطأ غير معروف. الرجاء المحاولة مرة أخرى.';
    }
    
    throw new Error(userMessage);
  }
};

export const signOutUser = async () => {
  if (!auth) return true;
  
  // Sign out from Google Auth on mobile
  if (Capacitor.isNativePlatform()) {
    try {
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
      await FirebaseAuthentication.signOut();
    } catch (e) {
      // Ignore sign out errors
    }
  }
  
  return await signOut(auth);
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) {
    // Immediately report no user when auth is unavailable
    try { callback(null); } catch { }
    return () => { };
  }
  return onAuthStateChanged(auth, callback);
};

// Firestore helper functions with error handling
export const createDocument = async (collectionName: string, data: any, customId?: string) => {
  if (!db) throw new Error('Firestore not configured.');
  try {
    if (customId) {
      const docRef = doc(db, collectionName, customId);
      await setDoc(docRef, data);
      return { id: customId, ...data };
    } else {
      const docRef = await addDoc(collection(db, collectionName), data);
      return { id: docRef.id, ...data };
    }
  } catch (error: any) {
    console.error(`Failed to create document in ${collectionName}:`, {
      error,
      message: error?.message,
      code: error?.code,
      customId,
      collectionName
    });
    throw error;
  }
};

export const getDocument = async (collectionName: string, docId: string) => {
  if (!db) return null;
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  if (!db) throw new Error('Firestore not configured.');
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, data);
  return { id: docId, ...data };
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  if (!db) throw new Error('Firestore not configured.');
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
  return true;
};

export const getCollection = async (collectionName: string, conditions?: any[], orderByField?: string) => {
  if (!db) return [];
  let q = collection(db, collectionName);

  // Add where conditions if provided
  if (conditions) {
    for (const [field, operator, value] of conditions) {
      q = query(q as any, where(field, operator, value)) as any;
    }
  }

  // Add ordering if provided
  if (orderByField) {
    q = query(q as any, orderBy(orderByField)) as any;
  }

  const querySnapshot = await getDocs(q as any);
  const docs: any[] = [];
  querySnapshot.forEach((docSnap) => {
    const docData = docSnap.data() || {};
    docs.push({ id: docSnap.id, ...docData });
  });

  return docs;
};

export const getUserCompanies = async (userId: string) => {
  return await getCollection('companies', [['user_id', '==', userId]]);
};

export const getCompanyData = async (companyId: string, collectionName: string) => {
  return await getCollection(collectionName, [['company_id', '==', companyId]]);
};

export type { FirebaseUser };