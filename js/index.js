/** Главный файл приложения */

class HireMeApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.init();
    }

    init() {
        // Базовая настройка Telegram WebApp
        this.tg.expand();
        this.tg.setHeaderColor('#2563EB');
        this.tg.setBackgroundColor('#F8FAFC');
        this.tg.enableClosingConfirmation();

        // Инициализация после загрузки DOM
        document.addEventListener('DOMContentLoaded', () => {
            this.initUserProfile();
            this.setupNavigation();
            this.setupTelegramButton();
            this.setupKeyboardEvents();
        });
    }

    initUserProfile() {
        if (this.tg.initDataUnsafe?.user) {
            const user = this.tg.initDataUnsafe.user;
            const userAvatar = document.getElementById('userAvatar');

            // Аватар
            if (user.photo_url) {
                userAvatar.style.backgroundImage = `url(${user.photo_url})`;
                userAvatar.style.backgroundSize = 'cover';
                userAvatar.textContent = '';
            } else if (user.first_name) {
                userAvatar.textContent = user.first_name[0].toUpperCase();
            }

            // Имя
            let userName = '';
            if (user.first_name) userName += user.first_name;
            if (user.last_name) userName += ' ' + user.last_name;
            document.getElementById('userName').textContent = userName.trim() || 'Пользователь';

            // Цвет аватара
            const colors = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
            const colorIndex = user.id % colors.length;
            userAvatar.style.backgroundColor = colors[colorIndex];
        }
    }

    async checkProfileExists(telegramUserId) {
        try {
            const response = await fetch(`https://hireme.serveo.net/profile/check-access/${telegramUserId}`);
            return await response.json();
        } catch (error) {
            this.tg.showAlert('Произошла неизвестная ошибка');
            return false;
        }
    }

    setupNavigation() {
        document.querySelectorAll('.action-card').forEach(item => {
            item.addEventListener('click', async (e) => {
                // Обработка "Мой профиль"
                if (item.href.includes('profile.html')) {
                    e.preventDefault();
                    const telegramUserId = this.tg.initDataUnsafe?.user?.id;
                    const profileExists = await this.checkProfileExists(telegramUserId);

                    if (profileExists) {
                        window.location.href = 'profile.html';
                    } else {
                        this.tg.showAlert('Для просмотра и редактирования профиля необходимо зарегистрироваться');
                    }
                    return;
                }

                // Анимация и переход
                e.preventDefault();
                item.style.transform = 'translateY(-2px)';
                item.style.background = '#EFF6FF';

                setTimeout(() => {
                    if (item.href.includes('.html')) {
                        window.location.href = item.href;
                    } else {
                        this.tg.showPopup ? window.open(item.href, '_blank') : window.location.href = item.href;
                    }
                }, 200);
            });

            // Сброс анимации
            item.addEventListener('transitionend', () => {
                item.style.transform = '';
                item.style.background = '';
            });
        });
    }

    setupTelegramButton() {
        document.querySelector('.btn-telegram').addEventListener('click', (e) => {
            e.preventDefault();
            window.open(e.target.href, '_blank');
        });
    }

    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && window.history.length > 1) {
                window.history.back();
            }
        });
    }
}

// Запуск приложения
new HireMeApp();