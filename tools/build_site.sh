#!/bin/sh
# Builds the website (site/, Next.js) into docs/ for GitHub Pages.
# The report app (start.html, app.js, engine.js ...) lives in site/public and is copied as-is.
set -e
cd "$(dirname "$0")/.."
python3 tools/app_chrome.py
cd site
[ -d node_modules ] || npm install --no-audit --no-fund
rm -rf out .next
NEXT_TELEMETRY_DISABLED=1 PAGES_BASE=/creator-growth-studio NEXT_PUBLIC_BASE=/creator-growth-studio npx next build
cd ..
rm -rf docs && cp -r site/out docs && touch docs/.nojekyll
echo "built docs/"
