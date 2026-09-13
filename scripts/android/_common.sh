#!/usr/bin/env sh
# ---------------------------------------------------------------------------
# VEYRA Android ? ortak yard?mc?lar.
# Di?er scriptler bu dosyay? `source` eder; do?rudan ?al??t?r?lmaz.
# ---------------------------------------------------------------------------

VEYRA_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
export VEYRA_ROOT

info() { printf '\033[1;36m[veyra]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[veyra UYARI]\033[0m %s\n' "$*" >&2; }
fail() { printf '\033[1;31m[veyra HATA]\033[0m %s\n' "$*" >&2; exit 1; }

# pnpm: kuruluysa onu, yoksa corepack ?zerinden ?al??t?r.
run_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then
    pnpm "$@"
  elif command -v corepack >/dev/null 2>&1; then
    corepack pnpm "$@"
  else
    fail "pnpm bulunamad?. Kurulum: 'npm i -g pnpm' veya 'corepack enable pnpm'"
  fi
}

# Capacitor CLI (k?k node_modules ?zerinden).
cap_cli() {
  run_pnpm exec cap "$@"
}

require_file() {
  [ -e "$1" ] || fail "Beklenen dosya yok: $1"
}

# Android derlemesi i?in ?nko?ullar (JDK 21 + Android SDK).
check_android_toolchain() {
  if ! command -v java >/dev/null 2>&1; then
    fail "Java bulunamad?. Capacitor 8 / AGP 8.13 i?in JDK 21 gerekir.
     Kurulum: https://adoptium.net (Temurin 21) veya 'sdkman install java 21-tem'"
  fi
  java_major="$(java -version 2>&1 | head -1 | sed -E 's/.*"([0-9]+).*/\1/')"
  if [ "${java_major:-0}" -lt 21 ]; then
    warn "Java s?r?m? $java_major g?r?n?yor; Capacitor 8 JDK 21 bekler. Derleme ba?ar?s?z olursa JDK 21 kurun."
  fi
  if [ -z "${ANDROID_HOME:-}" ] && [ -z "${ANDROID_SDK_ROOT:-}" ]; then
    warn "ANDROID_HOME/ANDROID_SDK_ROOT tan?ml? de?il."
    warn "Android Studio kuruluysa sorun olmaz; de?ilse SDK kurup ANDROID_HOME tan?mlay?n (docs/ANDROID.md)."
  fi
}
