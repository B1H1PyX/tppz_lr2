/**
 * Модуль централізованого логування
 * @module logger
 */

// Рівні логування
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    CRITICAL: 4
};

// Генерація унікального ID сесії
const SESSION_ID = generateSessionId();
const PAGE_URL = window.location.href;

// Історія логів для експорту
const logHistory = [];
const MAX_LOG_HISTORY = 200;

// Поточний рівень логування (за замовчуванням INFO)
let currentLogLevel = LOG_LEVELS.INFO;

// Спроба завантажити рівень логування з localStorage
try {
    const storedLevel = localStorage.getItem('app_log_level');
    if (storedLevel && LOG_LEVELS.hasOwnProperty(storedLevel)) {
        currentLogLevel = LOG_LEVELS[storedLevel];
    }
} catch (e) {
    // Ігноруємо помилки localStorage
}

/**
 * Генерує унікальний ID сесії
 * @returns {string} UUID v4
 */
function generateSessionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Генерує унікальний ID помилки
 * @returns {string} Унікальний ідентифікатор
 */
function generateErrorId() {
    return `ERR-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

/**
 * Централізований логер
 */
const logger = {
    sessionId: SESSION_ID,
    
    /**
     * Логування рівня DEBUG
     * @param {...any} args Аргументи для логування
     */
    debug: (...args) => log(LOG_LEVELS.DEBUG, '🔍 DEBUG', ...args),
    
    /**
     * Логування рівня INFO
     * @param {...any} args Аргументи для логування
     */
    info: (...args) => log(LOG_LEVELS.INFO, 'ℹ️ INFO', ...args),
    
    /**
     * Логування рівня WARN
     * @param {...any} args Аргументи для логування
     */
    warn: (...args) => log(LOG_LEVELS.WARN, '⚠️ WARN', ...args),
    
    /**
     * Логування рівня ERROR
     * @param {...any} args Аргументи для логування
     */
    error: (...args) => log(LOG_LEVELS.ERROR, '❌ ERROR', ...args),
    
    /**
     * Логування рівня CRITICAL
     * @param {...any} args Аргументи для логування
     */
    critical: (...args) => log(LOG_LEVELS.CRITICAL, '🔥 CRITICAL', ...args),

    /**
     * Змінює рівень логування
     * @param {string} levelName - Назва рівня (DEBUG, INFO, WARN, ERROR, CRITICAL)
     */
    setLevel: (levelName) => {
        if (LOG_LEVELS.hasOwnProperty(levelName)) {
            currentLogLevel = LOG_LEVELS[levelName];
            try {
                localStorage.setItem('app_log_level', levelName);
            } catch (e) {}
            logger.info(`Рівень логування змінено на ${levelName}`);
        } else {
            logger.warn(`Невідомий рівень логування: ${levelName}`);
        }
    },

    /**
     * Експортує історію логів у консоль
     */
    exportLogs: () => {
        console.group('📋 ЕКСПОРТ ЛОГІВ');
        console.log('Session ID:', SESSION_ID);
        console.log('Page URL:', PAGE_URL);
        console.log('Total logs:', logHistory.length);
        console.table(logHistory);
        console.groupEnd();
        logger.info('Логи експортовано. Скопіюйте їх для аналізу.');
    },

    /**
     * Повертає останні N логів
     * @param {number} count - Кількість логів
     * @returns {Array} Масив останніх логів
     */
    getLastLogs: (count = 50) => {
        return logHistory.slice(-count);
    }
};

/**
 * Внутрішня функція логування
 * @param {number} level - Рівень логування
 * @param {string} prefix - Префікс повідомлення
 * @param {...any} args - Аргументи
 */
function log(level, prefix, ...args) {
    if (level < currentLogLevel) return;

    const timestamp = new Date().toISOString();
    let errorId = null;

    // Підготовка аргументів для збереження
    const serializedArgs = args.map(arg => {
        try {
            if (arg instanceof Error) {
                return {
                    name: arg.name,
                    message: arg.message,
                    stack: arg.stack
                };
            }
            if (typeof arg === 'object') {
                return JSON.parse(JSON.stringify(arg));
            }
            return arg;
        } catch (e) {
            return String(arg);
        }
    });

    // Створення запису логу
    const logEntry = {
        timestamp,
        sessionId: SESSION_ID,
        pageUrl: PAGE_URL,
        userAgent: navigator.userAgent,
        level: Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level),
        message: args.map(a => String(a)).join(' '),
        data: serializedArgs
    };

    // Додавання ID для помилок
    if (level >= LOG_LEVELS.ERROR) {
        errorId = generateErrorId();
        logEntry.errorId = errorId;
    }

    // Збереження в історію
    logHistory.push(logEntry);
    if (logHistory.length > MAX_LOG_HISTORY) {
        logHistory.shift();
    }

    // Виведення в консоль
    const shortSessionId = SESSION_ID.substring(0, 8);
    if (errorId) {
        console.log(`[${timestamp}] [Session: ${shortSessionId}] [${errorId}] ${prefix}:`, ...args);
    } else {
        console.log(`[${timestamp}] [Session: ${shortSessionId}] ${prefix}:`, ...args);
    }

    // Відправка критичних помилок на сервер (імітація)
    if (level >= LOG_LEVELS.CRITICAL) {
        sendErrorToServer(logEntry);
    }

    return errorId;
}

/**
 * Імітація відправки помилки на сервер
 * @param {Object} logEntry - Запис логу
 */
function sendErrorToServer(logEntry) {
    // Тут мав би бути fetch до API
    console.warn('🔄 Відправка критичної помилки на сервер:', logEntry.errorId);
    
    // Зберігаємо в localStorage для наступного запуску
    try {
        const pendingErrors = JSON.parse(localStorage.getItem('pending_errors') || '[]');
        pendingErrors.push(logEntry);
        if (pendingErrors.length > 10) pendingErrors.shift();
        localStorage.setItem('pending_errors', JSON.stringify(pendingErrors));
    } catch (e) {}
}

// Робимо логер доступним глобально
window.appLogger = logger;

// Логуємо запуск
logger.info('🟢 Система логування ініціалізована');
logger.debug('Session ID:', SESSION_ID);
logger.debug('Page URL:', PAGE_URL);
logger.debug('User Agent:', navigator.userAgent);

export default logger;
export { LOG_LEVELS, generateErrorId };