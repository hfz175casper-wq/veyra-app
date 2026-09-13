# VEYRA Android ? Kurulum, Derleme ve ?mzalama Rehberi

Bu belge, VEYRA web uygulamas?n?n **mevcut koduna dokunmadan** bir Android
APK/AAB'ye nas?l d?n??t?r?ld???n? ve release imzal? APK'n?n nas?l ?retilece?ini
anlat?r.

> Y?ntem: **Capacitor 8** ? Vite production ??kt?s? (`artifacts/reeldrama/dist/public`)
> bir Android WebView i?ine sar?l?r. Web uygulamas?, sayfalar?, tasar?m? ve
> ?zellikleri birebir korunur; `android/` klas?r? tamamen **ek** niteli?indedir.

---

## 1. Mimari ?zeti

```
artifacts/reeldrama/dist/public   ? Vite production ??kt?s? (web de?i?medi)
            ?  cap sync android
            ?
android/app/src/main/assets/public  ? APK i?ine g?m?len web varl?klar? (Git'te yok)
            ?  gradlew assembleRelease
            ?
dist-android/veyra-<s?r?m>-release.apk
```

- **Native kabuk:** `android/` (Capacitor 8.5.1 resm? ?ablonu)
- **appId / uygulama ad?:** `app.veyra.mobile` / **VEYRA**
- **S?r?m:** `versionName 1.0.0`, `versionCode 1` (CI'da `github.run_number` ile artar)
- **SDK:** `minSdk 24` (Android 7.0+), `compileSdk/targetSdk 36`
- **Ara? zinciri:** Gradle 8.14.3 ? AGP 8.13.0 ? **JDK 21**
- **?konlar/splash:** `public/favicon.svg` geometrisinden ?retilir
  (`scripts/android/generate-icons.mjs`, s?f?r ba??ml?l?k)

### ?al??ma modlar? (hibrit)

| Mod | Nas?l | Ne olur |
|---|---|---|
| **Bundle** (varsay?lan) | hi?bir ?ey yapma | Web varl?klar? APK i?inde. Katalog + dikey player ?al???r. G?reli `/api/...` ?a?r?lar? i?in `VITE_API_BASE_URL` gerekir. |
| **Remote** | `VEYRA_ANDROID_SERVER_URL=https://...` env **veya** `capacitor.config.ts` i?inde `server.url` sat?r? | APK canl? siteyi y?kler; Clerk auth ve `/api` birebir ?al???r. Uygulama online olur. |

Clerk oturum ak???n?n WebView i?inde kalabilmesi i?in
`capacitor.config.ts ? server.allowNavigation` alan?na Clerk/Google hostlar?
eklenmi?tir.

---

## 2. ?nko?ullar (yerel derleme i?in)

| Ara? | S?r?m | Not |
|---|---|---|
| Node.js | ? 20 | `pnpm` corepack ile gelir: `corepack enable pnpm` |
| JDK | **21** | AGP 8.13 zorunlu k?lar (Temurin ?nerilir) |
| Android SDK | platform **36** + build-tools 36.0.0 | Android Studio kurulumu yeterlidir; yoksa `sdkmanager` |
| Gradle | 8.14.3 | `android/gradlew` kendi indirir (ilk ?al??t?rmada) |

`ANDROID_HOME` (veya `ANDROID_SDK_ROOT`) tan?ml? olmal?; Android Studio
kullan?yorsan?z Gradle SDK'y? otomatik bulur.

> Bu depo sandbox'?nda Google/Gradle sunucular? a? d?zeyinde bloke oldu?undan
> APK **burada** derlenemez; a?a??daki yerel ad?mlar veya GitHub Actions kullan?l?r.

---

## 3. H?zl? ba?lang?? (yerel)

```bash
# 0) ba??ml?l?klar
corepack pnpm install

# 1) VEYRA ikon/splash ?retimi (bir kez; zaten commit edilmi? durumda)
node scripts/android/generate-icons.mjs

# 2) release keystore (bir kez) ? Git'e girmez
sh scripts/android/make-keystore.sh

# 3) u?tan uca imzal? APK
sh scripts/android/build-apk.sh          # veya: pnpm run mobile:apk

# 4) cihaza kur
adb install -r dist-android/veyra-1.0.0-release.apk
```

Tek tek ad?mlar:

```bash
sh scripts/android/build-web.sh     # web production derlemesi ? dist/public
sh scripts/android/sync-android.sh  # cap sync android ? assets/public
cd android && ./gradlew assembleRelease
```

Play Store paketi:

```bash
sh scripts/android/build-aab.sh     # ? dist-android/*.aab
```

Android Studio ile a?mak: `pnpm run mobile:open` (veya `android/` klas?r?n? a?).

---

## 4. Release imzas?

### 4.1 Keystore ?retimi

`scripts/android/make-keystore.sh`:

- `android/veyra-release.keystore` ? PKCS12, RSA 2048, **10.000 g?n** ge?erlilik
- `android/keystore.properties` ? Gradle'?n okudu?u dosya (mod 600)
- ?kisi de `.gitignore` i?indedir; **asla commit etmeyin.**

Gradle imzay? ?u ?ncelikle ??zer:

1. Ortam de?i?kenleri: `VEYRA_KEYSTORE_PATH`, `VEYRA_KEYSTORE_PASSWORD`,
   `VEYRA_KEY_ALIAS`, `VEYRA_KEY_PASSWORD`
2. `android/keystore.properties`
3. Hi?biri yoksa ? **uyar? basar ve imzas?z derler** (build k?r?lmaz).

### 4.2 GitHub Actions (?nerilen)

Workflow: `.github/workflows/android-release.yml`

- `main` / `arena/**` push ve PR'larda ? APK+AAB **artifact** olarak y?klenir
  (Actions ? run ? *Artifacts* ? `veyra-android-<numara>`).
- `v*` tag'inde ? ayr?ca **GitHub Release** olu?turulur.

Gerekli secret'lar (*Settings ? Secrets and variables ? Actions*):

| Secret | ??erik |
|---|---|
| `VEYRA_KEYSTORE_B64` | `base64 -w0 android/veyra-release.keystore` ??kt?s? |
| `VEYRA_KEYSTORE_PASSWORD` | keystore ?ifresi |
| `VEYRA_KEY_ALIAS` | alias (varsay?lan `veyra-release`) |
| `VEYRA_KEY_PASSWORD` | alias ?ifresi |
| `VEYRA_CLERK_PUBLISHABLE_KEY` | opsiyonel ? yoksa auth pasif, uygulama ?al???r |
| `VEYRA_API_BASE_URL` | opsiyonel ? bundle modda `/api` mutlak adresi |

Secret'lar yoksa pipeline **imzas?z** APK ?retir (derlemenin ?al??t???n?
kan?tlar); imza i?in yukar?dakileri tan?mlay?n.

### 4.3 Keystore'u kaybederseniz

Play Store'a ayn? imzayla g?ncelleme **y?klenemez**. Keystore'u ve ?ifreleri
g?venli bir yerde yedekleyin. Play Console'da **Play App Signing** kullan?rsan?z
upload key'inizi yenileyebilirsiniz (Google destek talebiyle).

---

## 5. Web uygulamas?yla ili?kisi (neler korundu, neler eklendi)

**Korunan:** t?m sayfalar (`/`, `/drama/:id`, `/watch/...`, `/search`,
`/discover`, `/saved`, `/following`, `/rewards`, `/profile`, `/admin`), koyu
sinematik tema, alt cam navigasyon, dikey player (play/pause, seek, ses,
tam ekran, altyaz?, sonraki b?l?m), localStorage ilerleme kayd?.

**Eklenen native davran??lar:**

- `MainActivity` + `VeyraWebChromeClient`: HTML5 video tam ekran? ger?ekten
  ?al???r (Capacitor varsay?lan? iste?i iptal eder; biz siyah kapsay?c? +
  gizli sistem ?ubuklar? + yatay y?nelim uygular?z, ??k??ta geri al?r?z).
- `SystemBars` (Capacitor 8 g?m?l?): koyu zeminde **beyaz** sistem ?ubu?u ikonlar?.
- Splash: `#111118` zemin + VEYRA rozeti (Android 12+ sistem splash'i dahil).
- `network_security_config`: yaln?zca HTTPS (cleartext kapal?).

**Web taraf?nda yap?lan tek de?i?iklik** (build'i k?ran mevcut hatan?n onar?m?):

- `@clerk/react` v6 (Clerk Core 3) `SignedIn`/`SignedOut` bile?enlerini
  kald?rd??? i?in `App.tsx`'te `<Show when="signed-in">` /
  `<Show when="signed-out">` kullan?ld? (davran?? ayn?).
- `/admin` sayfas?nda kullan?lan ama import edilmemi? `ShieldCheck` ve `Upload`
  ikonlar? import listesine eklendi (gizli `ReferenceError` giderildi).

Bunlar?n d???nda **hi?bir mevcut dosya silinmedi veya yeniden yaz?lmad?**;
`package.json`'a yaln?zca Capacitor ba??ml?l?klar? ve `mobile:*` scriptleri
eklendi, `.gitignore`'a sat?r eklendi.

---

## 6. S?r?m y?kseltme

1. `android/app/build.gradle` ? `versionName` (?r. `1.1.0`) ve `versionCode` (+1)
   ? veya CI'da tag at?n: `git tag v1.1.0 && git push origin v1.1.0`
   (CI, tag'den `versionName`, `github.run_number`'dan `versionCode` ?retir).
2. Web de?i?tiyse `build-web.sh` + `sync-android.sh` zaten `build-apk.sh` i?inde ?al???r.

---

## 7. S?k kar??la??lan sorunlar

| Belirti | ??z?m |
|---|---|
| `Unsupported class file major version` / `compileSdk` hatas? | JDK 21 kurulu mu? `java -version` |
| `SDK location not found` | `ANDROID_HOME` tan?mla veya `android/local.properties` i?ine `sdk.dir=...` |
| APK kuruluyor ama beyaz ekran | `assets/public/index.html` var m?? `sh scripts/android/sync-android.sh` |
| Oturum a?ma ?al??m?yor | `VITE_CLERK_PUBLISHABLE_KEY` tan?ml? m?? Remote mod i?in `VEYRA_ANDROID_SERVER_URL` dene |
| `/api` ?a?r?lar? 404 (bundle mod) | `VITE_API_BASE_URL` ile mutlak backend adresi ver |
| Google Fonts/posterler y?klenmiyor | Cihazda internet yok; i?erik CDN'lerden gelir (INTERNET izni tan?ml?) |
| ?mzas?z APK uyar?s? | `make-keystore.sh` veya CI secret'lar? |

---

## 8. Dosya haritas?

```
capacitor.config.ts                  Capacitor + hibrit mod + splash/SystemBars ayarlar?
android/                             Native Gradle projesi (Capacitor ?ablonu + VEYRA ?zelle?tirmeleri)
  app/build.gradle                   ?mza ??z?m? + s?r?mleme + ??kt? ad? (veyra-*.apk)
  keystore.properties.example        ?mza ?ablonu
  app/src/main/java/app/veyra/mobile/
      MainActivity.java              K?pr? + tam ekran chrome client kurulumu
      VeyraWebChromeClient.java      Ger?ek HTML5 tam ekran uygulamas?
  app/src/main/res/                  VEYRA ikonlar?, splash, tema, a? g?venli?i
scripts/android/
  build-web.sh ? sync-android.sh     Derleme + senkron
  make-keystore.sh                   Release keystore ?retimi
  build-apk.sh ? build-aab.sh        U?tan uca imzal? ??kt? ? dist-android/
  generate-icons.mjs                 favicon ? ikon/splash PNG (ba??ml?l?ks?z)
.github/workflows/android-release.yml  CI: imzal? APK/AAB + GitHub Release
artifacts/reeldrama/.env.example     Build env de?i?kenleri ?rne?i
```
