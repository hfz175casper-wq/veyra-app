#!/usr/bin/env sh
# ---------------------------------------------------------------------------
# VEYRA Android — ortak yardımcılar.
# Diğer scriptler bu dosyayı `source` eder; doğrudan çalıştırılmaz.
# ---------------------------------------------------------------------------

VEYRA_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
export VEYRA_ROOT

info() { printf '\033[1;36m[veyra]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[veyra UYARI]\033[0m %s\n' "$*" >&2; }
fail() { printf '\033[1;31m[veyra HATA]\033[0m %s\n' "$*" >&2; exit 1; }

# pnpm: kuruluysa onu, yoksa corepack üzerinden çalıştır.
run_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then
    pnpm "$@"
  elif command -v corepack >/dev/null 2>&1; then
    corepack pnpm "$@"
  else
    fail "pnpm bulunamadı. Kurulum: 'npm i -g pnpm' veya 'corepack enable pnpm'"
  fi
}

# Capacitor CLI (kök node_modules üzerinden).
cap_cli() {
  run_pnpm exec cap "$@"
}

require_file() {
  [ -e "$1" ] || fail "Beklenen dosya yok: $1"
}

# Android derlemesi için önkoşullar (JDK 21 + Android SDK).
check_android_toolchain() {
  if ! command -v java >/dev/null 2>&1; then
    fail "Java bulunamadı. Capacitor 8 / AGP 8.13 için JDK 21 gerekir.
     Kurulum: https://adoptium.net (Temurin 21) veya 'sdkman install java 21-tem'"
  fi
  java_major="$(java -version 2>&1 | head -1 | sed -E 's/.*"([0-9]+).*/\1/')"
  if [ "${java_major:-0}" -lt 21 ]; then
    warn "Java sürümü $java_major görünüyor; Capacitor 8 JDK 21 bekler. Derleme başarısız olursa JDK 21 kurun."
  fi
  if [ -z "${ANDROID_HOME:-}" ] && [ -z "${ANDROID_SDK_ROOT:-}" ]; then
    warn "ANDROID_HOME/ANDROID_SDK_ROOT tanımlı değil."
    warn "Android Studio kuruluysa sorun olmaz; değilse SDK kurup ANDROID_HOME tanımlayın (docs/ANDROID.md)."
  fi
}
