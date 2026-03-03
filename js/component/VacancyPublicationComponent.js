class VacancyPublicationComponent {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.api = apiService;
        this.validator = validator;
        this.currentStep = 1;
        this.totalSteps = 7;
        this.formData = {};
    }

    async init(profileData = null, existingVacancy = null) {
        this.profileData = profileData;
        this.container = document.querySelector('.container');

        this.bindEvents();

        const salaryInputMin = document.getElementById('salaryMin');
        const salaryInputMax = document.getElementById('salaryMax');

        this.salaryMaskFrom = this.validator.validateSalary(salaryInputMin);
        this.salaryMaskTo = this.validator.validateSalary(salaryInputMax);

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
            if (btn.classList.contains('back-button')) window.history.back();
        });

        // 2. Обработка публикации через событие submit
        this.container.addEventListener('submit', (e) => this.publishVacancy(e));

        // 3. НОВЫЙ БЛОК: Авто-высота и счетчик символов
        this.container.addEventListener('input', (e) => {
            if (e.target.tagName === 'TEXTAREA') {
                const textarea = e.target;

                const counter = textarea.parentElement.querySelector('.char-counter span');
                if (counter) counter.textContent = textarea.value.length;

                // Логика авто-высоты
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';

                textarea.style.overflowY = textarea.scrollHeight > 400 ? 'auto' : 'hidden';
            }
        });
    }

    // Универсальный метод навигации
    moveStep(direction) {
        if (direction > 0) {
            const isValid = this.validateCurrentStep();

            // Вызываем haptic feedback при ошибке валидации
            if (!isValid) {
                this.tg?.HapticFeedback.notificationOccurred('error');
                return;
            }

        }

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

        if (this.currentStep === 1) {
            if (!this.formData.title) {
                notification.error('Укажите должность');
                return false;
            }

            if (!this.formData.companyName) {
                notification.error('Укажите компанию');
                return false;
            }

            if (!this.formData.address) {
                notification.error('Заполните адрес');
                return false;
            }
        }

        if (this.currentStep === 2) {
            if (!this.formData.salaryMin || !this.formData.salaryMax) {
                notification.error('Укажите зарплатный диапазон');
                return false;
            }
        }

        if (this.currentStep === 3) {
            if (!this.formData.responsibilities) {
                notification.error('Необходимо указать обязанности');
                return false;
            }
        }
        return true;
    }

    async publishVacancy(event) {
        event.preventDefault();
        this.syncStepData();

        if (!this.validateCurrentStep()) return;

        const modal = document.getElementById('confirmModal');
        modal.style.display = 'flex';

        document.getElementById('confirmCancel').onclick = () => modal.style.display = 'none';

        document.getElementById('confirmOk').onclick = async () => {
            modal.style.display = 'none';
            try {
                this.syncStepData();
                const employerId = this.profileData?.employer?.id;
                await this.api.post(`/vacancy/create/${employerId}`, this.preparePayload());

                this.tg?.HapticFeedback.notificationOccurred('success');
                notification.success('Опубликовано');

                setTimeout(() => window.history.back(), 1500);
            } catch (error) {
                notification.error('Ошибка');
            }
        };
    }

    loadExistingData(data) {
        this.formData = {
            ...data,
            salaryMin: data.salary?.min,
            salaryMax: data.salary?.max,
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

    preparePayload() {
        return {
            ...this.formData,
            salary: {
                min: this.salaryMaskFrom ? Number(this.salaryMaskFrom.unmaskedValue) : 0,
                max: this.salaryMaskTo ? Number(this.salaryMaskTo.unmaskedValue) : 0,
                currency: this.formData.currency,
            },
            experience: this.formData.experience,
            address: this.formData.address
        };
    }
}