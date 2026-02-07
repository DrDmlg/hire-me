/**
 * ResumeManager - главный менеджер для страницы резюме
 * Аналогичен AboutMeManager по структуре
 */
class ResumeManager {
    constructor() {
        this.profileData = null;
        this.navigation = new NavigationService();
        this.resumeData = null;
        this.component = new ResumeComponent();
    }

    async init() {
        try {
            // Инициализация навигации
            this.navigation.init();

            // Загружаем данные профиля
            this.profileData = await ProfileService.loadProfile();

            if (this.profileData) {
                // Ищем резюме в данных профиля
                this.extractResumeFromProfile();

                // Инициализируем компонент
                await this.component.init(this.resumeData, this.profileData);

                console.log('ResumeManager initialized successfully');
            } else {
                console.error('Не удалось загрузить данные профиля');
                notification.error('Не удалось загрузить профиль');
            }
        } catch (error) {
            console.error('ResumeManager initialization error:', error);
            notification.error('Ошибка загрузки данных');
        }
    }

    /**
     * Извлекает информацию о резюме из данных профиля
     */
    extractResumeFromProfile() {
        try {
            if (!this.profileData?.filesMeta || !Array.isArray(this.profileData.filesMeta)) {
                this.resumeData = null;
                return;
            }

            // Ищем файл с типом RESUME (или первый PDF файл)
            const resumeFile = this.profileData.filesMeta.find(file =>
                file.type === 'RESUME' ||
                file.mimeType === 'application/pdf' ||
                file.originalName?.toLowerCase().endsWith('.pdf')
            );

            if (resumeFile) {
                this.resumeData = {
                    id: resumeFile.id,
                    fileName: resumeFile.originalName,
                    uploadDate: resumeFile.createdDate,
                    storageKey: resumeFile.storageKey,
                    fileSize: resumeFile.size,
                    mimeType: resumeFile.mimeType
                };
                console.log('Найдено резюме в профиле:', this.resumeData);
            } else {
                this.resumeData = null;
                console.log('Резюме не найдено в профиле');
            }

        } catch (error) {
            console.error('Error extracting resume from profile:', error);
            this.resumeData = null;
        }
    }
}

// Автоматическая инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const resumeManager = new ResumeManager();
    resumeManager.init();
});