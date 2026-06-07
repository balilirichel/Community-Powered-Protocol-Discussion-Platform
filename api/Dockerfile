FROM dunglas/frankenphp:1-php8.4-alpine

# Install system extensions required for Laravel & MySQL
RUN install-php-extensions \
    pdo_pgsql \
    pdo_mysql \
    mbstring \
    xml \
    openssl \
    zip \
    bcmath \
    opcache \
    intl \
    curl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy composer files first
COPY composer.json composer.lock /app/

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Copy rest of application files
COPY . /app

# Run composer scripts now that full app is present
RUN composer dump-autoload --optimize

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
