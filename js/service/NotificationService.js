class NotificationService {
    constructor() {
        this.container = null;
        this.initContainer();
    }

    // Инициализация контейнера для уведомлений
    initContainer() {
        this.container = document.getElementById('notificationContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notificationContainer';
            document.body.appendChild(this.container);
        }
    }

    // Показать уведомление
    #show(text, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        if (type === 'loading' || type === 'process') {
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            notification.appendChild(spinner);

            const textNode = document.createTextNode(text);
            notification.appendChild(textNode);
        } else {
            notification.textContent = text;
        }

        this.container.appendChild(notification);

        // Автоматически скрываем уведомления через 3 секунды (кроме loading)
        if (type !== 'loading' && type !== 'process') {
            setTimeout(() => {
                this.#hideWithAnimation(notification);
            }, 3000);
        }

        return notification;
    }

    // Скрыть уведомление с анимацией
    #hideWithAnimation(notificationElement) {
        if (notificationElement && notificationElement.parentElement) {
            notificationElement.classList.add('fade-out');
            setTimeout(() => {
                if (notificationElement.parentElement) {
                    notificationElement.remove();
                }
            }, 300);
        }
    }

    // Показать информационное уведомление (синий цвет)
    info(text) {
        return this.#show(text, 'info');
    }

    // Показать уведомление об ошибке (красный цвет)
    error(text) {
        return this.#show(text, 'error');
    }

    // Показать уведомление об успехе (зеленый цвет)
    success(text) {
        return this.#show(text, 'success');
    }

    // Показать предупреждение (оранжевый цвет)
    warning(text) {
        return this.#show(text, 'warning');
    }

    // Показать уведомление о загрузке (серый цвет)
    loading(text = 'Загрузка...') {
        return this.#show(text, 'loading');
    }

    // Показать уведомление о процессе выполнения (синий цвет с кружком)
    process(text = 'Выполняется...') {
        return this.#show(text, 'process');
    }

    // Скрыть все уведомления для скрытия загрузочных сообщений т.к. они не скрываются автоматически
    hideAll() {
        if (this.container) {
            const notifications = this.container.querySelectorAll('.notification');
            notifications.forEach(notification => {
                this.#hideWithAnimation(notification);
            });
        }
    }

    // Скрыть конкретное уведомление
    hide(notificationElement) {
        this.#hideWithAnimation(notificationElement);
    }
}

// глобальный экземпляр
const notification = new NotificationService();