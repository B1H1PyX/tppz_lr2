/**
 * Головний скрипт сторінки
 */

import logger from './logger.js';
import './errorModal.js'; // Імпортуємо для ініціалізації модального вікна
import { getUserFriendlyMessage } from './errorMessages.js';

/**
 * Ініціалізує кнопку "Scroll to Top"
 */
function initScrollToTop() {
    const scrollBtn = document.getElementById('scrollTopBtn');
    
    if (!scrollBtn) {
        logger.error('Кнопку "scrollTopBtn" не знайдено');
        window.showErrorToUser?.({ message: 'ELEMENT_NOT_FOUND' }, 'ELEMENT_NOT_FOUND');
        return;
    }

    logger.debug('Кнопку "scrollTopBtn" знайдено, додаємо обробники');

    // Показ/приховування кнопки при прокрутці
    window.addEventListener('scroll', () => {
        try {
            const shouldShow = window.scrollY > 300;
            const isShown = scrollBtn.classList.contains('show');
            
            if (shouldShow && !isShown) {
                scrollBtn.classList.add('show');
                logger.debug('Кнопка "Вгору" показана');
            } else if (!shouldShow && isShown) {
                scrollBtn.classList.remove('show');
                logger.debug('Кнопка "Вгору" прихована');
            }
        } catch (error) {
            logger.error('Помилка при обробці прокрутки:', error);
        }
    });

    // Обробка кліку по кнопці
    scrollBtn.addEventListener('click', () => {
        try {
            logger.info('Користувач натиснув кнопку "Вгору"');
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } catch (error) {
            logger.error('Помилка при прокрутці вгору:', error);
        }
    });
}

/**
 * Ініціалізує навігацію з плавним скролом
 */
function initSmoothNavigation() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const targetPosition = targetElement.offsetTop - 20;
                
                logger.info(`Навігація до секції: ${targetId}`);
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            } else {
                logger.warn(`Елемент ${targetId} не знайдено для навігації`);
            }
        });
    });
}

/**
 * Додає обробку помилок завантаження зображень
 */
function initImageErrorHandling() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', (event) => {
            const errorId = logger.error(`Помилка завантаження зображення: ${img.src}`);
            
            // Заміна на заглушку
            img.src = 'img/placeholder.webp';
            img.alt = 'Зображення не завантажилось';
            
            // Показуємо повідомлення користувачу
            window.showErrorToUser?.(
                { message: 'IMAGE_LOAD_ERROR' },
                errorId || 'IMAGE_LOAD_ERROR'
            );
        });
    });
}

/**
 * Головна функція ініціалізації
 */
function initApp() {
    logger.info('🚀 Ініціалізація додатку');
    
    try {
        initScrollToTop();
        initSmoothNavigation();
        initImageErrorHandling();
        
        logger.info('✅ Додаток успішно ініціалізовано');
    } catch (error) {
        const errorId = logger.critical('Критична помилка при ініціалізації:', error);
        window.showErrorToUser?.(error, errorId);
    }
}

// Запуск після завантаження DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        logger.debug('DOM завантажується...');
        initApp();
    });
} else {
    logger.debug('DOM вже завантажено');
    initApp();
}

// Логування вивантаження сторінки
window.addEventListener('beforeunload', () => {
    logger.info('🔴 Сторінка вивантажується');
});

// Додаємо глобальний обробник помилок
window.addEventListener('error', (event) => {
    const errorId = logger.critical('Неперехоплена помилка:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    window.showErrorToUser?.(event.error || event, errorId);
});

window.addEventListener('unhandledrejection', (event) => {
    const errorId = logger.critical('Необроблений проміс:', event.reason);
    window.showErrorToUser?.(event.reason, errorId);
});

// Додаємо можливість зміни рівня логування з консолі
window.changeLogLevel = (level) => {
    logger.setLevel(level);
    console.log(`Рівень логування змінено на ${level}`);
};