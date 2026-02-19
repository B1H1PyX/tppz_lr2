@echo off
REM scripts/dev-server.bat - Запуск простого HTTP-сервера для розробки на Windows

echo Запускаємо сервер для розробки за адресою http://localhost:8080
echo Натисніть Ctrl+C для зупинки.

cd /d "%~dp0.." 
REM Перевірка, чи встановлено Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Помилка: Python не знайдено. Будь ласка, встановіть Python.
    pause
    exit /b
)

python -m http.server 8080