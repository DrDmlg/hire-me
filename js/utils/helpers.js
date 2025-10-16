class Helpers {
    static escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static showMessage(text, type = 'info') {
        // Создаем контейнер для сообщений если его нет
        let container = document.getElementById('messageContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'messageContainer';
            container.style.cssText = `
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10000;
                max-width: 400px;
                width: 90%;
            `;
            document.body.appendChild(container);
        }

        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;

        container.appendChild(message);

        // Автоматически скрываем сообщения через 3 секунды (кроме loading)
        if (type !== 'loading') {
            setTimeout(() => {
                if (message.parentElement) {
                    message.remove();
                }
            }, 3000);
        }

        return message;
    }

    static hideMessage() {
        const container = document.getElementById('messageContainer');
        if (container) {
            container.innerHTML = '';
        }
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}