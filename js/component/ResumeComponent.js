class ResumeComponent {
    constructor() {
        this.api = apiService;
        this.profileData = null;
        this.resumeData = null;
        this.isUploading = false;
        this.elements = {};
    }

    // ============ ИНИЦИАЛИЗАЦИЯ ============
    async init(resumeData = null, profileData = null) {
        try {
            this.profileData = profileData;
            this.resumeData = resumeData;

            this.cacheElements();
            this.bindEvents();
            this.render(); // Важно вызвать при загрузке

            console.log('ResumeComponent initialized');
        } catch (error) {
            console.error('ResumeComponent init error:', error);
            notification.error('Не удалось загрузить компонент');
        }
    }

    cacheElements() {
        // Кэшируем только то, с чем реально работаем
        const ids = ['uploadArea', 'uploadTitle', 'uploadDescription', 'fileInfoContainer', 'mainActionBtn', 'secondaryActionBtn', 'fileInput'];
        ids.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    }

    // Единственная точка правды для UI
    render() {
        const { uploadArea, uploadTitle, uploadDescription, mainActionBtn } = this.elements;

        const state = this.isUploading ? 'uploading' : (this.resumeData ? 'has-file' : 'empty');
        uploadArea.className = `resume-upload-area ${state}`;

        if (this.isUploading) {
            uploadTitle.textContent = 'Загрузка...';
            uploadDescription.textContent = 'Пожалуйста, подождите';
        } else if (this.resumeData) {
            uploadTitle.textContent = 'Резюме загружено';
            uploadDescription.textContent = 'Доступно для работодателей';
            mainActionBtn.textContent = 'Скачать резюме';
            this.renderFileInfo();
        } else {
            uploadTitle.textContent = 'Добавьте ваше резюме';
            uploadDescription.textContent = 'Нажмите кнопку ниже для выбора файла';
            mainActionBtn.textContent = 'Выбрать файл';
            this.elements.fileInfoContainer.innerHTML = '';
        }
    }

    renderFileInfo() {
        if (!this.resumeData) return;
        const { fileName, uploadDate } = this.resumeData;
        const date = uploadDate ? new Date(uploadDate).toLocaleDateString('ru-RU') : 'неизвестно';

        this.elements.fileInfoContainer.innerHTML = `
            <div class="file-info">
                <div class="file-name">${Helpers.escapeHtml(fileName)}</div>
                <div class="file-date">Загружено: ${date}</div>
            </div>`;
    }

    bindEvents() {
        this.elements.mainActionBtn?.addEventListener('click', () => this.handleMainAction());
        this.elements.secondaryActionBtn?.addEventListener('click', () => this.deleteResume());
        this.elements.fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    // ============ ЛОГИКА ДЕЙСТВИЙ ============

    handleMainAction() {
        this.resumeData ? this.downloadResume() : this.elements.fileInput.click();
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.validateAndUploadFile(file);
        }
        event.target.value = ''; // Сброс для возможности повторного выбора того же файла
    }

    validateAndUploadFile(file) {
        if (file.type !== 'application/pdf') {
            return notification.error('Пожалуйста, выберите PDF файл');
        }
        if (file.size > 5 * 1024 * 1024) {
            return notification.error('Файл слишком большой (макс. 5MB)');
        }
        this.uploadResume(file);
    }

    async uploadResume(file) {
        this.isUploading = true;
        this.render();

        Telegram.WebApp.HapticFeedback.impactOccurred('medium');

        try {
            const profileId = this.profileData?.id;
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${this.api.BASE_URL}/resume/upload/${profileId}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload error');

            const data = await response.json();
            this.resumeData = {
                id: data.id,
                fileName: data.originalName,
                uploadDate: data.createdDate,
                storageKey: data.storageKey
            };

            notification.success('Резюме сохранено');
            Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        } catch (error) {
            console.error(error);
            notification.error('Ошибка при загрузке');
        } finally {
            this.isUploading = false;
            this.render();
        }
    }

    async downloadResume() {
        try {
            notification.process('Загрузка файла...');
            const response = await fetch(
                `${this.api.BASE_URL}/resume/download/${this.profileData.id}?key=${encodeURIComponent(this.resumeData.storageKey)}`
            );

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = this.resumeData.fileName || 'resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => window.URL.revokeObjectURL(url), 100);
            notification.success('Файл скачан');
        } catch (error) {
            notification.error('Ошибка скачивания');
        } finally {
            notification.hideAll();
        }
    }

    async deleteResume() {
        if (!confirm('Вы уверены, что хотите удалить резюме?')) return;

        try {
            notification.process('Удаление...');
            await this.api.delete(`/resume/${this.resumeData.id}`);

            this.resumeData = null;
            notification.success('Удалено');
        } catch (error) {
            notification.error('Ошибка удаления');
        } finally {
            this.render();
            notification.hideAll();
        }
    }

    reset() {
        this.resumeData = null;
        this.isUploading = false;
        this.render();
    }
}