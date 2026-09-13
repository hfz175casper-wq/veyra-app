#!/usr/bin/env sh
# ---------------------------------------------------------------------------
# U?tan uca imzal? RELEASE APK ?retir.
#   1) web production derlemesi   (build-web.sh)
#   2) cap sync android           (sync-android.sh)
#   3) gradlew assembleRelease
#   4) APK'y? dist-android/ dizinine kopyalar + sha256 basar
#
# ?nko?ullar: JDK 21 + Android SDK 36 (docs/ANDROID.md).
# ?mza: android/keystore.properties veya VEYRA_KEYSTORE_* env (CI ile ayn? yol).
# ---------------------------------------------------------------------------
set -eu
. "$(dirname "$0")/_common.sh"
cd "$VEYRA_ROOT"

sh "$VEYRA_ROOT/scripts/android/build-web.sh"
sh "$VEYRA_ROOT/scripts/android/sync-android.sh"
check_android_toolchain

info "Gradle: assembleRelease (bu birka? dakika s?rebilir)?"
cd "$VEYRA_ROOT/android"
./gradlew assembleRelease --no-daemon --stacktrace

OUT_DIR="$VEYRA_ROOT/android/app/build/outputs/apk/release"
DEST="$VEYRA_ROOT/dist-android"
mkdir -p "$DEST"

found=0
for apk in "$OUT_DIR"/veyra-*.apk; do
  [ -e "$apk" ] || continue
  cp "$apk" "$DEST/"
  found=1
done
[ "$found" -eq 1 ] || fail "APK bulunamad?: $OUT_DIR (gradle ??kt?s?n? kontrol edin)"

info "?retilen APK'lar ? dist-android/"
if command -v sha256sum >/dev/null 2>&1; then
  (cd "$DEST" && sha256sum veyra-*.apk)
fi

if [ ! -f "$VEYRA_ROOT/android/keystore.properties" ] && [ -z "${VEYRA_KEYSTORE_PATH:-}" ]; then
  warn "Keystore tan?ml? de?ildi ? APK ?MZASIZ. Kurulu test i?in: scripts/android/make-keystore.sh"
else
  info "APK release keystore ile imzaland?. Cihaza kurulum: adb install -r dist-android/veyra-*.apk"
fi
