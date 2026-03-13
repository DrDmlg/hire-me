class ApplicationComponent {
    constructor() {
        this.api = apiService;
        this.tg = window.Telegram?.WebApp;
    }

    createGroupedCard(response) {
        const statusClass = `status-${response.status}`;
        const statusText = this.getStatusText(response.status);
        const candidate = response.candidate || {};
        const fullName = [candidate.lastName, candidate.firstName].filter(Boolean).join(' ') || 'Кандидат';
        const initials = this.getInitials(fullName);
        const timeAgo = this.formatTimeAgo(response.appliedAt);

        const avatarUrl = candidate.id
            ? `${this.api.BASE_URL}/file/avatar/${response.candidate.profileId}?t=${Date.now()}`
            : null;

        return `
            <div class="response-card ${response.status}" data-response-id="${response.id}">
                <div class="response-header">
                    <div class="avatar-container">
                        ${initials}
                        ${avatarUrl ? `<img src="${avatarUrl}" class="avatar-image" onerror="this.style.display='none'">` : ''}
                    </div>
                    
                    <div class="candidate-main">
                        <div class="candidate-name">
                            ${fullName}
                            <span class="response-status ${statusClass}">${statusText}</span>
                        </div>
                        
                        <div class="candidate-meta">
                            <span class="tag-pill"><span>${candidate.desiredPosition || 'Специалист'}</span></span>
                             ${candidate.experience ? `<span class="candidate-tag"><span>${candidate.experience}</span></span>` : ''}
                            ${candidate.desiredSalary ? `<span class="tag-salary"><span>от ${this.formatSalary(candidate.desiredSalary)} ₽</span></span>` : ''}
                        </div>
                        
                        <div class="response-time">${timeAgo}</div>
                    </div>
                </div>
                
                <div class="response-actions">
                    ${response.status === 'NEW' ? `
                    <button class="btn-invite" data-action="invite">Пригласить</button>
                    <button class="btn-reject" data-action="reject">Отклонить</button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    getStatusText(status) {
        const statusMap = { 'NEW': 'Новый', 'INVITED': 'Приглашен', 'REJECTED': 'Отклонен' };
        return statusMap[status] || status;
    }

    getInitials(name) {
        if (!name || name === 'Кандидат') return '';
        return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    formatTimeAgo(dateString) {
        if (!dateString) return '';
        const diffMs = new Date() - new Date(dateString);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'только что';
        if (diffMins < 60) return `${diffMins} мин. назад`;
        if (diffHours < 24) return `${diffHours} ч. назад`;
        if (diffDays === 1) return 'вчера';
        return new Date(dateString).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    }

    formatSalary(salary) {
        return new Intl.NumberFormat('ru-RU').format(salary);
    }

    bindCardEvents(cardElement, manager) {
        cardElement.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const id = cardElement.dataset.responseId;
                action === 'invite' ? manager.inviteCandidate(id) : manager.rejectResponse(id);
            });
        });
    }
}

const applicationComponent = new ApplicationComponent();