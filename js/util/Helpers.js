/** Вспомогательные функции*/
class Helpers {
    // защищает от XSS-атак (межсайтового скриптинга).
    static escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static getTelegramUserId() {
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null;
    }
}