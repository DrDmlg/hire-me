class BaseInfoComponent {
    constructor() {
        this.profileData = null;
        this.api = apiService;
    }

    async init(profileData = null) {
        this.profileData = profileData;
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        const editBtn = document.getElementById(this.getIds().editBtn);
        const cancelBtn = document.getElementById(this.getIds().cancelBtn);
        const form = document.getElementById(this.getIds().formElement);

        editBtn?.addEventListener('click', () => this.showForm());
        cancelBtn?.addEventListener('click', () => this.hideForm());
        form?.addEventListener('submit', (e) => this.onFormSubmit(e));
    }

    showForm() {
        const formContainer = document.getElementById(this.getIds().formContainer);
        if (!formContainer) return;

        this.fillForm();
        formContainer.style.display = 'block';
        formContainer.scrollIntoView({behavior: 'smooth'});
    }

    hideForm() {
        const formContainer = document.getElementById(this.getIds().formContainer);
        if (formContainer) formContainer.style.display = 'none';
    }

    async sendRequest(url, data, profileType) {
        notification.process('Сохранение...');
        try {
            const response = await this.api.patch(url, data);
            if (response.status >= 200 && response.status < 300) {
                // Синхронизируем данные в памяти
                if (this.profileData[profileType]) {
                    Object.assign(this.profileData[profileType], response.data);
                }
                this.updateDisplay();
                this.hideForm();
                notification.success('Обновлено');
            }
        } catch (e) {
            notification.error('Ошибка сохранения');
        } finally {
            notification.hideAll();
        }
    }

    getIds() {
    }

    updateDisplay() {
    }

    fillForm() {
    }

    async onFormSubmit(e) {
    }
}