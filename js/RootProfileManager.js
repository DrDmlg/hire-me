/** Корневой файл работы с профайлами*/

class RootProfileManager {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.profileManager = new AboutMeManager();
    }

    async init() {
        try {
            if (this.tg) {
                this.initTelegram();
            }

            // Инициализируем профиль (он загрузит все данные)
            await this.profileManager.init();

            this.initNavigation();
            this.initUserData();

            window.app = this;
            console.log('RootProfileManager initialized successfully');
        } catch (error) {
            console.error('RootProfileManager initialization error:', error);
        }
    }

    initTelegram() {
        this.tg.expand();
        this.tg.setHeaderColor('#FFFFFF');
        this.tg.setBackgroundColor('#F8FAFC');
        this.tg.enableClosingConfirmation();
    }

    initNavigation() {
        // Обработка навигации
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function (e) {
                if (this.getAttribute('href') && !this.getAttribute('href').includes('t.me')) {
                    e.preventDefault();
                    this.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        window.location.href = this.getAttribute('href');
                    }, 150);
                }
            });
        });

        // Обработка Escape для возврата
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.goBack();
            }
        });

        // Анимация для кнопки назад
        const backButton = document.querySelector('.back-button-header');
        if (backButton) {
            backButton.addEventListener('click', function () {
                this.style.animation = 'rotateIn 0.6s ease-out';
            });
        }

        // Анимация появления элементов при скролле
        this.initScrollAnimations();
    }

    initUserData() {
        if (this.tg?.initDataUnsafe?.user) {
            const user = this.tg.initDataUnsafe.user;
            const avatar = document.getElementById('userAvatar');

            // Устанавливаем аватар
            if (user.photo_url) {
                avatar.innerHTML = `<img src="${user.photo_url}" alt="Avatar" class="avatar-image">`;
            } else if (user.first_name) {
                avatar.textContent = user.first_name[0].toUpperCase();
                const colors = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
                const colorIndex = user.id % colors.length;
                avatar.style.background = colors[colorIndex];
                avatar.style.color = 'white';
            }

            // Устанавливаем имя
            let userName = '';
            if (user.first_name) userName += user.first_name;
            if (user.last_name) userName += ' ' + user.last_name;
            if (userName.trim() === '') userName = 'Пользователь';

            document.getElementById('userName').textContent = userName;
        }
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-slide-up').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // Публичные методы
    goBack() {
        const backButton = document.querySelector('.back-button-header');
        if (backButton) {
            backButton.style.animation = 'rotateIn 0.6s ease-out';
        }

        setTimeout(() => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'profile.html';
            }
        }, 300);
    }

    editProfile() {
        if (this.tg) {
            this.tg.showAlert('Редактирование профиля');
        } else {
            alert('Редактирование профиля');
        }
    }
}

// Запуск приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    const app = new RootProfileManager();
    await app.init();
});