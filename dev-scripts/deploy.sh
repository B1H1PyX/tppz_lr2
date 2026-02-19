#!/bin/bash

# scripts/deploy.sh - Скрипт для автоматичного розгортання на production сервері
# Використання: ./deploy.sh [branch_name]

set -e # Зупинити скрипт при першій помилці

REPO_URL="https://github.com/B1H1PyX/tppz_lr2.git"
TARGET_DIR="/var/www/bachelor-work/html"
BACKUP_DIR="/var/www/bachelor-work/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BRANCH=${1:-main} # Використовуємо перший аргумент або 'main' за замовчуванням

echo "=== Початок розгортання проекту ==="
echo "Гілка: $BRANCH"

# 1. Створення резервної копії
echo "1. Створення резервної копії поточної версії..."
mkdir -p $BACKUP_DIR
if [ -d "$TARGET_DIR" ]; then
    sudo cp -r $TARGET_DIR $BACKUP_DIR/html-backup-$TIMESTAMP
    echo "   Резервна копія створена: $BACKUP_DIR/html-backup-$TIMESTAMP"
else
    echo "   Цільова папка не існує, створюємо..."
    sudo mkdir -p $TARGET_DIR
fi

# 2. Клонування нової версії в тимчасову папку
echo "2. Клонування гілки $BRANCH з репозиторію..."
TMP_DIR=$(mktemp -d)
git clone --branch $BRANCH $REPO_URL $TMP_DIR

# 3. Копіювання файлів в цільову директорію
echo "3. Копіювання файлів в $TARGET_DIR..."
sudo rsync -av --delete $TMP_DIR/ $TARGET_DIR/

# 4. Встановлення прав
echo "4. Встановлення прав доступу..."
sudo chown -R www-data:www-data $TARGET_DIR

# 5. Очищення
echo "5. Очищення тимчасових файлів..."
rm -rf $TMP_DIR

echo "=== Розгортання успішно завершено! ==="