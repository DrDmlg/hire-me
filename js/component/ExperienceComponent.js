class ExperienceComponent {
    constructor() {
        this.experiences = [];
        this.currentEditId = null;
        this.api = apiService;
    }

    // ============ ИНИЦИАЛИЗАЦИЯ ============
    async init(experiences = []) {
        try {
            this.experiences = experiences;
            this.render();
            this.bindEvents();
            console.log('ExperienceComponent initialized with data');
        } catch (error) {
            console.error('ExperienceComponent init error:', error);
            notification.error('Не удалось инициализировать опыт работы');
        }
    }

    bindEvents() {
        const experienceList = document.getElementById('experienceList');
        const pressedAddButton = document.getElementById('addExperienceBtn');
        const pressedCancelButton = document.getElementById('cancelBtn');
        const form = document.getElementById('experienceFormElement');

        // Находим элементы счетчика
        const workDescription = document.getElementById('workDescription');
        const charCount = document.getElementById('charCount');

        const currentJobCheckbox = document.getElementById('currentJob');
        const endDateGroup = document.getElementById('endDateGroup');

        if (pressedAddButton) {
            pressedAddButton.addEventListener('click', () => this.showForm());
        }

        if (pressedCancelButton) {
            pressedCancelButton.addEventListener('click', () => this.hideForm());
        }

        if (form) {
            form.addEventListener('submit', (e) => this.onExperienceAction(e));
        }

        currentJobCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                endDateGroup.classList.add('hidden-period');
            } else {
                endDateGroup.classList.remove('hidden-period');
            }
        });

        // Логика счетчика символов
        if (workDescription && charCount) {
            workDescription.addEventListener('input', () => {
                const length = workDescription.value.length;
                charCount.textContent = length;

                // Подсвечиваем красным, если лимит почти исчерпан (например, 950+)
                if (length >= 950) {
                    charCount.parentElement.classList.add('limit-reached');
                } else {
                    charCount.parentElement.classList.remove('limit-reached');
                }
            });
        }

        // 💡 Делегирование событий для edit/delete
        if (experienceList) {
            experienceList.addEventListener('click', (event) => {
                const editBtn = event.target.closest('.edit-btn');
                const deleteBtn = event.target.closest('.delete-btn');
                const description = event.target.closest('.experience-description');

                if (editBtn) {
                    const id = parseInt(editBtn.closest('.experience-item').dataset.id);
                    this.editExperienceRecord(id);
                } else if (deleteBtn) {
                    const id = parseInt(deleteBtn.closest('.experience-item').dataset.id);
                    this.deleteExperienceRecord(id);
                } else if (description) {
                    description.classList.toggle('expanded');
                }
            });
        }
    }

    // ============ ФОРМА ============
    showForm(experience = null) {
        const form = document.getElementById('experienceForm');
        const list = document.getElementById('experienceList');
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
        if (list) list.style.display = 'none';
        form.scrollIntoView({behavior: 'smooth'});
    }

    hideForm() {
        const form = document.getElementById('experienceForm');
        const list = document.getElementById('experienceList');
        const saveButton = document.getElementById('saveButton');
        const updateButton = document.getElementById('updateButton');

        if (form) {
            form.style.display = 'none';
        }
        if (list) {
            list.style.display = 'block';
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
        document.getElementById('workDescription').value = experience.description || '';
        document.getElementById('currentJob').checked = experience.isCurrent;

        if (experience.startDate) {
            const start = new Date(experience.startDate);
            document.getElementById('startMonth').value = start.getMonth();
            document.getElementById('startYear').value = start.getFullYear();
        }

        const endDateGroup = document.getElementById('endDateGroup');
        if (experience.isCurrent) {
            endDateGroup.classList.add('hidden-period');
        } else if (experience.endDate) {
            const end = new Date(experience.endDate);
            document.getElementById('endMonth').value = end.getMonth();
            document.getElementById('endYear').value = end.getFullYear();
            endDateGroup.classList.remove('hidden-period');
        }
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
        // Проверяем обязательные текстовые поля и дату начала
        if (!formData.company || !formData.position || !formData.startDate) {
            notification.error('Заполните обязательные поля и дату начала');
            return false;
        }

        // Если это не текущая работа, проверяем дату окончания
        if (!formData.isCurrent) {
            if (!formData.endDate) {
                notification.error('Укажите дату окончания или "Текущее место"');
                return false;
            }
            // Проверка: начало не может быть позже конца
            if (new Date(formData.startDate) > new Date(formData.endDate)) {
                notification.error('Дата начала не может быть позже окончания');
                return false;
            }
        }
        return true;
    }

    collectFormData() {
        const isCurrent = document.getElementById('currentJob').checked;

        // Вспомогательная функция для сборки даты в формат YYYY-MM-DD
        const formatDate = (monthId, yearId) => {
            const monthVal = document.getElementById(monthId).value;
            const yearVal = document.getElementById(yearId).value;

            if (monthVal === "" || !yearVal) return null;

            const month = parseInt(monthVal) + 1;
            return `${yearVal}-${String(month).padStart(2, '0')}-01`;
        };

        return {
            company: document.getElementById('companyName').value.trim(),
            position: document.getElementById('position').value.trim(),
            description: document.getElementById('workDescription').value.trim(),
            isCurrent: isCurrent,
            startDate: formatDate('startMonth', 'startYear'),
            endDate: isCurrent ? null : formatDate('endMonth', 'endYear')
        };
    }

    // ============ API ОПЕРАЦИИ ============
    /** Создание новой записи об опыте работы*/
    async createExperience(experienceData) {
        notification.process('Сохранение...');

        try {
            let telegramUserId = Helpers.getTelegramUserId();
            const response = await this.api.post(`/work-experience/${telegramUserId}`, experienceData)

            // добавляем новую запись в начало
            this.experiences.unshift(response.data);

            // Обновляем интерфейс
            this.render();
            this.hideForm();
            notification.success('Опыт работы добавлен')
        } catch (error) {
            notification.error('Ошибка сохранения');
        } finally {
            notification.hideAll();
        }
    }

    /** Обновление редактируемой записи опыта работы*/
    async updateExperience(experienceData) {
        notification.process('Обновляем запись...');

        try {

            const response = await this.api.put(`/work-experience/${this.currentEditId}`, experienceData);

            if (response.status === 200) {
                notification.success('Изменен опыт работы');
            }

            // Обновляем существующую запись
            this.experiences = this.experiences.map(exp =>
                exp.id === this.currentEditId ? response.data : exp
            );

            // Обновляем интерфейс
            this.render();
            this.hideForm();
            notification.success('Данные обновлены');
        } catch (error) {
            notification.error('Ошибка обновления')
        } finally {
            notification.hideAll();
        }
    }

    /** Удаление записи об опыте*/
    async deleteExperienceRecord(id) {
        notification.process('Удаление...')

        try {
            const response = await this.api.delete(`/work-experience/${id}`);

            if (response.status === 200) {
                notification.success('Опыт работы удален');
            }
            this.experiences = this.experiences.filter(experience => experience.id !== id);
            this.render();
        } catch (error) {
            notification.error('Ошибка удаления');
        } finally {
            notification.hideAll();
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
                 <button class="button-icon size-28 edit-btn">
                    <img src="../../images/icons/edit.svg" alt="Редактировать">
                </button>

                <button class="button-icon size-28 delete-btn">
                    <img src="../../images/icons/trash.svg" alt="Удалить">
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

    formatPeriod(startDate, endDate, isCurrent) {
        if (!startDate) return 'Дата не указана';

        const options = { month: 'long', year: 'numeric' };
        const start = new Date(startDate).toLocaleDateString('ru-RU', options);

        if (isCurrent) {
            return `${start} — по наст. время`;
        }

        const end = new Date(endDate).toLocaleDateString('ru-RU', options);
        return `${start} — ${end}`;
    }

    getEmptyState() {
        return `
        <div class="empty-state-minimal" onclick="document.getElementById('addExperienceBtn').click()">
            <span class="add-icon">+</span>
        </div>
    `;
    }

    // ============ ОСТАЛЬНЫЕ ============
    editExperienceRecord(id) {
        const experience = this.experiences.find(exp => exp.id === id);
        if (experience) {
            this.showForm(experience);
        }
    }
}