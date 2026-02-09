class CandidateProfileManager {

    constructor(profileData) {
        this.tg = window.Telegram?.WebApp;
        this.api = apiService;
        this.profileData = profileData;
    }

    async init() {
        try {
            this.initEventListeners();
            this.updateCandidateProfileData();

            console.log('CandidateProfileManager успешно инициализирован');
        } catch (error) {
            console.error('CandidateProfileManager ошибка инициализации:', error);
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

        const currentStatus = this.profileData.candidate.candidateJobStatus;
        const newStatus = currentStatus === 'Активный поиск' ? 'Не ищу работу' : 'Активный поиск';

        try {
            const response = await this.api.put(`/candidate/status/${candidateId}`, {
                jobStatus: newStatus
            });

            if (response.status >= 200 && response.status < 300) {
                this.profileData.candidate.candidateJobStatus = newStatus;
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

        const isActive = this.profileData.candidate.candidateJobStatus === 'Активный поиск';

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
        if (userPositionElement) userPositionElement.textContent = this.profileData.candidate.desiredPosition;
    }

    setCandidateStatistics() {
        const applicationElement = document.getElementById('statApplications');
        const invitationElement = document.getElementById('statInvitations');
        const rejectionElement = document.getElementById('statRejections');

        if (applicationElement) applicationElement.textContent = this.profileData.candidate.stats.applications;
        if (invitationElement) invitationElement.textContent = this.profileData.candidate.stats.invitations;
        if (rejectionElement) rejectionElement.textContent = this.profileData.candidate.stats.rejections;
    }
}