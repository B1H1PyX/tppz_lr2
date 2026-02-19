#!/bin/bash

# scripts/dev-server.sh - Запуск простого HTTP-сервера для розробки

echo "Запускаємо сервер для розробки за адресою http://localhost:8080"
echo "Натисніть Ctrl+C для зупинки."

# Використовуємо Python 3 для запуску простого HTTP-сервера
cd "$(dirname "$0")/.." # Перехід в корінь проекту
python3 -m http.server 8080