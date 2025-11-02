class RegistrationChoice {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.navigation = new NavigationService(); // ← Добавляем сервис
        this.init();
    }

    init() {
        if (this.tg) {
            this.initTelegram();
        }
        this.setupEventListeners();
        this.navigation.init(); // ← Инициализируем навигацию
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
        // Обработчики для карточек
        document.querySelectorAll('.action-card').forEach(item => {
            // Специальная логика для анимации карточек
            item.addEventListener('click', (e) => this.handleCardClick(e, item));

            // Сброс анимации
            item.addEventListener('transitionend', () => {
                item.style.transform = '';
                item.style.background = '';
            });
        });
    }

    handleCardClick(e, card) {
        // Для локальных HTML-страниц разрешаем стандартный переход
        if (card.href.includes('.html')) {
            // Минимальная задержка для feedback
            e.preventDefault();
            this.animateCardPress(card);

            setTimeout(() => {
                window.location.href = card.href;
            }, 200);
            return;
        }

        e.preventDefault();
        this.animateCardPress(card);

        setTimeout(() => {
            if (this.tg.showPopup) {
                window.open(card.href, '_blank');
            } else {
                window.location.href = card.href;
            }
        }, 200);
    }

    animateCardPress(card) {
        card.style.transform = 'translateY(-2px)';
        card.style.background = '#EFF6FF';
    }
}

// Запуск приложения
new RegistrationChoice();