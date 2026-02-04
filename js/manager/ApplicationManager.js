class ApplicationManager {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.api = apiService;
        this.profileData = null;
        this.navigation = new NavigationService();
        this.responses = this.generateTestResponses(); // Тестовые данные
        this.vacancies = this.generateTestVacancies(); // Тестовые вакансии
        this.currentFilter = 'all';
        this.selectedVacancy = 'all';
        this.responseCard = applicationCardComponent;
    }

    async init() {
        try {
            this.navigation.init();

            // Для тестов - создаем фейковый профиль работодателя
            this.profileData = {
                employer: {
                    id: 1,
                    name: 'Алексей Петров',
                    position: 'HR-менеджер в Real Estate Agency'
                }
            };

            // Или загружаем реальный профиль, если есть
            // this.profileData = await ProfileService.loadProfile();

            this.renderResponses();
            this.bindEvents();
            this.updateCounters();

            console.log('ApplicationManager initialized with test data');

        } catch (error) {
            console.error('ApplicationManager init error:', error);
        }
    }

    // Генерация тестовых вакансий
    generateTestVacancies() {
        return [
            {
                id: 101,
                title: 'Агент по продаже элитной недвижимости',
                companyName: 'Elite Properties',
                salary: {from: 250000, to: 500000},
                workFormat: 'Гибрид'
            },
            {
                id: 102,
                title: 'Менеджер по аренде коммерческой недвижимости',
                companyName: 'Real Estate Agency',
                salary: {from: 150000, to: 300000},
                workFormat: 'Офис'
            },
            {
                id: 103,
                title: 'Брокер по жилой недвижимости',
                companyName: 'Домовёнок',
                salary: {from: 120000, to: 250000},
                workFormat: 'Удаленно'
            }
        ];
    }

    // Генерация тестовых откликов
    generateTestResponses() {
        return [
            {
                id: 1,
                vacancyId: 101,
                vacancyTitle: 'Агент по продаже элитной недвижимости',
                status: 'new',
                appliedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 минут назад
                viewedAt: null,
                employerNotes: '',
                candidate: {
                    id: 201,
                    name: 'Анна Смирнова',
                    desiredPosition: 'Senior Real Estate Agent',
                    experience: '7 лет 3 мес',
                    desiredSalary: 450000,
                    location: 'Москва',
                    contacts: {
                        email: 'anna.smirnova@example.com',
                        phone: '+7 (915) 123-45-67',
                        telegram: 'anna_smirnova'
                    }
                },
            },
            {
                id: 3,
                vacancyId: 102,
                vacancyTitle: 'Менеджер по аренде коммерческой недвижимости',
                status: 'new',
                appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 день назад
                viewedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 часов назад
                employerNotes: 'Интересный кандидат, назначить собеседование на следующей неделе',
                candidate: {
                    id: 203,
                    name: 'Сергей Иванов',
                    desiredPosition: 'Коммерческий брокер',
                    experience: '5 лет 8 мес',
                    desiredSalary: 280000,
                    location: 'Москва',
                    contacts: {
                        email: 's.ivanov@example.com',
                        phone: '+7 (903) 555-44-33',
                        telegram: 's_ivanov_commercial'
                    }
                },
            },
            {
                id: 5,
                vacancyId: 103,
                vacancyTitle: 'Брокер по жилой недвижимости',
                status: 'rejected',
                appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 дня назад
                viewedAt: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(), // 60 часов назад
                employerNotes: 'Не подходит - нужен офисный сотрудник',
                candidate: {
                    id: 205,
                    name: 'Михаил Козлов',
                    desiredPosition: 'Удаленный брокер',
                    experience: '3 года',
                    desiredSalary: 180000,
                    location: 'Санкт-Петербург',
                    contacts: {
                        email: 'kozlov@example.com',
                        phone: '+7 (812) 333-22-11',
                        telegram: 'kozlov_remote'
                    }
                },
            },
        ];
    }

    async loadData() {
        this.showLoadingState();

        // Имитация загрузки данных
        setTimeout(() => {
            this.hideLoadingState();
            this.renderResponses();
            this.updateCounters();

            // Скрываем пустое состояние
            const emptyState = document.getElementById('emptyState');
            if (emptyState) {
                emptyState.style.display = 'none';
            }
        }, 1000);
    }

    renderResponses() {
        const groupedContainer = document.getElementById('responsesGrouped');
        const flatContainer = document.getElementById('responsesFlat');

        if (!groupedContainer || !flatContainer) return;

        // Очищаем контейнеры
        groupedContainer.innerHTML = '';
        flatContainer.innerHTML = '';

        // Фильтруем отклики
        let filteredResponses = this.filterResponses(this.responses);

        if (filteredResponses.length === 0) {
            this.showEmptyState();
            return;
        }

        // Группируем по вакансиям
        const groupedByVacancy = this.groupByVacancy(filteredResponses);

        // Рендерим группированный вид
        Object.keys(groupedByVacancy).forEach(vacancyId => {
            const vacancyResponses = groupedByVacancy[vacancyId];
            const vacancy = this.vacancies.find(v => v.id == vacancyId) || {
                id: vacancyId,
                title: vacancyResponses[0]?.vacancyTitle || 'Вакансия'
            };

            const vacancyGroup = this.createVacancyGroup(vacancy, vacancyResponses);
            groupedContainer.appendChild(vacancyGroup);
        });
    }

    createVacancyGroup(vacancy, responses) {
        const groupElement = document.createElement('div');
        groupElement.className = 'vacancy-group';
        groupElement.dataset.vacancyId = vacancy.id;

        const newCount = responses.filter(r => r.status === 'new').length;
        const totalCount = responses.length;

        groupElement.innerHTML = `
            <div class="vacancy-group-header">
                <div class="vacancy-group-title">
                    <span>${vacancy.title || 'Без названия'}</span>
                    <span class="vacancy-group-count">${totalCount}</span>
                    ${newCount > 0 ? `<span class="vacancy-group-count new">+${newCount}</span>` : ''}
                </div>
                <span class="vacancy-group-arrow">▼</span>
            </div>
            <div class="vacancy-group-content">
                ${responses.map(response =>
            this.responseCard.createGroupedCard(response)
        ).join('')}
            </div>
        `;

        // Привязываем события к группе
        const header = groupElement.querySelector('.vacancy-group-header');
        const content = groupElement.querySelector('.vacancy-group-content');
        const arrow = groupElement.querySelector('.vacancy-group-arrow');

        header.addEventListener('click', () => {
            groupElement.classList.toggle('expanded');
            arrow.textContent = groupElement.classList.contains('expanded') ? '▲' : '▼';
        });

        // Привязываем события к карточкам откликов
        setTimeout(() => {
            const responseCards = groupElement.querySelectorAll('.response-card');
            responseCards.forEach(card => {
                this.responseCard.bindCardEvents(card, this);
            });
        }, 100);

        // Разворачиваем группу, если есть новые отклики
        if (newCount > 0) {
            groupElement.classList.add('expanded');
            arrow.textContent = '▲';
        }

        return groupElement;
    }

    filterResponses(responses) {
        let filtered = [...responses];

        // Фильтр по статусу
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(response => response.status === this.currentFilter);
        }

        // Фильтр по вакансии
        if (this.selectedVacancy !== 'all') {
            filtered = filtered.filter(response => response.vacancyId == this.selectedVacancy);
        }

        return filtered;
    }

    groupByVacancy(responses) {
        return responses.reduce((groups, response) => {
            const vacancyId = response.vacancyId || 'unknown';
            if (!groups[vacancyId]) {
                groups[vacancyId] = [];
            }
            groups[vacancyId].push(response);
            return groups;
        }, {});
    }

    updateCounters() {
        const allCount = this.responses.length;
        const newCount = this.responses.filter(r => r.status === 'new').length;

        // Обновляем счетчики в табах
        const countAll = document.getElementById('countAll');
        const countNew = document.getElementById('countNew');

        if (countAll) countAll.textContent = allCount;
        if (countNew) countNew.textContent = newCount;

        // Обновляем бейдж в хедере
        const badge = document.getElementById('newResponsesCount');
        if (badge) {
            badge.textContent = newCount;
            if (newCount > 0) {
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    bindEvents() {
        // Фильтры по статусу
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                this.currentFilter = tab.dataset.filter;
                this.renderResponses();
            });
        });

        // Фильтр по вакансии
        const vacancyFilter = document.querySelector('.filter-select');
        if (vacancyFilter) {
            vacancyFilter.addEventListener('change', (e) => {
                this.selectedVacancy = e.target.value;
                this.renderResponses();
            });
        }

        // Кнопка назад
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.history.back();
            });
        }
    }

    // Методы для действий с откликами (имитация)
    async updateResponseStatus(responseId, newStatus) {
        console.log(`Changing response ${responseId} status to ${newStatus}`);

        // Имитация запроса
        return new Promise((resolve) => {
            setTimeout(() => {
                // Обновляем локальные данные
                const index = this.responses.findIndex(r => r.id == responseId);
                if (index !== -1) {
                    this.responses[index].status = newStatus;
                    this.responses[index].viewedAt = new Date().toISOString();
                }

                // Показываем уведомление
                const statusText = this.responseCard.getStatusText(newStatus);
                notification.success(`Статус изменен на "${statusText}"`);

                // Перерендериваем
                this.renderResponses();
                this.updateCounters();
                this.closeResponseDetail();

                resolve();
            }, 500);
        });
    }

    async inviteCandidate(responseId) {
        await this.updateResponseStatus(responseId, 'invited');
    }

    async rejectResponse(responseId) {
        await this.updateResponseStatus(responseId, 'rejected');
    }

    async saveResponseNotes(responseId, notes) {
        console.log(`Saving notes for response ${responseId}:`, notes);

        // Имитация сохранения
        setTimeout(() => {
            // Обновляем локальные данные
            const index = this.responses.findIndex(r => r.id == responseId);
            if (index !== -1) {
                this.responses[index].employerNotes = notes;
            }

            notification.success('Заметки сохранены');
        }, 500);
    }

    // Методы для навигации (имитация)
    viewCandidateProfile(candidateId) {
        notification.info('В реальном приложении здесь открывался бы профиль кандидата');
    }

    viewCandidateResume(candidateId) {
        notification.info('В реальном приложении здесь открывалось бы резюме кандидата');
    }

    scheduleInterview(candidateId) {
        notification.info('В реальном приложении здесь можно было бы запланировать собеседование');
    }

    openResponseDetail(responseId) {
        console.log('Opening response detail:', responseId);

        const response = this.responses.find(r => r.id == responseId);
        if (!response) return;

        const modal = document.getElementById('responseModal');
        const modalContent = modal.querySelector('.modal-content');

        if (!modal || !modalContent) return;

        modalContent.innerHTML = this.responseCard.createModalContent(response);
        modal.style.display = 'flex';

        // Привязываем события к модалке
        setTimeout(() => {
            this.responseCard.bindModalEvents(modal, responseId, this);
        }, 100);
    }

    closeResponseDetail() {
        const modal = document.getElementById('responseModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Вспомогательные методы для UI состояний
    showLoadingState() {
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');

        if (loadingState) loadingState.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
    }

    hideLoadingState() {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) loadingState.style.display = 'none';
    }

    showEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const groupedContainer = document.getElementById('responsesGrouped');
        const flatContainer = document.getElementById('responsesFlat');

        if (emptyState) emptyState.style.display = 'block';
        if (groupedContainer) groupedContainer.innerHTML = '';
        if (flatContainer) flatContainer.innerHTML = '';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('ApplicationManager starting with test data...');
    const applicationManager = new ApplicationManager();
    applicationManager.init();
});