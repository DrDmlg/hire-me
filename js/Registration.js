class Registration {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.navigation = new NavigationService();
        this.api = apiService;
        this.userType = null;
        this.positions = [
            "Frontend Developer",
            "Backend Developer",
            "Fullstack Developer",
            "Mobile Developer",
            "DevOps Engineer",
            "Data Scientist",
            "UI/UX Designer",
            "Product Manager",
            "QA Engineer",
            "System Administrator"
        ];
        this.selectedIndex = -1;

        this.init();
    }

    init() {
        this.userType = this.getUserTypeFromURL();

        if (!this.userType) {
            console.error('Тип пользователя не указан в URL');
            this.navigation.goBack();
            return;
        }

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
        const candidateFields = document.getElementById('candidateFields');
        const employerFields = document.getElementById('employerFields');

        if (this.userType === 'candidate') {
            if (candidateFields) candidateFields.style.display = 'block';
            if (employerFields) employerFields.style.display = 'none';
        } else {
            if (candidateFields) candidateFields.style.display = 'none';
            if (employerFields) employerFields.style.display = 'block';
        }
    }

    setupEventListeners() {
        // Общие обработчики
        const form = document.getElementById('regForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Обработчики для кандидата
        if (this.userType === 'candidate') {
            this.setupCandidateEventListeners();
        }

        // Обработчики телефона (общие)
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneInput.addEventListener('blur', () => this.validatePhone());
        }
    }

    setupCandidateEventListeners() {
        // Зарплата
        const salaryInput = document.getElementById('desiredSalary');
        if (salaryInput) {
            salaryInput.addEventListener('input', (e) => this.handleSalaryInput(e));
            salaryInput.addEventListener('keydown', (e) => this.handleSalaryKeydown(e));
            salaryInput.addEventListener('paste', (e) => this.handleSalaryPaste(e));
        }

        // Автодополнение
        const positionInput = document.getElementById('desiredPosition');
        if (positionInput) {
            positionInput.addEventListener('input', () => this.handlePositionInput());
            positionInput.addEventListener('focus', () => this.handlePositionFocus());
            positionInput.addEventListener('keydown', (e) => this.handlePositionKeydown(e));
        }
    }

    // ===== МЕТОДЫ ДЛЯ ФОРМАТИРОВАНИЯ ЗАРПЛАТЫ =====
    formatSalary(number) {
        if (!number) return '';
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    unformatSalary(formattedNumber) {
        return formattedNumber.replace(/\D/g, '');
    }

    handleSalaryInput(e) {
        const cursorPosition = e.target.selectionStart;
        const unformattedValue = this.unformatSalary(e.target.value);
        const formattedValue = this.formatSalary(unformattedValue);

        e.target.value = formattedValue;

        const addedSpaces = formattedValue.length - unformattedValue.length;
        const newCursorPosition = cursorPosition + addedSpaces;
        e.target.setSelectionRange(newCursorPosition, newCursorPosition);
    }

    handleSalaryKeydown(e) {
        const allowedKeys = [
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft',
            'ArrowRight', 'ArrowUp', 'ArrowDown'
        ];

        if (!allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    }

    handleSalaryPaste(e) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        const numbers = this.unformatSalary(text);
        const formatted = this.formatSalary(numbers);
        document.execCommand('insertText', false, formatted);
    }

    // ===== МЕТОДЫ ДЛЯ АВТОДОПОЛНЕНИЯ =====
    filterPositions(query) {
        if (!query) return this.positions;
        return this.positions.filter(position =>
            position.toLowerCase().includes(query.toLowerCase())
        );
    }

    showSuggestions(suggestions) {
        const dropdown = document.getElementById('positionDropdown');
        if (!dropdown) return;

        dropdown.innerHTML = '';

        if (suggestions.length === 0) {
            dropdown.style.display = 'none';
            return;
        }

        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = suggestion;
            item.addEventListener('click', () => {
                document.getElementById('desiredPosition').value = suggestion;
                dropdown.style.display = 'none';
            });
            dropdown.appendChild(item);
        });

        dropdown.style.display = 'block';
        this.selectedIndex = -1;
    }

    handlePositionInput() {
        const input = document.getElementById('desiredPosition');
        const query = input.value;
        const filtered = this.filterPositions(query);
        this.showSuggestions(filtered);
    }

    handlePositionFocus() {
        const input = document.getElementById('desiredPosition');
        const query = input.value;
        const filtered = this.filterPositions(query);
        this.showSuggestions(filtered);
    }

    handlePositionKeydown(e) {
        const dropdown = document.getElementById('positionDropdown');
        const items = dropdown ? dropdown.querySelectorAll('.autocomplete-item') : [];

        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedIndex = (this.selectedIndex + 1) % items.length;
            this.updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
            this.updateSelection(items);
        } else if (e.key === 'Enter' && this.selectedIndex >= 0) {
            e.preventDefault();
            document.getElementById('desiredPosition').value = items[this.selectedIndex].textContent;
            dropdown.style.display = 'none';
        }
    }

    updateSelection(items) {
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({block: 'nearest'});
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // ===== ВАЛИДАЦИЯ =====
    validatePhone() {
        const phoneInput = document.getElementById('phoneNumber');
        const phoneError = document.getElementById('phoneNumberError');

        if (!phoneInput || !phoneError) return true;

        const phoneNumber = phoneInput.value.trim();
        const phoneNumberPattern = /^\+?[\d\s\-\(\)]+$/;
        const isValid = phoneNumber && phoneNumberPattern.test(phoneNumber) &&
            phoneNumber.replace(/\D/g, '').length >= 10;

        if (!isValid) {
            phoneInput.classList.add('error');
            phoneError.style.display = 'block';
            return false;
        }

        phoneInput.classList.remove('error');
        phoneError.style.display = 'none';
        return true;
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
            if (!data.position) {
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
        if (!this.validatePhone() || !this.validateForm(formData)) {
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
            notification.error(error.message || 'Ошибка соединения');
        } finally {
            submitBtn.classList.remove('loading');

            // Возвращаем форматирование зарплаты если нужно
            if (this.userType === 'candidate') {
                const salaryField = document.getElementById('desiredSalary');
                if (salaryField) {
                    salaryField.value = this.formatSalary(salaryField.value);
                }
            }
        }
    }

    collectFormData() {
        const commonData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phoneNumber: document.getElementById('phoneNumber').value.trim()
        };

        if (this.userType === 'candidate') {
            return {
                ...commonData,
                desiredPosition: document.getElementById('desiredPosition').value.trim(),
                desiredSalary: parseFloat(this.unformatSalary(document.getElementById('desiredSalary').value)),
                currency: document.getElementById('currency').value,
                candidateJobStatus: document.getElementById('candidateJobStatus').checked ? 'active' : 'inactive'
            };
        } else {
            return {
                ...commonData,
                position: document.getElementById('position').value.trim()
            };
        }
    }

    async sendCandidateData(formData) {
        const data = {
            formType: 'registration_candidate',
            generalProfileRegistrationData: {
                ...formData,
                candidateRegistrationData: {
                    desiredPosition: formData.desiredPosition,
                    desiredSalary: formData.desiredSalary,
                    currency: formData.currency,
                    candidateJobStatus: formData.candidateJobStatus
                }
            },
            initData: this.tg.initData,
            initDataUnsafe: this.tg.initDataUnsafe
        };

        const response = await this.api.post('/registration/candidate', data);

        if (response.status === 200) {
            notification.success('Профиль успешно сохранен');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            throw new Error('Не удалось отправить данные');
        }
    }

    async sendEmployerData(formData) {
        const data = {
            formType: 'registration_employer',
            generalProfileRegistrationData: {
                ...formData,
                employerRegistrationData: {
                    position: formData.position
                }
            },
            initData: this.tg.initData,
            initDataUnsafe: this.tg.initDataUnsafe
        };

        const response = await this.api.post('/registration/employer', data);

        if (response.status === 200) {
            notification.success('Регистрация успешно завершена!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            throw new Error('Не удалось отправить данные');
        }
    }
}

// Запуск приложения
new Registration();