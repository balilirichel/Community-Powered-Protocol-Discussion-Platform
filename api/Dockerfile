FROM dunglas/frankenphp:1-php8.3-alpine

# Install system extensions required for Laravel & MySQL
RUN install-php-extensions \
    pdo_pgsql \
    pdo_mysql \
    mbstring \
    xml \
    openssl \
    zip \
    bcmath \
    opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy application files
COPY . /app

# Install Composer dependencies securely for production
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set correct storage permissions for Laravel
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Optimize configurations, routes, and views for production performance
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Expose Render's default port
EXPOSE 80

# Set custom deployment entrypoint script
ENTRYPOINT ["/bin/sh", "/app/scripts/deploy.sh"]
