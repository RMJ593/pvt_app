FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql mysqli mbstring exif pcntl bcmath gd

# Enable Apache modules
RUN a2enmod rewrite

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Node dependencies and build assets
RUN npm ci && npm run build

# Create storage directories structure
RUN mkdir -p storage/app/public/hero-banners \
    && mkdir -p storage/app/public/videos \
    && mkdir -p storage/app/public/images \
    && mkdir -p storage/framework/cache \
    && mkdir -p storage/framework/sessions \
    && mkdir -p storage/framework/views \
    && mkdir -p storage/logs \
    && mkdir -p bootstrap/cache

# Set ownership to www-data FIRST
RUN chown -R www-data:www-data /var/www/html

# Set permissions
RUN chmod -R 775 storage bootstrap/cache \
    && chmod -R 755 public

# Remove public/storage if it exists (to avoid conflicts)
RUN rm -rf public/storage

# Create the symlink manually (MORE RELIABLE than artisan)
RUN ln -s /var/www/html/storage/app/public /var/www/html/public/storage

# Verify symlink was created and works
RUN ls -la public/ | grep storage && echo "✅ Symlink created successfully" || echo "❌ Symlink creation failed"

# Configure Apache DocumentRoot
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Add Apache configuration for storage access
RUN echo '<Directory /var/www/html/public/storage>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride None\n\
    Require all granted\n\
</Directory>\n\
\n\
# Alias for storage if symlink fails\n\
Alias /storage /var/www/html/storage/app/public\n\
<Directory /var/www/html/storage/app/public>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride None\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/apache2.conf

# Create entrypoint script
RUN echo '#!/bin/bash\n\
set -e\n\
echo "🚀 Starting application..."\n\
\n\
# Force recreate symlink if missing\n\
if [ ! -L "/var/www/html/public/storage" ]; then\n\
    echo "📎 Creating storage symlink..."\n\
    rm -rf /var/www/html/public/storage\n\
    ln -s /var/www/html/storage/app/public /var/www/html/public/storage\n\
fi\n\
\n\
# Verify symlink\n\
if [ -L "/var/www/html/public/storage" ]; then\n\
    echo "✅ Storage symlink exists"\n\
    ls -la /var/www/html/public/storage\n\
else\n\
    echo "❌ Storage symlink missing!"\n\
fi\n\
\n\
# Clear config only (no DB needed)\n\
php artisan config:clear\n\
\n\
# Run migrations FIRST (this creates the cache table)\n\
php artisan migrate --force\n\
\n\
# NOW safe to clear cache (table exists now)\n\
php artisan cache:clear\n\
\n\
# Cache config\n\
php artisan config:cache\n\
\n\
echo "🎬 Starting Apache on port $PORT..."\n\
export PORT=${PORT:-80}\n\
sed -i "s/Listen 80/Listen $PORT/" /etc/apache2/ports.conf\n\
sed -i "s/:80/:$PORT/" /etc/apache2/sites-enabled/*.conf\n\
apache2-foreground' > /entrypoint.sh

RUN chmod +x /entrypoint.sh

# Set final ownership
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["/entrypoint.sh"]