class BaseProfile {

    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.profileData = null;
        this.navigation = new NavigationService();
        this.api = apiService;
        this.userType = null; // 'candidate' или 'employer'
        this.managers = {};   // Пока пустой
    }

    async init() {
        if (this.tg) {
            this.initTelegram();
        }

        this.navigation.init();
        await this.loadProfile();
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
        // this.userType = localStorage.getItem('userProfileType');
        this.userType = 'candidate';
        console.log('Пользователь заходит под : ' + this.userType);
    }

    async initManagers() {
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

    async loadProfile() {
        this.showLoading('Загрузка профиля...');

        try {
            const telegramUserId = Helpers.getTelegramUserId();
            console.log('Loading profile for user:', telegramUserId);

            const response = await this.api.get(`/profile/${telegramUserId}`);
            this.profileData = response.data

            console.log('Профиль был загружен:', this.profileData);
            Helpers.hideMessage();

        } catch (error) {
            console.error('Ошибка загрузки профайла:', error);
            Helpers.hideMessage();
            this.showError('Ошибка загрузки профиля');
            throw error;
        }
    }

    showLoading(text) {
        Helpers.showMessage(text, 'loading');
    }

    showError(text) {
        Helpers.showMessage(text, 'error');
    }

    // // Action methods
    // openAboutMe() {
    //     const telegramUserId = Helpers.getTelegramUserId();
    //
    //     this.checkProfileAccess(telegramUserId)
    //         .then(hasAccess => {
    //             if (hasAccess) {
    //                 window.location.href = 'about-me.html';
    //             } else {
    //                 this.showAlert('Для просмотра профиля необходимо зарегистрироваться');
    //             }
    //         })
    //         .catch(error => {
    //             console.error('Error checking profile access:', error);
    //             this.showAlert('Произошла ошибка при проверке профиля');
    //         });
    // }
    //
    // // Utility methods
    // async checkProfileAccess(telegramUserId) {
    //     try {
    //         const response = await fetch(`https://hireme.serveo.net/profile/check-access/${telegramUserId}`);
    //         return await response.json();
    //     } catch (error) {
    //         console.error('Profile access check failed:', error);
    //         return false;
    //     }
    // }
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('BaseProfile успешно инициализирован');
    const baseProfile = new BaseProfile();
    baseProfile.init();
});