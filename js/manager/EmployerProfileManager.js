class EmployerProfileManager {
    static ROUTES = {
        ABOUT_ME: 'about-me.html?type=employer',
        PUBLICATION: 'publication.html?type=employer',
        VACANCIES: '../vacancies.html?type=employer',
        APPLICATIONS: 'application.html?type=employer',
    };

    constructor(profileData) {
        this.tg = window.Telegram?.WebApp;
        this.profileData = profileData || {};
        // Контейнер для делегирования событий
        this.actionsContainer = document.querySelector('.actions-grid');
    }

    async init() {
        try {
            this.initEventListeners();
            this.updateEmployerProfileData();
            console.log('EmployerProfileManager успешно инициализирован');
        } catch (error) {
            console.error('EmployerProfileManager ошибка инициализации:', error);
        }
    }

    // Универсальный метод навигации
    navigateTo(path) {
        if (path) window.location.href = path;
    }

    initEventListeners() {
        // Делегирование событий: слушаем клик на родителе
        this.actionsContainer?.addEventListener('click', (e) => {
            const card = e.target.closest('.action-card');
            if (!card) return;

            const action = card.dataset.action;
            this.handleAction(action);
        });
    }

    handleAction(action) {
        const handlers = {
            'about-me': () => this.navigateTo(EmployerProfileManager.ROUTES.ABOUT_ME),
            'publication': () => this.navigateTo(EmployerProfileManager.ROUTES.PUBLICATION),
            'vacancies': () => this.navigateTo(EmployerProfileManager.ROUTES.VACANCIES),
            'responses': () => this.navigateTo(EmployerProfileManager.ROUTES.APPLICATIONS),
        };

        if (handlers[action]) {
            handlers[action]();
        } else {
            console.warn(`No handler for action: ${action}`);
        }
    }

    updateEmployerProfileData() {
        const { employer = {} } = this.profileData;
        const stats = employer.stats || {};

        // Общие данные через вспомогательный класс
        UserProfileFiller.setUserAvatar(this.tg);
        UserProfileFiller.setUserName(this.profileData);

        // Локальные данные профиля
        this._updateTextContent('userPosition', employer.position, 'Не указано');
        this._updateTextContent('statApplications', stats.applications, 0);
        this._updateTextContent('statInvitations', stats.invitations, 0);
        this._updateTextContent('statRejections', stats.rejections, 0);
    }

    // Вспомогательный метод для безопасного обновления текста
    _updateTextContent(id, value, fallback) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value ?? fallback;
        }
    }
}