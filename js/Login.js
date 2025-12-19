class Login {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.navigation = new NavigationService();
        this.init();
    }

    init() {
        if (this.tg) {
            this.initTelegram();
        }
        this.navigation.init();
    }

    initTelegram() {
        if (this.tg) {
            this.tg.expand();
            this.tg.enableClosingConfirmation();
        }
    }
}

new Login();