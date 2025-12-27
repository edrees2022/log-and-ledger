import admin from "firebase-admin";
import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "log-and-ledger";
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!admin.apps.length) {
  if (!serviceAccountJson) {
    console.error("⚠️ FIREBASE_SERVICE_ACCOUNT_KEY env var is missing; cannot init Firebase Admin SDK");
  } else {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id ?? PROJECT_ID,
      });

      console.log("🔥 Firebase Admin SDK initialized for project:", serviceAccount.project_id ?? PROJECT_ID);
    } catch (error) {
      console.error("⚠️ Failed to initialize Firebase Admin SDK:", error);
      throw error;
    }
  }
}

// Verify Firebase ID tokens using Admin SDK so backend trusts Google signatures
export const verifyFirebaseToken = async (token: string) => {
  // Primary: Admin SDK
  if (admin.apps.length) {
    try {
      return await admin.auth().verifyIdToken(token, true);
    } catch (e) {
      console.warn("Admin SDK verification failed, falling back to JWKS:", (e as Error).message);
    }
  }

  // Fallback: Verify using Google's JWKS (no service account needed)
  const issuer = `https://securetoken.google.com/${PROJECT_ID}`;
  const audience = PROJECT_ID;
  const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));

  const { payload } = await jwtVerify(token, JWKS, {
    issuer,
    audience,
  });

  // Cast minimal shape similar to Admin SDK decoded token
  return payload as unknown as JWTPayload & { uid: string; email?: string };
};