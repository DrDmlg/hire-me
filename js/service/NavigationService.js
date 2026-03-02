class NavigationService {
    constructor() {
        this.tg = window.Telegram?.WebApp;
    }

    init() {
        this.setupGlobalNavigation();
        this.setupBackNavigation();
        this.setupKeyboardEvents();
    }

    setupGlobalNavigation() {
        document.querySelectorAll('.nav-item, .action-card').forEach(item => {
            item.addEventListener('click', function (e) {

                const href = this.getAttribute('href');
                if (!href || href.includes('t.me')) return;
                e.preventDefault();

                window.location.href = href;
            });
        });
    }

    setupBackNavigation() {
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.goBack();
            });
        }
    }

    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.goBack();
            }
        });
    }

    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        }
    }
}