class VacancyManager {
    constructor() {
        this.profileData = null;
        this.vacancyComponent = null;
        this.navigation = new NavigationService();
    }

    async init() {
        try {
            this.navigation.init();
            this.profileData = await ProfileService.loadProfile();

            // Проверяем, что пользователь - работодатель
            if (!this.profileData || !this.profileData.employer) {
                notification.error('Только работодатели могут создавать вакансии');
                setTimeout(() => window.history.back(), 2000);
                return;
            }

            this.vacancyComponent = new VacancyCreateComponent();
            await this.vacancyComponent.init(this.profileData);

            console.log('VacancyManager initialized for new vacancy creation');

        } catch (error) {
            console.error('VacancyManager init error:', error);
            notification.error('Не удалось загрузить страницу создания вакансии');
            setTimeout(() => window.history.back(), 3000);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('VacancyManager успешно инициализирован');
    const vacancyManager = new VacancyManager();
    vacancyManager.init();
});