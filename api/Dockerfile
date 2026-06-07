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

WORKDIR /app

COPY composer.json composer.lock /app/

RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

COPY . /app

RUN composer dump-autoload --optimize

RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

EXPOSE 80

# Run migrations then hand off to default FrankenPHP entrypoint
CMD ["sh", "-c", "php artisan migrate --force && php artisan db:seed --force && php artisan typesense:reindex && frankenphp run --config /etc/caddy/Caddyfile"]
