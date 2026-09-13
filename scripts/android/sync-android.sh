#!/usr/bin/env sh
# ---------------------------------------------------------------------------
# Web varl?klar?n? + Capacitor eklentilerini Android projesine kopyalar.
# (cap sync android ? assets/public + capacitor.settings.gradle g?ncellenir)
# ---------------------------------------------------------------------------
set -eu
. "$(dirname "$0")/_common.sh"
cd "$VEYRA_ROOT"

WEB_DIR="$VEYRA_ROOT/artifacts/reeldrama/dist/public"
if [ ! -f "$WEB_DIR/index.html" ]; then
  warn "Web derlemesi bulunamad? ? ?nce build-web.sh ?al??t?r?l?yor?"
  sh "$VEYRA_ROOT/scripts/android/build-web.sh"
fi

if [ ! -d "$VEYRA_ROOT/android" ]; then
  fail "android/ projesi yok. Bir kez i?in: pnpm exec cap add android"
fi

info "cap sync android ?"
cap_cli sync android
info "Tamam ? android/app/src/main/assets/public (ve eklenti gradle dosyalar?)"
