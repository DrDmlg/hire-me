class UserProfileFiller {

    static setUserName(profileData) {
        const userNameElement = document.getElementById('userName');

        let firstName = profileData.firstName;
        let lastName = profileData.lastName;

        userNameElement.textContent = firstName + ' ' + lastName;
    }

    static updateAvatar(container, profileId, baseUrl) {
        if (!container) return;

        let img = container.querySelector('.avatar-image');
        if (!img) {
            img = document.createElement('img');
            img.className = 'avatar-image';
            container.prepend(img);
        }

        // Если ID нет (пользователь не найден), сразу ставим заглушку и выходим
        if (!profileId) {
            img.src = '/images/icons/no-avatar.svg';
            return;
        }

        const avatarUrl = `${baseUrl}/file/avatar/${profileId}?t=${Date.now()}`;
        img.src = avatarUrl;

        img.onerror = () => {
            img.src = '/images/icons/no-avatar.svg';
            img.onerror = null;
        };
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

    static initTelegram(tg) {
        if (!tg) return;

        const style = getComputedStyle(document.documentElement);
        const primaryColor = style.getPropertyValue('--primary').trim();
        const bgColor = style.getPropertyValue('--bg-light').trim();

        tg.expand();
        tg.setHeaderColor(primaryColor);
        tg.setBackgroundColor(bgColor);
        tg.enableClosingConfirmation();
    }
}