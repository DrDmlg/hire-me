/** Главный файл приложения */

class HireMeApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.navigation = new NavigationService();
        this.api = apiService;
        this.avatarContainer = document.getElementById('userAvatar');
    }

    init() {
        if (this.tg) {
            this.initTelegram();
        }

        this.setUserAvatar();
        this.navigation.init();
        this.preloadUserRoles();
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

    setUserAvatar() {
        UserProfileFiller.updateAvatar(this.avatarContainer, 33,  this.api.BASE_URL)
    }

    async preloadUserRoles() {
        const telegramUserId = Helpers.getTelegramUserId();
        if (!telegramUserId) return;
        await this.getProfileRoles(telegramUserId);
    }


    setupProfileNavigation() {
        document.querySelectorAll('.profile-link').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();

                const telegramUserId = Helpers.getTelegramUserId();
                const response = await this.getProfileRoles(telegramUserId);

                if (response == null) {
                    notification.error('Для просмотра и редактирования профиля необходимо зарегистрироваться');
                } else if (response.isCandidate && response.isEmployer) {
                    console.log('User has two roles. Redirecting to login.html');
                    window.location.href = 'html/login.html';
                } else if (response.isCandidate && !response.isEmployer) {
                    console.log('User is Candidate. Redirecting to profile.html?type=candidate');
                    window.location.href = 'html/candidate/profile.html?type=candidate';
                } else if (response.isEmployer && !response.isCandidate) {
                    console.log('User is employer. Redirecting to profile.html?type=employer');
                    window.location.href = 'html/employer/profile.html?type=employer';
                }
            }, true);
        });
    }

    async getProfileRoles(telegramUserId) {
        try {
            const response = await this.api.get(`/profile/roles/${telegramUserId}`);
            // Кэшируем результат
            if (response.data) {
                sessionStorage.setItem('user_roles', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            console.error(error.message)
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