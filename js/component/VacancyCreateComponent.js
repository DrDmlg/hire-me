class VacancyCreateComponent {
    constructor() {
        this.api = apiService;
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {
            // Шаг 1
            title: '',
            companyName: '',
            workFormat: '',
            workDays: '',
            workPlace: '',

            // Шаг 2
            salaryFrom: null,
            salaryTo: null,
            experience: '',
            address: '',

            // Шаг 3
            aboutCompany: '',
            responsibilities: '',
            skills: '',

            // Шаг 4
            suggestion: '',
            additionalInformation: ''
        };

        // DOM элементы
        this.elements = {
            steps: null,
            forms: null,
            progressIndicators: null,
            backButton: null,
            cancelButton: null,
            publishButton: null
        };

        // Кнопки навигации
        this.buttons = {
            nextStep1: null,
            nextStep2: null,
            nextStep3: null,
            prevStep2: null,
            prevStep3: null,
            prevStep4: null
        };
    }

    // ============ ИНИЦИАЛИЗАЦИЯ ============
    async init(profileData = null, existingVacancy = null) {
        try {
            this.profileData = profileData;

            console.log('=== VACANCY COMPONENT INIT START ===');

            this.cacheElements();
            console.log('Elements cached');

            this.bindEvents();
            console.log('Events bound');

            // Если редактируем существующую вакансию
            if (existingVacancy) {
                this.loadExistingData(existingVacancy);
            }

            this.updateProgress();

            console.log('VacancyCreateComponent initialized successfully');
            console.log('=== VACANCY COMPONENT INIT END ===');

        } catch (error) {
            console.error('VacancyCreateComponent init error:', error);
            notification.error('Не удалось инициализировать форму создания вакансии');
        }
    }

    cacheElements() {
        console.log('=== CACHE ELEMENTS ===');

        // Шаги и формы - ИСПРАВЛЕННЫЙ СЕЛЕКТОР
        this.elements.steps = document.querySelectorAll('.vacancy-form.step');
        this.elements.forms = document.querySelectorAll('.vacancy-form.step');
        this.elements.progressIndicators = document.querySelectorAll('.step-indicator');

        console.log('Steps found:', this.elements.steps.length);
        console.log('Forms found:', this.elements.forms.length);
        console.log('Progress indicators:', this.elements.progressIndicators.length);

        // Основные кнопки
        this.elements.backButton = document.getElementById('backButton');
        this.elements.cancelButton = document.getElementById('cancelBtn');
        this.elements.publishButton = document.getElementById('publishBtn');

        console.log('backButton:', !!this.elements.backButton);
        console.log('cancelButton:', !!this.elements.cancelButton);
        console.log('publishButton:', !!this.elements.publishButton);

        // Кнопки навигации по шагам
        this.buttons.nextStep1 = document.getElementById('nextStep1');
        this.buttons.nextStep2 = document.getElementById('nextStep2');
        this.buttons.nextStep3 = document.getElementById('nextStep3');
        this.buttons.prevStep2 = document.getElementById('prevStep2');
        this.buttons.prevStep3 = document.getElementById('prevStep3');
        this.buttons.prevStep4 = document.getElementById('prevStep4');

        console.log('nextStep1:', !!this.buttons.nextStep1);
        console.log('nextStep2:', !!this.buttons.nextStep2);
        console.log('nextStep3:', !!this.buttons.nextStep3);
        console.log('prevStep2:', !!this.buttons.prevStep2);
        console.log('prevStep3:', !!this.buttons.prevStep3);
        console.log('prevStep4:', !!this.buttons.prevStep4);
    }

    bindEvents() {
        console.log('=== BIND EVENTS ===');

        // Навигация по шагам
        if (this.buttons.nextStep1) {
            console.log('Binding nextStep1...');
            this.buttons.nextStep1.addEventListener('click', () => {
                console.log('nextStep1 clicked!');
                this.nextStep(1);
            });
        }

        if (this.buttons.nextStep2) {
            console.log('Binding nextStep2...');
            this.buttons.nextStep2.addEventListener('click', () => this.nextStep(2));
        }

        if (this.buttons.nextStep3) {
            console.log('Binding nextStep3...');
            this.buttons.nextStep3.addEventListener('click', () => this.nextStep(3));
        }

        if (this.buttons.prevStep2) {
            console.log('Binding prevStep2...');
            this.buttons.prevStep2.addEventListener('click', () => this.prevStep(2));
        }

        if (this.buttons.prevStep3) {
            console.log('Binding prevStep3...');
            this.buttons.prevStep3.addEventListener('click', () => this.prevStep(3));
        }

        if (this.buttons.prevStep4) {
            console.log('Binding prevStep4...');
            this.buttons.prevStep4.addEventListener('click', () => this.prevStep(4));
        }

        // Основные кнопки
        if (this.elements.backButton) {
            this.elements.backButton.addEventListener('click', () => this.goBack());
        }

        if (this.elements.cancelButton) {
            this.elements.cancelButton.addEventListener('click', () => this.cancel());
        }

        if (this.elements.publishButton) {
            this.elements.publishButton.addEventListener('click', (e) => this.publishVacancy(e));
        }

        // Автосохранение при вводе
        this.bindAutoSave();
    }

    bindAutoSave() {
        // Сохраняем данные при изменении полей
        document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
            input.addEventListener('input', (e) => {
                this.saveStepData(this.currentStep);
            });

            input.addEventListener('change', (e) => {
                this.saveStepData(this.currentStep);
            });
        });
    }

    // ============ НАВИГАЦИЯ ПО ШАГАМ ============
    nextStep(currentStep) {
        console.log(`nextStep called with step: ${currentStep}`);

        // Сохраняем данные текущего шага
        this.saveStepData(currentStep);

        // Проверяем минимальную валидацию
        if (!this.validateStep(currentStep)) {
            console.log(`Validation failed for step ${currentStep}`);
            return;
        }

        // Переходим к следующему шагу
        this.currentStep = currentStep + 1;
        console.log(`Moving to step ${this.currentStep}`);

        this.showStep(this.currentStep);
        this.updateProgress();

        // Прокручиваем к верху
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    prevStep(currentStep) {
        console.log(`prevStep called with step: ${currentStep}`);

        this.currentStep = currentStep - 1;
        this.showStep(this.currentStep);
        this.updateProgress();

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showStep(stepNumber) {
        console.log(`showStep called for step: ${stepNumber}`);

        // Скрываем все шаги
        this.elements.steps.forEach(step => {
            step.classList.remove('active');
        });

        // Показываем текущий шаг
        const currentStep = document.querySelector(`.vacancy-form.step[data-step="${stepNumber}"]`);
        if (currentStep) {
            console.log(`Found step ${stepNumber}, adding active class`);
            currentStep.classList.add('active');
        } else {
            console.error(`Step ${stepNumber} not found!`);
            // Покажем первый шаг как fallback
            const firstStep = document.querySelector('.vacancy-form.step[data-step="1"]');
            if (firstStep) {
                firstStep.classList.add('active');
            }
        }
    }

    updateProgress() {
        console.log(`updateProgress called, current step: ${this.currentStep}`);

        // Обновляем индикаторы прогресса
        this.elements.progressIndicators.forEach((indicator, index) => {
            if (index + 1 <= this.currentStep) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    // ============ СОХРАНЕНИЕ ДАННЫХ ============
    saveStepData(stepNumber) {
        console.log(`saveStepData called for step: ${stepNumber}`);

        // ИСПРАВЛЕННЫЙ СЕЛЕКТОР
        const form = document.querySelector(`.vacancy-form.step[data-step="${stepNumber}"]`);
        console.log(`Form for step ${stepNumber}:`, form);

        if (!form) {
            console.error(`Form for step ${stepNumber} not found!`);
            return;
        }

        const formData = new FormData(form);
        console.log(`FormData for step ${stepNumber} created`);

        switch(stepNumber) {
            case 1:
                this.formData.title = formData.get('title') || '';
                this.formData.companyName = formData.get('companyName') || '';
                this.formData.workFormat = formData.get('workFormat') || '';
                this.formData.workDays = formData.get('workDays') || '';
                this.formData.workPlace = formData.get('workPlace') || '';
                console.log('Step 1 data:', this.formData);
                break;

            case 2:
                const salaryFrom = formData.get('salaryFrom');
                const salaryTo = formData.get('salaryTo');

                this.formData.salaryFrom = salaryFrom ? parseInt(salaryFrom) || null : null;
                this.formData.salaryTo = salaryTo ? parseInt(salaryTo) || null : null;
                this.formData.experience = formData.get('experience') || '';
                this.formData.address = formData.get('address') || '';
                console.log('Step 2 data:', this.formData);
                break;

            case 3:
                this.formData.aboutCompany = formData.get('aboutCompany') || '';
                this.formData.responsibilities = formData.get('responsibilities') || '';
                this.formData.skills = formData.get('skills') || '';
                console.log('Step 3 data:', this.formData);
                break;

            case 4:
                this.formData.suggestion = formData.get('suggestion') || '';
                this.formData.additionalInformation = formData.get('additionalInformation') || '';
                console.log('Step 4 data:', this.formData);
                break;
        }
    }

    // ============ ВАЛИДАЦИЯ ============
    validateStep(stepNumber) {
        console.log(`validateStep called for step: ${stepNumber}`);

        switch(stepNumber) {
            case 1:
                return this.validateStep1();
            case 2:
                return this.validateStep2();
            case 3:
                return true; // Шаг 3 без обязательных полей
            case 4:
                return true; // Шаг 4 без обязательных полей
            default:
                return true;
        }
    }

    validateStep1() {
        console.log('Validating step 1...');

        if (!this.formData.title.trim()) {
            notification.error('Укажите должность');
            return false;
        }

        if (!this.formData.companyName.trim()) {
            notification.error('Укажите название компании');
            return false;
        }

        console.log('Step 1 validation passed');
        return true;
    }

    validateStep2() {
        console.log('Validating step 2...');

        // Если указана зарплата "от", проверяем что это число
        if (this.formData.salaryFrom && isNaN(this.formData.salaryFrom)) {
            notification.error('Укажите корректную зарплату "от"');
            return false;
        }

        // Если указана зарплата "до", проверяем что это число
        if (this.formData.salaryTo && isNaN(this.formData.salaryTo)) {
            notification.error('Укажите корректную зарплату "до"');
            return false;
        }

        // Проверяем логику: "до" не может быть меньше "от"
        if (this.formData.salaryFrom && this.formData.salaryTo) {
            if (this.formData.salaryTo < this.formData.salaryFrom) {
                notification.error('Зарплата "до" не может быть меньше зарплаты "от"');
                return false;
            }
        }

        console.log('Step 2 validation passed');
        return true;
    }

    // ============ ПУБЛИКАЦИЯ ============
    async publishVacancy(event) {
        console.log('publishVacancy called');
        event.preventDefault();

        // Сохраняем данные последнего шага
        this.saveStepData(4);

        // Проверяем все обязательные поля
        if (!this.validateStep(1) || !this.validateStep(2)) {
            notification.error('Проверьте обязательные поля');
            return;
        }

        // Показываем загрузку
        const publishBtn = event.target.closest('.btn-primary') || event.target;
        const originalText = publishBtn.querySelector('.btn-text');
        const spinner = publishBtn.querySelector('.btn-spinner');

        if (originalText && spinner) {
            originalText.style.display = 'none';
            spinner.style.display = 'inline-block';
        }

        publishBtn.disabled = true;

        try {
            // Формируем данные для API
            const vacancyData = this.prepareVacancyData();
            console.log('Prepared vacancy data:', vacancyData);

            // Получаем employerId из профиля
            const employerId = this.profileData?.employer?.id;
            if (!employerId) {
                throw new Error('Employer ID not found');
            }

            console.log(`Sending to /vacancy/create/${employerId}`);

            // Отправляем на сервер
            const response = await this.api.post(`/vacancy/create/${employerId}`, vacancyData);
            console.log('Server response:', response);

            if (response.status === 200) {
                notification.success('Вакансия успешно создана!');

                // Через 2 секунды возвращаемся назад
                setTimeout(() => {
                    window.history.back();
                }, 2000);
            } else {
                throw new Error('Server error: ' + response.status);
            }

        } catch (error) {
            console.error('Publish vacancy error:', error);
            notification.error('Ошибка при создании вакансии');

            // Возвращаем кнопку в исходное состояние
            if (originalText && spinner) {
                originalText.style.display = 'inline';
                spinner.style.display = 'none';
            }
            publishBtn.disabled = false;
        }
    }

    prepareVacancyData() {
        return {
            title: this.formData.title,
            companyName: this.formData.companyName,
            workFormat: this.formData.workFormat,
            workDays: this.formData.workDays,
            workPlace: this.formData.workPlace,
            salary: {
                from: this.formData.salaryFrom,
                to: this.formData.salaryTo
            },
            experience: {
                name: this.formData.experience
            },
            address: {
                name: this.formData.address
            },
            aboutCompany: this.formData.aboutCompany,
            responsibilities: this.formData.responsibilities,
            skills: this.formData.skills,
            suggestion: this.formData.suggestion,
            additionalInformation: this.formData.additionalInformation
        };
    }

    // ============ ЗАГРУЗКА СУЩЕСТВУЮЩИХ ДАННЫХ ============
    loadExistingData(vacancyData) {
        // Заполняем форму данными из существующей вакансии
        this.formData = {
            title: vacancyData.title || '',
            companyName: vacancyData.companyName || '',
            workFormat: vacancyData.workFormat || '',
            workDays: vacancyData.workDays || '',
            workPlace: vacancyData.workPlace || '',
            salaryFrom: vacancyData.salary?.from || null,
            salaryTo: vacancyData.salary?.to || null,
            experience: vacancyData.experience?.name || '',
            address: vacancyData.address?.name || '',
            aboutCompany: vacancyData.aboutCompany || '',
            responsibilities: vacancyData.responsibilities || '',
            skills: vacancyData.skills || '',
            suggestion: vacancyData.suggestion || '',
            additionalInformation: vacancyData.additionalInformation || ''
        };

        // Заполняем поля формы
        this.fillFormFields();

        // Меняем заголовок кнопки публикации
        const publishBtn = document.getElementById('publishBtn');
        if (publishBtn) {
            publishBtn.querySelector('.btn-text').textContent = 'Обновить вакансию';
        }
    }

    fillFormFields() {
        // Шаг 1
        if (document.getElementById('title')) {
            document.getElementById('title').value = this.formData.title;
        }
        if (document.getElementById('companyName')) {
            document.getElementById('companyName').value = this.formData.companyName;
        }
        if (document.getElementById('workFormat')) {
            document.getElementById('workFormat').value = this.formData.workFormat;
        }
        if (document.getElementById('workDays')) {
            document.getElementById('workDays').value = this.formData.workDays;
        }
        if (document.getElementById('workPlace')) {
            document.getElementById('workPlace').value = this.formData.workPlace;
        }

        // Шаг 2
        if (document.getElementById('salaryFrom')) {
            document.getElementById('salaryFrom').value = this.formData.salaryFrom || '';
        }
        if (document.getElementById('salaryTo')) {
            document.getElementById('salaryTo').value = this.formData.salaryTo || '';
        }
        if (document.getElementById('experience')) {
            document.getElementById('experience').value = this.formData.experience;
        }
        if (document.getElementById('address')) {
            document.getElementById('address').value = this.formData.address;
        }

        // Шаг 3
        if (document.getElementById('aboutCompany')) {
            document.getElementById('aboutCompany').value = this.formData.aboutCompany;
        }
        if (document.getElementById('responsibilities')) {
            document.getElementById('responsibilities').value = this.formData.responsibilities;
        }
        if (document.getElementById('skills')) {
            document.getElementById('skills').value = this.formData.skills;
        }

        // Шаг 4
        if (document.getElementById('suggestion')) {
            document.getElementById('suggestion').value = this.formData.suggestion;
        }
        if (document.getElementById('additionalInformation')) {
            document.getElementById('additionalInformation').value = this.formData.additionalInformation;
        }
    }

    // ============ НАВИГАЦИЯ ============
    goBack() {
        if (this.currentStep > 1) {
            this.prevStep(this.currentStep);
        } else {
            window.history.back();
        }
    }

    cancel() {
        if (confirm('Вы уверены? Все несохраненные данные будут потеряны.')) {
            window.history.back();
        }
    }

    // ============ СБРОС ============
    reset() {
        this.currentStep = 1;
        this.formData = {
            title: '',
            companyName: '',
            workFormat: '',
            workDays: '',
            workPlace: '',
            salaryFrom: null,
            salaryTo: null,
            experience: '',
            address: '',
            aboutCompany: '',
            responsibilities: '',
            skills: '',
            suggestion: '',
            additionalInformation: ''
        };

        this.showStep(1);
        this.updateProgress();

        // Очищаем форму
        document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
            if (input.type !== 'submit') {
                input.value = '';
            }
        });
    }
}