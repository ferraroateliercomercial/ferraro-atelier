#!/usr/bin/env bash
# Monta a pasta publicada (dist/) só com o que o site usa. Os arquivos de trabalho (branding, documentos,
# ferramentas, configurações do editor) ficam no repositório, mas não vão para o ar.
# Na Cloudflare Pages (ou Netlify): comando de build "bash scripts/build.sh", pasta de saída "dist".
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist
mkdir -p dist
cp index.html dist/
cp -r css js assets dist/
# cabeçalhos de cache das imagens e do filme (Cloudflare e Netlify leem este arquivo)
cp _headers dist/
echo "dist/ pronto: $(find dist -type f | wc -l) arquivos"
