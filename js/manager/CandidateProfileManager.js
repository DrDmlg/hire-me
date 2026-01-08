class CandidateProfileManager {

    constructor(profileData) {
        this.tg = window.Telegram?.WebApp;
        this.api = apiService;
        this.profileData = profileData; // Пока данными мы никак не оперируем, но они в дальнейшем понадобятся
        this.candidateProfile = this.getTemporaryCandidateProfileData(); // временные тестовые данные
    }

    async init() {
        try {
            this.initEventListeners();
            this.updateCandidateProfileData();

            console.log('CandidateProfileManager initialized successfully');
        } catch (error) {
            console.error('CandidateProfileManager initialization error:', error);
        }
    }

    openAboutMe() {
        window.location.href = 'about-me.html?type=candidate';
    }

    openResumePage() {
        window.location.href = 'resume.html';
    }

    openVacancies() {
        window.location.href = '../vacancies.html?type=candidate';
    }

    // Временные тестовые данные
    getTemporaryCandidateProfileData() {
        return {
            position: this.profileData.candidate.desiredPosition,
            jobStatus: this.profileData.candidate.candidateJobStatus,
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
            statusTag.addEventListener('click', () => this.changeCandidateJobStatus());
        }
    }

    handleAction(action) {
        const actionHandlers = {
            'about-me': () => this.openAboutMe(),
            'resume': () => this.openResumePage(),
            'vacancies': () => this.openVacancies(),
        };

        const handler = actionHandlers[action];
        if (handler) {
            handler();
        } else {
            console.warn(`No handler for action: ${action}`);
        }
    }

    updateCandidateProfileData() {
        this.setUserAvatar();
        this.setUserName();
        this.setCandidateDesiredPosition()
        this.setCandidateJobStatus();
        this.setCandidateStatistics();
    }

    setUserAvatar() {
        UserProfileFiller.setUserAvatar(this.tg);
    }

    setUserName() {
        UserProfileFiller.setUserName(this.profileData);
    }

    async changeCandidateJobStatus() {
        const candidateId = this.profileData?.candidate?.id;

            const currentStatus = this.candidateProfile.jobStatus;
            const newStatus = currentStatus === 'Активный поиск' ? 'Не ищу работу' : 'Активный поиск';

            try {
                const response = await this.api.put(`/candidate/status/${candidateId}`, {
                    jobStatus: newStatus
                });

                if (response.status >= 200 && response.status < 300) {
                    this.candidateProfile.jobStatus = newStatus;
                    this.setCandidateJobStatus();
                }
            } catch (error) {
                notification.error('Ошибка смены статуса');
            }
        }

    setCandidateJobStatus() {
        const statusElement = document.getElementById('userStatus');
        const statusDot = document.getElementById('statusDot');

        if (!statusElement || !statusDot) return;

        const isActive = this.candidateProfile.jobStatus === 'Активный поиск';

        if (isActive) {
            statusElement.textContent = 'Активный поиск';
            statusDot.style.background = '#10E6A0';
        } else {
            statusElement.textContent = 'Не ищу работу';
            statusDot.style.background = '#e21212';
        }
    }

    setCandidateDesiredPosition() {
        const userPositionElement = document.getElementById('userPosition');
        if (userPositionElement) userPositionElement.textContent = this.candidateProfile.position;
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