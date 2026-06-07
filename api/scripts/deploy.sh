#!/bin/sh

# Fail immediately if any command returns a non-zero exit code
set -e

echo "🚀 Booting up deployment script..."

# Run database migrations automatically
echo "⚙️ Running migrations..."
php artisan migrate --force

# Seed mock data if needed (Optional: check if database is empty first or keep enabled)
echo "🌱 Seeding mock data..."
php artisan db:seed --force

# Sync your Typesense indexes with the production server
echo "🔍 Reindexing Typesense collections..."
php artisan typesense:reindex

echo "🏁 Starting FrankenPHP Web Server..."
exec frankenphp run --config /etc/caddy/Caddyfile