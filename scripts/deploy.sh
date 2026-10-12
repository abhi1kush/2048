#!/usr/bin/env bash
# Rebuild and publish dist/ to the gh-pages branch (GitHub Pages, branch-based).
set -euo pipefail
cd "$(dirname "$0")/.."
npm ci
npm run build
REMOTE=$(git remote get-url origin)
TMP=$(mktemp -d)
cp -r dist/. "$TMP"
touch "$TMP/.nojekyll"
cd "$TMP"
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C "$OLDPWD" config user.name)" -c user.email="$(git -C "$OLDPWD" config user.email)" commit -qm "Deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push -f "$REMOTE" gh-pages
rm -rf "$TMP"
echo "Deployed to gh-pages"
