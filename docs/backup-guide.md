# Інструкція з резервного копіювання та відновлення

Цей документ описує стратегію та процедури резервного копіювання для статичного сайту.

## 1. Стратегія резервного копіювання

Основним об'єктом резервного копіювання є файли самого сайту. Додатково слід копіювати конфігурацію веб-сервера, оскільки вона була налаштована вручну.

### Типи резервних копій
*   **Повні копії:** Створюються щотижня. Містять всю папку проекту (`/var/www/bachelor-work/`) та конфігураційні файли Nginx (`/etc/nginx/sites-available/`, `/etc/nginx/sites-enabled/`).
*   **Інкрементальні/Диференціальні:** Для такого малого об'єму даних (статичний сайт) достатньо лише повних копій. Це спрощує процес відновлення.

### Частота створення резервних копій
*   **Файли сайту:** Щоденно (наприклад, о 03:00 ночі).
*   **Конфігурація веб-сервера:** Щотижня, або після будь-яких змін у конфігурації.
*   **Логи:** Логи системи та веб-сервера ротуються автоматично інструментами ОС (`logrotate`). Їх резервне копіювання не є критичним, але може бути корисним для аудиту.

### Зберігання та ротація копій
*   **Локальне сховище:** Зберігати останні 7 щоденних копій на самому сервері (в окремій папці, наприклад, `/backups/local/`).
*   **Віддалене сховище:** Щоденні копії синхронізувати з віддаленим об'єктним сховищем (AWS S3, Google Cloud Storage) або іншим сервером. Це захистить дані у разі фізичної поломки сервера. Зберігати копії за останні 30 днів.

## 2. Процедура резервного копіювання

### Бази даних
Не потрібно.

### Файлів конфігурацій та користувацьких даних
Створіть скрипт `/usr/local/bin/backup-bachelor.sh`:
```bash
#!/bin/bash

# Змінні
BACKUP_DIR="/backups/local"
REMOTE_BUCKET="s3://my-backup-bucket/bachelor-work/"
DATE=$(date +%Y%m%d)
BACKUP_FILE="$BACKUP_DIR/bachelor-full-$DATE.tar.gz"
CONFIG_BACKUP_FILE="$BACKUP_DIR/nginx-config-$DATE.tar.gz"

# Створити директорію, якщо її немає
mkdir -p $BACKUP_DIR

# 1. Резервне копіювання файлів сайту
echo "Створення резервної копії файлів сайту..."
tar -czf $BACKUP_FILE /var/www/bachelor-work/

# 2. Резервне копіювання конфігурації Nginx
echo "Створення резервної копії конфігурації Nginx..."
tar -czf $CONFIG_BACKUP_FILE /etc/nginx/sites-available/ /etc/nginx/sites-enabled/ /etc/nginx/nginx.conf

# 3. Синхронізація з віддаленим сховищем (приклад з AWS CLI)
# Переконайтеся, що aws cli встановлено та налаштовано
# echo "Копіювання у віддалене сховище..."
# aws s3 cp $BACKUP_FILE $REMOTE_BUCKET
# aws s3 cp $CONFIG_BACKUP_FILE $REMOTE_BUCKET

# 4. Ротація локальних копій (зберігати 7 днів)
find $BACKUP_DIR -name "bachelor-full-*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "nginx-config-*.tar.gz" -mtime +7 -delete

echo "Резервне копіювання завершено."
```

### Автоматизація процесу
Додайте завдання в cron для щоденного виконання:

```bash
sudo crontab -e
# Додайте рядок:
0 3 * * * /usr/local/bin/backup-bachelor.sh >> /var/log/backup.log 2>&1
```

## 3. Процедура відновлення з резервних копій
###  Повне відновлення системи
Зупиніть веб-сервер (за потреби):

```bash
sudo systemctl stop nginx
```
Відновіть файли сайту:

```bash
# Знайдіть потрібну резервну копію
ls -la /backups/local/bachelor-full-*.tar.gz

# Розпакуйте її в корінь
sudo tar -xzf /backups/local/bachelor-full-20231027.tar.gz -C /
# Це відновить структуру /var/www/bachelor-work/
```
Відновіть конфігурацію Nginx (якщо вона була втрачена):

```bash
sudo tar -xzf /backups/local/nginx-config-20231027.tar.gz -C /
```
Встановіть правильні права:

```bash
sudo chown -R www-data:www-data /var/www/bachelor-work/
```
Перевірте конфігурацію та запустіть веб-сервер:

```bash
sudo nginx -t
sudo systemctl start nginx
```
### Вибіркове відновлення даних
Якщо потрібно відновити лише один файл (наприклад, index.html):

```bash
# Перегляньте вміст архіву
tar -tzf /backups/local/bachelor-full-20231027.tar.gz | grep index.html

# Розпакуйте тільки цей файл
tar -xzf /backups/local/bachelor-full-20231027.tar.gz -C /tmp ./var/www/bachelor-work/html/index.html

# Скопіюйте файл на місце
sudo cp /tmp/var/www/bachelor-work/html/index.html /var/www/bachelor-work/html/index.html

# Очистіть тимчасові файли
rm -rf /tmp/var
```
## Тестування відновлення
Рекомендується раз на місяць (або квартал) проводити тестове відновлення на окремому тестовому сервері, щоб переконатися в цілісності резервних копій та працездатності процедури.