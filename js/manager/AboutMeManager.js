class AboutMeManager {
    constructor() {
        this.tg = window.Telegram?.WebApp;
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
                    this.setBasicUserInfo();
                    this.setBasicCandidateInfo();
                } else if (this.userType === 'employer') {
                    await this.initManagersForEmployer();
                    this.setBasicUserInfo();
                    this.setBasicEmployerInfo();
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

    setBasicUserInfo() {
        if (this.profileData) {
            this.setUserName();
            this.setUserAvatar();
        }
    }

    setBasicCandidateInfo() {
        document.getElementById('userPosition').textContent = this.profileData.candidate.desiredPosition || 'Не указано';
    }

    setBasicEmployerInfo() {
        document.getElementById('userPosition').textContent = this.profileData.employer.position || 'Не указано';
    }

    setUserName() {
        UserProfileFiller.setUserName(this.profileData);
    }

    setUserAvatar() {
        UserProfileFiller.setUserAvatar(this.tg);
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