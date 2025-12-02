class ContactsComponent {
    constructor() {
        this.contacts = {};
        this.api = apiService;
    }

    // ============ ИНИЦИАЛИЗАЦИЯ ============
    async init(contacts = {}, profileData = null) {
        try {
            this.profileData = profileData;
            this.contacts = contacts || {};

            this.render();
            this.bindEvents();
        } catch (error) {
            console.error('ContactsComponent init error:', error);
            notification.error('Не удалось инициализировать контакты');
        }
    }

    bindEvents() {
        const addContactBtn = document.getElementById('addContactBtn');
        const cancelBtn = document.getElementById('cancelContactBtn');
        const form = document.getElementById('contactsFormElement');

        if (addContactBtn) {
            addContactBtn.addEventListener('click', () => this.showForm());
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideForm());
        }
        if (form) {
            form.addEventListener('submit', (e) => this.onContactsAction(e));
        }
    }

    // ============ ФОРМА ============
    showForm() {
        const form = document.getElementById('contactsForm');
        if (!form) return;

        this.fillForm();
        form.style.display = 'block';
        form.scrollIntoView({behavior: 'smooth'});
    }

    hideForm() {
        const form = document.getElementById('contactsForm');
        if (form) form.style.display = 'none';
    }

    fillForm() {
        document.getElementById('contactEmail').value = this.contacts.email || '';
        document.getElementById('contactPhone').value = this.contacts.phoneNumber || '';
        document.getElementById('contactTelegram').value = this.contacts.telegram || '';
        document.getElementById('contactWhatsApp').value = this.contacts.whatsapp || '';
    }

    // ============ ОБРАБОТЧИКИ ФОРМЫ ============
    async onContactsAction(event) {
        event.preventDefault();
        const formData = this.collectFormData();

        if (!this.validateFormData(formData)) return;

        const requestData = {
            email: formData.email || null,
            phoneNumber: formData.phone || null,
            telegram: formData.telegram || null,
            whatsapp: formData.whatsapp || null
        };

        if (this.contacts.id) {
            await this.updateContacts(requestData);
        } else {
            await this.createContacts(requestData);
        }
    }

    validateFormData(formData) {
        // Email валидация
        if (formData.email && !this.isValidEmail(formData.email)) {
            notification.error('Введите корректный email');
            return false;
        }

        // Телефон валидация
        const validatePhone = (phone, field) => {
            if (phone && !this.isValidPhone(phone)) {
                notification.error(`Введите корректный номер ${field}`);
                return false;
            }
            return true;
        };

        if (!validatePhone(formData.phone, 'телефона')) return false;
        if (!validatePhone(formData.whatsapp, 'WhatsApp')) return false;

        // Автодобавление @ для Telegram
        if (formData.telegram && !formData.telegram.startsWith('@')) {
            formData.telegram = '@' + formData.telegram;
        }

        // Проверка наличия хотя бы одного контакта
        if (!formData.email && !formData.phone && !formData.telegram && !formData.whatsapp) {
            notification.error('Заполните хотя бы одно поле контактов');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return phone.replace(/\D/g, '').length >= 10;
    }

    collectFormData() {
        return {
            email: document.getElementById('contactEmail').value.trim(),
            phone: document.getElementById('contactPhone').value.trim(),
            telegram: document.getElementById('contactTelegram').value.trim(),
            whatsapp: document.getElementById('contactWhatsApp').value.trim()
        };
    }

    // ============ ОТОБРАЖЕНИЕ ============
    render() {
        const container = document.getElementById('contactsList');
        if (!container) return;

        if (this.isEmpty()) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        const contactsConfig = [
            { key: 'email', label: 'Email', icon: '✉️' },
            { key: 'phoneNumber', label: 'Телефон', icon: '📱' },
            { key: 'telegram', label: 'Telegram', icon: '✈️' },
            { key: 'whatsapp', label: 'WhatsApp', icon: '💬' }
        ];

        const html = contactsConfig
            .filter(({ key }) => this.contacts[key])
            .map(({ key, label, icon }) => `
                <div class="contact-item fade-in">
                    <div class="contact-icon">${icon}</div>
                    <div class="contact-info">
                        <div class="contact-label">${label}</div>
                        <div class="contact-value">${Helpers.escapeHtml(this.contacts[key])}</div>
                    </div>
                </div>
            `).join('');

        container.innerHTML = html || this.getEmptyState();
    }

    isEmpty() {
        return !this.contacts.email && !this.contacts.phoneNumber &&
            !this.contacts.telegram && !this.contacts.whatsapp;
    }

    getEmptyState() {
        return `            
            <div class="empty-state">
                <div class="empty-text">Здесь пока ничего нет</div>
            </div>
        `;
    }

    // ============ API ОПЕРАЦИИ ============
    async createContacts(contactData) {
        notification.process('Сохранение контактов...');

        try {
            const telegramUserId = this.profileData?.telegramUserId;
            if (!telegramUserId) {
                notification.error('Не удалось определить пользователя');
                return;
            }

            const response = await this.api.post(`/contact/${telegramUserId}`, contactData);

            if (response.status < 300) {
                this.contacts = response.data;
                this.render();
                this.hideForm();
                notification.success('Контакты успешно сохранены');
            }
        } catch (error) {
            notification.error('Ошибка сохранения контактов');
            console.error('Create contacts error:', error);
        } finally {
            notification.hideAll();
        }
    }

    async updateContacts(contactData) {
        notification.process('Обновление контактов...');

        try {
            if (!this.contacts.id) {
                notification.error('Не найден ID контактов');
                return;
            }

            const response = await this.api.put(`/contact/${this.contacts.id}`, contactData);

            if (response.status === 200) {
                this.contacts = response.data;
                this.render();
                this.hideForm();
                notification.success('Контакты обновлены');
            }
        } catch (error) {
            notification.error('Ошибка обновления контактов');
            console.error('Update contacts error:', error);
        } finally {
            notification.hideAll();
        }
    }
}