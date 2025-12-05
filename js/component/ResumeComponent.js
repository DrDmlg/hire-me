/**
 * ResumeComponent - компонент для работы с резюме
 * Управляет UI и обработкой файлов
 */
class ResumeComponent {
    constructor() {
        this.api = apiService;
        this.resumeData = null;
        this.profileData = null;
        this.currentFile = null;
        this.isUploading = false;
        this.uploadController = null;
        this.elements = {};
    }

    /**
     * Инициализация компонента
     */
    async init(resumeData = null, profileData = null) {
        this.resumeData = resumeData;
        this.profileData = profileData;

        this.initElements();
        this.bindEvents();
        this.updateUI();

        console.log('ResumeComponent initialized');
    }

    /**
     * Инициализация DOM элементов
     */
    initElements() {
        this.elements = {
            // Основные контейнеры
            uploadArea: document.getElementById('uploadArea'),
            fileInput: document.getElementById('fileInput'),

            // Элементы формы
            uploadTitle: document.getElementById('uploadTitle'),
            uploadDescription: document.getElementById('uploadDescription'),
            uploadDropZone: document.querySelector('.upload-drop-zone'),
            dropZoneText: document.getElementById('dropZoneText'),
            uploadOr: document.getElementById('uploadOr'),
            mainActionBtn: document.getElementById('mainActionBtn'),
            secondaryActionBtn: document.getElementById('secondaryActionBtn'),
            uploadFooter: document.getElementById('uploadFooter'),

            // Контейнер для динамического контента
            fileInfoContainer: document.getElementById('fileInfoContainer')
        };
    }

    /**
     * Привязка событий
     */
    bindEvents() {
        // Кнопка выбора файла
        if (this.elements.mainActionBtn) {
            this.elements.mainActionBtn.addEventListener('click', () => {
                this.elements.fileInput.click();
            });
        }

        // Input файла
        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files[0]);
            });
        }

        // Drag & Drop события
        this.bindDragDropEvents();
    }

    /**
     * Привязка Drag & Drop событий
     */
    bindDragDropEvents() {
        const uploadArea = this.elements.uploadArea;
        if (!uploadArea) return;

        // Предотвращаем стандартное поведение
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Визуальная обратная связь
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('drag-over');
            });
        });

        // Обработка сброса файла
        uploadArea.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            if (file) {
                this.handleFileSelect(file);
            }
        });
    }

    /**
     * Обработка выбранного файла
     */
    handleFileSelect(file) {
        if (!file) return;

        // Если уже есть файл - это замена
        if (this.resumeData) {
            this.resumeData = null;
        }

        // Валидация
        if (!this.validateFile(file)) {
            return;
        }

        this.currentFile = file;
        this.startUpload();
    }

    /**
     * Валидация файла
     */
    validateFile(file) {
        // Проверка типа
        const validTypes = ['application/pdf'];
        const validExtensions = ['.pdf'];

        const isTypeValid = validTypes.includes(file.type);
        const isExtensionValid = validExtensions.some(ext =>
            file.name.toLowerCase().endsWith(ext)
        );

        if (!isTypeValid && !isExtensionValid) {
            notification.error('Пожалуйста, выберите PDF файл');
            return false;
        }

        // Проверка размера (5 MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            notification.error('Файл слишком большой. Максимальный размер: 5 MB');
            return false;
        }

        return true;
    }

    /**
     * Начало загрузки файла
     */
    async startUpload() {
        if (!this.currentFile || this.isUploading) return;

        this.isUploading = true;
        this.showUploadProgress();
        this.updateProgress(0);

        try {
            const formData = new FormData();
            formData.append('resume', this.currentFile);

            // Создаем AbortController для отмены
            this.uploadController = new AbortController();

            // Имитация загрузки для демо
            await this.mockUpload(formData);

            // Сохраняем данные
            this.resumeData = {
                id: Date.now(),
                fileName: this.currentFile.name,
                uploadDate: new Date().toISOString(),
                downloadUrl: URL.createObjectURL(this.currentFile)
            };

            // Сохраняем в localStorage для демо
            const candidateId = this.profileData?.candidate?.id;
            if (candidateId) {
                localStorage.setItem(`resume_${candidateId}`, JSON.stringify(this.resumeData));
            }

            // Обновляем UI
            this.updateUI();
            notification.success('Резюме успешно загружено!');

        } catch (error) {
            if (error.name === 'AbortError') {
                notification.info('Загрузка отменена');
            } else {
                console.error('Upload error:', error);
                notification.error('Ошибка загрузки резюме');
            }
        } finally {
            this.isUploading = false;
            this.currentFile = null;
            this.uploadController = null;
            this.updateUI();
        }
    }

    /**
     * Имитация загрузки (для демо)
     */
    async mockUpload(formData) {
        return new Promise((resolve, reject) => {
            let progress = 0;

            const interval = setInterval(() => {
                progress += 10;
                this.updateProgress(progress);

                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(resolve, 300);
                }
            }, 100);
        });
    }

    /**
     * Обновление прогресса загрузки
     */
    updateProgress(percent) {
        const progressPercent = document.getElementById('progressPercent');
        const progressFill = document.getElementById('progressFill');

        if (progressPercent) {
            progressPercent.textContent = `${percent}%`;
        }

        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
    }

    /**
     * Отмена загрузки
     */
    cancelUpload() {
        if (this.uploadController) {
            this.uploadController.abort();
        }
        this.isUploading = false;
        this.currentFile = null;
        this.updateUI();
    }

    /**
     * Скачивание резюме
     */
    async downloadResume() {
        if (!this.resumeData) return;

        try {
            // Для демо создаем временную ссылку
            if (this.resumeData.downloadUrl) {
                const link = document.createElement('a');
                link.href = this.resumeData.downloadUrl;
                link.download = this.resumeData.fileName || 'resume.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                notification.success('Начинается скачивание...');
            } else {
                notification.error('Файл не найден');
            }

        } catch (error) {
            console.error('Download error:', error);
            notification.error('Ошибка скачивания');
        }
    }

    /**
     * Удаление резюме
     */
    async deleteResume() {
        if (!this.resumeData) return;

        notification.process('Удаление...');

        try {
            // Удаляем из localStorage для демо
            const candidateId = this.profileData?.candidate?.id;
            if (candidateId) {
                localStorage.removeItem(`resume_${candidateId}`);
            }

            // Очищаем данные
            this.resumeData = null;

            // Обновляем UI
            this.updateUI();
            notification.success('Резюме удалено');

        } catch (error) {
            console.error('Delete error:', error);
            notification.error('Ошибка удаления');
        } finally {
            notification.hideAll();
        }
    }

    /**
     * Обновление UI в зависимости от состояния
     */
    updateUI() {
        if (!this.elements.uploadArea) return;

        // Очищаем динамический контент
        if (this.elements.fileInfoContainer) {
            this.elements.fileInfoContainer.innerHTML = '';
        }

        // Удаляем прогресс-бар если есть
        const progressContainer = document.querySelector('.upload-progress-container');
        if (progressContainer) {
            progressContainer.remove();
        }

        // Показываем все скрытые элементы
        if (this.elements.uploadDropZone) {
            this.elements.uploadDropZone.style.display = 'flex';
        }
        if (this.elements.uploadOr) {
            this.elements.uploadOr.style.display = 'flex';
        }
        if (this.elements.uploadFooter) {
            this.elements.uploadFooter.style.display = 'block';
        }

        if (this.isUploading) {
            this.showUploadProgress();
        } else if (this.resumeData) {
            this.showFileState();
        } else {
            this.showEmptyState();
        }
    }

    /**
     * Показывает состояние "Нет файла"
     */
    showEmptyState() {
        const elements = this.elements;

        // Классы
        elements.uploadArea.classList.remove('has-file', 'uploading');
        elements.uploadArea.classList.add('empty');

        // Тексты
        elements.uploadTitle.textContent = 'Добавьте ваше резюме';
        elements.uploadDescription.style.display = 'block';
        elements.dropZoneText.textContent = 'Перетащите сюда';

        // Элементы
        if (elements.uploadOr) elements.uploadOr.style.display = 'flex';

        // Кнопки
        elements.mainActionBtn.textContent = 'Выбрать файл';
        elements.mainActionBtn.onclick = () => elements.fileInput.click();
        elements.mainActionBtn.style.display = 'block';

        if (elements.secondaryActionBtn) {
            elements.secondaryActionBtn.style.display = 'none';
        }

        // Футер
        if (elements.uploadFooter) {
            elements.uploadFooter.innerHTML = `
                <div class="requirement-item">
                    <span>• Только PDF формат</span>
                </div>
                <div class="requirement-item">
                    <span>• Максимальный размер: 5 MB</span>
                </div>
            `;
        }
    }

    /**
     * Показывает состояние "Есть файл"
     */
    showFileState() {
        if (!this.resumeData) return;

        const elements = this.elements;

        // Классы
        elements.uploadArea.classList.remove('empty', 'uploading');
        elements.uploadArea.classList.add('has-file');

        // Тексты
        elements.uploadTitle.textContent = 'Ваше резюме';
        elements.uploadDescription.style.display = 'none';
        elements.dropZoneText.textContent = '';

        // Прячем элементы
        if (elements.uploadOr) elements.uploadOr.style.display = 'none';

        // Информация о файле
        if (elements.fileInfoContainer) {
            elements.fileInfoContainer.innerHTML = `
            <div class="file-info">
                <div class="file-name">${this.resumeData.fileName || 'Не указано'}</div>
                <div class="file-date">${this.formatDateForDisplay(this.resumeData.uploadDate)}</div>
            </div>
        `;
        }

        // Кнопки
        elements.mainActionBtn.textContent = '📥 Скачать резюме';
        elements.mainActionBtn.onclick = () => this.downloadResume();
        elements.mainActionBtn.style.display = 'block';

        if (elements.secondaryActionBtn) {
            elements.secondaryActionBtn.style.display = 'block';
            elements.secondaryActionBtn.textContent = '🗑️ Заменить';
            elements.secondaryActionBtn.onclick = () => this.deleteResume();
        }

        // Футер
        if (elements.uploadFooter) {
            elements.uploadFooter.innerHTML = `
            <div class="requirement-item">
                <span>💡 Перетащите новый файл для замены</span>
            </div>
        `;
        }
    }

    /**
     * Форматирование даты для отображения
     */
    formatDateForDisplay(dateString) {
        if (!dateString) return 'Дата не указана';

        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Обновлено сегодня";
        if (diffDays === 1) return "Обновлено вчера";
        if (diffDays < 7) return "Обновлено на этой неделе";
        if (diffDays < 30) return "Обновлено в этом месяце";
        return "Обновлено давно";
    }

    /**
     * Показывает состояние "Загрузка"
     */
    showUploadProgress() {
        const elements = this.elements;

        // Классы
        elements.uploadArea.classList.remove('empty', 'has-file');
        elements.uploadArea.classList.add('uploading');

        // Тексты
        elements.uploadTitle.textContent = 'Загрузка резюме';
        elements.uploadDescription.style.display = 'none';

        // Прячем элементы
        if (elements.uploadDropZone) elements.uploadDropZone.style.display = 'none';
        if (elements.uploadOr) elements.uploadOr.style.display = 'none';
        if (elements.mainActionBtn) elements.mainActionBtn.style.display = 'none';
        if (elements.secondaryActionBtn) elements.secondaryActionBtn.style.display = 'none';
        if (elements.uploadFooter) elements.uploadFooter.style.display = 'none';

        // Добавляем прогресс
        const progressHTML = `
            <div class="upload-progress-container">
                <div class="progress-header">
                    <span class="progress-text">Загружается...</span>
                    <span class="progress-percent" id="progressPercent">0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <button class="cancel-btn" id="cancelUploadBtn">Отменить загрузку</button>
            </div>
        `;

        if (elements.fileInfoContainer) {
            elements.fileInfoContainer.innerHTML = progressHTML;

            // Привязываем кнопку отмены
            const cancelBtn = document.getElementById('cancelUploadBtn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => this.cancelUpload());
            }
        }
    }
}