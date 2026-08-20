import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.textlooter.rpg',
  appName: 'Text Looter RPG',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    backgroundColor: '#050507',
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#050507',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
