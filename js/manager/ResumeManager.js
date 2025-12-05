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
                // Загружаем информацию о резюме
                await this.loadResumeInfo();

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
     * Загружает информацию о резюме с сервера
     */
    async loadResumeInfo() {
        try {
            const candidateId = this.profileData?.candidate?.id;

            if (!candidateId) {
                console.warn('Candidate ID not found');
                this.resumeData = null;
                return;
            }

            // TODO: Заменить на реальный эндпоинт API
            // const response = await apiService.get(`/candidate/${candidateId}/resume`);
            // this.resumeData = response.data;

            // Временные мок данные для тестирования
            this.resumeData = await this.getMockResumeData(candidateId);

        } catch (error) {
            console.error('Error loading resume info:', error);
            this.resumeData = null;
        }
    }

    /**
     * Временные мок данные (удалить при подключении реального API)
     */
    async getMockResumeData(candidateId) {
        // Проверяем есть ли резюме в localStorage (для демо)
        const mockResume = localStorage.getItem(`resume_${candidateId}`);

        if (mockResume) {
            return JSON.parse(mockResume);
        }

        return null;
    }
}

// Автоматическая инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('ResumeManager запускается...');
    const resumeManager = new ResumeManager();
    resumeManager.init();
});