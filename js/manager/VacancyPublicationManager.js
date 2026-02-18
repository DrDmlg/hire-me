class VacancyPublicationManager {
    constructor() {
        this.profileData = null;
        this.vacancyComponent = null;
        this.navigation = new NavigationService();
    }

    async init() {
        try {
            this.navigation.init();
            this.profileData = await ProfileService.loadProfile();

            this.vacancyComponent = new VacancyPublicationComponent();
            await this.vacancyComponent.init(this.profileData);
            console.log('VacancyPublicationManager успешно инициализирован');
        } catch (error) {
            console.error('VacancyPublicationManager init error:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('VacancyPublicationManager успешно инициализирован');
    const vacancyPublicationManager = new VacancyPublicationManager();
    vacancyPublicationManager.init();
});