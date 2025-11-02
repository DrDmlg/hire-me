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
                if (this.getAttribute('href') && !this.getAttribute('href').includes('t.me')) {
                    e.preventDefault();

                    if (this.classList.contains('action-card')) {
                        this.style.transform = 'translateY(-2px)';
                        this.style.background = '#EFF6FF';
                    } else {
                        this.style.transform = 'scale(0.98)';
                    }

                    setTimeout(() => {
                        window.location.href = this.getAttribute('href');
                    }, 150);
                }
            });

            item.addEventListener('transitionend', () => {
                item.style.transform = '';
                item.style.background = '';
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