class CandidateProfileManager {

    constructor(profileData) {
        this.tg = window.Telegram?.WebApp;
        this.profileData = profileData; // Пока данными мы никак не оперируем, но они в дальнейшем понадобятся
        this.candidateProfile = this.getDefaultCandidateProfile(); // временные тестовые данные
    }

    async init() {
        try {
            this.initEventListeners();
            this.updateProfileData();

            console.log('CandidateProfileManager initialized successfully');
        } catch (error) {
            console.error('CandidateProfileManager initialization error:', error);
        }
    }

    openAboutMe() {
        window.location.href = 'about-me.html';
    }

    openResumePage() {
        window.location.href = 'resume.html';
    }

    // Временные тестовые данные
    getDefaultCandidateProfile() {
        return {
            headline: this.profileData.candidate.desiredPosition,
            experience: "5+ лет опыта", // TODO: пока мок значение. Продумать как будем рассчитывать. Может вообще убрать
            education: "Высшее образование", // TODO: пока мок значение. Продумать, что будем сюда подставлять. Может вообще убрать
            isActive: true, // TODO: пока мок значение. Исправить реализацю как дойдут руки
            stats: {
                profileViews: 0,
                responses: 0,
                matches: 0
            }
        };
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
        const statusTag = document.getElementById('statusTag');
        if (statusTag) {
            statusTag.addEventListener('click', () => this.toggleStatus());
        }
    }

    handleAction(action) {
        const actionHandlers = {
            'about-me': () => this.openAboutMe(),
            'resume': () => this.openResumePage(),
        };

        const handler = actionHandlers[action];
        if (handler) {
            handler();
        } else {
            console.warn(`No handler for action: ${action}`);
        }
    }

    // Смена статуса
    toggleStatus() {
        this.candidateProfile.isActive = !this.candidateProfile.isActive;
        this.setUserStatus();

        const statusText = this.candidateProfile.isActive ? 'Активный поиск' : 'Не ищу работу';
    }

    updateProfileData() {
        this.setAvatar();
        this.setUserName();
        this.setUserStatus();
        this.setUserPosition()
        this.setUserExperience();
        this.setUserEducation();
        this.setUserStatistics();
    }

    //TODO: Аватар пока берется из данных телеграма. В системе аватар пользователя не сохраняется. Функционала смены аватара не существует
    setAvatar() {
        if (!this.tg?.initDataUnsafe?.user) return;

        const user = this.tg.initDataUnsafe.user;
        const avatar = document.getElementById('userAvatar');

        if (user.photo_url) {
            avatar.innerHTML = `<img src="${user.photo_url}" alt="Avatar" class="avatar-image">`;
        } else if (user.first_name) {
            avatar.textContent = user.first_name[0].toUpperCase();
            const colors = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
            const colorIndex = user.id % colors.length;
            avatar.style.background = colors[colorIndex];
            avatar.style.color = 'white';
        }
    }

    setUserName() {
        const userNameElement = document.getElementById('userName');

        let firstName = this.profileData.firstName;
        let lastName = this.profileData.lastName;

        userNameElement.textContent = firstName + ' ' + lastName;
    }

    setUserStatus() {
        const statusElement = document.getElementById('userStatus');
        const statusDot = document.getElementById('statusDot');

        if (!statusElement || !statusDot) return;

        if (this.candidateProfile.isActive) {
            statusElement.textContent = 'Активный поиск';
            statusDot.className = 'status-dot';
            statusDot.style.background = '#10E6A0';
        } else {
            statusElement.textContent = 'Не ищу работу';
            statusDot.className = 'status-dot inactive';
            statusDot.style.background = '#e21212';
        }
    }

    setUserPosition() {
        const userPositionElement = document.getElementById('userPosition');
        if (userPositionElement) userPositionElement.textContent = this.candidateProfile.headline;
    }

    setUserExperience() {
        const experienceElement = document.getElementById('userExperience');
        if (experienceElement) experienceElement.textContent = this.candidateProfile.experience;
    }

    setUserEducation() {
        const educationElement = document.getElementById('userEducation');

        if (educationElement) educationElement.textContent = this.candidateProfile.education;
    }

    setUserStatistics() {
        const viewsElement = document.getElementById('statProfileViews');
        const responsesElement = document.getElementById('statResponses');
        const matchesElement = document.getElementById('statMatches');

        if (viewsElement) viewsElement.textContent = this.candidateProfile.stats.profileViews;
        if (responsesElement) responsesElement.textContent = this.candidateProfile.stats.responses;
        if (matchesElement) matchesElement.textContent = this.candidateProfile.stats.matches;
    }
}