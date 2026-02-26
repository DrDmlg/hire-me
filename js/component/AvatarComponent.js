class AvatarComponent {
    constructor() {
        this.api = apiService;
        this.container = document.getElementById('userAvatar');
        this.input = document.getElementById('avatarInput');
        this.profileData = null;
        this.modal = document.getElementById('cropperOverlay');
        this.imageToCrop = document.getElementById('imageToCrop');
        this.cropper = null;
    }

    async init(profileData) {
        this.profileData = profileData;
        this.render();
        this.bindEvents();
        this.bindModalEvents();
    }

    render() {
        UserProfileFiller.updateAvatar(this.container, this.profileData.id, this.api.BASE_URL);
    }

    bindEvents() {
        this.container.addEventListener('click', () => this.input.click());
        this.input.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    bindModalEvents() {
        document.getElementById('closeCropper').addEventListener('click', () => {
            this.closeCropper();
        });

        document.getElementById('saveCroppedImage').addEventListener('click', () => {
            this.saveCroppedImage();
        });

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeCropper();
        });
    }

    closeCropper() {
        this.modal.style.display = 'none';

        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.enableVerticalSwipes();
        }

        this.cropper?.destroy();
        this.cropper = null;
        this.imageToCrop.src = '';
        this.input.value = '';
    }

    async saveCroppedImage() {
        if (!this.cropper) return;

        try {
            this.modal.style.display = 'none';
            notification.process('Обрабатываем фото...');

            const canvas = this.cropper.getCroppedCanvas({
                width: 512,
                height: 512,
                imageSmoothingQuality: 'high'
            });

            canvas.toBlob(async (blob) => {
                const file = new File([blob], 'avatar.jpg', {type: 'image/jpeg'});
                await this.uploadAvatar(file);
                this.closeCropper();
            }, 'image/jpeg', 0.95);

        } catch (error) {
            console.error(error);
            notification.error('Не удалось обработать фото');
            this.modal.style.display = 'flex';
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            return notification.error('Пожалуйста, выберите изображение');
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.modal.style.display = 'flex';

            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.disableVerticalSwipes();
            }

            this.imageToCrop.src = e.target.result;

            this.cropper?.destroy();
            this.cropper = new Cropper(this.imageToCrop, {
                aspectRatio: 1,
                viewMode: 1,
                dragMode: 'move',
                guides: false,
                center: false,
                highlight: false,
                autoCropArea: 1,
                cropBoxMovable: false,
                cropBoxResizable: false,
                background: false,
                modal: true
            });
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    }

    async uploadAvatar(file) {
        try {

            if (window.Telegram?.WebApp?.HapticFeedback) {
                Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            }

            const formData = new FormData();
            formData.append('file', file);

            await this.api.uploadFile(
                `/file/avatar/upload/${this.profileData.id}`,
                formData
            );

            if (window.Telegram?.WebApp?.HapticFeedback) {
                Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }

            notification.success('Аватар обновлен');

            this.render();
        } catch (error) {
            console.error(error);
            notification.error('Не удалось сохранить фото');
            this.render();
        } finally {
            notification.hideAll();
        }
    }
}