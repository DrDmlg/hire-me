class UserProfileFiller {

    static setUserName(profileData) {
        const userNameElement = document.getElementById('userName');

        let firstName = profileData.firstName;
        let lastName = profileData.lastName;

        userNameElement.textContent = firstName + ' ' + lastName;
    }

    //TODO: Аватар пока берется из данных телеграма. В системе аватар пользователя не сохраняется. Функционала смены аватара не существует
    static setUserAvatar(tg) {
        if (!tg?.initDataUnsafe?.user) return;

        const user = tg.initDataUnsafe.user;
        const avatar = document.getElementById('userAvatar');

        if (user.photo_url) {
            avatar.innerHTML = `<img src="${user.photo_url}" alt="Avatar" class="avatar-image">`;
        } else if (user.first_name) {
            avatar.textContent = user.first_name[0].toUpperCase();
            const colors = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
            const colorIndex = user.id % colors.length;
            avatar.style.background = colors[colorIndex];
            avatar.style.color = 'white';
        }
    }
}