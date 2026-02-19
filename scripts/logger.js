const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    CRITICAL: 4
};

const SESSION_ID = generateSessionId();
const PAGE_URL = window.location.href;

const logHistory = [];
const MAX_LOG_HISTORY = 200;

let currentLogLevel = LOG_LEVELS.INFO;

try {
    const storedLevel = localStorage.getItem('app_log_level');
    if (storedLevel && LOG_LEVELS.hasOwnProperty(storedLevel)) {
        currentLogLevel = LOG_LEVELS[storedLevel];
    }
} catch (e) {}

function generateSessionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function generateErrorId() {
    return `ERR-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

function showErrorModal(message, errorId) {
    setTimeout(() => {
        if (window.showErrorToUser) {
            window.showErrorToUser(message, errorId);
        } else {
            createFallbackModal(message, errorId);
        }
    }, 100);
}

function createFallbackModal(message, errorId) {
    let modal = document.getElementById('fallbackErrorModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'fallbackErrorModal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10001;
            max-width: 400px;
            width: 90%;
            font-family: Arial, sans-serif;
            border-top: 5px solid #dc3545;
        `;
        
        modal.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
                <h3 style="color: #dc3545; margin: 10px 0; font-size: 1.5rem;">Помилка</h3>
                <p id="fallbackErrorMessage" style="margin: 15px 0; color: #333; line-height: 1.5;"></p>
                <p style="font-size: 12px; color: #666; background: #f8f9fa; padding: 8px; border-radius: 4px;">
                    Код: <span id="fallbackErrorCode"></span>
                </p>
                <button onclick="this.closest('#fallbackErrorModal').remove()"
                        style="
                            background: #007bff;
                            color: white;
                            border: none;
                            padding: 10px 30px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                            margin-top: 15px;
                        ">
                    Закрити
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    const msgEl = document.getElementById('fallbackErrorMessage');
    const codeEl = document.getElementById('fallbackErrorCode');
    
    if (msgEl && codeEl) {
        msgEl.textContent = message || 'Невідома помилка';
        codeEl.textContent = errorId || 'N/A';
    }
    
    setTimeout(() => {
        const modalToRemove = document.getElementById('fallbackErrorModal');
        if (modalToRemove) modalToRemove.remove();
    }, 10000);
}

const logger = {
    sessionId: SESSION_ID,
    
    debug: (...args) => log(LOG_LEVELS.DEBUG, '🔍 DEBUG', ...args),
    info: (...args) => log(LOG_LEVELS.INFO, 'ℹ️ INFO', ...args),
    warn: (...args) => log(LOG_LEVELS.WARN, '⚠️ WARN', ...args),
    
    error: (...args) => {
        const errorId = log(LOG_LEVELS.ERROR, '❌ ERROR', ...args);
        const message = args.map(a => String(a)).join(' ');
        showErrorModal(message, errorId);
        return errorId;
    },
    
    critical: (...args) => {
        const errorId = log(LOG_LEVELS.CRITICAL, '🔥 CRITICAL', ...args);
        const message = 'КРИТИЧНО: ' + args.map(a => String(a)).join(' ');
        showErrorModal(message, errorId);
        return errorId;
    },

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

    exportLogs: () => {
        console.group('📋 ЕКСПОРТ ЛОГІВ');
        console.log('Session ID:', SESSION_ID);
        console.log('Page URL:', PAGE_URL);
        console.log('Total logs:', logHistory.length);
        console.table(logHistory.slice(-20));
        console.groupEnd();
        logger.info('Логи експортовано. Скопіюйте їх для аналізу.');
    },

    getLastLogs: (count = 50) => {
        return logHistory.slice(-count);
    }
};

function log(level, prefix, ...args) {
    if (level < currentLogLevel) return null;

    const timestamp = new Date().toISOString();
    let errorId = null;

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

    const logEntry = {
        timestamp,
        sessionId: SESSION_ID,
        pageUrl: PAGE_URL,
        userAgent: navigator.userAgent,
        level: Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level),
        message: args.map(a => String(a)).join(' '),
        data: serializedArgs
    };

    if (level >= LOG_LEVELS.ERROR) {
        errorId = generateErrorId();
        logEntry.errorId = errorId;
    }

    logHistory.push(logEntry);
    if (logHistory.length > MAX_LOG_HISTORY) {
        logHistory.shift();
    }

    const shortSessionId = SESSION_ID.substring(0, 8);
    if (errorId) {
        console.log(`[${timestamp}] [Session: ${shortSessionId}] [${errorId}] ${prefix}:`, ...args);
    } else {
        console.log(`[${timestamp}] [Session: ${shortSessionId}] ${prefix}:`, ...args);
    }

    if (level >= LOG_LEVELS.CRITICAL) {
        sendErrorToServer(logEntry);
    }

    return errorId;
}

function sendErrorToServer(logEntry) {
    console.warn('🔄 Відправка критичної помилки на сервер:', logEntry.errorId);
    
    try {
        const pendingErrors = JSON.parse(localStorage.getItem('pending_errors') || '[]');
        pendingErrors.push({
            errorId: logEntry.errorId,
            timestamp: logEntry.timestamp,
            message: logEntry.message,
            sessionId: logEntry.sessionId
        });
        if (pendingErrors.length > 10) pendingErrors.shift();
        localStorage.setItem('pending_errors', JSON.stringify(pendingErrors));
    } catch (e) {}
}

window.appLogger = logger;

logger.info('🟢 Система логування ініціалізована');
logger.debug('Session ID:', SESSION_ID);
logger.debug('Page URL:', PAGE_URL);
logger.debug('User Agent:', navigator.userAgent);

window.testLogger = {
    error: () => logger.error('Тестова помилка з логера'),
    critical: () => logger.critical('Тестова критична помилка з логера'),
    info: () => logger.info('Тестове інформаційне повідомлення')
};

export default logger;
export { LOG_LEVELS, generateErrorId };