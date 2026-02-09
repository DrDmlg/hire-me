class EmployerProfileManager {

    constructor(profileData) {
        this.tg = window.Telegram?.WebApp;
        this.profileData = profileData;
    }

    async init() {
        try {
            this.initEventListeners();
            this.updateEmployerProfileData();
            console.log('EmployerProfileManager успешно инициализирован');
        } catch (error) {
            console.error('EmployerProfileManager ошибка инициализации:', error);
        }
    }

     openAboutMe() {
        window.location.href = 'about-me.html?type=employer';
    }

    publicationVacancy() {
        window.location.href = 'publication.html?type=employer';
    }

    openVacancies() {
        window.location.href = '../vacancies.html?type=employer';
    }

    openApplications() {
        window.location.href = 'application.html?type=employer';
    }


    initEventListeners() {
        // Обработчики для action cards через data-attributes
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const action = card.getAttribute('data-action');
                this.handleAction(action);
            });
        });
    }

    handleAction(action) {
        const actionHandlers = {
            'about-me': () => this.openAboutMe(),
            'publication': () => this.publicationVacancy(),
            'vacancies': () => this.openVacancies(),
            'responses': () => this.openApplications(),
        };

        const handler = actionHandlers[action];
        if (handler) {
            handler();
        } else {
            console.warn(`No handler for action: ${action}`);
        }
    }

    updateEmployerProfileData() {
        this.setUserAvatar();
        this.setUserName();
        this.setEmployerCurrentPosition()
        this.setEmployerStatistics();
    }

    setUserAvatar() {
        UserProfileFiller.setUserAvatar(this.tg);
    }

    setUserName() {
        UserProfileFiller.setUserName(this.profileData);
    }

    setEmployerCurrentPosition() {
        const userPositionElement = document.getElementById('userPosition');
        if (userPositionElement) userPositionElement.textContent = this.profileData.employer.position;
    }

    setEmployerStatistics() {
        const applicationElement = document.getElementById('statApplications');
        const invitationElement = document.getElementById('statInvitations');
        const rejectionElement = document.getElementById('statRejections');

        if (applicationElement) applicationElement.textContent = this.profileData.employer.stats.applications;
        if (invitationElement) invitationElement.textContent = this.profileData.employer.stats.invitations;
        if (rejectionElement) rejectionElement.textContent = this.profileData.employer.stats.rejections;
    }
}