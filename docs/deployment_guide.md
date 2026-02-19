# Інструкція з розгортання (Production)

Цей документ описує процес розгортання статичного сайту на виробничому сервері.

## 1. Вимоги до апаратного забезпечення

Оскільки проект є статичним, вимоги до ресурсів мінімальні.

*   **Архітектура:** x86_64, ARM64.
*   **Процесор (CPU):** 1 ядро (достатньо).
*   **Оперативна пам'ять (RAM):** Від 512 МБ. Більшість пам'яті використовуватиме веб-сервер (наприклад, nginx або Apache).
*   **Дисковий простір:**
    *   **Система:** 5-10 ГБ.
    *   **Дані проекту:** < 100 МБ (весь сайт займає дуже мало місця). Рекомендується передбачити трохи місця для логів.
*   **Операційна система:** Linux (рекомендовано Ubuntu 20.04/22.04 LTS або Debian 11/12) або Windows Server.

## 2. Необхідне програмне забезпечення (на прикладі Ubuntu Linux)

*   **Оновлення системи:**
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```
*   **Веб-сервер (вибрати один):**
    *   **Nginx** (рекомендовано):
        ```bash
        sudo apt install nginx -y
        sudo systemctl enable nginx
        sudo systemctl start nginx
        ```
    *   **Apache:**
        ```bash
        sudo apt install apache2 -y
        sudo systemctl enable apache2
        sudo systemctl start apache2
        ```
*   **Git (для клонування коду):**
    ```bash
    sudo apt install git -y
    ```

## 3. Налаштування мережі

*   **Порт 80 (HTTP):** Має бути відкритий у фаєрволі сервера.
    ```bash
    sudo ufw allow 80/tcp
    sudo ufw reload
    ```
*   **Порт 443 (HTTPS - рекомендовано):** Якщо планується налаштування SSL-сертифіката (наприклад, за допомогою Let's Encrypt), цей порт також має бути відкритий.
*   **DNS:** Налаштуйте A-запис вашого домену (наприклад, `bachelor.work`) на публічну IP-адресу сервера.

## 4. Конфігурація сервера (на прикладі Nginx)

1.  **Створіть директорію для проекту:**
    ```bash
    sudo mkdir -p /var/www/bachelor-work/html
    ```

2.  **Надайте права користувачу** (припустимо, ви заходите під користувачем `$USER`):
    ```bash
    sudo chown -R $USER:$USER /var/www/bachelor-work/html
    ```

3.  **Створіть конфігураційний файл для сайту:**
    ```bash
    sudo nano /etc/nginx/sites-available/bachelor-work
    ```
    Додайте наступну базову конфігурацію:
    ```nginx
    server {
        listen 80;
        listen [::]:80;

        root /var/www/bachelor-work/html;
        index index.html index.htm;

        server_name bachelor.work www.bachelor.work; # Змініть на ваш домен

        location / {
            try_files $uri $uri/ =404;
        }

        # Опціонально: кешування статичних файлів
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp|svg)$ {
            expires 30d;
            add_header Cache-Control "public, no-transform";
        }
    }
    ```

4.  **Активуйте сайт:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/bachelor-work /etc/nginx/sites-enabled/
    sudo nginx -t # Перевірка конфігурації
    sudo systemctl reload nginx
    ```

## 5. Налаштування СУБД

Не потрібно, оскільки проект не використовує базу даних.

## 6. Розгортання коду

1.  **Клонуйте репозиторій** в цільову директорію:
    ```bash
    git clone https://github.com/B1H1PyX/tppz_lr2.git /tmp/bachelor-project
    ```
2.  **Скопіюйте файли** (без папки `.git` та `docs`, якщо вони не потрібні на продакшені):
    ```bash
    cp -r /tmp/bachelor-project/* /var/www/bachelor-work/html/
    cp -r /tmp/bachelor-project/.[!.]* /var/www/bachelor-work/html/ 2>/dev/null # Копіювати приховані файли, якщо є
    ```
3.  **Встановіть правильні права:**
    ```bash
    sudo chown -R www-data:www-data /var/www/bachelor-work/html
    ```
4.  **Очистіть тимчасові файли:**
    ```bash
    rm -rf /tmp/bachelor-project
    ```

## 7. Перевірка працездатності

1.  **Перевірте статус веб-сервера:**
    ```bash
    sudo systemctl status nginx
    ```
2.  **Відкрийте IP-адресу або домен вашого сервера у браузері.** Ви повинні побачити головну сторінку проекту.
3.  **Перевірте консоль браузера** (F12 -> Console) на наявність помилок (404, 500).
4.  **Перевірте роботу JavaScript:** проскрольте сторінку вниз і переконайтеся, що з'являється кнопка "Вгору". Натисніть на неї — сторінка має плавно прокрутитися вгору.