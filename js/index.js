/** Главный файл приложения */

class HireMeApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.navigation = new NavigationService();
        this.api = apiService;
    }

    init() {
        if (this.tg) {
            this.initTelegram();
        }

            this.initUserProfile();
            this.navigation.init();
            this.setupTelegramButton();
            this.setupProfileNavigation();
    }

    initTelegram() {
        if (this.tg) {
            this.tg.expand();
            this.tg.setHeaderColor('#2563EB');
            this.tg.setBackgroundColor('#F8FAFC')
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
                e.stopImmediatePropagation();

                const telegramUserId = Helpers.getTelegramUserId();
                 const response = await this.getProfileRoles(telegramUserId);

                if (response == null) {
                    notification.error('Для просмотра и редактирования профиля необходимо зарегистрироваться');
                } else if (response.isCandidate && response.isEmployer) {
                    console.log('User has two roles. Redirecting to profile-choice.html');
                    window.location.href = 'profile-choice.html';
                } else if (response.isCandidate && !response.isEmployer) {
                    console.log('User is Candidate. Redirecting to profile.html');
                    window.location.href = 'profile.html';
                } else if (response.isEmployer && !response.isCandidate) {
                    console.log('User is employer. Redirecting to profile.html');
                    window.location.href = 'profile.html';
                }
            }, true);
        });
    }

    async getProfileRoles(telegramUserId) {
        try {
            const response =  await this.api.get(`/profile/roles/${telegramUserId}`);
            return response.data;
        } catch (error) {
            notification.error(error.message);
            return null;
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
    console.log('Запуск приложения');
    new HireMeApp().init();
});