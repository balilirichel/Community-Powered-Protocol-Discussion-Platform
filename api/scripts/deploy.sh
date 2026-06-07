#!/bin/sh

set -e

echo "🚀 Booting up deployment script..."

echo "⚙️ Running migrations..."
php artisan migrate --force

echo "🌱 Seeding mock data..."
php artisan db:seed --force

echo "🔍 Reindexing Typesense collections..."
php artisan typesense:reindex

echo "🏁 Starting FrankenPHP Web Server..."
which frankenphp || find / -name "frankenphp" 2>/dev/null
exec /usr/local/bin/frankenphp run --config /etc/caddy/Caddyfile
