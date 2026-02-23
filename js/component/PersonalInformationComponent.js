class PersonalInformationComponent {
    constructor() {
        this.api = apiService;
        this.profileData = null;

        // Элементы модалки
        this.modal = document.getElementById('nameModal');
        this.overlay = document.getElementById('modalOverlay');
        this.firstNameInput = document.getElementById('modalFirstName');
        this.lastNameInput = document.getElementById('modalLastName');

        // Кнопки
        this.editBtn = document.getElementById('editUserNameBtn');
        this.closeBtn = document.getElementById('closeNameModal');
        this.saveBtn = document.getElementById('saveNameModal');
    }

    async init(profileData) {
        this.profileData = profileData;
        this.bindEvents();
    }

    bindEvents() {
        this.editBtn?.addEventListener('click', () => this.open());
        this.closeBtn?.addEventListener('click', () => this.close());
        this.overlay?.addEventListener('click', () => this.close());
        this.saveBtn?.addEventListener('click', () => this.handleSave());
    }

    open() {
        this.firstNameInput.value = this.profileData.firstName || '';
        this.lastNameInput.value = this.profileData.lastName || '';

        this.overlay.style.display = 'block';
        // Небольшая задержка для запуска CSS анимации
        setTimeout(() => this.modal.classList.add('active'), 10);
    }

    close() {
        this.modal.classList.remove('active');
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, 300); // Время должно совпадать с transition в CSS
    }

    async handleSave() {
        const firstName = this.firstNameInput.value.trim();
        const lastName = this.lastNameInput.value.trim();

        if (!firstName || !lastName) {
            notification.error('Имя и фамилия обязательны');
            return;
        }

        notification.process('Сохранение...');
        try {
            const response = await this.api.patch(`/profile/${this.profileData.telegramUserId}`, {
                firstName,
                lastName
            });

            if (response.status >= 200 && response.status < 300) {
                // Обновляем данные в объекте профиля
                this.profileData.firstName = firstName;
                this.profileData.lastName = lastName;

                // Вызываем обновление UI в шапке
                UserProfileFiller.setUserName(this.profileData);

                this.close();
                notification.success('Данные обновлены');
            }
        } catch (error) {
            console.error('Save name error:', error);
            notification.error('Ошибка при сохранении');
        } finally {
            notification.hideAll();
        }
    }
}