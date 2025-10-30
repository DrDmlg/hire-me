class ProfileChoice {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.init();
    }

    init() {
        // Настройка Telegram
        if (this.tg) {
            this.tg.expand();
            this.tg.enableClosingConfirmation();
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Обработчики для карточек
        const candidateCard = document.querySelector('.action-card.candidate');
        const employerCard = document.querySelector('.action-card.employer');

        if (candidateCard) {
            candidateCard.addEventListener('click', () => this.selectProfile('candidate'));
        }

        if (employerCard) {
            employerCard.addEventListener('click', () => this.selectProfile('employer'));
        }

        // Кнопка назад
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', (e) => this.handleBackClick(e));
        }

        // Клавиатура
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    selectProfile(profileType) {
        const card = event?.currentTarget || document.querySelector(`.action-card.${profileType}`);

        if (!card) return;

        // Анимация нажатия
        card.style.transform = 'translateY(-2px)';
        card.style.background = 'var(--primary-soft)';

        // Переход с задержкой для анимации
        setTimeout(() => {
            if (profileType === 'candidate') {
                window.location.href = 'profile.html';
            } else {
                window.location.href = 'employer_profile.html';
            }
        }, 200);

        // Сброс анимации после перехода
        setTimeout(() => {
            card.style.transform = '';
            card.style.background = '';
        }, 400);
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
        button.style.animation = 'rotateIn 0.6s ease-out';
        setTimeout(() => {
            this.goBack();
        }, 300);
    }

    handleKeydown(e) {
        if (e.key === 'Escape') {
            this.goBack();
        }
    }
}

// Запуск приложения
new ProfileChoice();