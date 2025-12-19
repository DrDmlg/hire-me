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
            position: this.profileData.candidate.desiredPosition,
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

    toggleStatus() {
        this.candidateProfile.isActive = !this.candidateProfile.isActive;
        this.setCandidateJobStatus();

        const statusText = this.candidateProfile.isActive ? 'Активный поиск' : 'Не ищу работу';
    }

    updateProfileData() {
        this.setUserAvatar();
        this.setUserName();
        this.setCandidateDesiredPosition()
        this.setCandidateJobStatus();
        this.setCandidateJobExperience();
        this.setCandidateEducation();
        this.setCandidateStatistics();
    }

    setUserAvatar() {
        UserProfileFiller.setUserAvatar(this.tg);
    }

    setUserName() {
        UserProfileFiller.setUserName(this.profileData);
    }

    setCandidateJobStatus() {
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

    setCandidateDesiredPosition() {
        const userPositionElement = document.getElementById('userPosition');
        if (userPositionElement) userPositionElement.textContent = this.candidateProfile.position;
    }

    setCandidateJobExperience() {
        const experienceElement = document.getElementById('userExperience');
        if (experienceElement) experienceElement.textContent = this.candidateProfile.experience;
    }

    setCandidateEducation() {
        const educationElement = document.getElementById('userEducation');

        if (educationElement) educationElement.textContent = this.candidateProfile.education;
    }

    setCandidateStatistics() {
        const viewsElement = document.getElementById('statProfileViews');
        const responsesElement = document.getElementById('statResponses');
        const matchesElement = document.getElementById('statMatches');

        if (viewsElement) viewsElement.textContent = this.candidateProfile.stats.profileViews;
        if (responsesElement) responsesElement.textContent = this.candidateProfile.stats.responses;
        if (matchesElement) matchesElement.textContent = this.candidateProfile.stats.matches;
    }
}