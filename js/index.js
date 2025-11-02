/** Главный файл приложения */

class HireMeApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.navigation = new NavigationService();
    }

    init() {
        if (this.tg) {
            this.initTelegram();
        }

        // Инициализация после загрузки DOM
        document.addEventListener('DOMContentLoaded', () => {
            this.initUserProfile();
            this.navigation.init();
            this.setupTelegramButton();
            this.setupProfileNavigation();
        });
    }

    initTelegram() {
        if (this.tg) {
            this.tg.expand();
            this.tg.setHeaderColor('#2563EB');
            this.tg.setBackgroundColor('#F8FAFC');
            this.tg.enableClosingConfirmation();
        }
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

    setupProfileNavigation() {
        document.querySelectorAll('[href="profile.html"]').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();

                const telegramUserId = this.tg.initDataUnsafe?.user?.id;
                // const profileExists = await this.checkProfileExists(telegramUserId);
                const profileExists = true; // TODO: заменить на реальную проверку

                if (profileExists) {
                    window.location.href = 'profile.html';
                } else {
                    this.tg.showAlert('Для просмотра и редактирования профиля необходимо зарегистрироваться');
                }
            });
        });
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

    setupTelegramButton() {
        document.querySelector('.btn-telegram').addEventListener('click', (e) => {
            e.preventDefault();
            window.open(e.target.href, '_blank');
        });
    }
}


document.addEventListener('DOMContentLoaded', function () {
    new HireMeApp().init();
});

