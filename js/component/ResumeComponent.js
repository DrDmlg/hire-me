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
        this.elements = {
            uploadArea: document.getElementById('uploadArea'),
            fileInfoContainer: document.getElementById('fileInfoContainer'),
            uploadBtn: document.getElementById('uploadResumeBtn'),
            downloadBtn: document.getElementById('downloadResumeBtn'),
            deleteBtn: document.getElementById('deleteResumeBtn'),
            fileInput: document.getElementById('fileInput')
        };
    }

    render() {
        const {uploadArea, uploadBtn, downloadBtn, deleteBtn, fileInfoContainer} = this.elements;
        const hasFile = !!this.resumeData;

        // Устанавливаем состояние контейнера
        uploadArea.className = `resume-upload-area ${this.isUploading ? 'uploading' : (hasFile ? 'has-file' : 'empty')}`;

        if (hasFile) {
            this.renderFileInfo();
            // Показываем обе кнопки: заменить и удалить
            uploadBtn.style.display = 'none';
            downloadBtn.style.display = 'flex';
            deleteBtn.style.display = 'flex';
        } else {
            fileInfoContainer.innerHTML = '';
            uploadBtn.style.display = 'flex';
            downloadBtn.style.display = 'none';
            deleteBtn.style.display = 'none';
        }
    }

    renderFileInfo() {
        if (!this.resumeData) return;
        const {fileName, uploadDate} = this.resumeData;
        const date = uploadDate ? new Date(uploadDate).toLocaleDateString('ru-RU') : 'неизвестно';

        this.elements.fileInfoContainer.innerHTML = `
        <div class="file-info">
            <div class="file-details">
                <span class="file-name">${Helpers.escapeHtml(fileName)}</span>
                <div class="file-status">
                    <span class="status-dot"></span> 
                    Видно работодателям
                </div>
                <div class="file-date" style="font-size: 0.7rem; color: #64748B; margin-top: 2px;">
                    Загружено: ${date}
                </div>
            </div>
        </div>`;
    }

    bindEvents() {
        this.elements.downloadBtn?.addEventListener('click', () => this.downloadResume());
        this.elements.uploadBtn?.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.deleteBtn?.addEventListener('click', () => this.deleteResume());
        this.elements.fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));
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