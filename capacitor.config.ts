import type { CapacitorConfig } from '@capacitor/cli';

/**
 * VEYRA ? Capacitor (Android) yap?land?rmas?
 * ---------------------------------------------------------------------------
 * Bu dosya VEYRA web uygulamas?n? DE???T?RMEZ; yaln?zca Vite ?retim ??kt?s?n?
 * (`artifacts/reeldrama/dist/public`) bir Android WebView i?ine sarar.
 *
 * ?K? ?ALI?MA MODU (hibrit):
 *
 *  1) BUNDLE (varsay?lan) ? web varl?klar? APK'n?n i?indedir.
 *     Uygulama `https://localhost` origin'inden a??l?r, katalog + dikey player
 *     g?m?l? veriyle ?al???r. Poster/video uzak CDN'lerden geldi?i i?in
 *     INTERNET izni gerekir. Bu modda g?reli `/api/...` ?a?r?lar? bir yere
 *     gitmez; backend'e ba?lanmak i?in `VITE_API_BASE_URL` ile mutlak adres
 *     verin (bkz. artifacts/reeldrama/.env.example).
 *
 *  2) REMOTE (opsiyonel) ? a?a??daki ortam de?i?keni doluysa APK, canl? siteyi
 *     y?kler. Clerk auth ve g?reli `/api/...` ?a?r?lar? birebir ?al???r:
 *
 *         VEYRA_ANDROID_SERVER_URL="https://veyra-ornek.replit.app" pnpm run mobile:apk
 *
 *     ya da `capacitor.config.ts` i?indeki `server.url` sat?r?n? a??n.
 *
 * S?r?mler (Capacitor 8.5.1 resm? Android ?ablonuyla birebir):
 *   Gradle 8.14.3 ? AGP 8.13.0 ? compileSdk/targetSdk 36 ? minSdk 24 ? JDK 21
 */

/** Uzaktan (remote kabuk) mod: ortam de?i?keni doluysa etkinle?ir. */
const remoteWebUrl = (process.env.VEYRA_ANDROID_SERVER_URL ?? '').trim();

/** Release imzas? ? `npx cap build android` kullananlar i?in opsiyonel k?pr?. */
const keystorePath = (process.env.VEYRA_KEYSTORE_PATH ?? '').trim();
const keystorePassword = (process.env.VEYRA_KEYSTORE_PASSWORD ?? '').trim();
const keystoreAlias = (process.env.VEYRA_KEY_ALIAS ?? '').trim();
const keystoreAliasPassword = (process.env.VEYRA_KEY_PASSWORD ?? '').trim();

const hasKeystore = Boolean(keystorePath && keystorePassword && keystoreAlias);

/**
 * Clerk oturum ak???n?n WebView i?inde kalabilmesi i?in izin verilen hostlar.
 * (Otomatik y?nlendirmeler ? ?r. Google OAuth ? sistem taray?c?s?na a??l?rsa
 * oturum geri d?nemez; bu liste o ak??lar? uygulama i?inde tutar.)
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

  // VEYRA'n?n koyu sinematik zemini ? a??l??ta beyaz fla? olmamas? i?in.
  backgroundColor: '#111118',
  loggingBehavior: 'production',
  zoomEnabled: false,

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#111118',
    // `npx cap build android` ile imzal? APK/AAB ?retmek isterseniz env ?zerinden dolar.
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
    // REMOTE MOD: VEYRA_ANDROID_SERVER_URL tan?ml?ysa APK canl? siteyi y?kler.
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
    // Capacitor 8'de sistem ?ubuklar? core'a g?m?l?d?r (ayr? status-bar paketi gerekmez).
    // Kaynak: SystemBars.setStyle ? setAppearanceLightStatusBars(!style.equals("DARK"))
    // Yani "DARK" = koyu zemin ?zerinde A?IK (beyaz) ikon/yaz?. VEYRA'n?n temas? i?in do?ru de?er budur.
    SystemBars: {
      insetsHandling: 'css',
      style: 'DARK',
      hidden: false,
    },
  },
};

export default config;
