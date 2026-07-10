#!/bin/sh
# Injecte le SHA du commit courant dans tous les ?v=... des <script>/<link>
# locaux (js/*.js, css/*.css) au moment du build Netlify, pour forcer chaque
# navigateur à retélécharger les fichiers modifiés à chaque déploiement —
# sans dépendre d'un bump manuel de version qu'on peut oublier.
set -e

SHA="${COMMIT_REF:-$(git rev-parse HEAD 2>/dev/null || echo dev)}"
SHORT=$(printf '%s' "$SHA" | cut -c1-8)

for f in index.html team-form.html; do
  if [ -f "$f" ]; then
    sed -i.bak -E "s/(\.(js|css))\?v=[A-Za-z0-9]+/\1?v=$SHORT/g" "$f"
    rm -f "$f.bak"
    echo "Cache-busting: $f -> ?v=$SHORT"
  fi
done
