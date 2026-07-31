FROM php:8.2-apache

# Install PDO MySQL and PGSQL extensions
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Set the working directory to where the PHP files are
WORKDIR /var/www/html

# Copy all files from the api folder to the container
COPY . .

# Expose port 80
EXPOSE 80

# Start Apache in the foreground
CMD ["apache2-foreground"]
