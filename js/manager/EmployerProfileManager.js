class EmployerProfileManager {

    constructor(profileData) {
        this.tg = window.Telegram?.WebApp;
        this.profileData = profileData; // Пока данными мы никак не оперируем, но они в дальнейшем понадобятся
        this.employerProfile = this.getTemporaryEmployerProfileData(); // временные тестовые данные
    }

    async init() {
        try {
            this.initEventListeners();
            this.updateEmployerProfileData();

            console.log('EmployerProfileManager initialized successfully');
        } catch (error) {
            console.error('EmployerProfileManager initialization error:', error);
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

    // Временные тестовые данные
    getTemporaryEmployerProfileData() {
        return {
            position: this.profileData.employer.position,
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
    }

    handleAction(action) {
        const actionHandlers = {
            'about-me': () => this.openAboutMe(),
            'publication': () => this.publicationVacancy(),
            'vacancies': () => this.openVacancies(),
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
    }

    setUserAvatar() {
        UserProfileFiller.setUserAvatar(this.tg);
    }

    setUserName() {
        UserProfileFiller.setUserName(this.profileData);
    }

    setEmployerCurrentPosition() {
        const userPositionElement = document.getElementById('userPosition');
        if (userPositionElement) userPositionElement.textContent = this.employerProfile.position;
    }
}