/**
 * ResumeManager - главный менеджер для страницы резюме
 */
class ResumeManager {
    constructor() {
        this.profileData = null;
        this.resumeData = null;
        this.navigation = new NavigationService();
        this.component = new ResumeComponent();
    }

    async init() {
        try {
            this.navigation.init();
            this.profileData = await ProfileService.loadProfile();

            this.resumeData = this.extractResume(this.profileData);

            await this.component.init(this.resumeData, this.profileData);
            console.log('ResumeManager успешно инициализирован');

        } catch (error) {
            console.error('ResumeManager initialization error:', error);
            notification.error('Ошибка при загрузке страницы');
        }
    }

    /**
     * Поиск резюме в метаданных файлов профиля
     */
    extractResume(profile) {
        const files = profile?.filesMeta;
        if (!Array.isArray(files)) return null;

        // Приоритет: сначала ищем по типу RESUME, затем просто PDF
        const file = files.find(f => f.type === 'RESUME') ||
            files.find(f => f.originalName?.toLowerCase().endsWith('.pdf'));

        if (!file) return null;

        return {
            id: file.id,
            fileName: file.originalName,
            uploadDate: file.createdDate,
            storageKey: file.storageKey,
            fileSize: file.size,
            mimeType: file.mimeType
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const resumeManager = new ResumeManager();
    resumeManager.init();
});