class CandidateRegistration {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.positions = [
            "Frontend Developer",
            "Backend Developer",
            "Fullstack Developer",
            // ... остальные должности
        ];
        this.selectedIndex = -1;

        this.init();
    }

    init() {
        // Настройка Telegram
        this.tg.expand();
        this.tg.setHeaderColor('#2563EB');
        this.tg.setBackgroundColor('#F8FAFC');

        // Инициализация после загрузки DOM
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.autoFillFromTelegram();
        });
    }

    setupEventListeners() {
        // Зарплата
        const salaryInput = document.getElementById('desiredSalary');
        if (salaryInput) {
            salaryInput.addEventListener('input', (e) => this.handleSalaryInput(e));
            salaryInput.addEventListener('keydown', (e) => this.handleSalaryKeydown(e));
            salaryInput.addEventListener('paste', (e) => this.handleSalaryPaste(e));
        }

        // Статус
        const statusToggle = document.getElementById('candidateJobStatus');
        if (statusToggle) {
            statusToggle.addEventListener('change', () => this.handleStatusChange());
        }

        // Автодополнение
        const positionInput = document.getElementById('desiredPosition');
        if (positionInput) {
            positionInput.addEventListener('input', () => this.handlePositionInput());
            positionInput.addEventListener('focus', () => this.handlePositionFocus());
            positionInput.addEventListener('keydown', (e) => this.handlePositionKeydown(e));
        }

        // Форма
        const form = document.getElementById('regForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Кнопка назад
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', (e) => this.handleBackClick(e));
        }

        // Клавиатура
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    // ===== МЕТОДЫ ДЛЯ ФОРМАТИРОВАНИЯ ЗАРПЛАТЫ =====
    formatSalary(number) {
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
    // ===== КОНЕЦ МЕТОДОВ ДЛЯ ЗАРПЛАТЫ =====

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
    // ===== КОНЕЦ МЕТОДОВ ДЛЯ АВТОДОПОЛНЕНИЯ =====

    // ===== ОБРАБОТЧИКИ СТАТУСА =====
    handleStatusChange() {
        const statusToggle = document.getElementById('candidateJobStatus');
        const statusText = document.getElementById('statusText');
        const statusHelp = document.getElementById('statusHelp');

        if (statusToggle.checked) {
            statusText.textContent = '✅ В активном поиске';
            statusText.classList.remove('status-inactive');
            statusText.classList.add('status-active');
            statusHelp.textContent = 'Работодатели увидят ваш профиль и смогут предлагать вам вакансии';
        } else {
            statusText.textContent = '❌ Не ищу работу';
            statusText.classList.remove('status-active');
            statusText.classList.add('status-inactive');
            statusHelp.textContent = 'Ваш профиль будет скрыт от работодателей';
        }
    }
    // ===== КОНЕЦ ОБРАБОТЧИКОВ СТАТУСА =====

    // ===== ОБРАБОТКА ФОРМЫ =====
    async handleFormSubmit(e) {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Сохранение...';

        // Убираем форматирование зарплаты перед отправкой
        const salaryField = document.getElementById('desiredSalary');
        salaryField.value = this.unformatSalary(salaryField.value);

        // Собираем данные формы
        const data = {
            formType: 'registration_candidate',
            generalProfileRegistrationData: {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phoneNumber: document.getElementById('phoneNumber').value.trim(),
                candidateRegistrationData: {
                    desiredPosition: document.getElementById('desiredPosition').value.trim(),
                    desiredSalary: parseFloat(document.getElementById('desiredSalary').value),
                    currency: document.getElementById('currency').value,
                    candidateJobStatus: document.getElementById('candidateJobStatus').checked ? 'active' : 'inactive',
                }
            },
            initData: this.tg.initData,
            initDataUnsafe: this.tg.initDataUnsafe
        };

        // Валидация телефона
        if (!this.validatePhone()) {
            submitBtn.classList.remove('loading');
            submitBtn.textContent = '✅ Сохранить профиль';
            salaryField.value = this.formatSalary(salaryField.value); // Возвращаем форматирование
            return;
        }

        // Общая валидация
        if (!this.validateForm(data)) {
            submitBtn.classList.remove('loading');
            submitBtn.textContent = '✅ Сохранить профиль';
            salaryField.value = this.formatSalary(salaryField.value); // Возвращаем форматирование
            return;
        }

        try {
            const response = await this.sendFormData(data);

            submitBtn.classList.remove('loading');
            submitBtn.textContent = '✅ Сохранить профиль';
            salaryField.value = this.formatSalary(salaryField.value); // Возвращаем форматирование

            if (response.ok) {
                this.showSuccess('✅ Профиль успешно сохранен!');
                setTimeout(() => {
                    if (this.tg.close) {
                        this.tg.close();
                    } else {
                        this.goBack();
                    }
                }, 2000);
            } else {
                const errorMessage = await response.json();
                this.showError('❌ ' + errorMessage.message);
            }

        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
            submitBtn.classList.remove('loading');
            submitBtn.textContent = '✅ Сохранить профиль';
            salaryField.value = this.formatSalary(salaryField.value); // Возвращаем форматирование
            this.showError('❌ Ошибка соединения. Попробуйте еще раз');
        }
    }

    validatePhone() {
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const phoneNumberPattern = /^\+?[\d\s\-\(\)]+$/;
        const isValid = phoneNumber && phoneNumberPattern.test(phoneNumber) && phoneNumber.replace(/\D/g, '').length >= 10;

        if (!isValid) {
            document.getElementById('phoneNumber').classList.add('error');
            document.getElementById('phoneNumberError').style.display = 'block';
            return false;
        }

        document.getElementById('phoneNumber').classList.remove('error');
        document.getElementById('phoneNumberError').style.display = 'none';
        return true;
    }

    validateForm(data) {
        const profileRegData = data.generalProfileRegistrationData;
        const candidateRegData = data.generalProfileRegistrationData.candidateRegistrationData;

        const isValid = profileRegData.firstName &&
            profileRegData.lastName &&
            candidateRegData.desiredPosition &&
            profileRegData.email &&
            candidateRegData.desiredSalary > 0;

        if (!isValid) {
            this.showError('Пожалуйста, заполните все поля');
            return false;
        }

        return true;
    }

    async sendFormData(data) {
        return await fetch('https://hireme.serveo.net/registration/candidate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Telegram-Init-Data': this.tg.initData || ''
            },
            body: JSON.stringify({
                ...data,
                telegramUser: this.tg.initDataUnsafe?.user,
                chatId: this.tg.initDataUnsafe?.user?.id
            })
        });
    }
    // ===== КОНЕЦ ОБРАБОТКИ ФОРМЫ =====

    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    }

    showError(message) {
        if (this.tg.showAlert) {
            this.tg.showAlert(message);
        } else {
            alert(message);
        }
    }

    showSuccess(message) {
        if (this.tg.showPopup) {
            this.tg.showPopup({
                message: message,
                buttons: [{type: 'default', text: 'Отлично', id: 'ok'}]
            });
        } else {
            alert(message);
        }
    }

    autoFillFromTelegram() {
        if (this.tg.initDataUnsafe && this.tg.initDataUnsafe.user) {
            const user = this.tg.initDataUnsafe.user;

            if (user.first_name && !document.getElementById('firstName').value) {
                document.getElementById('firstName').value = user.first_name;
            }

            if (user.last_name && !document.getElementById('lastName').value) {
                document.getElementById('lastName').value = user.last_name;
            }
        }
    }

    handleBackClick(e) {
        e.preventDefault();
        e.target.style.animation = 'rotateIn 0.6s ease-out';
        setTimeout(() => {
            this.goBack();
        }, 300);
    }

    handleKeydown(e) {
        if (e.key === 'Escape') {
            this.goBack();
        }
    }
    // ===== КОНЕЦ ВСПОМОГАТЕЛЬНЫХ МЕТОДОВ =====
}

// Запуск приложения
new CandidateRegistration();