class ApplicationManager {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.api = apiService;
        this.navigation = new NavigationService();

        this.profileData = null;
        this.responses = [];

        this.responseCard = applicationComponent;
    }

    async init() {
        try {
            this.navigation.init();
            this.profileData = await ProfileService.loadProfile();
            await this.loadEmployerResponses();

            this.renderResponses();
            this.updateCounters();
        } catch (error) {
            console.error('ApplicationManager init error:', error);
        }
    }

    async loadEmployerResponses() {
        const employerId = this.profileData?.employer?.id;
        if (!employerId) return;

        try {
            const response = await this.api.get(`/application/employer/${employerId}`);
            this.responses = response.data;
        } catch (error) {
            console.error('Ошибка загрузки откликов:', error);
            notification.error('Не удалось загрузить отклики');
        }
    }

    renderResponses() {
        const container = document.getElementById('responsesGrouped');
        if (!container) return;

        container.innerHTML = '';

        if (!this.responses || this.responses.length === 0) {
            this.showEmptyState();
            return;
        }

        // Группируем все имеющиеся отклики
        const groups = this.groupByVacancy(this.responses);

        Object.keys(groups).forEach(id => {
            const groupData = groups[id];
            const title = groupData[0]?.vacancyTitle || 'Вакансия';
            const groupEl = this.createVacancyGroup({ id, title }, groupData);
            container.appendChild(groupEl);
        });
    }

    createVacancyGroup(vacancy, responses) {
        const groupElement = document.createElement('div');
        groupElement.className = 'vacancy-group';

        const newCount = responses.filter(r => r.status === 'NEW').length;

        groupElement.innerHTML = `
            <div class="vacancy-group-header">
                <div class="vacancy-group-title">
                    <span>${vacancy.title}</span>
                    <span class="vacancy-group-count">${responses.length}</span>
                    ${newCount > 0 ? `<span class="vacancy-group-count new">+${newCount}</span>` : ''}
                </div>
                <span class="vacancy-group-arrow">▼</span>
            </div>
            <div class="vacancy-group-content">
                ${responses.map(r => this.responseCard.createGroupedCard(r)).join('')}
            </div>
        `;

        groupElement.querySelector('.vacancy-group-header').addEventListener('click', () => {
            groupElement.classList.toggle('expanded');
        });

        // Привязываем события к карточкам внутри группы
        groupElement.querySelectorAll('.response-card').forEach(card => {
            this.responseCard.bindCardEvents(card, this);
        });

        if (newCount > 0) groupElement.classList.add('expanded');
        return groupElement;
    }

    // --- Логика действий ---
    async updateResponseStatus(applicationId, newStatus) {
        try {
            const response = await this.api.put(`/application/${applicationId}/status`, { status: newStatus });

            if (response.status === 200) {
                const index = this.responses.findIndex(r => r.id == applicationId);
                if (index !== -1) {
                    this.responses[index].status = newStatus;
                }

                notification.success(`Статус: ${this.responseCard.getStatusText(newStatus)}`);
                this.renderResponses();
                this.updateCounters();
            }
        } catch (error) {
            notification.error('Ошибка обновления статуса');
        }
    }

    async inviteCandidate(id) { await this.updateResponseStatus(id, 'INVITED'); }
    async rejectResponse(id) { await this.updateResponseStatus(id, 'REJECTED'); }

    groupByVacancy(responses) {
        return responses.reduce((groups, r) => {
            const id = r.vacancyId || 'unknown';
            if (!groups[id]) groups[id] = [];
            groups[id].push(r);
            return groups;
        }, {});
    }

    updateCounters() {
        const countAll = document.getElementById('countAll');
        if (countAll) {
            countAll.textContent = this.responses.length;
        }
    }

    showEmptyState() {
        const empty = document.getElementById('emptyState');
        const container = document.getElementById('responsesGrouped');
        if (empty) empty.style.display = 'block';
        if (container) container.innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const applicationManager = new ApplicationManager();
    applicationManager.init();
});