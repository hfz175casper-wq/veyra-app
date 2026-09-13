import type { CapacitorConfig } from '@capacitor/cli';

/**
 * VEYRA — Capacitor (Android) yapılandırması
 * ---------------------------------------------------------------------------
 * Bu dosya VEYRA web uygulamasını DEĞİŞTİRMEZ; yalnızca Vite üretim çıktısını
 * (`artifacts/reeldrama/dist/public`) bir Android WebView içine sarar.
 *
 * İKİ ÇALIŞMA MODU (hibrit):
 *
 *  1) BUNDLE (varsayılan) — web varlıkları APK'nın içindedir.
 *     Uygulama `https://localhost` origin'inden açılır, katalog + dikey player
 *     gömülü veriyle çalışır. Poster/video uzak CDN'lerden geldiği için
 *     INTERNET izni gerekir. Bu modda göreli `/api/...` çağrıları bir yere
 *     gitmez; backend'e bağlanmak için `VITE_API_BASE_URL` ile mutlak adres
 *     verin (bkz. artifacts/reeldrama/.env.example).
 *
 *  2) REMOTE (opsiyonel) — aşağıdaki ortam değişkeni doluysa APK, canlı siteyi
 *     yükler. Clerk auth ve göreli `/api/...` çağrıları birebir çalışır:
 *
 *         VEYRA_ANDROID_SERVER_URL="https://veyra-ornek.replit.app" pnpm run mobile:apk
 *
 *     ya da `capacitor.config.ts` içindeki `server.url` satırını açın.
 *
 * Sürümler (Capacitor 8.5.1 resmî Android şablonuyla birebir):
 *   Gradle 8.14.3 · AGP 8.13.0 · compileSdk/targetSdk 36 · minSdk 24 · JDK 21
 */

/** Uzaktan (remote kabuk) mod: ortam değişkeni doluysa etkinleşir. */
const remoteWebUrl = (process.env.VEYRA_ANDROID_SERVER_URL ?? '').trim();

/** Release imzası — `npx cap build android` kullananlar için opsiyonel köprü. */
const keystorePath = (process.env.VEYRA_KEYSTORE_PATH ?? '').trim();
const keystorePassword = (process.env.VEYRA_KEYSTORE_PASSWORD ?? '').trim();
const keystoreAlias = (process.env.VEYRA_KEY_ALIAS ?? '').trim();
const keystoreAliasPassword = (process.env.VEYRA_KEY_PASSWORD ?? '').trim();

const hasKeystore = Boolean(keystorePath && keystorePassword && keystoreAlias);

/**
 * Clerk oturum akışının WebView içinde kalabilmesi için izin verilen hostlar.
 * (Otomatik yönlendirmeler — ör. Google OAuth — sistem tarayıcısına açılırsa
 * oturum geri dönemez; bu liste o akışları uygulama içinde tutar.)
 */
const allowNavigation = [
  '*.clerk.dev',
  '*.clerk.com',
  '*.clerk.accounts.dev',
  'accounts.google.com',
  'appleid.apple.com',
];

const config: CapacitorConfig = {
  appId: 'app.veyra.mobile',
  appName: 'VEYRA',
  webDir: 'artifacts/reeldrama/dist/public',

  // VEYRA'nın koyu sinematik zemini — açılışta beyaz flaş olmaması için.
  backgroundColor: '#111118',
  loggingBehavior: 'production',
  zoomEnabled: false,

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#111118',
    // `npx cap build android` ile imzalı APK/AAB üretmek isterseniz env üzerinden dolar.
    ...(hasKeystore
      ? {
          buildOptions: {
            keystorePath,
            keystorePassword,
            keystoreAlias,
            keystoreAliasPassword: keystoreAliasPassword || keystorePassword,
            bundleType: (process.env.VEYRA_BUNDLE_TYPE as 'APK' | 'ABB') ?? 'APK',
          },
        }
      : {}),
  },

  server: {
    androidScheme: 'https',
    // REMOTE MOD: VEYRA_ANDROID_SERVER_URL tanımlıysa APK canlı siteyi yükler.
    ...(remoteWebUrl ? { url: remoteWebUrl } : {}),
    allowNavigation,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchFadeOutDuration: 250,
      launchAutoHide: true,
      backgroundColor: '#111118',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      useDialog: false,
    },
    // Capacitor 8'de sistem çubukları core'a gömülüdür (ayrı status-bar paketi gerekmez).
    // Kaynak: SystemBars.setStyle → setAppearanceLightStatusBars(!style.equals("DARK"))
    // Yani "DARK" = koyu zemin üzerinde AÇIK (beyaz) ikon/yazı. VEYRA'nın teması için doğru değer budur.
    SystemBars: {
      insetsHandling: 'css',
      style: 'DARK',
      hidden: false,
    },
  },
};

export default config;
