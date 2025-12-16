class RegistrationChoice {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.navigation = new NavigationService();
        this.init();
    }

    init() {
        if (this.tg) {
            this.initTelegram();
        }
        this.setupEventListeners();
        this.navigation.init();
    }

    initTelegram() {
        if (this.tg) {
            this.tg.expand();
            this.tg.setHeaderColor('#2563EB');
            this.tg.setBackgroundColor('#F8FAFC');
            this.tg.enableClosingConfirmation();
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.action-card').forEach(item => {
            item.addEventListener('click', (e) => {
            });
        });
    }
}

new RegistrationChoice();