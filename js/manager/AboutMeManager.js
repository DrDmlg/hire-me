class AboutMeManager {
    constructor() {
        this.profileData = null;
        this.navigation = new NavigationService();

        this.managers = {
            experience: new ExperienceComponent(),
            skills: new SkillsComponent(),
        };
    }

    async init() {
        try {
            this.navigation.init();
            this.profileData = await ProfileService.loadProfile();
            if (this.profileData) {
                await this.managers.experience.init(this.profileData.workExperiences || []);
                await this.managers.skills.init(this.profileData.candidate.skills || [], this.profileData);
                this.updateStaticSections();
                console.log('AboutMeManager initialized successfully');
            }
        } catch (error) {
            console.error('AboutMeManager init error:', error);
            this.showError('Не удалось загрузить профиль');
        }
    }

    updateStaticSections() {
        if (this.profileData) {
            document.getElementById('userName').textContent =
                `${this.profileData.firstName} ${this.profileData.lastName}`;
            // document.getElementById('userPosition').textContent =
            //     this.profileData.position || 'Не указано';
            // Пока не понятно какую позицию устанавливать в профиле (то ли от кандидата то ли от сотрудника, а может совсем иную)
        } else {
            console.warn('No profile data to update static sections');
        }
    }

    showLoading(text) {
        Helpers.showMessage(text, 'loading');
    }

    showError(text) {
        Helpers.showMessage(text, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('AboutMeManager успешно инициализирован');
    const aboutMeManager = new AboutMeManager();
    aboutMeManager.init();
});