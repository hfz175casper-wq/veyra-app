#!/usr/bin/env sh
# ---------------------------------------------------------------------------
# VEYRA web uygulamasının PRODUCTION derlemesi.
# Çıktı: artifacts/reeldrama/dist/public  (Capacitor'ın webDir hedefi)
#
# Bu script mevcut web uygulamasını DEĞİŞTİRMEZ; yalnızca Vite'ı production
# modunda çalıştırır. Replit derlemesiyle aynı komuttur.
# ---------------------------------------------------------------------------
set -eu
. "$(dirname "$0")/_common.sh"
cd "$VEYRA_ROOT"

: "${PORT:=22067}"
: "${BASE_PATH:=/}"
export PORT BASE_PATH
export NODE_ENV=production

if [ -z "${VITE_CLERK_PUBLISHABLE_KEY:-}" ]; then
  warn "VITE_CLERK_PUBLISHABLE_KEY tanımlı değil → uygulama açılır, katalog + player çalışır;"
  warn "ancak oturum açma (Sign in / Profile / Admin) APK'da pasif kalır."
  warn "Gerçek anahtar: artifacts/reeldrama/.env.production.local veya CI secret (VEYRA_CLERK_PUBLISHABLE_KEY)."
fi

if [ -n "${VEYRA_ANDROID_SERVER_URL:-}" ]; then
  info "REMOTE (hibrit) mod seçili: APK canlı siteyi yükleyecek → $VEYRA_ANDROID_SERVER_URL"
fi

info "Web production derlemesi başlıyor (PORT=$PORT BASE_PATH=$BASE_PATH)…"
run_pnpm --filter @workspace/reeldrama run build
info "Tamam → artifacts/reeldrama/dist/public"
