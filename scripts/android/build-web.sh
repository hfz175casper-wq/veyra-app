#!/usr/bin/env sh
# ---------------------------------------------------------------------------
# VEYRA web uygulamas?n?n PRODUCTION derlemesi.
# ??kt?: artifacts/reeldrama/dist/public  (Capacitor'?n webDir hedefi)
#
# Bu script mevcut web uygulamas?n? DE???T?RMEZ; yaln?zca Vite'? production
# modunda ?al??t?r?r. Replit derlemesiyle ayn? komuttur.
# ---------------------------------------------------------------------------
set -eu
. "$(dirname "$0")/_common.sh"
cd "$VEYRA_ROOT"

: "${PORT:=22067}"
: "${BASE_PATH:=/}"
export PORT BASE_PATH
export NODE_ENV=production

if [ -z "${VITE_CLERK_PUBLISHABLE_KEY:-}" ]; then
  warn "VITE_CLERK_PUBLISHABLE_KEY tan?ml? de?il ? uygulama a??l?r, katalog + player ?al???r;"
  warn "ancak oturum a?ma (Sign in / Profile / Admin) APK'da pasif kal?r."
  warn "Ger?ek anahtar: artifacts/reeldrama/.env.production.local veya CI secret (VEYRA_CLERK_PUBLISHABLE_KEY)."
fi

if [ -n "${VEYRA_ANDROID_SERVER_URL:-}" ]; then
  info "REMOTE (hibrit) mod se?ili: APK canl? siteyi y?kleyecek ? $VEYRA_ANDROID_SERVER_URL"
fi

info "Web production derlemesi ba?l?yor (PORT=$PORT BASE_PATH=$BASE_PATH)?"
run_pnpm --filter @workspace/reeldrama run build
info "Tamam ? artifacts/reeldrama/dist/public"
