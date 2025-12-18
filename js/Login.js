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

        this.setupEventListeners();
        this.navigation.init();
    }

    initTelegram() {
        if (this.tg) {
            this.tg.expand();
            this.tg.enableClosingConfirmation();
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {

                const profileType = card.dataset.type;

                if (profileType) {
                    localStorage.setItem('userProfileType', profileType);

                    window.location.href = `html/${profileType}/profile.html?type=${profileType}`;
                }
            });
        });
    }
}

new Login();