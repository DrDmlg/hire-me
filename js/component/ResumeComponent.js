class ResumeComponent {
    constructor() {
        this.api = apiService;
        this.profileData = null;
        this.resumeData = null;
        this.currentFile = null;
        this.isUploading = false;
        this.progress = 0;
        this.progressInterval = null;

        // DOM элементы
        this.elements = {
            uploadArea: null,
            uploadTitle: null,
            uploadDescription: null,
            dropZone: null,
            dropZoneText: null,
            fileInfoContainer: null,
            mainActionBtn: null,
            secondaryActionBtn: null,
            uploadFooter: null,
            fileInput: null
        };
    }

    // ============ ИНИЦИАЛИЗАЦИЯ ============
    async init(resumeData = null, profileData = null) {
        try {
            this.profileData = profileData;
            this.resumeData = resumeData;

            this.cacheElements();
            this.bindEvents();
            this.updateUIState();

            console.log('ResumeComponent initialized with data:', this.resumeData);
        } catch (error) {
            console.error('ResumeComponent init error:', error);
            notification.error('Не удалось инициализировать компонент резюме');
        }
    }

    cacheElements() {
        this.elements.uploadArea = document.getElementById('uploadArea');
        this.elements.uploadTitle = document.getElementById('uploadTitle');
        this.elements.uploadDescription = document.getElementById('uploadDescription');
        this.elements.dropZone = document.getElementById('dropZone');
        this.elements.dropZoneText = document.getElementById('dropZoneText');
        this.elements.fileInfoContainer = document.getElementById('fileInfoContainer');
        this.elements.mainActionBtn = document.getElementById('mainActionBtn');
        this.elements.secondaryActionBtn = document.getElementById('secondaryActionBtn');
        this.elements.uploadFooter = document.getElementById('uploadFooter');
        this.elements.fileInput = document.getElementById('fileInput');
    }

    bindEvents() {
        // Основная кнопка действия
        if (this.elements.mainActionBtn) {
            this.elements.mainActionBtn.addEventListener('click', () => this.handleMainAction());
        }

        // Вторая кнопка (удаление)
        if (this.elements.secondaryActionBtn) {
            this.elements.secondaryActionBtn.addEventListener('click', () => this.deleteResume());
        }

        // Скрытый input
        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Drag & Drop
        if (this.elements.uploadArea) {
            this.elements.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.elements.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.elements.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        }
    }

    // ============ ОБНОВЛЕНИЕ СОСТОЯНИЯ ИНТЕРФЕЙСА ============
    updateUIState() {
        if (!this.resumeData) {
            this.setStateEmpty();
        } else {
            this.setStateHasFile();
        }
    }

    setStateEmpty() {
        const { uploadArea, uploadTitle, uploadDescription, dropZoneText, mainActionBtn, secondaryActionBtn, uploadFooter } = this.elements;

        // Обновляем классы
        uploadArea.classList.remove('has-file', 'uploading');
        uploadArea.classList.add('empty');

        // Обновляем текст
        uploadTitle.textContent = 'Добавьте ваше резюме';
        uploadDescription.textContent = 'Нажмите кнопку ниже для выбора файла';
        dropZoneText.textContent = 'Область для отображения статуса';

        // Обновляем кнопки
        mainActionBtn.textContent = 'Выбрать файл';
        mainActionBtn.style.display = 'block';
        secondaryActionBtn.style.display = 'none';

        // Показываем footer
        uploadFooter.style.display = 'flex';

        // Очищаем информацию о файле
        this.elements.fileInfoContainer.innerHTML = '';
    }

    setStateHasFile() {
        const { uploadArea, uploadTitle, uploadDescription, dropZoneText, mainActionBtn, secondaryActionBtn } = this.elements;

        // Обновляем классы
        uploadArea.classList.remove('empty', 'uploading');
        uploadArea.classList.add('has-file');

        // Обновляем текст
        uploadTitle.textContent = 'Ваше резюме загружено';
        uploadDescription.textContent = 'Резюме готово к отправке работодателям';
        dropZoneText.style.display = 'none';

        // Обновляем кнопки
        mainActionBtn.textContent = 'Скачать резюме';
        mainActionBtn.style.display = 'block';
        secondaryActionBtn.style.display = 'block';

        // Скрываем footer
        this.elements.uploadFooter.style.display = 'none';

        // Показываем информацию о файле
        this.renderFileInfo();
    }

    setStateUploading() {
        const { uploadArea, uploadTitle, uploadDescription, mainActionBtn, secondaryActionBtn, uploadFooter } = this.elements;

        // Обновляем классы
        uploadArea.classList.remove('empty', 'has-file');
        uploadArea.classList.add('uploading');

        // Обновляем текст
        uploadTitle.textContent = 'Загрузка резюме...';
        uploadDescription.textContent = 'Пожалуйста, подождите';

        // Скрываем кнопки и footer
        mainActionBtn.style.display = 'none';
        secondaryActionBtn.style.display = 'none';
        uploadFooter.style.display = 'none';

        // Показываем прогресс бар
        this.showProgressBar();
    }

    // ============ ОТОБРАЖЕНИЕ ИНФОРМАЦИИ О ФАЙЛЕ ============
    renderFileInfo() {
        if (!this.resumeData) return;

        const { fileName, uploadDate } = this.resumeData;
        const formattedDate = this.formatDate(uploadDate);

        this.elements.fileInfoContainer.innerHTML = `
            <div class="file-info">
                <div class="file-name">${Helpers.escapeHtml(fileName)}</div>
                <div class="file-date">Загружено: ${formattedDate}</div>
            </div>
        `;
    }

    // ============ ПРОГРЕСС БАР ============
    showProgressBar() {
        this.elements.fileInfoContainer.innerHTML = `
            <div class="upload-progress-container fade-in">
                <div class="progress-header">
                    <div class="progress-text">Загрузка...</div>
                    <div class="progress-percent" id="progressPercent">0%</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                </div>
                <button class="cancel-btn" id="cancelUploadBtn">Отменить</button>
            </div>
        `;

        // Навешиваем обработчик отмены
        const cancelBtn = document.getElementById('cancelUploadBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelUpload());
        }

        // Запускаем симуляцию прогресса
        this.simulateProgress();
    }

    simulateProgress() {
        this.progress = 0;

        this.progressInterval = setInterval(() => {
            if (this.progress >= 95) {
                clearInterval(this.progressInterval);
                return;
            }

            this.progress += Math.random() * 15 + 5;
            if (this.progress > 95) this.progress = 95;

            this.updateProgressBar();
        }, 300);
    }

    updateProgressBar() {
        const progressPercent = document.getElementById('progressPercent');
        const progressFill = document.getElementById('progressFill');

        if (progressPercent) {
            progressPercent.textContent = `${Math.round(this.progress)}%`;
        }

        if (progressFill) {
            progressFill.style.width = `${this.progress}%`;
        }
    }

    completeProgress() {
        clearInterval(this.progressInterval);

        const progressPercent = document.getElementById('progressPercent');
        const progressFill = document.getElementById('progressFill');

        if (progressPercent) {
            progressPercent.textContent = '100%';
        }

        if (progressFill) {
            progressFill.style.width = '100%';
        }

        // Через секунду скрываем прогресс бар
        setTimeout(() => {
            this.isUploading = false;
            this.updateUIState();
        }, 1000);
    }

    cancelUpload() {
        clearInterval(this.progressInterval);
        this.isUploading = false;
        this.updateUIState();
        notification.info('Загрузка отменена');
    }

    // ============ ОБРАБОТЧИКИ ДЕЙСТВИЙ ============
    handleMainAction() {
        if (!this.resumeData) {
            // Если нет резюме - открываем выбор файла
            this.elements.fileInput.click();
        } else {
            // Если есть резюме - скачиваем
            this.downloadResume();
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.validateAndUploadFile(file);
        event.target.value = ''; // Сбрасываем input
    }

    // ============ DRAG & DROP ============
    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        this.elements.uploadArea.style.borderColor = 'var(--primary)';
        this.elements.uploadArea.style.backgroundColor = 'rgba(37, 99, 235, 0.05)';
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        this.elements.uploadArea.style.borderColor = '';
        this.elements.uploadArea.style.backgroundColor = '';
    }

    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();

        this.elements.uploadArea.style.borderColor = '';
        this.elements.uploadArea.style.backgroundColor = '';

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.validateAndUploadFile(files[0]);
        }
    }

    // ============ ВАЛИДАЦИЯ И ЗАГРУЗКА ============
    validateAndUploadFile(file) {
        // Проверка типа файла
        if (file.type !== 'application/pdf') {
            notification.error('Пожалуйста, загрузите файл в формате PDF');
            return;
        }

        // Проверка размера файла (5 MB)
        const maxSize = 5 * 1024 * 1024; // 5 MB в байтах
        if (file.size > maxSize) {
            notification.error('Размер файла не должен превышать 5 MB');
            return;
        }

        // Сохраняем файл и начинаем загрузку
        this.currentFile = file;
        this.uploadResume(file);
    }

    async uploadResume(file) {
        this.isUploading = true;
        this.setStateUploading();

        try {
            // Получаем profileId
            const profileId = this.profileData?.id;
            if (!profileId) {
                throw new Error('Profile ID not found');
            }

            // Используем fetch напрямую для загрузки файла
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${this.api.BASE_URL}/resume/upload/${profileId}`, {
                method: 'POST',
                body: formData
                // Не устанавливаем Content-Type - браузер сделает это сам с правильным boundary
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload failed:', response.status, errorText);
                throw new Error(`Upload failed: ${response.status}`);
            }

            const responseData = await response.json();

            // Обновляем данные резюме
            this.resumeData = {
                id: responseData.id,
                fileName: responseData.originalName,
                uploadDate: responseData.createdDate,
                storageKey: responseData.storageKey,
                fileSize: responseData.size,
                mimeType: responseData.mimeType
            };

            // Завершаем прогресс
            this.completeProgress();

            notification.success('Резюме успешно загружено!');

        } catch (error) {
            console.error('Upload resume error:', error);
            notification.error('Ошибка загрузки резюме');
            this.isUploading = false;
            this.updateUIState();
        }
    }

    async downloadResume() {
        if (!this.resumeData || !this.resumeData.storageKey) {
            notification.error('Файл резюме не найден');
            return;
        }

        try {
            notification.process('Подготовка скачивания...');

            const profileId = this.profileData?.id;
            const key = this.resumeData.storageKey;

            // Загружаем файл
            const response = await this.api.get(`/resume/download/${profileId}?key=${encodeURIComponent(key)}`, {
                responseType: 'blob'
            });

            if (!response.data) {
                throw new Error('No file data received');
            }

            // Создаем ссылку для скачивания
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = this.resumeData.fileName || 'resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            notification.success('Резюме скачивается...');

        } catch (error) {
            console.error('Download resume error:', error);
            notification.error('Ошибка скачивания резюме');
        } finally {
            notification.hideAll();
        }
    }

    async deleteResume() {
        if (!this.resumeData || !this.resumeData.id) {
            notification.error('Нет резюме для удаления');
            return;
        }

        try {
            const confirmed = confirm('Вы уверены, что хотите удалить резюме?');
            if (!confirmed) return;

            notification.process('Удаление резюме...');

            // Отправляем запрос на удаление
            await this.api.delete(`/resume/${this.resumeData.id}`);

            // Очищаем данные
            this.resumeData = null;
            this.currentFile = null;

            // Обновляем UI
            this.updateUIState();

            notification.success('Резюме удалено');

        } catch (error) {
            console.error('Delete resume error:', error);
            notification.error('Ошибка удаления резюме');
        } finally {
            notification.hideAll();
        }
    }

    // ============ ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ============
    formatDate(dateString) {
        if (!dateString) return 'Неизвестно';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    // ============ ОБНОВЛЕНИЕ ДАННЫХ ============
    updateResumeData(newResumeData) {
        this.resumeData = newResumeData;
        this.updateUIState();
    }

    // ============ СБРОС ============
    reset() {
        this.resumeData = null;
        this.currentFile = null;
        this.isUploading = false;
        this.progress = 0;

        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }

        this.updateUIState();
    }
}