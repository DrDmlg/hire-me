class BasicInfoComponent {
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
        const editBtn = document.getElementById('editBasicInfoBtn');
        const cancelBtn = document.getElementById('cancelBasicInfoBtn');
        const form = document.getElementById('basicInfoFormElement');

        if (editBtn) {
            editBtn.addEventListener('click', () => this.showForm());
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideForm());
        }
        if (form) {
            form.addEventListener('submit', (e) => this.onFormSubmit(e));
        }
    }

    // ============ ФОРМА ============
    showForm() {
        const form = document.getElementById('basicInfoForm');
        if (!form) return;

        this.fillForm();
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    }

    hideForm() {
        const form = document.getElementById('basicInfoForm');
        if (form) form.style.display = 'none';
    }

    fillForm() {
        const candidate = this.profileData?.candidate || {};

        // Заполняем специализацию
        document.getElementById('editPositionInput').value = candidate.desiredPosition || '';

        // Заполняем зарплату
        if (candidate.desiredSalary) {
            document.getElementById('editSalaryInput').value = candidate.desiredSalary.toString();
        } else {
            document.getElementById('editSalaryInput').value = '';
        }

        // Заполняем валюту
        document.getElementById('editCurrencySelect').value = candidate.currency || 'RUB';
    }


    // ============ ОБРАБОТКА ФОРМЫ ============
    async onFormSubmit(event) {
        event.preventDefault();

        const formData = this.collectFormData();
        if (!this.validateFormData(formData)) return;

        const requestData = {
            desiredPosition: formData.position,
            desiredSalary: formData.salary ? parseFloat(formData.salary.replace(/\s/g, '')) : null,
            currency: formData.currency
        };

        await this.updateBasicInfo(requestData);
    }

    collectFormData() {
        return {
            position: document.getElementById('editPositionInput').value.trim(),
            salary: document.getElementById('editSalaryInput').value.trim(),
            currency: document.getElementById('editCurrencySelect').value
        };
    }

    validateFormData(formData) {
        // Проверка специализации
        if (!formData.position) {
            notification.error('Введите специализацию');
            return false;
        }

        // Проверка зарплаты (если введена)
        if (formData.salary) {
            const salary = parseFloat(formData.salary.replace(/\s/g, ''));
            if (isNaN(salary) || salary < 0) {
                notification.error('Введите корректную зарплату');
                return false;
            }
        }

        return true;
    }

    // ============ ОТОБРАЖЕНИЕ ============
    updateDisplay() {
        if (!this.profileData?.candidate) return;

        const candidate = this.profileData.candidate;

        // Обновляем специализацию
        const positionEl = document.getElementById('desiredPositionValue');
        if (positionEl) {
            positionEl.textContent = candidate.desiredPosition || 'Не указано';
        }

        // Обновляем зарплату
        const salaryEl = document.getElementById('desiredSalaryValue');
        if (salaryEl) {
            if (candidate.desiredSalary && candidate.currency) {
                const formatted = new Intl.NumberFormat('ru-RU').format(candidate.desiredSalary);
                const symbol = candidate.currency === 'USD' ? '$' : '₽';
                salaryEl.textContent = `${formatted} ${symbol}`;
            } else {
                salaryEl.textContent = 'Не указана';
            }
        }

        // Обновляем заголовок профиля
        const profileTitle = document.getElementById('userPosition');
        if (profileTitle && candidate.desiredPosition) {
            profileTitle.textContent = candidate.desiredPosition;
        }
    }

    // ============ API ОПЕРАЦИИ ============
    async updateBasicInfo(data) {
        const candidateId = this.profileData?.candidate?.id;

        if (!candidateId) {
            notification.error('Ошибка: ID кандидата не найден');
            return;
        }

        notification.process('Сохранение...');

        try {
            const response = await this.api.patch(`/candidate/preferences/${candidateId}`, data);

            if (response.status >= 200 && response.status < 300) {
                // Обновляем данные
                if (this.profileData.candidate) {
                    Object.assign(this.profileData.candidate, response.data);
                }

                this.updateDisplay();
                this.hideForm();
                notification.success('Сохранено');
            }

        } catch (error) {
            console.error('Ошибка сохранения:', error);
            notification.error('Ошибка сохранения');
        } finally {
            notification.hideAll();
        }
    }
}