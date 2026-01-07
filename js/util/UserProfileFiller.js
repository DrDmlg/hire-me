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

    static updateProgressBar(userType, profileData) {
        let filled = 0;
        let total = 0;

        if (profileData?.contact) {
         if (profileData.contact?.email) filled++;
         if (profileData.contact?.phoneNumber) filled++;
         if (profileData.contact?.telegram) filled++;
        }

        if (profileData?.workExperiences.length > 0) filled++;


        if (userType === 'candidate') {
            total = 7;

            if (profileData.candidate.educations.length > 0) filled++;
            if (profileData.candidate.skills.length > 0) filled++;
            if (profileData.candidate.languages.length > 0) filled++;
        } else if (userType === 'employer') {
            total = 4;
        }

        const percent = Math.round((filled / total) * 100);

        // Обновляем UI
        const percentEl = document.querySelector('.completion-percent');
        const progressEl = document.querySelector('.progress-fill');

        if (percentEl) percentEl.textContent = `${percent}%`;
        if (progressEl) progressEl.style.width = `${percent}%`;
    }
}