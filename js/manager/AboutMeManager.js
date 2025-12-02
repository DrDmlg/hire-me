class AboutMeManager {
    constructor() {
        this.profileData = null;
        this.navigation = new NavigationService();

        this.managers = {
            experience: new ExperienceComponent(),
            educations: new EducationComponent(),
            skills: new SkillsComponent(),
            languages: new LanguagesComponent(),
            contact: new ContactsComponent(),
        };
    }

    async init() {
        try {
            this.navigation.init();
            this.profileData = await ProfileService.loadProfile();
            if (this.profileData) {
                await this.managers.experience.init(this.profileData.workExperiences || []);
                await this.managers.educations.init(this.profileData.candidate.educations || [], this.profileData);
                await this.managers.skills.init(this.profileData.candidate.skills || [], this.profileData);
                await this.managers.languages.init(this.profileData.candidate.languages || [], this.profileData);
                await this.managers.contact.init(this.profileData.contact || {}, this.profileData);
                this.loadBasicCandidateInfo();
                console.log('AboutMeManager initialized successfully');
            }
        } catch (error) {
            console.error('Не удалось загрузить профиль:', error);
            notification.error('Не удалось загрузить профиль');
        }
    }

    loadBasicCandidateInfo() {
        if (this.profileData) {
            document.getElementById('userName').textContent = `${this.profileData.firstName} ${this.profileData.lastName}`;
            document.getElementById('userPosition').textContent = this.profileData.candidate.desiredPosition || 'Не указано';
        } else {
            console.warn('No profile data to update static sections');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('AboutMeManager успешно инициализирован');
    const aboutMeManager = new AboutMeManager();
    aboutMeManager.init();
});