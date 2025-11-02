class CandidateProfileManager {

    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.navigation = new NavigationService();
    }

    async init() {
        try {
            this.initEventListeners();
            this.updateProfileData();
            this.updateStats();
            this.updateStatus();

            window.app = this;
            console.log('CandidateProfileManager initialized successfully');
        } catch (error) {
            console.error('CandidateProfileManager initialization error:', error);
        }
    }


    initEventListeners() {
        // Обработчики для action cards через data-attributes
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const action = card.getAttribute('data-action');
                this.handleAction(action);
            });
        });

        // Обработчик для статуса
        const statusTag = document.querySelector('.status-tag');
        if (statusTag) {
            statusTag.addEventListener('click', () => this.toggleStatus());
        }
    }

    handleAction(action) {
        const actionHandlers = {
            'about-me': () => this.openAboutMe(),
        };

        const handler = actionHandlers[action];
        if (handler) {
            handler();
        } else {
            console.warn(`No handler for action: ${action}`);
        }
    }

    // Status methods
    toggleStatus() {
        this.userProfile.isActive = !this.userProfile.isActive;
        this.updateStatus();

        const statusText = this.userProfile.isActive ? 'Активный поиск' : 'Не ищу работу';
        this.showAlert(`Статус изменен на: ${statusText}`);
    }

    updateProfileData() {
        // Обновляем данные профиля из Telegram (если есть)
        if (this.tg?.initDataUnsafe?.user) {
            this.updateTelegramUserData();
        }

        // Обновляем статические данные
        const headlineElement = document.getElementById('userHeadline');
        const experienceElement = document.getElementById('userExperience');
        const educationElement = document.getElementById('userEducation');

        if (headlineElement) headlineElement.textContent = this.userProfile.headline;
        if (experienceElement) experienceElement.textContent = this.userProfile.experience;
        if (educationElement) educationElement.textContent = this.userProfile.education;
    }

    updateTelegramUserData() {
        const user = this.tg.initDataUnsafe.user;
        const avatar = document.getElementById('userAvatar');
        const userNameElement = document.getElementById('userName');

        if (!avatar || !userNameElement) return;

        // Устанавливаем аватар
        if (user.photo_url) {
            avatar.innerHTML = `<img src="${user.photo_url}" alt="Avatar" class="avatar-image">`;
        } else if (user.first_name) {
            avatar.textContent = user.first_name[0].toUpperCase();
            const colors = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
            const colorIndex = user.id % colors.length;
            avatar.style.background = colors[colorIndex];
            avatar.style.color = 'white';
        }

        // Устанавливаем имя
        let userName = '';
        if (user.first_name) userName += user.first_name;
        if (user.last_name) userName += ' ' + user.last_name;
        if (userName.trim() === '') userName = 'Пользователь';

        userNameElement.textContent = userName;
    }

    updateStats() {
        const viewsElement = document.getElementById('statProfileViews');
        const responsesElement = document.getElementById('statResponses');
        const matchesElement = document.getElementById('statMatches');

        if (viewsElement) viewsElement.textContent = this.userProfile.stats.profileViews;
        if (responsesElement) responsesElement.textContent = this.userProfile.stats.responses;
        if (matchesElement) matchesElement.textContent = this.userProfile.stats.matches;
    }

    updateStatus() {
        const statusElement = document.getElementById('userStatus');
        const statusDot = document.getElementById('statusDot');

        if (!statusElement || !statusDot) return;

        if (this.userProfile.isActive) {
            statusElement.textContent = 'Активный поиск';
            statusDot.className = 'status-dot';
            statusDot.style.background = '#10E6A0';
        } else {
            statusElement.textContent = 'Не ищу работу';
            statusDot.className = 'status-dot inactive';
            statusDot.style.background = '#e21212';
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    new CandidateProfileManager.init();
});