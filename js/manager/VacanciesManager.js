class VacanciesManager {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.profileData = null;
        this.navigation = new NavigationService();
        this.api = apiService
        this.vacancies = [];
        this.vacancyCard = vacancyCardComponent;
    }

    async init() {
        try {
            this.navigation.init();
            this.profileData = await ProfileService.loadProfile();
            await this.loadVacancies();

            console.log('VacanciesManager initialized successfully');
        } catch (error) {
            console.error('VacanciesManager init error:', error);
            notification.error('Не удалось загрузить вакансии');
        }
    }

    async loadVacancies() {
        try {
            this.showLoadingState();

            const response = await this.api.get('/vacancy/all');

            if (response.status === 200 && response.data) {
                this.vacancies = Array.isArray(response.data) ? response.data : [];

                if (this.vacancies.length > 0) {
                    this.renderVacancies();
                }
            }
        } catch (error) {
            console.error('Load vacancies error:', error);
        }
    }

    renderVacancies() {
        const container = document.getElementById('vacanciesList');
        if (!container) return;

        // Очищаем контейнер
        container.innerHTML = '';

        this.vacancies.forEach(vacancy => {
            const cardHtml = this.vacancyCard.createCard(vacancy);
            container.insertAdjacentHTML('beforeend', cardHtml);

            // Привязываем события к последней добавленной карточке
            const lastCard = container.lastElementChild;
            if (lastCard) {
                this.vacancyCard.bindCardEvents(lastCard);
            }
        });

        // Скрываем состояние загрузки
        const loadingState = container.querySelector('.loading-state');
        if (loadingState) {
            loadingState.style.display = 'none';
        }
    }

    showLoadingState() {
        const container = document.getElementById('vacanciesList');

        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Загружаем вакансии...</div>
                </div>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('VacanciesManager starting...');
    const vacanciesManager = new VacanciesManager();
    vacanciesManager.init();
});