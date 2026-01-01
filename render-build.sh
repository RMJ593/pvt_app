#!/usr/bin/env bash
# exit on error
set -o errexit

composer install --no-dev --optimize-autoloader
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Install npm dependencies and build assets
npm ci
npm run build

# Run migrations
php artisan migrate --force