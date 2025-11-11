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
        if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
            return window.Telegram.WebApp.initDataUnsafe.user.id;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user_id');
        return userId ? parseInt(userId) : 442485517; // test ID
    }
}