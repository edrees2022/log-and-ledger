import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.logandledger.app',
  appName: 'Log & Ledger Pro',
  webDir: 'dist/public',
  // Remove server.url for native build - app will use bundled files
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"]
    },
    Browser: {
      windowName: '_self',
      presentationStyle: 'fullscreen',
      toolbarColor: '#ffffff'
    },
    CapacitorHttp: {
      enabled: true
    },
    CapacitorCookies: {
      enabled: true
    }
  },
  server: {
    androidScheme: 'https',
    hostname: 'log-and-ledger.firebaseapp.com',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
