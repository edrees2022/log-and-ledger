import { registerPlugin } from '@capacitor/core';

export interface GoogleAuthPlugin {
  signIn(): Promise<{ idToken: string; email: string; displayName: string; photoUrl: string }>;
}

const GoogleAuth = registerPlugin<GoogleAuthPlugin>('GoogleAuth');

export default GoogleAuth;
