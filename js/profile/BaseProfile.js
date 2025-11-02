class BaseProfile {

    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.navigation = new NavigationService();
        this.userType = null; // 'candidate' или 'employer'
        this.managers = {};   // Пока пустой
    }

    async init() {
        if (this.tg) {
            this.initTelegram();
        }

        this.navigation.init();

        await this.determineProfileType();

        await this.initManagers();

        console.log(`Профиль инициализирован для: ${this.userType}`);
    }

    initTelegram() {
        if (this.tg) {
            this.tg.expand();
            this.tg.setHeaderColor('#FFFFFF');
            this.tg.setBackgroundColor('#F8FAFC');
            this.tg.enableClosingConfirmation();
        }
    }

    async determineProfileType() {
        this.userType = localStorage.getItem('userProfileType');
        console.log('Пользователь захотел зайти в профайл: ' + this.userType);
    }

    async initManagers() {
        // Создаем только нужные менеджеры!
        if (this.userType === 'candidate') {
            this.managers.profile = new CandidateProfileManager(this);
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
    new BaseProfile().init();
});