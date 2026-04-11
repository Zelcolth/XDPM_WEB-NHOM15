# Dùng môi trường PHP 8.2 siêu nhẹ
FROM php:8.2-cli

# Cài đặt các thư viện cần thiết cho Laravel và MySQL
RUN apt-get update && apt-get install -y \
    unzip \
    git \
    libzip-dev \
    && docker-php-ext-install pdo pdo_mysql zip

# Cài đặt Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Chuyển vào thư mục làm việc
WORKDIR /app

# Copy toàn bộ code backend vào trong container
COPY . .

# Chạy lệnh cài đặt thư viện của Laravel
RUN composer install --no-dev --optimize-autoloader

# Cấp quyền cho thư mục chứa ảnh và cache
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Khởi động service: tạo symlink storage, clear cache, cache config, generate Swagger rồi mới serve
CMD ["sh", "-lc", "php artisan storage:link || true && php artisan optimize:clear && php artisan config:cache && php artisan l5-swagger:generate && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"]