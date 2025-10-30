class RegistrationChoice {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.init();
    }

    init() {
        // Настройка Telegram
        this.tg.expand();
        this.tg.setHeaderColor('#2563EB');
        this.tg.setBackgroundColor('#F8FAFC');
        this.tg.enableClosingConfirmation();

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Обработчики для карточек
        document.querySelectorAll('.action-card').forEach(item => {
            item.addEventListener('click', (e) => this.handleCardClick(e, item));

            // Сброс анимации
            item.addEventListener('transitionend', () => {
                item.style.transform = '';
                item.style.background = '';
            });
        });

        // Кнопка назад
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', (e) => this.handleBackClick(e));
        }

        // Клавиатура
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
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

    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    }

    handleBackClick(e) {
        e.preventDefault();
        const button = e.target;
        button.style.transform = 'translateX(-4px)';
        setTimeout(() => {
            this.goBack();
        }, 150);
    }

    handleKeydown(e) {
        if (e.key === 'Escape') {
            this.goBack();
        }
    }
}

// Запуск приложения
new RegistrationChoice();