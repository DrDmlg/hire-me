class ProfileManager {
    constructor() {
        this.profileData = null;
        this.managers = {
            experience: new ExperienceManager(),
            skills: new SkillsManager()
        };
    }

    async init() {
        try {
            await this.loadProfile();

            if (this.profileData) {
                this.managers.experience.init(this.profileData.workExperiences || []);
                this.managers.skills.init(this.profileData.skills || []);

                this.updateStaticSections();
                console.log('ProfileManager initialized successfully');
            }
        } catch (error) {
            console.error('ProfileManager init error:', error);
            this.showError('Не удалось загрузить профиль');
        }
    }

    async loadProfile() {
        this.showLoading('Загрузка профиля...');

        try {
            const telegramUserId = Helpers.getTelegramUserId();
            console.log('Loading profile for user:', telegramUserId);
            const response = await fetch(`https://hireme.serveo.net/profile/${telegramUserId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.profileData = await response.json();
            console.log('Profile loaded:', this.profileData);
            Helpers.hideMessage();

        } catch (error) {
            console.error('Load profile error:', error);
            Helpers.hideMessage();
            this.showError('Ошибка загрузки профиля');
            throw error;
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