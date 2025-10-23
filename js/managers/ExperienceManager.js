class ExperienceManager {
    constructor() {
        this.experiences = [];
        this.currentEditId = null;
        this.isInitialized = false;
    }

    // ============ ИНИЦИАЛИЗАЦИЯ ============
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
        const pressedAddButton = document.getElementById('addExperienceBtn');
        const pressedCancelButton = document.getElementById('cancelBtn');
        const form = document.getElementById('experienceFormElement');

        if (pressedAddButton) {
            pressedAddButton.addEventListener('click', () => this.showForm());
        }

        if (pressedCancelButton) {
            pressedCancelButton.addEventListener('click', () => this.hideForm());
        }

        if (form) {
            form.addEventListener('submit', (e) => this.onExperienceAction(e));
        }
    }

    // ============ ФОРМА ============
    showForm(experience = null) {
        const form = document.getElementById('experienceForm');
        const formTitle = document.getElementById('formTitle');
        const saveButton = document.getElementById('saveButton');
        const updateButton = document.getElementById('updateButton');

        if (experience) {
            // Если режим редактирования существующей записи
            formTitle.textContent = 'Редактировать опыт работы';
            this.fillForm(experience);
            this.currentEditId = experience.id;

            // Показываем кнопку "Обновить", скрываем "Сохранить"
            saveButton.style.display = 'none';
            updateButton.style.display = 'block';
        } else {
            // Если режим добавления новой записи
            formTitle.textContent = 'Добавить опыт работы';
            this.clearForm();
            this.currentEditId = null;

            // Показываем кнопку "Сохранить", скрываем "Обновить"
            saveButton.style.display = 'block';
            updateButton.style.display = 'none';
        }

        form.style.display = 'block';
        form.scrollIntoView({behavior: 'smooth'});
    }

    hideForm() {
        const form = document.getElementById('experienceForm');
        const saveButton = document.getElementById('saveButton');
        const updateButton = document.getElementById('updateButton');

        if (form) {
            form.style.display = 'none';
        }

        // Всегда показываем кнопку "Сохранить" при скрытии формы
        saveButton.style.display = 'block';
        updateButton.style.display = 'none';
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

    // ============ ОБРАБОТЧИКИ ФОРМЫ ============
    /** Определяем какая кнопка была нажата на форме опыта работы*/
    async onExperienceAction(event) {
        event.preventDefault();

        const clickedButton = event.submitter;
        const formData = this.collectFormData();

        // Проверяем валидацию
        if (!this.validateFormData(formData)) {
            return;
        }

        if (clickedButton.id === 'saveButton') {
            await this.createExperience(formData);
        } else if (clickedButton.id === 'updateButton') {
            await this.updateExperience(formData);
        }
    }

    /** Валидация данных с формы*/
    validateFormData(formData) {
        if (!formData.company || !formData.position || !formData.period) {
            this.showError('Заполните обязательные поля');
            return false; // возвращаем false при ошибке
        }
        return true; // возвращаем true если все ок
    }

    collectFormData() {
        return {
            company: document.getElementById('companyName').value.trim(),
            position: document.getElementById('position').value.trim(),
            period: document.getElementById('workPeriod').value.trim(),
            description: document.getElementById('workDescription').value.trim(),
            isCurrent: document.getElementById('currentJob').checked
        };
    }

    // ============ API ОПЕРАЦИИ ============
    /** Создание новой записи об опыте работы*/
    async createExperience(experienceData) {
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

            if (!response.ok) {
                throw new Error(response.message);
            }

            const savedExperience = await response.json();

            this.experiences.unshift(savedExperience);

            // Обновляем интерфейс
            this.render();
            this.hideForm();
            this.showSuccess('Опыт работы добавлен');
        } catch (error) {
            this.showError('Ошибка сохранения');
        } finally {
            Helpers.hideMessage()
        }
    }

    /** Обновление редактируемой записи опыта работы*/
    async updateExperience(experienceData) {
        this.showLoading('Обновляем запись...');

        try {
            const response = await fetch(`https://hireme.serveo.net/work-experience/${this.currentEditId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(experienceData),
                });

            if (response.ok) {
                this.showSuccess('Изменен опыт работы');
            }

            const updatedExperience = await response.json();

            // Обновляем существующую запись
            this.experiences = this.experiences.map(exp =>
                exp.id === this.currentEditId ? updatedExperience : exp
            );

            // Обновляем интерфейс
            this.render();
            this.hideForm();
            this.showSuccess('Данные обновлены');
        } catch (error) {
            this.showError('Ошибка обновления');
        } finally {
            Helpers.hideMessage()
        }
    }

    /** Удаление записи об опыте*/
    async deleteExperienceRecord(id) {
        if (!confirm('Вы уверены, что хотите удалить этот опыт работы?')) return;

        this.showLoading('Удаление...');

        try {
            const response = await fetch(`https://hireme.serveo.net/work-experience/${id}`,
                {
                    method: 'DELETE',
                });

            if (response.ok) {
                this.showSuccess('Опыт работы удален');
            }
            this.experiences = this.experiences.filter(exp => exp.id !== id);
            this.render();
        } catch (error) {
            this.showError('Ошибка удаления');
        } finally {
            Helpers.hideMessage()
        }
    }

    // ============ ОТОБРАЖЕНИЕ ============
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
                            onclick="app.profileManager.managers.experience.editExperienceRecord(${exp.id})">
                        ✏️
                    </button>
                    <button class="action-btn delete-btn" 
                            onclick="app.profileManager.managers.experience.deleteExperienceRecord(${exp.id})">
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
    // Метод для форматирования периода
    formatPeriod(startDate, endDate, isCurrent) {
        const start = startDate;
        let end = endDate;

        if (isCurrent) {
            end = 'По настоящее время'; // Если текущая работа
        }

        return `${start} - ${end}`;
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

    // ============ ВСПОМОГАТЕЛЬНЫЕ ============
    showLoading(text) {
        Helpers.showMessage(text, 'loading');
    }

    showSuccess(text) {
        Helpers.showMessage(text, 'success');
    }

    showError(text) {
        Helpers.showMessage(text, 'error');
    }

    // ============ ОСТАЛЬНЫЕ ============
    editExperienceRecord(id) {
        const experience = this.experiences.find(exp => exp.id === id);
        if (experience) {
            this.showForm(experience);
        }
    }
}