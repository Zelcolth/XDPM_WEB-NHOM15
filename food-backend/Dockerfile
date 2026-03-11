# Dùng môi trường PHP 8.2
FROM php:8.2-cli

# Cài đặt các công cụ cần thiết cho Laravel
RUN apt-get update -y && apt-get install -y libmcrypt-dev libzip-dev zip unzip

# Cài đặt Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Cài đặt thư viện kết nối MySQL
RUN docker-php-ext-install pdo_mysql zip

# Chép toàn bộ code từ máy bạn vào máy chủ Render
WORKDIR /app
COPY . /app

# Cài đặt các thư viện của Laravel
RUN composer install --optimize-autoloader --no-dev

# Chạy server Laravel khi khởi động
CMD php artisan serve --host=0.0.0.0 --port=$PORT