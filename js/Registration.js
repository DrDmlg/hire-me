class Registration {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.navigation = new NavigationService();
        this.api = apiService;
        this.userType = null;
        this.init();
    }

    init() {
        this.userType = this.getUserTypeFromURL();
        if (this.tg) {
            this.initTelegram();
        }

        document.addEventListener('DOMContentLoaded', () => {
            this.setupUI();
            this.setupEventListeners();
            this.navigation.init();
        });
    }

    getUserTypeFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('type'); // 'candidate' или 'employer'
    }

    initTelegram() {
        if (this.tg) {
            this.tg.expand();
            this.tg.setHeaderColor('#2563EB')
            this.tg.setBackgroundColor('#F8FAFC');
        }
    }

    setupUI() {
        this.showRelevantFields();
    }

    showRelevantFields() {
        const isCandidate = this.userType === 'candidate';

        const candidateFields = document.getElementById('candidateFields');
        const employerFields = document.getElementById('employerFields');

        // Специфичные поля
        const desiredSalary = document.getElementById('desiredSalary');
        const desiredPosition = document.getElementById('desiredPosition');
        const currentPosition = document.getElementById('currentPosition');

        if (isCandidate) {
            if (candidateFields) candidateFields.style.display = 'block';
            if (employerFields) employerFields.style.display = 'none';

            if (desiredSalary) desiredSalary.required = true;
            if (desiredPosition) desiredPosition.required = true;

            if (currentPosition) currentPosition.required = false;
        } else {
            if (candidateFields) candidateFields.style.display = 'none';
            if (employerFields) employerFields.style.display = 'block';

            if (desiredSalary) desiredSalary.required = false;
            if (desiredPosition) desiredPosition.required = false;

            if (currentPosition) currentPosition.required = true;
        }
    }

    setupEventListeners() {
        // Общие обработчики
        const form = document.getElementById('regForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            this.phoneMask = IMask(phoneInput, {
                mask: '+{7} (000) 000-00-00',
            });
        }

        // Обработчики специфичные для кандидата
        if (this.userType === 'candidate') {
            this.setupCandidateEventListeners();
        }
    }

    setupCandidateEventListeners() {
        const salaryInput = document.getElementById('desiredSalary');
        if (salaryInput) {
            // Создаем маску для числа
            this.salaryMask = IMask(salaryInput, {
                mask: Number,
                thousandsSeparator: ' ',
                min: 0,
                max: 100000000,
            });

            salaryInput.addEventListener('input', () => {
                this.tg?.HapticFeedback.impactOccurred('light');
            });
        }
    }

    validateForm(data) {
        // Общая валидация
        if (!data.firstName || !data.lastName || !data.email) {
            notification.error('Пожалуйста, заполните все обязательные поля');
            return false;
        }

        // Валидация email
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(data.email)) {
            notification.error('Пожалуйста, введите корректный email');
            return false;
        }

        // Валидация специфичных полей
        if (this.userType === 'candidate') {
            if (!data.desiredPosition || !data.desiredSalary || data.desiredSalary <= 0) {
                notification.error('Пожалуйста, заполните все поля для кандидата');
                return false;
            }
        } else {
            if (!data.currentPosition) {
                notification.error('Пожалуйста, укажите вашу должность в компании');
                return false;
            }
        }

        return true;
    }

    // ===== ОБРАБОТКА ФОРМЫ =====
    async handleFormSubmit(e) {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.classList.add('loading');

        // Собираем данные формы
        const formData = this.collectFormData();

        // Валидация
        if (!this.validateForm(formData)) {
            submitBtn.classList.remove('loading');
            return;
        }

        try {
            if (this.userType === 'candidate') {
                await this.sendCandidateData(formData);
            } else {
                await this.sendEmployerData(formData);
            }
        } catch (error) {
            console.error('Ошибка сохранения профиля:', error);
        } finally {
            submitBtn.classList.remove('loading');
        }
    }

    collectFormData() {
        const commonData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phoneNumber: this.phoneMask ? this.phoneMask.unmaskedValue : ''
        };

        if (this.userType === 'candidate') {
            return {
                ...commonData,
                desiredPosition: document.getElementById('desiredPosition').value.trim(),
                desiredSalary: this.salaryMask ? Number(this.salaryMask.unmaskedValue) : 0,
                currency: document.getElementById('currency').value,
                candidateJobStatus: document.getElementById('candidateJobStatus').checked ? 'Активный поиск' : 'Не ищу работу'
            };
        } else {
            return {
                ...commonData,
                currentPosition: document.getElementById('currentPosition').value.trim()
            };
        }
    }

    // Вспомогательный метод для сборки общих данных (InitData)
    preparePayload(formData) {
        return {
            ...formData,
            webAppTelegram: {
                initData: this.tg?.initData || '',
                initDataUnsafe: this.tg?.initDataUnsafe || {}
            }
        };
    }

    async sendCandidateData(formData) {
        const payload = this.preparePayload({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            candidateRegistration: {
                desiredPosition: formData.desiredPosition,
                desiredSalary: formData.desiredSalary,
                currency: formData.currency,
                candidateJobStatus: formData.candidateJobStatus
            }
        });

        const response = await this.api.post('/registration/candidate', payload);
        if (response.status === 200) {
            await this.handleSuccess();
        } else {
            throw new Error('Не удалось отправить данные кандидата');
        }
    }

    async sendEmployerData(formData) {
        const payload = this.preparePayload({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            employerRegistration: {
                currentPosition: formData.currentPosition
            }
        });

        const response = await this.api.post('/registration/employer', payload);
        if (response.status === 200) {
            await this.handleSuccess();
        } else {
            throw new Error('Не удалось отправить данные работодателя');
        }
    }

    async handleSuccess() {
        // Удаляем старый кэш, чтобы при возврате на главную сделать новый запрос и обновить роли
        sessionStorage.removeItem('user_roles');
        this.tg?.HapticFeedback.notificationOccurred('heavy');
        notification.success('Профиль успешно создан');

        // Уходим на главную через паузу
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    }
}

// Запуск приложения
new Registration();