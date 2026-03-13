class HeadlineComponent {
    constructor() {
        this.api = apiService;

        this.display = document.getElementById('headlineDisplay');
        this.container = this.display.closest('.headline-description');

        this.modal = document.getElementById('headlineModal');
        this.overlay = document.getElementById('headlineOverlay');
        this.input = document.getElementById('headlineInput');
        this.charCount = document.getElementById('headlineCharCount');

        this.saveBtn = document.getElementById('saveHeadlineBtn');
        this.cancelBtn = document.getElementById('cancelHeadlineBtn');

        this.profileData = null;
        this.userType = null;

        this.initEventListeners();
    }

    async init(profileData) {
        this.profileData = profileData;
        this.userType = this.getUserTypeFromURL()
        this.render();
    }

    getUserTypeFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('type'); // 'candidate' или 'employer'
    }

    render() {
        const headline = this.userType === 'candidate'
            ? this.profileData.candidate?.headline
            : this.profileData.employer?.headline;

        if (!headline || headline.trim() === '') {
            this.container.classList.add('is-empty');

            this.display.textContent = this.userType === 'candidate'
                ? 'В чём твоё мастерство и какая у тебя главная фишка?'
                : 'Кого ищешь в команду и почему работать с тобой — это круто?';
        } else {
            this.container.classList.remove('is-empty');
            this.display.textContent = headline;
        }
    }

    initEventListeners() {
        this.container.onclick = () => this.open();

        this.cancelBtn.onclick = () => this.close();
        this.overlay.onclick = () => this.close();


        this.saveBtn.onclick = (e) => {
            e.stopPropagation();
            this.saveHeadline();
        };
    }

    open() {
        const currentText = this.userType === 'candidate'
            ? this.profileData.candidate?.headline
            : this.profileData.employer?.headline;

        this.input.value = currentText || '';
        this.charCount.textContent = this.input.value.length;

        this.overlay.style.display = 'block';
        setTimeout(() => {
            this.modal.classList.add('active');
        }, 10);

    }

    close() {
        this.modal.classList.remove('active');
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, 300);
    }

    async saveHeadline() {
        const newHeadline = this.input.value.trim();

        try {
            let response;
            const candidateId = this.profileData.candidate?.id;
            const employerId = this.profileData.employer?.id;

            if (this.userType === 'candidate') {
                response = await this.api.post(`/headline/candidate/${candidateId}`, {headline: newHeadline});
            } else if (this.userType === 'employer') {
                response = await this.api.post(`/headline/employer/${employerId}`, {headline: newHeadline});
            } else {
                throw new Error('Неизвестный тип пользователя');
            }

            if (response && response.status === 200) {
                // Обновляем данные в зависимости от типа
                if (this.userType === 'candidate') {
                    this.profileData.candidate.headline = newHeadline;
                } else if (this.userType === 'employer') {
                    this.profileData.employer.headline = newHeadline;
                }

                notification.success('Заголовок обновлен');
                this.render();
                this.close();

                UserProfileFiller.updateProgressBar(this.userType, this.profileData);
            } else {
                notification.error('Ошибка при сохранении');
            }

        } catch (error) {
            console.error('Ошибка при сохранении headline:', error);
            notification.error('Не удалось сохранить заголовок');
        }
    }
}