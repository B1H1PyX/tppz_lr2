/**
 * Модуль локалізації повідомлень про помилки
 * @module errorMessages
 */

// Словник повідомлень про помилки
const errorMessages = {
    // Помилки DOM
    'ELEMENT_NOT_FOUND': {
        uk: 'Не вдалося знайти необхідний елемент на сторінці. Можливо, сайт завантажився некоректно. Спробуйте оновити сторінку.',
        en: 'Failed to find a required element on the page. The site may have loaded incorrectly. Try refreshing the page.',
        ru: 'Не удалось найти необходимый элемент на странице. Возможно, сайт загрузился некорректно. Попробуйте обновить страницу.'
    },
    
    // Мережеві помилки
    'NETWORK_ERROR': {
        uk: 'Помилка мережі. Перевірте з\'єднання з інтернетом та спробуйте ще раз.',
        en: 'Network error. Please check your internet connection and try again.',
        ru: 'Ошибка сети. Проверьте подключение к интернету и попробуйте снова.'
    },
    
    // Помилки зображень
    'IMAGE_LOAD_ERROR': {
        uk: 'Не вдалося завантажити зображення. Можливо, воно було видалене або переміщене.',
        en: 'Failed to load image. It may have been deleted or moved.',
        ru: 'Не удалось загрузить изображение. Возможно, оно было удалено или перемещено.'
    },
    
    // Помилки скриптів
    'SCRIPT_ERROR': {
        uk: 'Сталася помилка у виконанні скрипта. Спробуйте оновити сторінку.',
        en: 'A script execution error occurred. Try refreshing the page.',
        ru: 'Произошла ошибка выполнения скрипта. Попробуйте обновить страницу.'
    },
    
    // Помилки localStorage
    'STORAGE_ERROR': {
        uk: 'Помилка доступу до локального сховища. Можливо, ваш браузер блокує збереження даних.',
        en: 'Error accessing local storage. Your browser may be blocking data storage.',
        ru: 'Ошибка доступа к локальному хранилищу. Возможно, ваш браузер блокирует сохранение данных.'
    },
    
    // За замовчуванням
    'DEFAULT': {
        uk: 'Сталася несподівана помилка. Наша команда вже працює над її виправленням. Якщо проблема повторюється, будь ласка, повідомте нам.',
        en: 'An unexpected error occurred. Our team is already working on a fix. If the problem persists, please let us know.',
        ru: 'Произошла неожиданная ошибка. Наша команда уже работает над ее исправлением. Если проблема повторяется, пожалуйста, сообщите нам.'
    }
};

/**
 * Повертає локалізоване повідомлення для користувача
 * @param {string} errorCode - Код помилки
 * @param {string} lang - Мова ('uk', 'en', 'ru')
 * @returns {string} Локалізоване повідомлення
 */
export const getUserFriendlyMessage = (errorCode, lang = 'uk') => {
    return errorMessages[errorCode]?.[lang] || errorMessages.DEFAULT[lang];
};

/**
 * Визначає код помилки за об'єктом помилки
 * @param {Error|any} error - Об'єкт помилки
 * @returns {string} Код помилки
 */
export const getErrorCode = (error) => {
    if (!error) return 'DEFAULT';
    
    if (error.message) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
            return 'NETWORK_ERROR';
        }
        if (error.message.includes('image') || error.message.includes('img')) {
            return 'IMAGE_LOAD_ERROR';
        }
        if (error.message.includes('storage') || error.message.includes('localStorage')) {
            return 'STORAGE_ERROR';
        }
        if (error.message.includes('script')) {
            return 'SCRIPT_ERROR';
        }
    }
    
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
        return 'SCRIPT_ERROR';
    }
    
    return 'DEFAULT';
};

export default {
    getUserFriendlyMessage,
    getErrorCode
};