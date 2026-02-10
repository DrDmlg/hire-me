class CandidateProfileManager {
    // Конфигурация путей
    static ROUTES = {
        ABOUT_ME: 'about-me.html?type=candidate',
        RESUME: 'resume.html',
        VACANCIES: '../vacancies.html?type=candidate'
    };

    // Конфигурация визуальных состояний статуса
    static STATUS_THEMES = {
        'Активный поиск': { text: 'Активный поиск', color: '#10E6A0' },
        'Не ищу работу': { text: 'Не ищу работу', color: '#e21212' }
    };

    constructor(profileData) {
        this.tg = window.Telegram?.WebApp;
        this.api = apiService;
        this.profileData = profileData || {};
        this.isUpdatingStatus = false; // Флаг для предотвращения спам-кликов
    }

    async init() {
        try {
            this.initEventListeners();
            this.updateCandidateProfileData();
            console.log('CandidateProfileManager инициализирован');
        } catch (error) {
            console.error('Ошибка инициализации:', error);
        }
    }

    // --- Навигация ---
    navigateTo(path) {
        if (path) window.location.href = path;
    }

    // --- Инициализация ---
    initEventListeners() {
        // Делегирование для карточек
        document.querySelector('.actions-grid')?.addEventListener('click', (e) => {
            const card = e.target.closest('.action-card');
            if (card) this.handleAction(card.dataset.action);
        });

        // Слушатель статуса
        document.getElementById('statusTag')?.addEventListener('click', () => {
            this.toggleJobStatus();
        });
    }

    handleAction(action) {
        const routes = {
            'about-me': CandidateProfileManager.ROUTES.ABOUT_ME,
            'resume': CandidateProfileManager.ROUTES.RESUME,
            'vacancies': CandidateProfileManager.ROUTES.VACANCIES,
        };
        this.navigateTo(routes[action]);
    }

    // --- Работа с данными ---
    updateCandidateProfileData() {
        const candidate = this.profileData?.candidate || {};

        UserProfileFiller.setUserAvatar(this.tg);
        UserProfileFiller.setUserName(this.profileData);

        this._setElementText('userPosition', candidate.desiredPosition, 'Должность не указана');
        this.renderStatus();
        this.renderStatistics(candidate.stats);
    }

    // Изменение статуса (Логика + API)
    async toggleJobStatus() {
        if (this.isUpdatingStatus) return;

        const candidate = this.profileData?.candidate;
        if (!candidate?.id) return;

        const oldStatus = candidate.candidateJobStatus;
        const newStatus = oldStatus === 'Активный поиск' ? 'Не ищу работу' : 'Активный поиск';

        try {
            this.isUpdatingStatus = true;
            // Можно добавить класс лоадера на элемент
            document.getElementById('statusTag')?.classList.add('loading');

            const response = await this.api.put(`/candidate/status/${candidate.id}`, {
                jobStatus: newStatus
            });

            if (response.status >= 200 && response.status < 300) {
                candidate.candidateJobStatus = newStatus;
                this.renderStatus();
            }
        } catch (error) {
            notification.error('Ошибка смены статуса');
            console.error(error);
        } finally {
            this.isUpdatingStatus = false;
            document.getElementById('statusTag')?.classList.remove('loading');
        }
    }

    // Отрисовка статуса (UI)
    renderStatus() {
        const status = this.profileData?.candidate?.candidateJobStatus;
        const theme = CandidateProfileManager.STATUS_THEMES[status] || CandidateProfileManager.STATUS_THEMES['Не ищу работу'];

        const elements = {
            text: document.getElementById('userStatus'),
            dot: document.getElementById('statusDot')
        };

        if (elements.text) elements.text.textContent = theme.text;
        if (elements.dot) elements.dot.style.background = theme.color;
    }

    renderStatistics(stats = {}) {
        this._setElementText('statApplications', stats.applications, 0);
        this._setElementText('statInvitations', stats.invitations, 0);
        this._setElementText('statRejections', stats.rejections, 0);
    }

    _setElementText(id, value, fallback) {
        const el = document.getElementById(id);
        if (el) el.textContent = value ?? fallback;
    }
}