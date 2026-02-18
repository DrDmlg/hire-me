class VacancyPublicationComponent {
    constructor() {
        this.api = apiService;
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {};
    }

    async init(profileData = null, existingVacancy = null) {
        this.profileData = profileData;
        this.container = document.querySelector('.vacancy-create-container');

        this.bindEvents();

        if (existingVacancy) {
            this.loadExistingData(existingVacancy);
        }
        this.updateUI();
    }

    bindEvents() {
        // 1. Делегирование кликов (один обработчик на все кнопки навигации)
        this.container.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            if (btn.id.includes('next')) this.moveStep(1);
            if (btn.id.includes('prev')) this.moveStep(-1);
            if (btn.id === 'cancelBtn') this.handleCancel();
            if (btn.classList.contains('back-button')) window.history.back();
        });

        // 2. Обработка публикации через событие submit
        this.container.addEventListener('submit', (e) => this.publishVacancy(e));
    }

    // Универсальный метод навигации
    moveStep(direction) {
        if (direction > 0 && !this.validateCurrentStep()) return;

        this.syncStepData(); // Сохраняем данные текущего шага
        this.currentStep += direction;
        this.updateUI();
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

    // Автоматический сбор данных с текущего шага
    syncStepData() {
        const currentStepEl = this.container.querySelector(`.step[data-step="${this.currentStep}"]`);
        const inputs = currentStepEl.querySelectorAll('[name]');
        inputs.forEach(input => {
            this.formData[input.name] = input.value.trim();
        });
    }

    updateUI() {
        // Показываем активный шаг
        document.querySelectorAll('.step').forEach(step => {
            step.classList.toggle('active', parseInt(step.dataset.step) === this.currentStep);
        });

        // Обновляем прогресс-бар
        document.querySelectorAll('.step-indicator').forEach((ind, i) => {
            ind.classList.toggle('active', i < this.currentStep);
        });
    }

    validateCurrentStep() {
        this.syncStepData();

        // if (this.currentStep === 1) {
        //     if (!this.formData.title || !this.formData.companyName) {
        //         notification.error('Заполните должность и компанию');
        //         return false;
        //     }
        // }
        // Добавь другие проверки по номеру шага здесь
        return true;
    }

    async publishVacancy(event) {
        event.preventDefault();
        this.syncStepData();

        if (!this.validateCurrentStep()) return;

        const btn = document.getElementById('publishBtn');
        this.toggleLoading(btn, true);

        try {
            const payload = this.preparePayload();
            const employerId = this.profileData?.employer?.id;

            await this.api.post(`/vacancy/create/${employerId}`, payload);
            notification.success('Вакансия опубликована!');
            setTimeout(() => window.history.back(), 2000);
        } catch (error) {
            notification.error('Ошибка публикации');
            this.toggleLoading(btn, false);
        }
    }

    preparePayload() {
        // Превращаем плоские данные в структуру бэкенда
        return {
            ...this.formData,
            salary: {
                from: parseInt(this.formData.salaryFrom) || null,
                to: parseInt(this.formData.salaryTo) || null
            },
            experience: this.formData.experience,
            address: this.formData.address
        };
    }

    loadExistingData(data) {
        // Мапим данные бэкенда на плоскую структуру формы
        this.formData = {
            ...data,
            salaryFrom: data.salary?.from,
            salaryTo: data.salary?.to,
            experience: data.experience?.name,
            address: data.address?.name
        };

        // Автоматически заполняем все поля по атрибуту [name]
        document.querySelectorAll('[name]').forEach(input => {
            if (this.formData[input.name] !== undefined) {
                input.value = this.formData[input.name];
            }
        });
    }

    toggleLoading(btn, isLoading) {
        const text = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.btn-spinner');
        btn.disabled = isLoading;
        if (text) text.style.display = isLoading ? 'none' : 'block';
        if (spinner) spinner.style.display = isLoading ? 'block' : 'none';
    }

    handleCancel() {
        if (confirm('Все несохраненные данные будут потеряны. Выйти?')) {
            window.history.back();
        }
    }
}