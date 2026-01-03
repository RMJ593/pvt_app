#!/usr/bin/env bash
set -e

echo "🚀 Starting Render build process..."

# Install PHP dependencies
echo "📦 Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader

# Install Node dependencies
echo "📦 Installing NPM dependencies..."
npm ci

# Build frontend assets
echo "🎨 Building frontend assets..."
npm run build

# Clear Laravel caches
echo "⚙️ Clearing Laravel caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Run database migrations
echo "🗄️ Running database migrations..."
php artisan migrate --force

# Create storage directories
echo "📁 Creating storage directories..."
mkdir -p storage/app/public/hero-banners
mkdir -p storage/app/public/videos
mkdir -p storage/app/public/images
mkdir -p public/storage

# Create storage symlink with fallback
echo "🔗 Creating storage symlink..."
php artisan storage:link || ln -sfn /opt/render/project/src/storage/app/public /opt/render/project/src/public/storage

# Set proper permissions
echo "🔒 Setting storage permissions..."
chmod -R 775 storage bootstrap/cache
chmod -R 755 public

# Verify symlink
echo "✅ Verifying storage symlink..."
ls -la public/ | grep storage || echo "⚠️ Symlink verification failed"

# Cache optimizations
echo "⚡ Caching configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Build completed successfully!"