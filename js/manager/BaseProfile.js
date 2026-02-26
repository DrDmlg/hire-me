class BaseProfile {

    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.api = apiService;
        this.profileData = null;
        this.navigation = new NavigationService();
        this.userType = null; // 'candidate' или 'employer'
        this.managers = {};   // Пока пустой
        this.avatarContainer = document.getElementById('userAvatar');
    }

    async init() {
        if (this.tg) {
            this.initTelegram();
        }

        this.navigation.init();
        this.profileData = await ProfileService.loadProfile();
        await this.determineProfileType();
        await this.initManagers();
        this.setUserAvatar();

        console.log(`Профиль инициализирован для: ${this.userType}`);
    }

    initTelegram() {
        if (this.tg) {
            this.tg.expand();
            this.tg.setHeaderColor('#2563EB');
            this.tg.setBackgroundColor('#F8FAFC');
            this.tg.enableClosingConfirmation();
        }
    }

    async determineProfileType() {
        const urlParams = new URLSearchParams(window.location.search);
        this.userType = urlParams.get('type');
        console.log('Пользователь заходит под : ' + this.userType);
    }

    async initManagers() {
        if (this.userType === 'candidate') {
            this.managers.profile = new CandidateProfileManager(this.profileData);
            console.log('Создан CandidateProfileManager');
        } else if (this.userType === 'employer') {
            this.managers.profile = new EmployerProfileManager(this.profileData);
            console.log('Создан EmployerProfileManager');
        }

        await this.managers.profile.init();
    }

    setUserAvatar() {
        UserProfileFiller.updateAvatar(this.avatarContainer, this.profileData.id, this.api.BASE_URL)
    }
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('BaseProfile успешно инициализирован');
    const baseProfile = new BaseProfile();
    baseProfile.init();
});