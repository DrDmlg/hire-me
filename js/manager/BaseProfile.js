class BaseProfile {

    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.profileData = null;
        this.navigation = new NavigationService();
        this.userType = null; // 'candidate' или 'employer'
        this.managers = {};   // Пока пустой
    }

    async init() {
        if (this.tg) {
            this.initTelegram();
        }

        this.navigation.init();
        this.profileData = await ProfileService.loadProfile();
        await this.determineProfileType();
        await this.initManagers();

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
        this.userType = localStorage.getItem('userProfileType');
        console.log('Пользователь заходит под : ' + this.userType);
    }

    async initManagers() {
        //TODO: Так как пока не реализован профиль работодателя, то по умолчанию выставляем кандидата
        this.userType = 'candidate';

        if (this.userType === 'candidate') {
            this.managers.profile = new CandidateProfileManager(this.profileData);
            console.log('Создан CandidateProfileManager');
        } else if (this.userType === 'employer') {
            this.managers.profile = new EmployerProfileManager(this);
            console.log('Создан EmployerProfileManager');
        }

        // Инициализируем их
        await this.managers.profile.init();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('BaseProfile успешно инициализирован');
    const baseProfile = new BaseProfile();
    baseProfile.init();
});