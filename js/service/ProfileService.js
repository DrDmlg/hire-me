class ProfileService {

    /** Загрузка данных профиля с сервера */
    static async loadProfile() {
        Helpers.showMessage('Загрузка профиля...');

        try {
            const telegramUserId = Helpers.getTelegramUserId();
            console.log('Loading profile for user:', telegramUserId);

            const response = await apiService.get(`/profile/${telegramUserId}`);
            const profileData = response.data

            console.log('Профиль был загружен:', profileData);
            Helpers.hideMessage();
            return profileData;

        } catch (error) {
            console.error('Ошибка загрузки профайла:', error);
            Helpers.hideMessage();
            Helpers.showMessage('Ошибка загрузки профиля');
            throw error;
        }
    }
}