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

        this.checkAndApplyRoles();
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

    checkAndApplyRoles() {
        const cachedRoles = sessionStorage.getItem('user_roles');

        if (cachedRoles) {
            try {
                const roles = JSON.parse(cachedRoles);

                if (roles.isCandidate) {
                    this.disableCard('candidate');
                }
                if (roles.isEmployer) {
                    this.disableCard('employer');
                }
            } catch (e) {
                console.error("Ошибка парсинга ролей из кэша", e);
            }
        }
    }

    disableCard(type) {
        const card = document.querySelector(`.action-card[href*="type=${type}"]`);
        if (card) {
            card.classList.add('disabled');
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.action-card').forEach(item => {
            item.addEventListener('click', (e) => {
                if (item.classList.contains('disabled')) {
                    e.preventDefault();
                    return false;
                }
            });
        });
    }
}

new RegistrationChoice();