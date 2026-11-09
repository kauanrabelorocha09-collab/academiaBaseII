#!/usr/bin/env bash
# Gera o pacote para publicar o site (hospedagem estática, ex.: Cloudflare Pages).
#   bash scripts/gerar-pacote-publicacao.sh  →  entrega/academia-base-ii-publicar.zip
# Leva só o que o site usa: index.html, css/, js/ e assets/ (sem testes, scripts e LEIA-MEs).
set -euo pipefail
cd "$(dirname "$0")/.."
DESTINO=entrega/publicar
rm -rf "$DESTINO" entrega/academia-base-ii-publicar.zip
mkdir -p "$DESTINO"
cp -r index.html css js assets "$DESTINO"/
find "$DESTINO" -name '*.md' -delete
(cd "$DESTINO" && zip -qr ../academia-base-ii-publicar.zip .)
echo "Gerado: entrega/academia-base-ii-publicar.zip ($(du -h entrega/academia-base-ii-publicar.zip | cut -f1))"
