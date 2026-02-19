/**
 * Модуль відображення модального вікна помилки
 * @module errorModal
 */

import { getUserFriendlyMessage, getErrorCode } from './errorMessages.js';
import logger from './logger.js';

/**
 * Створює HTML-структуру модального вікна
 * @returns {string} HTML модального вікна
 */
function createModalHTML() {
    return `
        <div id="errorModal" class="error-modal" style="display: none;" role="dialog" aria-labelledby="errorModalTitle" aria-describedby="errorModalMessage">
            <div class="error-modal-content">
                <div class="error-modal-header">
                    <h3 id="errorModalTitle">Упс! Щось пішло не так.</h3>
                    <span class="error-modal-close" aria-label="Закрити">&times;</span>
                </div>
                <div class="error-modal-body">
                    <div class="error-modal-icon">⚠️</div>
                    <p id="errorModalMessage" class="error-modal-message"></p>
                    <div class="error-modal-details">
                        <details>
                            <summary>Технічна інформація</summary>
                            <p><small>Код помилки: <span id="errorModalCode"></span></small></p>
                            <p><small>Сесія: <span id="errorModalSession"></span></small></p>
                            <p><small>Час: <span id="errorModalTime"></span></small></p>
                            <p><small>Сторінка: <span id="errorModalPage"></span></small></p>
                        </details>
                    </div>
                </div>
                <div class="error-modal-footer">
                    <button id="errorModalRefreshBtn" class="btn btn-secondary">🔄 Оновити сторінку</button>
                    <button id="errorModalReportBtn" class="btn btn-primary">📧 Повідомити про проблему</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Ініціалізує модальне вікно помилки
 */
export function initErrorModal() {
    // Перевіряємо, чи вже існує модальне вікно
    if (document.getElementById('errorModal')) {
        return;
    }

    // Додаємо модальне вікно в DOM
    document.body.insertAdjacentHTML('beforeend', createModalHTML());

    // Отримуємо посилання на елементи
    const modal = document.getElementById('errorModal');
    const closeBtn = document.querySelector('.error-modal-close');
    const refreshBtn = document.getElementById('errorModalRefreshBtn');
    const reportBtn = document.getElementById('errorModalReportBtn');
    const messageEl = document.getElementById('errorModalMessage');
    const codeEl = document.getElementById('errorModalCode');
    const sessionEl = document.getElementById('errorModalSession');
    const timeEl = document.getElementById('errorModalTime');
    const pageEl = document.getElementById('errorModalPage');

    // Закриття модального вікна
    const closeModal = () => {
        modal.style.display = 'none';
    };

    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Обробник для кнопки оновлення
    refreshBtn.addEventListener('click', () => {
        logger.info('Користувач оновив сторінку після помилки');
        window.location.reload();
    });

    // Функція показу помилки
    window.showErrorToUser = (error, errorId) => {
        if (!modal || !messageEl) return;

        const errorCode = getErrorCode(error);
        const userMessage = getUserFriendlyMessage(errorCode, 'uk');
        
        messageEl.textContent = userMessage;
        codeEl.textContent = errorId || 'Невідомо';
        sessionEl.textContent = logger.sessionId || 'Невідомо';
        timeEl.textContent = new Date().toLocaleString('uk-UA');
        pageEl.textContent = window.location.pathname;

        modal.style.display = 'flex';
        logger.info('Показано модальне вікно помилки', { errorCode, errorId });

        // Налаштовуємо кнопку звіту
        reportBtn.onclick = () => {
            const subject = encodeURIComponent(`Повідомлення про помилку: ${errorCode} (${errorId})`);
            const body = encodeURIComponent(
                `Опишіть, що ви робили перед тим, як виникла помилка:\n\n\n\n` +
                `--- Технічна інформація ---\n` +
                `Помилка: ${errorCode}\n` +
                `ID помилки: ${errorId}\n` +
                `Сесія: ${logger.sessionId}\n` +
                `Сторінка: ${window.location.href}\n` +
                `Час: ${new Date().toISOString()}\n` +
                `Браузер: ${navigator.userAgent}\n` +
                `ОС: ${navigator.platform}\n` +
                `Екран: ${screen.width}x${screen.height}`
            );
            
            logger.info('Користувач відкрив форму звіту про помилку');
            window.location.href = `mailto:bihipyxcom@gmail.com?subject=${subject}&body=${body}`;
            closeModal();
        };
    };
}

// Автоматична ініціалізація при завантаженні
document.addEventListener('DOMContentLoaded', initErrorModal);

export default {
    initErrorModal
};