import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.iptv.stream',
  appName: 'IPTV Stream',
  webDir: 'dist',
  android: {
    backgroundColor: '#030712',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#030712',
      showSpinner: false,
    },
  },
};

export default config;