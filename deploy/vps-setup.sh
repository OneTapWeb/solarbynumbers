#!/usr/bin/env bash
# One-time VPS setup for solarbynumbers.co.uk (run as root on 185.249.75.81).
# Mirrors the existing onetapweb nginx/certbot patterns on the same box.
set -euo pipefail

DOMAIN=solarbynumbers.co.uk
WEBROOT=/var/www/$DOMAIN

echo "== webroot =="
mkdir -p "$WEBROOT"
echo '<!doctype html><title>Solar by Numbers</title><p>Deploy pending…' > "$WEBROOT/index.html"

echo "== nginx server block =="
# expects nginx-solarbynumbers.conf to have been scp'd to /tmp first
cp /tmp/nginx-solarbynumbers.conf /etc/nginx/sites-available/$DOMAIN
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
nginx -t
systemctl reload nginx

echo "== certbot (adds 443 + cert lines to the server block) =="
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --redirect -m dave.caldeira@tucasi.com

echo "== rsync present? (needed by the GitHub Action) =="
command -v rsync || apt-get install -y rsync

echo "done — https://$DOMAIN"
