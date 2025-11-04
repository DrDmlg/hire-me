class ProfileChoice {
    constructor() {
        this.tg = window.Telegram?.WebApp;
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
            this.tg.enableClosingConfirmation();
        }
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
    }

    selectProfile(profileType) {
        const card = event?.currentTarget || document.querySelector(`.action-card.${profileType}`);

        if (!card) return;

        localStorage.setItem('userProfileType', profileType);
        console.log('Пользователь захотел зайти в профайл: ' + profileType);

        // Анимация нажатия
        card.style.transform = 'translateY(-2px)';
        card.style.background = 'var(--primary-soft)';

        // Переход с задержкой для анимации
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 200);

        // Сброс анимации после перехода
        setTimeout(() => {
            card.style.transform = '';
            card.style.background = '';
        }, 400);
    }
}

// Запуск приложения
new ProfileChoice();