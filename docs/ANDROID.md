# VEYRA Android — Kurulum, Derleme ve İmzalama Rehberi

Bu belge, VEYRA web uygulamasının **mevcut koduna dokunmadan** bir Android
APK/AAB'ye nasıl dönüştürüldüğünü ve release imzalı APK'nın nasıl üretileceğini
anlatır.

> Yöntem: **Capacitor 8** — Vite production çıktısı (`artifacts/reeldrama/dist/public`)
> bir Android WebView içine sarılır. Web uygulaması, sayfaları, tasarımı ve
> özellikleri birebir korunur; `android/` klasörü tamamen **ek** niteliğindedir.

---

## 1. Mimari özeti

```
artifacts/reeldrama/dist/public   ← Vite production çıktısı (web değişmedi)
            │  cap sync android
            ▼
android/app/src/main/assets/public  ← APK içine gömülen web varlıkları (Git'te yok)
            │  gradlew assembleRelease
            ▼
dist-android/veyra-<sürüm>-release.apk
```

- **Native kabuk:** `android/` (Capacitor 8.5.1 resmî şablonu)
- **appId / uygulama adı:** `app.veyra.mobile` / **VEYRA**
- **Sürüm:** `versionName 1.0.0`, `versionCode 1` (CI'da `github.run_number` ile artar)
- **SDK:** `minSdk 24` (Android 7.0+), `compileSdk/targetSdk 36`
- **Araç zinciri:** Gradle 8.14.3 · AGP 8.13.0 · **JDK 21**
- **İkonlar/splash:** `public/favicon.svg` geometrisinden üretilir
  (`scripts/android/generate-icons.mjs`, sıfır bağımlılık)

### Çalışma modları (hibrit)

| Mod | Nasıl | Ne olur |
|---|---|---|
| **Bundle** (varsayılan) | hiçbir şey yapma | Web varlıkları APK içinde. Katalog + dikey player çalışır. Göreli `/api/...` çağrıları için `VITE_API_BASE_URL` gerekir. |
| **Remote** | `VEYRA_ANDROID_SERVER_URL=https://...` env **veya** `capacitor.config.ts` içinde `server.url` satırı | APK canlı siteyi yükler; Clerk auth ve `/api` birebir çalışır. Uygulama online olur. |

Clerk oturum akışının WebView içinde kalabilmesi için
`capacitor.config.ts → server.allowNavigation` alanına Clerk/Google hostları
eklenmiştir.

---

## 2. Önkoşullar (yerel derleme için)

| Araç | Sürüm | Not |
|---|---|---|
| Node.js | ≥ 20 | `pnpm` corepack ile gelir: `corepack enable pnpm` |
| JDK | **21** | AGP 8.13 zorunlu kılar (Temurin önerilir) |
| Android SDK | platform **36** + build-tools 36.0.0 | Android Studio kurulumu yeterlidir; yoksa `sdkmanager` |
| Gradle | 8.14.3 | `android/gradlew` kendi indirir (ilk çalıştırmada) |

`ANDROID_HOME` (veya `ANDROID_SDK_ROOT`) tanımlı olmalı; Android Studio
kullanıyorsanız Gradle SDK'yı otomatik bulur.

> Bu depo sandbox'ında Google/Gradle sunucuları ağ düzeyinde bloke olduğundan
> APK **burada** derlenemez; aşağıdaki yerel adımlar veya GitHub Actions kullanılır.

---

## 3. Hızlı başlangıç (yerel)

```bash
# 0) bağımlılıklar
corepack pnpm install

# 1) VEYRA ikon/splash üretimi (bir kez; zaten commit edilmiş durumda)
node scripts/android/generate-icons.mjs

# 2) release keystore (bir kez) — Git'e girmez
sh scripts/android/make-keystore.sh

# 3) uçtan uca imzalı APK
sh scripts/android/build-apk.sh          # veya: pnpm run mobile:apk

# 4) cihaza kur
adb install -r dist-android/veyra-1.0.0-release.apk
```

Tek tek adımlar:

```bash
sh scripts/android/build-web.sh     # web production derlemesi → dist/public
sh scripts/android/sync-android.sh  # cap sync android → assets/public
cd android && ./gradlew assembleRelease
```

Play Store paketi:

```bash
sh scripts/android/build-aab.sh     # → dist-android/*.aab
```

Android Studio ile açmak: `pnpm run mobile:open` (veya `android/` klasörünü aç).

---

## 4. Release imzası

### 4.1 Keystore üretimi

`scripts/android/make-keystore.sh`:

- `android/veyra-release.keystore` → PKCS12, RSA 2048, **10.000 gün** geçerlilik
- `android/keystore.properties` → Gradle'ın okuduğu dosya (mod 600)
- İkisi de `.gitignore` içindedir; **asla commit etmeyin.**

Gradle imzayı şu öncelikle çözer:

1. Ortam değişkenleri: `VEYRA_KEYSTORE_PATH`, `VEYRA_KEYSTORE_PASSWORD`,
   `VEYRA_KEY_ALIAS`, `VEYRA_KEY_PASSWORD`
2. `android/keystore.properties`
3. Hiçbiri yoksa → **uyarı basar ve imzasız derler** (build kırılmaz).

### 4.2 GitHub Actions (önerilen)

Workflow: `.github/workflows/android-release.yml`

- `main` / `arena/**` push ve PR'larda → APK+AAB **artifact** olarak yüklenir
  (Actions → run → *Artifacts* → `veyra-android-<numara>`).
- `v*` tag'inde → ayrıca **GitHub Release** oluşturulur.

Gerekli secret'lar (*Settings → Secrets and variables → Actions*):

| Secret | İçerik |
|---|---|
| `VEYRA_KEYSTORE_B64` | `base64 -w0 android/veyra-release.keystore` çıktısı |
| `VEYRA_KEYSTORE_PASSWORD` | keystore şifresi |
| `VEYRA_KEY_ALIAS` | alias (varsayılan `veyra-release`) |
| `VEYRA_KEY_PASSWORD` | alias şifresi |
| `VEYRA_CLERK_PUBLISHABLE_KEY` | opsiyonel — yoksa auth pasif, uygulama çalışır |
| `VEYRA_API_BASE_URL` | opsiyonel — bundle modda `/api` mutlak adresi |

Secret'lar yoksa pipeline **imzasız** APK üretir (derlemenin çalıştığını
kanıtlar); imza için yukarıdakileri tanımlayın.

### 4.3 Keystore'u kaybederseniz

Play Store'a aynı imzayla güncelleme **yüklenemez**. Keystore'u ve şifreleri
güvenli bir yerde yedekleyin. Play Console'da **Play App Signing** kullanırsanız
upload key'inizi yenileyebilirsiniz (Google destek talebiyle).

---

## 5. Web uygulamasıyla ilişkisi (neler korundu, neler eklendi)

**Korunan:** tüm sayfalar (`/`, `/drama/:id`, `/watch/...`, `/search`,
`/discover`, `/saved`, `/following`, `/rewards`, `/profile`, `/admin`), koyu
sinematik tema, alt cam navigasyon, dikey player (play/pause, seek, ses,
tam ekran, altyazı, sonraki bölüm), localStorage ilerleme kaydı.

**Eklenen native davranışlar:**

- `MainActivity` + `VeyraWebChromeClient`: HTML5 video tam ekranı gerçekten
  çalışır (Capacitor varsayılanı isteği iptal eder; biz siyah kapsayıcı +
  gizli sistem çubukları + yatay yönelim uygularız, çıkışta geri alırız).
- `SystemBars` (Capacitor 8 gömülü): koyu zeminde **beyaz** sistem çubuğu ikonları.
- Splash: `#111118` zemin + VEYRA rozeti (Android 12+ sistem splash'i dahil).
- `network_security_config`: yalnızca HTTPS (cleartext kapalı).

**Web tarafında yapılan tek değişiklik** (build'i kıran mevcut hatanın onarımı):

- `@clerk/react` v6 (Clerk Core 3) `SignedIn`/`SignedOut` bileşenlerini
  kaldırdığı için `App.tsx`'te `<Show when="signed-in">` /
  `<Show when="signed-out">` kullanıldı (davranış aynı).
- `/admin` sayfasında kullanılan ama import edilmemiş `ShieldCheck` ve `Upload`
  ikonları import listesine eklendi (gizli `ReferenceError` giderildi).

Bunların dışında **hiçbir mevcut dosya silinmedi veya yeniden yazılmadı**;
`package.json`'a yalnızca Capacitor bağımlılıkları ve `mobile:*` scriptleri
eklendi, `.gitignore`'a satır eklendi.

---

## 6. Sürüm yükseltme

1. `android/app/build.gradle` → `versionName` (ör. `1.1.0`) ve `versionCode` (+1)
   — veya CI'da tag atın: `git tag v1.1.0 && git push origin v1.1.0`
   (CI, tag'den `versionName`, `github.run_number`'dan `versionCode` üretir).
2. Web değiştiyse `build-web.sh` + `sync-android.sh` zaten `build-apk.sh` içinde çalışır.

---

## 7. Sık karşılaşılan sorunlar

| Belirti | Çözüm |
|---|---|
| `Unsupported class file major version` / `compileSdk` hatası | JDK 21 kurulu mu? `java -version` |
| `SDK location not found` | `ANDROID_HOME` tanımla veya `android/local.properties` içine `sdk.dir=...` |
| APK kuruluyor ama beyaz ekran | `assets/public/index.html` var mı? `sh scripts/android/sync-android.sh` |
| Oturum açma çalışmıyor | `VITE_CLERK_PUBLISHABLE_KEY` tanımlı mı? Remote mod için `VEYRA_ANDROID_SERVER_URL` dene |
| `/api` çağrıları 404 (bundle mod) | `VITE_API_BASE_URL` ile mutlak backend adresi ver |
| Google Fonts/posterler yüklenmiyor | Cihazda internet yok; içerik CDN'lerden gelir (INTERNET izni tanımlı) |
| İmzasız APK uyarısı | `make-keystore.sh` veya CI secret'ları |

---

## 8. Dosya haritası

```
capacitor.config.ts                  Capacitor + hibrit mod + splash/SystemBars ayarları
android/                             Native Gradle projesi (Capacitor şablonu + VEYRA özelleştirmeleri)
  app/build.gradle                   İmza çözümü + sürümleme + çıktı adı (veyra-*.apk)
  keystore.properties.example        İmza şablonu
  app/src/main/java/app/veyra/mobile/
      MainActivity.java              Köprü + tam ekran chrome client kurulumu
      VeyraWebChromeClient.java      Gerçek HTML5 tam ekran uygulaması
  app/src/main/res/                  VEYRA ikonları, splash, tema, ağ güvenliği
scripts/android/
  build-web.sh · sync-android.sh     Derleme + senkron
  make-keystore.sh                   Release keystore üretimi
  build-apk.sh · build-aab.sh        Uçtan uca imzalı çıktı → dist-android/
  generate-icons.mjs                 favicon → ikon/splash PNG (bağımlılıksız)
.github/workflows/android-release.yml  CI: imzalı APK/AAB + GitHub Release
artifacts/reeldrama/.env.example     Build env değişkenleri örneği
```
