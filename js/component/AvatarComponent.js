class AvatarComponent {
    constructor() {
        this.api = apiService;
        this.container = document.getElementById('userAvatar');
        this.input = document.getElementById('avatarInput');
        this.profileData = null;
        this.modal = document.getElementById('cropperModal');
        this.imageToCrop = document.getElementById('imageToCrop');
        this.cropper = null;

    }

    async init(profileData) {
        this.profileData = profileData;
        this.render();
        this.bindEvents();
    }

    render() {
        // Очищаем контейнер, сохраняя инпут
        const currentImg = this.container.querySelector('.avatar-image');
        if (!currentImg) {
            const img = document.createElement('img');
            img.className = 'avatar-image';
            // Используем фото из профиля или заглушку
            img.src = this.profileData?.avatarUrl || '../../images/default-avatar.png';
            this.container.prepend(img);
        } else if (this.profileData?.avatarUrl) {
            currentImg.src = this.profileData.avatarUrl;
        }
    }

    bindEvents() {
        // Клик по кругу открывает выбор файла
        this.container.addEventListener('click', () => this.input.click());

        // Обработка выбора файла
        this.input.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            return notification.error('Пожалуйста, выберите изображение');
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            // 1. Показываем модалку
            this.modal.style.display = 'flex';
            this.imageToCrop.src = e.target.result;

            // 2. Инициализируем кроппер
            if (this.cropper) this.cropper.destroy(); // Сброс старого

            this.cropper = new Cropper(this.imageToCrop, {
                aspectRatio: 1, // Квадрат
                viewMode: 1,    // Ограничить область картинкой
                dragMode: 'move', // Чтобы можно было двигать фото
                guides: false,
                center: false,
                highlight: false,
                autoCropArea: 1,
                cropBoxMovable: false,
                cropBoxResizable: false,
                background: false
            });
        };
        reader.readAsDataURL(file);

        // Сброс инпута
        event.target.value = '';
    }

    async uploadAvatar(file) {
        try {
            notification.process('Загружаем фото...');
            Telegram.WebApp.HapticFeedback.impactOccurred('medium');

            const formData = new FormData();
            formData.append('file', file);

            // Отправляем через наш новый метод
            const response = await this.api.uploadFile(
                `/profile/avatar/upload/${this.profileData.id}`,
                formData
            );

            notification.success('Аватар обновлен');
            Telegram.WebApp.HapticFeedback.notificationOccurred('success');

            // Обновляем данные в объекте (если бэк возвращает новый URL)
            if (response.data?.avatarUrl) {
                this.profileData.avatarUrl = response.data.avatarUrl;
            }

        } catch (error) {
            console.error(error);
            notification.error('Не удалось сохранить фото');
            // В случае ошибки возвращаем старую картинку
            this.render();
        } finally {
            notification.hideAll();
        }
    }
}