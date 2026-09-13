#!/usr/bin/env sh
# ---------------------------------------------------------------------------
# VEYRA release keystore üretir (PKCS12, RSA 2048, 10.000 gün ≈ 27 yıl).
#
# Üretilenler (Git'e GİRMEZ):
#   android/veyra-release.keystore
#   android/keystore.properties
#
# Kullanım:
#   sh scripts/android/make-keystore.sh
#   VEYRA_KEY_ALIAS=farkli-alias sh scripts/android/make-keystore.sh
#
# Mevcut keystore VARSA üzerine YAZMAZ (güvenlik).
# ---------------------------------------------------------------------------
set -eu
. "$(dirname "$0")/_common.sh"
cd "$VEYRA_ROOT"

KEYSTORE="$VEYRA_ROOT/android/veyra-release.keystore"
PROPERTIES="$VEYRA_ROOT/android/keystore.properties"
ALIAS="${VEYRA_KEY_ALIAS:-veyra-release}"

if ! command -v keytool >/dev/null 2>&1; then
  fail "keytool bulunamadı → JDK kurulu değil. JDK 21: https://adoptium.net"
fi

if [ -f "$KEYSTORE" ]; then
  fail "Keystore zaten var: $KEYSTORE — güvenlik için üzerine yazılmaz. Yeniden üretmek için önce kendiniz taşıyın."
fi

gen_pw() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | cut -c1-28
  else
    tr -dc 'A-Za-z0-9' </dev/urandom | head -c 28
  fi
}

STORE_PW="${VEYRA_KEYSTORE_PASSWORD:-$(gen_pw)}"
KEY_PW="${VEYRA_KEY_PASSWORD:-$STORE_PW}"

info "Keystore üretiliyor: $(basename "$KEYSTORE") (alias=$ALIAS)…"
keytool -genkeypair -v \
  -keystore "$KEYSTORE" \
  -storetype PKCS12 \
  -alias "$ALIAS" \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$STORE_PW" -keypass "$KEY_PW" \
  -dname "CN=VEYRA, OU=Mobile, O=VEYRA, L=Istanbul, ST=Istanbul, C=TR"

cat >"$PROPERTIES" <<EOF
# scripts/android/make-keystore.sh tarafından üretildi — Git'e GİRMEZ.
storeFile=veyra-release.keystore
storePassword=$STORE_PW
keyAlias=$ALIAS
keyPassword=$KEY_PW
EOF

chmod 600 "$KEYSTORE" "$PROPERTIES"

info "Tamam. Şimdi imzalı APK: sh scripts/android/build-apk.sh"
info ""
info "CI (GitHub Actions) için secret'ları tanımlayın:"
info "  VEYRA_KEYSTORE_B64     = $(printf 'base64 -w0 %s' "$KEYSTORE" | sed 's/$/  çıktısı/')"
info "  VEYRA_KEYSTORE_PASSWORD= (yukarıdaki storePassword)"
info "  VEYRA_KEY_ALIAS        = $ALIAS"
info "  VEYRA_KEY_PASSWORD     = (yukarıdaki keyPassword)"
info ""
warn "ÖNEMLİ: keystore'u kaybederseniz Play Store güncellemesi YÜKLENEMEZ. Yedekleyin."
