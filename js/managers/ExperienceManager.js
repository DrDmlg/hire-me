class ExperienceManager {
    constructor() {
        this.experiences = [];
        this.currentEditId = null;
        this.isInitialized = false;
    }

    init(experiences = []) {
        if (this.isInitialized) return;

        try {
            this.experiences = experiences;
            this.render();      // ← СНАЧАЛА создаем кнопку
            this.bindEvents();  // ← ПОТОМ навешиваем обработчики
            this.isInitialized = true;
            console.log('ExperienceManager initialized with data');
        } catch (error) {
            console.error('ExperienceManager init error:', error);
            this.showError('Не удалось инициализировать опыт работы');
        }
    }

    bindEvents() {
        const addBtn = document.getElementById('addExperienceBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const form = document.getElementById('experienceFormElement');

        if (addBtn) {
            addBtn.addEventListener('click', () => this.showForm());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideForm());
        }

        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    render() {
        const container = document.getElementById('experienceList');
        if (!container) return;

        if (this.experiences.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        container.innerHTML = this.experiences.map(exp => {
            // Вычисляем period из startDate и endDate
            const period = this.formatPeriod(exp.startDate, exp.endDate, exp.isCurrent);

            return `
            <div class="experience-item fade-in ${exp.isCurrent ? '' : 'past'}" data-id="${exp.id}">
                <div class="experience-actions">
                    <button class="action-btn edit-btn" 
                            onclick="app.profileManager.managers.experience.edit(${exp.id})">
                        ✏️
                    </button>
                    <button class="action-btn delete-btn" 
                            onclick="app.profileManager.managers.experience.delete(${exp.id})">
                        🗑️
                    </button>
                </div>
                <div class="experience-company">${Helpers.escapeHtml(exp.company)}</div>
                <div class="experience-position">${Helpers.escapeHtml(exp.position)}</div>
                <div class="experience-period">${Helpers.escapeHtml(period)}</div>
                <div class="experience-description">${Helpers.escapeHtml(exp.description || 'Описание не указано')}</div>
            </div>
        `;
        }).join('');
    }

    // Добавь метод для форматирования периода
    formatPeriod(startDate, endDate, isCurrent) {
        const start = startDate;

        let end = 'По настоящее время';
        if (isCurrent) {
           end = endDate;
        } else {
            end = ' настоящее время';
        }

        return `${start} - ${end}`;
    }

    showForm(experience = null) {
        const form = document.getElementById('experienceForm');
        const formTitle = document.getElementById('formTitle');

        if (experience) {
            // Режим редактирования
            formTitle.textContent = 'Редактировать опыт работы';
            this.fillForm(experience);
            this.currentEditId = experience.id;
        } else {
            // Режим добавления
            formTitle.textContent = 'Добавить опыт работы';
            this.clearForm();
            this.currentEditId = null;
        }

        form.style.display = 'block';
        form.scrollIntoView({behavior: 'smooth'});
    }

    hideForm() {
        const form = document.getElementById('experienceForm');
        if (form) {
            form.style.display = 'none';
        }
        this.clearForm();
        this.currentEditId = null;
    }

    fillForm(experience) {
        document.getElementById('companyName').value = experience.company;
        document.getElementById('position').value = experience.position;
        document.getElementById('workPeriod').value = experience.period;
        document.getElementById('workDescription').value = experience.description || '';
        document.getElementById('currentJob').checked = experience.isCurrent;
    }

    clearForm() {
        const form = document.getElementById('experienceFormElement');
        if (form) {
            form.reset();
        }
    }

    async handleFormSubmit(event) {
        event.preventDefault();

        const formData = {
            company: document.getElementById('companyName').value.trim(),
            position: document.getElementById('position').value.trim(),
            period: document.getElementById('workPeriod').value.trim(),
            description: document.getElementById('workDescription').value.trim(),
            isCurrent: document.getElementById('currentJob').checked
        };

        // Валидация
        if (!formData.company || !formData.position || !formData.period) {
            this.showError('Заполните обязательные поля');
            return;
        }

        await this.saveExperience(formData);
    }

    async saveExperience(experienceData) {
        this.showLoading('Сохранение...');

        try {
            let telegramUserId = Helpers.getTelegramUserId();
            const response = await fetch(`https://hireme.serveo.net/work-experience/${telegramUserId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(experienceData),
                });

            if (this.currentEditId) {
                // Обновление существующей записи
                await this.updateExperience(this.currentEditId, experienceData);
            } else {
                // Создание новой записи
                await this.createExperience(experienceData);
            }

        } catch (error) {
            this.showError('Ошибка сохранения');
        }
    }

    async createExperience(experienceData) {
        // Имитация API вызова
        const newExperience = {
            id: Date.now(),
            ...experienceData,
            createdAt: new Date().toISOString()
        };

        this.experiences.unshift(newExperience);
        this.render();
        this.hideForm();
        this.showSuccess('Опыт работы добавлен');
    }

    async updateExperience(id, experienceData) {
        // Имитация API вызова
        this.experiences = this.experiences.map(exp =>
            exp.id === id ? {...exp, ...experienceData} : exp
        );

        this.render();
        this.hideForm();
        this.showSuccess('Данные обновлены');
    }

    async deleteExperience(id) {
        if (!confirm('Вы уверены, что хотите удалить этот опыт работы?')) return;

        this.showLoading('Удаление...');

        try {
            // Имитация API вызова
            await Helpers.delay(600);

            this.experiences = this.experiences.filter(exp => exp.id !== id);
            this.render();
            this.showSuccess('Опыт работы удален');
        } catch (error) {
            this.showError('Ошибка удаления');
        }
    }

    getEmptyState() {
        return `
            <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">💼</div>
                <div style="font-weight: 500; margin-bottom: 0.5rem;">Опыт работы пока не добавлен</div>
                <div style="font-size: 0.9rem;">Нажмите "+" чтобы добавить первое место работы</div>
            </div>
        `;
    }

    // Публичные методы для вызова из HTML
    edit(id) {
        const experience = this.experiences.find(exp => exp.id === id);
        if (experience) {
            this.showForm(experience);
        }
    }

    delete(id) {
        this.deleteExperience(id);
    }

    showLoading(text) { Helpers.showMessage(text, 'loading'); }
    showSuccess(text) { Helpers.showMessage(text, 'success'); }
    showError(text) { Helpers.showMessage(text, 'error'); }
}