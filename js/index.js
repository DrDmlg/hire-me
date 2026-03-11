/** Главный файл приложения */

class HireMeApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.navigation = new NavigationService();
        this.api = apiService;
        this.avatarContainer = document.getElementById('userAvatar');
    }

    async init() {
        UserProfileFiller.initTelegram(this.tg)
        this.navigation.init();

        const telegramUserId = Helpers.getTelegramUserId();

        if (telegramUserId != null) {
            const userRoles = await this.getProfileRoles(telegramUserId);
            this.profileData = await ProfileService.loadProfile();
            this.setUserAvatar(userRoles);
            this.setName(this.profileData);
        } else {
            // Анонимный пользователь либо новый пользователь
            this.setUserAvatar(null);
            this.setName(null);
        }

        this.setupTelegramButton();
        this.setupProfileNavigation();
    }

    setUserAvatar(userRoles) {
        if (userRoles && userRoles.profileId) {
            UserProfileFiller.updateAvatar(this.avatarContainer, userRoles?.profileId, this.api.BASE_URL);
        } else {
            UserProfileFiller.updateAvatar(null, null, null);
        }
    }

    setName(profileData) {
        const usernameEl = document.getElementById('userName');
        if (!usernameEl) return

        const displayName = profileData?.firstName
            || this.tg?.initDataUnsafe?.user?.first_name
            || 'Пользователь';

        usernameEl.textContent = displayName;
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
                } else if (response.candidate && response.employer) {
                    console.log('User has two roles. Redirecting to login.html');
                    window.location.href = 'html/login.html';
                } else if (response.candidate && !response.employer) {
                    console.log('User is Candidate. Redirecting to profile.html?type=candidate');
                    window.location.href = 'html/candidate/profile.html?type=candidate';
                } else if (response.employer && !response.candidate) {
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