class AboutMeManager {
    constructor() {
        this.userType = this.determineProfileType();
        this.profileData = null;
        this.navigation = new NavigationService();

        if (this.userType === 'candidate') {
            this.loadManagersForCandidate()
        } else if (this.userType === 'employer') {
            this.loadManagersForEmployer();
        }
    }

    loadManagersForCandidate() {
        this.managers = {
            basicInfo: new BasicInfoComponent(),
            contact: new ContactsComponent(),
            experience: new ExperienceComponent(),
            educations: new EducationComponent(),
            skills: new SkillsComponent(),
            languages: new LanguagesComponent(),
        };
    }

    loadManagersForEmployer() {
        this.managers = {
            basicInfo: new BasicInfoComponent(),
            contact: new ContactsComponent(),
            experience: new ExperienceComponent(),
        };
    }

    async init() {
        try {
            this.navigation.init();
            this.profileData = await ProfileService.loadProfile();
            if (this.profileData) {
                if (this.userType === 'candidate') {
                    await this.initManagersForCandidate();
                    this.loadBasicCandidateInfo();
                } else if (this.userType === 'employer') {
                    this.initManagersForEmployer();
                    this.loadBasicEmployerInfo();
                }

                console.log('AboutMeManager initialized successfully');
            }
        } catch (error) {
            console.error('Не удалось загрузить профиль:', error);
            notification.error('Не удалось загрузить профиль');
        }
    }

    async initManagersForCandidate() {
        await this.managers.basicInfo.init(this.profileData);
        await this.managers.contact.init(this.profileData.contact || {}, this.profileData);
        await this.managers.experience.init(this.profileData.workExperiences || []);
        await this.managers.educations.init(this.profileData.candidate.educations || [], this.profileData);
        await this.managers.skills.init(this.profileData.candidate.skills || [], this.profileData);
        await this.managers.languages.init(this.profileData.candidate.languages || [], this.profileData);
    }

    async initManagersForEmployer() {
        await this.managers.basicInfo.init(this.profileData);
        await this.managers.contact.init(this.profileData.contact || {}, this.profileData);
        await this.managers.experience.init(this.profileData.workExperiences || []);
    }

    loadBasicCandidateInfo() {
        if (this.profileData) {
            document.getElementById('userName').textContent = `${this.profileData.firstName} ${this.profileData.lastName}`;
            document.getElementById('userPosition').textContent = this.profileData.candidate.desiredPosition || 'Не указано';
        }
    }

    loadBasicEmployerInfo() {
        if (this.profileData) {
            document.getElementById('userName').textContent = `${this.profileData.firstName} ${this.profileData.lastName}`;
            document.getElementById('userPosition').textContent = this.profileData.employer.position || 'Не указано';
        }
    }

    determineProfileType() {
        const urlParams = new URLSearchParams(window.location.search);
        let userType = urlParams.get('type');
        console.log('Пользователь заходит на страницу "Обо мне" под : ' + userType);
        return userType
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('AboutMeManager успешно инициализирован');
    const aboutMeManager = new AboutMeManager();
    aboutMeManager.init();
});