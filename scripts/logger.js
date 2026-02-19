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
    console.log('📢 showErrorModal викликано:', { message, errorId });
    
    // Спочатку пробуємо використати глобальну функцію
    if (window.showErrorToUser) {
        console.log('✅ Використовуємо window.showErrorToUser');
        window.showErrorToUser(message, errorId);
        return;
    }
    
    // Якщо немає, створюємо просте модальне вікно
    console.log('⚠️ Створюємо запасне модальне вікно');
    createFallbackModal(message, errorId);
}

function createFallbackModal(message, errorId) {
    // Видаляємо попереднє модальне вікно якщо є
    const oldModal = document.getElementById('fallbackErrorModal');
    if (oldModal) oldModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'fallbackErrorModal';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 999999;
        max-width: 450px;
        width: 90%;
        font-family: Arial, sans-serif;
        border-top: 8px solid #dc3545;
        animation: slideIn 0.3s ease;
    `;
    
    // Додаємо анімацію
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translate(-50%, -30%);
                opacity: 0;
            }
            to {
                transform: translate(-50%, -50%);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    modal.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 64px; margin-bottom: 15px; line-height: 1;">⚠️</div>
            <h3 style="color: #dc3545; margin: 10px 0 20px; font-size: 1.8rem; font-weight: bold;">Помилка</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p id="fallbackErrorMessage" style="margin: 0 0 10px; color: #333; font-size: 1.1rem; line-height: 1.5;"></p>
                <p style="font-size: 13px; color: #666; margin: 0; word-break: break-all;">
                    Код: <span id="fallbackErrorCode" style="font-family: monospace; background: #e9ecef; padding: 3px 6px; border-radius: 4px;"></span>
                </p>
            </div>
            <button onclick="document.getElementById('fallbackErrorModal').remove()"
                    style="
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 12px 40px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: bold;
                        transition: background 0.2s;
                    "
                    onmouseover="this.style.background='#0056b3'"
                    onmouseout="this.style.background='#007bff'">
                Закрити
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const msgEl = document.getElementById('fallbackErrorMessage');
    const codeEl = document.getElementById('fallbackErrorCode');
    
    if (msgEl) msgEl.textContent = message || 'Невідома помилка';
    if (codeEl) codeEl.textContent = errorId || 'N/A';
    
    // Автоматично сховати через 15 секунд
    setTimeout(() => {
        const modalToRemove = document.getElementById('fallbackErrorModal');
        if (modalToRemove) modalToRemove.remove();
    }, 15000);
}

const logger = {
    sessionId: SESSION_ID,
    
    debug: (...args) => log(LOG_LEVELS.DEBUG, '🔍 DEBUG', ...args),
    info: (...args) => log(LOG_LEVELS.INFO, 'ℹ️ INFO', ...args),
    warn: (...args) => log(LOG_LEVELS.WARN, '⚠️ WARN', ...args),
    
    error: (...args) => {
        const errorId = log(LOG_LEVELS.ERROR, '❌ ERROR', ...args);
        const message = args.map(a => {
            if (a instanceof Error) return a.message;
            if (typeof a === 'object') return JSON.stringify(a);
            return String(a);
        }).join(' ');
        
        // ВАЖЛИВО: викликаємо показ модального вікна
        setTimeout(() => showErrorModal(message, errorId), 0);
        
        return errorId;
    },
    
    critical: (...args) => {
        const errorId = log(LOG_LEVELS.CRITICAL, '🔥 CRITICAL', ...args);
        const message = 'КРИТИЧНО: ' + args.map(a => {
            if (a instanceof Error) return a.message;
            if (typeof a === 'object') return JSON.stringify(a);
            return String(a);
        }).join(' ');
        
        // ВАЖЛИВО: викликаємо показ модального вікна
        setTimeout(() => showErrorModal(message, errorId), 0);
        
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
        logger.info('Логи експортовано');
    },

    getLastLogs: (count = 50) => {
        return logHistory.slice(-count);
    }
};

function log(level, prefix, ...args) {
    if (level < currentLogLevel) return null;

    const timestamp = new Date().toISOString();
    let errorId = null;

    if (level >= LOG_LEVELS.ERROR) {
        errorId = generateErrorId();
    }

    const logEntry = {
        timestamp,
        sessionId: SESSION_ID,
        pageUrl: PAGE_URL,
        level: Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level),
        message: args.map(a => String(a)).join(' '),
        errorId
    };

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

// ВАЖЛИВО: Додаємо showErrorToUser глобально, якщо його немає
if (!window.showErrorToUser) {
    window.showErrorToUser = (message, errorId) => {
        console.log('🟡 showErrorToUser викликано з глобального');
        createFallbackModal(message, errorId);
    };
}

logger.info('🟢 Система логування ініціалізована');

window.testLogger = {
    error: () => logger.error('✅ Тестова помилка - має з\'явитись вікно!'),
    critical: () => logger.critical('🔥 Тестова критична помилка - має з\'явитись вікно!'),
    modal: () => showErrorModal('Прямий тест модального вікна', 'TEST-123')
};

console.log('✅ Логер готовий. Спробуйте: testLogger.error()');