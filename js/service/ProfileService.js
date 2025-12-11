class ProfileService {

    /** Загрузка данных профиля с сервера */
    static async loadProfile() {
        console.log('Загрузка профиля');

        try {
            const telegramUserId = Helpers.getTelegramUserId();
            console.log('Loading profile for user:', telegramUserId);

            const response = await apiService.get(`/profile/${telegramUserId}`);
            const profileData = response.data

            console.log('Профиль был загружен:', profileData);
            notification.hideAll()
            return profileData;

        } catch (error) {
            console.error('Ошибка загрузки профайла:', error);
            notification.hideAll();
            notification.error('Ошибка загрузки профиля');
            throw error;
        }
    }
}