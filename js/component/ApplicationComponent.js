class ApplicationComponent {
    constructor() {
        this.api = apiService;
        this.tg = window.Telegram?.WebApp;
    }

    // Создает карточку отклика для группированного вида
    createGroupedCard(response) {
        const statusClass = `status-${response.status}`;
        const statusText = this.getStatusText(response.status);
        const candidateName = response.candidate?.lastName+ " " + response.candidate?.firstName;
        const initials = this.getInitials(candidateName);
        const timeAgo = this.formatTimeAgo(response.appliedAt);

        return `
            <div class="response-card ${response.status}" data-response-id="${response.id}">
                <div class="response-header">
                    <div class="candidate-avatar" data-candidate-id="${response.candidate?.id}">
                        ${initials}
                    </div>
                    
                    <div class="candidate-main">
                        <div class="candidate-name">
                            ${(candidateName)}
                            <span class="response-status ${statusClass}">${statusText}</span>
                        </div>
                        
                        <div class="candidate-meta">
                            <span class="tag-pill">
                                <span>${response.candidate?.desiredPosition}</span>
                            </span>
                            
                             ${response.candidate?.experience ? `
                            <span class="candidate-tag">
                                <span>${response.candidate.experience}</span>
                            </span>
                            ` : ''}
                            
                            ${response.candidate?.desiredSalary ? `
                            <span class="tag-salary">
                                <span>от ${this.formatSalary(response.candidate.desiredSalary)} ₽</span>
                            </span>
                            ` : ''}
                        </div>
                        
                        <div class="response-time">${timeAgo}</div>
                    </div>
                </div>
                
                <div class="response-actions">
                    ${response.status === 'NEW' ? `
                    <button class="btn-invite" data-action="invite" data-response-id="${response.id}">
                        Пригласить
                    </button>
                    <button class="btn-reject" data-action="reject" data-response-id="${response.id}">
                        Отклонить
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Создает детальное модальное окно
    createModalContent(response) {
        const candidate = response.candidate || {};

        return `
            <div class="modal-header">
                <h2>Отклик на вакансию</h2>
                <button class="modal-close" id="modalClose">×</button>
            </div>
            
            <div class="modal-body">
                <div class="candidate-detail-header">
                    <div class="candidate-avatar large">
                        ${this.getInitials(candidate.name)}
                    </div>
                    <div class="candidate-info">
                        <h3>${(response.candidate?.lastName+ " " + response.candidate?.firstName)}</h3>
                        <p class="candidate-position">${(candidate.desiredPosition)}</p>
                        <p class="candidate-location">${(candidate.location || 'Город (не указан)')}</p>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Контактная информация</h4>
                    ${this.createContactInfo(candidate.contact)}
                </div>
                
                <div class="detail-section">
                    <h4>Ожидания кандидата</h4>
                    <div class="expectations-grid">
                        <div class="expectation-item">
                            <span class="expectation-label">Зарплата:</span>
                            <span class="expectation-value">${candidate.desiredSalary ? `от ${this.formatSalary(candidate.desiredSalary)} ₽` : 'Не указана'}</span>
                        </div>
                        <div class="expectation-item">
                            <span class="expectation-label">Формат работы:</span>
                            <span class="expectation-value">${candidate.workFormat || 'Не указан'}</span>
                        </div>
                        <div class="expectation-item">
                            <span class="expectation-label">Тип занятости:</span>
                            <span class="expectation-value">${candidate.employmentType || 'Не указан'}</span>
                        </div>
                    </div>
                </div>
                 
                <div class="detail-section">
                    <h4>Статус отклика</h4>
                    <div class="status-info">
                        <div class="status-current ${response.status}">
                            <span>Текущий статус:</span>
                            <strong>${this.getStatusText(response.status)}</strong>
                        </div>
                        <div class="status-history">
                            <p>Отправлен: ${this.formatDate(response.appliedAt)}</p>
                            ${response.viewedAt ? `<p>Просмотрен: ${this.formatDate(response.viewedAt)}</p>` : ''}
                            ${response.respondedAt ? `<p>Принятие решения: ${this.formatDate(response.respondedAt)}</p>` : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal-actions">
                <div class="action-buttons">
                    <button class="btn btn-view-resume" data-candidate-id="${candidate.id}">
                        Резюме
                    </button>
                </div>
                
                <div class="employer-notes">
                    <h4>Ваши заметки</h4>
                    <textarea class="notes-textarea" placeholder="Добавьте заметки об этом кандидате...">${response.employerNotes || ''}</textarea>
                    <button class="btn btn-secondary" id="saveNotes">Сохранить заметки</button>
                </div>
            </div>
        `;
    }

    // Вспомогательные методы
    getStatusText(status) {
        const statusMap = {
            'NEW': 'Новый',
            'INVITED': 'Приглашен',
            'REJECTED': 'Отклонен'
        };
        return statusMap[status] || status;
    }

    getInitials(name) {
        if (!name) return '👤';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    formatTimeAgo(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'только что';
        if (diffMins < 60) return `${diffMins} мин. назад`;
        if (diffHours < 24) return `${diffHours} ч. назад`;
        if (diffDays === 1) return 'вчера';
        if (diffDays < 7) return `${diffDays} дн. назад`;

        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long'
        });
    }

    formatSalary(salary) {
        return new Intl.NumberFormat('ru-RU').format(salary);
    }

    formatDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    createContactInfo(contacts) {
        if (!contacts) return '';

        let html = '<div class="contact-grid">';

        if (contacts.email) {
            html += `
                <div class="contact-item">
                    <span class="contact-icon"> <img src="../../images/icons/email-contact.svg" alt="Email" style="width: 28px; height: 28px;"></span>
                    <a href="mailto:${contacts.email}" class="contact-link">${contacts.email}</a>
                </div>
            `;
        }

        if (contacts.phoneNumber) {
            html += `
                <div class="contact-item">
                    <span class="contact-icon"><img src="../../images/icons/phone.svg" alt="Телефон" style="width: 28px; height: 28px;"></span>
                    <a href="tel:${contacts.phoneNumber}" class="contact-link">${contacts.phoneNumber}</a>
                </div>
            `;
        }

        if (contacts.telegram) {
            html += `
                <div class="contact-item">
                    <span class="contact-icon"><img src="../../images/icons/telegram-contact.png" alt="Telegram" style="width: 28px; height: 28px;"></span>
                    <a href="https://t.me/${contacts.telegram}" target="_blank" class="contact-link">${contacts.telegram}</a>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    // Привязка событий к карточке
    bindCardEvents(cardElement, manager) {
        // Клик по карточке для открытия деталей
        cardElement.addEventListener('click', (e) => {
            // Если клик не по кнопке действия
            if (!e.target.closest('.response-actions')) {
                const responseId = cardElement.dataset.responseId;
                manager.openResponseDetail(responseId);
            }
        });

        // Кнопки действий
        const buttons = cardElement.querySelectorAll('[data-action]');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const responseId = cardElement.dataset.responseId;

                switch (action) {
                    case 'invite':
                        manager.inviteCandidate(responseId);
                        break;
                    case 'reject':
                        manager.rejectResponse(responseId);
                        break;
                }
            });
        });

        // Кнопка просмотра профиля
        const viewProfileBtn = cardElement.querySelector('.btn-view-profile');
        if (viewProfileBtn) {
            viewProfileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const candidateId = viewProfileBtn.dataset.candidateId;
                manager.viewCandidateProfile(candidateId);
            });
        }

        // Кнопка связи
        const contactBtn = cardElement.querySelector('.btn-contact');
        if (contactBtn) {
            contactBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const candidateId = contactBtn.dataset.candidateId;
                manager.contactCandidate(candidateId);
            });
        }
    }

    // Привязка событий к модальному окну
    bindModalEvents(modalElement, responseId, manager) {
        // Закрытие модального окна
        const closeBtn = modalElement.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                manager.closeResponseDetail();
            });
        }

        // Клик по оверлею
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) {
                manager.closeResponseDetail();
            }
        });

        // Сохранение статуса
        const saveStatusBtn = modalElement.querySelector('#saveStatus');
        if (saveStatusBtn) {
            saveStatusBtn.addEventListener('click', () => {
                const statusSelect = modalElement.querySelector('#statusSelect');
                const newStatus = statusSelect.value;
                manager.updateResponseStatus(responseId, newStatus);
            });
        }

        // Сохранение заметок
        const saveNotesBtn = modalElement.querySelector('#saveNotes');
        if (saveNotesBtn) {
            saveNotesBtn.addEventListener('click', () => {
                const notesTextarea = modalElement.querySelector('.notes-textarea');
                const notes = notesTextarea.value;
                manager.saveResponseNotes(responseId, notes);
            });
        }

        // Другие кнопки в модалке
        const actionButtons = modalElement.querySelectorAll('[data-candidate-id]');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const candidateId = btn.dataset.candidateId;

                if (btn.classList.contains('btn-view-resume')) {
                    manager.viewCandidateResume(candidateId);
                } else if (btn.classList.contains('btn-contact-candidate')) {
                    manager.contactCandidate(candidateId);
                } else if (btn.classList.contains('btn-schedule')) {
                    manager.scheduleInterview(candidateId);
                }
            });
        });
    }
}

const applicationComponent = new ApplicationComponent();