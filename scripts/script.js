/**
 * Головний скрипт сторінки
 */

// ВСІ ІМПОРТИ ПОВИННІ БУТИ НА ПОЧАТКУ ФАЙЛУ!
import './errorModal.js';
import { getUserFriendlyMessage } from './errorMessages.js';

// Тепер можна використовувати logger
const logger = window.appLogger || {
    debug: (...args) => console.debug('🔍 DEBUG:', ...args),
    info: (...args) => console.info('ℹ️ INFO:', ...args),
    warn: (...args) => console.warn('⚠️ WARN:', ...args),
    error: (...args) => console.error('❌ ERROR:', ...args),
    critical: (...args) => {
        console.error('🔥 CRITICAL:', ...args);
        // Якщо є модальне вікно, показуємо помилку
        if (window.showErrorToUser) {
            const errorId = 'CRIT-' + Date.now();
            window.showErrorToUser(args[0] || 'Критична помилка', errorId);
        }
    },
    setLevel: (level) => console.log('Рівень логування змінено на', level)
};

// Ініціалізація модального вікна після завантаження DOM
document.addEventListener('DOMContentLoaded', () => {
    // Якщо функція initErrorModal існує, викликаємо її
    if (window.initErrorModal) {
        window.initErrorModal();
    }
});

/**
 * Ініціалізує кнопку "Scroll to Top"
 */
function initScrollToTop() {
    const scrollBtn = document.getElementById('scrollTopBtn');
    
    if (!scrollBtn) {
        logger.error('Кнопку "scrollTopBtn" не знайдено');
        window.showErrorToUser?.('Елемент кнопки не знайдено', 'ELEMENT_NOT_FOUND');
        return;
    }

    logger.debug('Кнопку "scrollTopBtn" знайдено, додаємо обробники');

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
                window.showErrorToUser?.(`Секцію ${targetId} не знайдено`, 'NAVIGATION_ERROR');
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
            logger.error(`Помилка завантаження зображення: ${img.src}`);
            
            // Заміна на заглушку
            img.src = 'img/placeholder.webp';
            img.alt = 'Зображення не завантажилось';
            
            window.showErrorToUser?.('Не вдалося завантажити зображення', 'IMAGE_LOAD_ERROR');
        });
        
        // Логуємо успішне завантаження
        img.addEventListener('load', () => {
            logger.debug(`Зображення завантажено: ${img.src}`);
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
        logger.critical('Критична помилка при ініціалізації:', error);
        window.showErrorToUser?.(error, 'INIT_ERROR');
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

// Глобальний обробник помилок
window.addEventListener('error', (event) => {
    logger.critical('Неперехоплена помилка:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    window.showErrorToUser?.(event.error || event.message, 'GLOBAL_ERROR');
});

window.addEventListener('unhandledrejection', (event) => {
    logger.critical('Необроблений проміс:', event.reason);
    window.showErrorToUser?.(event.reason, 'PROMISE_ERROR');
});

// Функція для зміни рівня логування
window.changeLogLevel = (level) => {
    if (logger.setLevel) {
        logger.setLevel(level);
    } else {
        console.log(`Рівень логування (імітація): ${level}`);
    }
};

// Тестові функції (можна викликати з консолі)
window.testError = () => {
    logger.error('Тестова помилка');
    window.showErrorToUser?.('Тестова помилка', 'TEST_ERROR');
};

window.testCritical = () => {
    logger.critical('Тестова критична помилка');
    window.showErrorToUser?.('Тестова критична помилка', 'TEST_CRITICAL');
};

console.log('✅ Script.js завантажено з правильним порядком імпортів');