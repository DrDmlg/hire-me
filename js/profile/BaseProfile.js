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
        // this.userType = localStorage.getItem('userProfileType');
        this.userType = 'candidate';
        console.log('Пользователь заходит под : ' + this.userType);
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
    new BaseProfile().init();
});