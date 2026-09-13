#!/usr/bin/env sh
# ---------------------------------------------------------------------------
# Play Store için RELEASE AAB (Android App Bundle) üretir.
# Adımlar build-apk.sh ile aynıdır; tek fark bundleRelease görevi.
# ---------------------------------------------------------------------------
set -eu
. "$(dirname "$0")/_common.sh"
cd "$VEYRA_ROOT"

sh "$VEYRA_ROOT/scripts/android/build-web.sh"
sh "$VEYRA_ROOT/scripts/android/sync-android.sh"
check_android_toolchain

info "Gradle: bundleRelease …"
cd "$VEYRA_ROOT/android"
./gradlew bundleRelease --no-daemon --stacktrace

OUT_DIR="$VEYRA_ROOT/android/app/build/outputs/bundle/release"
DEST="$VEYRA_ROOT/dist-android"
mkdir -p "$DEST"

found=0
for aab in "$OUT_DIR"/*.aab; do
  [ -e "$aab" ] || continue
  cp "$aab" "$DEST/"
  found=1
done
[ "$found" -eq 1 ] || fail "AAB bulunamadı: $OUT_DIR (gradle çıktısını kontrol edin)"

info "Üretilen AAB'ler → dist-android/"
if command -v sha256sum >/dev/null 2>&1; then
  (cd "$DEST" && sha256sum *.aab)
fi
info "Play Console'a dist-android/*.aab yükleyin. İmza: Play App Signing önerilir (docs/ANDROID.md)."
