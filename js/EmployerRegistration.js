class EmployerRegistration {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.navigation = new NavigationService(); // ← Добавляем сервис
        this.init();
    }

    init() {
        if (this.tg) {
            this.initTelegram();
        }
        // Инициализация после загрузки DOM
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.autoFillFromTelegram();
            this.navigation.init(); // ← Инициализируем навигацию
        });
    }

    initTelegram() {
        if (this.tg) {
            this.tg.expand();
            this.tg.setHeaderColor('#8B5CF6');
            this.tg.setBackgroundColor('#F8FAFC');
        }
    }

    setupEventListeners() {
        // Форма
        const form = document.getElementById('regForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // УДАЛЕНО: обработчики backButton и keyboard events
        // Их теперь обрабатывает NavigationService
    }

    // ===== ВАЛИДАЦИЯ ФОРМЫ =====
    validateForm() {
        let isValid = true;

        // Очистка предыдущих ошибок
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });

        // Проверка имени
        const firstName = document.getElementById('firstName').value.trim();
        if (!firstName) {
            document.getElementById('firstName').classList.add('error');
            document.getElementById('firstNameError').style.display = 'block';
            isValid = false;
        }

        // Проверка фамилии
        const lastName = document.getElementById('lastName').value.trim();
        if (!lastName) {
            document.getElementById('lastName').classList.add('error');
            document.getElementById('lastNameError').style.display = 'block';
            isValid = false;
        }

        // Проверка email
        const email = document.getElementById('email').value.trim();
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailPattern.test(email)) {
            document.getElementById('email').classList.add('error');
            document.getElementById('emailError').style.display = 'block';
            isValid = false;
        }

        // Проверка телефона
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const phoneNumberPattern = /^\+?[\d\s\-\(\)]+$/;
        if (!phoneNumber || !phoneNumberPattern.test(phoneNumber) || phoneNumber.replace(/\D/g, '').length < 10) {
            document.getElementById('phoneNumber').classList.add('error');
            document.getElementById('phoneNumberError').style.display = 'block';
            isValid = false;
        }

        // Проверка должности
        const position = document.getElementById('position').value.trim();
        if (!position) {
            document.getElementById('position').classList.add('error');
            document.getElementById('positionError').style.display = 'block';
            isValid = false;
        }

        return isValid;
    }

    // ===== ОБРАБОТКА ФОРМЫ =====
    async handleFormSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        // Показываем состояние загрузки
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Регистрация...';

        // Собираем данные формы
        const data = {
            formType: 'registration_employer',
            generalProfileRegistrationData: {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phoneNumber: document.getElementById('phoneNumber').value.trim(),
                employerRegistrationData: {
                    position: document.getElementById('position').value.trim()
                }
            },
            initData: this.tg.initData,
            initDataUnsafe: this.tg.initDataUnsafe
        };

        try {
            const response = await this.sendFormData(data);

            submitBtn.classList.remove('loading');
            submitBtn.textContent = '✅ Зарегистрироваться';

            if (response.ok) {
                this.showSuccess('✅ Регистрация успешно завершена!');
                setTimeout(() => {
                    if (this.tg.close) {
                        this.tg.close();
                    } else {
                        this.navigation.goBack(); // ← Используем навигационный сервис
                    }
                }, 2000);
            } else {
                const errorMessage = await response.json();
                this.showError('❌ ' + errorMessage.message);
            }

        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
            submitBtn.classList.remove('loading');
            submitBtn.textContent = '✅ Зарегистрироваться';
            this.showError('❌ Ошибка соединения. Попробуйте еще раз');
        }
    }

    async sendFormData(data) {
        return await fetch('https://hireme.serveo.net/registration/employer', {
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
    // УДАЛЕНО: goBack(), handleBackClick(), handleKeydown()

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

    // ===== КОНЕЦ ВСПОМОГАТЕЛЬНЫХ МЕТОДОВ =====
}

// Запуск приложения
new EmployerRegistration();