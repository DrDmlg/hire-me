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

                const href = card.getAttribute('href');
                const url = new URL(href, window.location.origin);
                const profileType = url.searchParams.get('type');

                if (profileType) {
                    localStorage.setItem('userProfileType', profileType);
                    console.log('Пользователь захотел зайти в профайл: ' + profileType);

                }
            });
        });
    }
}

new Login();