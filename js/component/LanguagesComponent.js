class LanguagesComponent {
    constructor() {
        this.languages = []; //Массив добавленных языков пользователя
        this.availableLanguagesNames = []; //Список доступных для выбора названий языков (получаем с бэкенда)
        this.availableLanguagesLevels = []; //Список доступных для выбора увроней владения языков (получаем с бэкенда)
        this.currentEditId = null;
        this.api = apiService;
        this.profileData = null;
    }

    // ============ ИНИЦИАЛИЗАЦИЯ ============
    async init(languages = [], profileData = null) {
        try {
            this.profileData = profileData;
            await this.loadAvailableLanguagesNames();
            await this.loadAvailableLanguagesLevels();
            this.languages = languages;
            this.renderLanguagesSelect();
            this.renderLevelsSelect();
            this.render();
            this.bindEvents();
            console.log('LanguagesComponent initialized with data:', this.languages);
        } catch (error) {
            console.error('LanguagesComponent init error:', error);
            notification.error('Не удалось инициализировать языки');
        }
    }

    /** Заполняет select названиями языков */
    renderLanguagesSelect() {
        const select = document.getElementById('languageName');
        if (!select) return;

        select.innerHTML = '<option value="">Выберите язык</option>';

        this.availableLanguagesNames.forEach(language => {
            const option = document.createElement('option');
            option.value = language;
            option.textContent = language;
            select.appendChild(option);
        });
    }

    /** Заполняет select уровнями владения */
    renderLevelsSelect() {
        const select = document.getElementById('languageLevel');
        if (!select) return;

        select.innerHTML = '<option value="">Выберите уровень</option>';

        this.availableLanguagesLevels.forEach(level => {
            const option = document.createElement('option');
            option.value = level; // Используем значение из бэкенда
            option.textContent = level;
            select.appendChild(option);
        });
    }

    bindEvents() {
        const addLanguageBtn = document.getElementById('addLanguageBtn');
        const languagesList = document.getElementById('languagesList');
        const cancelBtn = document.getElementById('cancelLanguageBtn');
        const form = document.getElementById('languageFormElement');

        if (addLanguageBtn) {
            addLanguageBtn.addEventListener('click', () => this.showForm());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideForm());
        }

        if (form) {
            form.addEventListener('submit', (e) => this.onLanguageAction(e));
        }

        // Делегирование событий для edit/delete
        if (languagesList) {
            languagesList.addEventListener('click', (event) => {
                const editBtn = event.target.closest('.edit-language-btn');
                const deleteBtn = event.target.closest('.delete-language-btn');

                if (editBtn) {
                    const id = parseInt(editBtn.closest('.language-item').dataset.id);
                    this.editLanguageRecord(id);
                } else if (deleteBtn) {
                    const languageId = parseInt(deleteBtn.closest('.language-item').dataset.id);
                    this.deleteLanguageRecord(languageId);
                }
            });
        }
    }

    // ============ ФОРМА ============
    showForm(language = null) {
        const form = document.getElementById('languageForm');
        const formTitle = document.getElementById('languageFormTitle');
        const saveButton = document.getElementById('saveLanguageButton');
        const updateButton = document.getElementById('updateLanguageButton');

        if (language) {
            // Режим редактирования
            formTitle.textContent = 'Редактировать язык';
            this.fillForm(language);
            this.currentEditId = language.id;
            saveButton.style.display = 'none';
            updateButton.style.display = 'block';
        } else {
            // Режим добавления
            formTitle.textContent = 'Добавить язык';
            this.clearForm();
            this.currentEditId = null;
            saveButton.style.display = 'block';
            updateButton.style.display = 'none';
        }

        form.style.display = 'block';
        form.scrollIntoView({behavior: 'smooth'});
    }

    hideForm() {
        const form = document.getElementById('languageForm');
        const saveButton = document.getElementById('saveLanguageButton');
        const updateButton = document.getElementById('updateLanguageButton');

        if (form) {
            form.style.display = 'none';
        }

        saveButton.style.display = 'block';
        updateButton.style.display = 'none';
        this.clearForm();
        this.currentEditId = null;
    }

    fillForm(language) {
        document.getElementById('languageName').value = language.name;
        document.getElementById('languageLevel').value = language.level;
    }

    clearForm() {
        const form = document.getElementById('languageFormElement');
        if (form) {
            form.reset();
        }
    }

    // ============ ОБРАБОТЧИКИ ФОРМЫ ============
    async onLanguageAction(event) {
        event.preventDefault();

        const clickedButton = event.submitter;
        const formData = this.collectFormData();

        if (!this.validateFormData(formData)) {
            return;
        }

        if (clickedButton.id === 'saveLanguageButton') {
            await this.createLanguage(formData);
        } else if (clickedButton.id === 'updateLanguageButton') {
            await this.updateLanguage(formData);
        }
    }

    validateFormData(formData) {
        if (!formData.name || !formData.level) {
            notification.error('Заполните все обязательные поля');
            return false;
        }

        // Проверка на дубликаты (только при создании)
        if (!this.currentEditId) {
            const isDuplicate = this.languages.some(lang =>
                lang.name.toLowerCase() === formData.name.toLowerCase()
            );

            if (isDuplicate) {
                notification.error('Этот язык уже добавлен');
                return false;
            }
        }

        return true;
    }

    collectFormData() {
        return {
            name: document.getElementById('languageName').value.trim(),
            level: document.getElementById('languageLevel').value
        };
    }

    // ============ ОТОБРАЖЕНИЕ ============
    render() {
        const container = document.getElementById('languagesList');
        if (!container) return;

        if (this.languages.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        container.innerHTML = this.languages.map(lang => {
            const levelLabel = this.getLevelLabel(lang.level);
            return `
                <div class="language-item" data-id="${lang.id}">
                    <span class="language-name">${Helpers.escapeHtml(lang.name)}</span>
                    <span class="language-level">${Helpers.escapeHtml(levelLabel)}</span>
                    <div class="language-actions">
                      <button class="edit-button edit-language-btn">
                         <img src="images/icons/edit.png" alt="Редактировать">
                      </button>
                      
                      <button class="delete-button delete-language-btn">
                         <img src="images/icons/trash.png" alt="Удалить">
                      </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getLevelLabel(levelValue) {
        const level = this.availableLanguagesLevels.find(l => l === levelValue);
        return level ? level : levelValue;
    }

    getEmptyState() {
        return `
            <div class="languages-empty-state">
                <div class="empty-icon">🌐</div>
                <div class="empty-text">Языки пока не добавлены</div>
                <div class="empty-hint">Нажмите "+" чтобы добавить первый язык</div>
            </div>
        `;
    }

    // ============ ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ============
    editLanguageRecord(id) {
        const language = this.languages.find(lang => lang.id === id);
        if (language) {
            this.showForm(language);
        }
    }

    // ============ API ОПЕРАЦИИ ============
    /** Подгрузка всех существующих названий языков в системе*/
    async loadAvailableLanguagesNames() {
        try {
            const response = await this.api.get(`/language/available/name`);
            if (response.status !== 200) {
                notification.error('Произошла ошибка при загрузке данных о языках с сервера');
            } else {
                this.availableLanguagesNames = response.data;
            }
        } catch (error) {

        }
    }

    /** Подгрузка всех существующих уровней владения языков в системе*/
    async loadAvailableLanguagesLevels() {
        try {
            const response = await this.api.get(`/language/available/level`);
            if (response.status !== 200) {
                notification.error('Произошла ошибка при загрузке данных уровней владения языков с сервера');
            } else {
                this.availableLanguagesLevels = response.data;
            }
        } catch (error) {

        }
    }

    /** Добавление нового языка*/
    async createLanguage(languageData) {
        notification.process('Добавляем новый язык');

        try {
            const newLanguage = {
                name: languageData.name,
                level: languageData.level
            };

            let candidateId = this.profileData.candidate.id;
            const response = await this.api.post(`/candidate/${candidateId}/language`, newLanguage);

            if (response.status !== 200) {
                notification.error('Ошибка добавления языка');
            }

            const savedLanguage = {
                id: response.data.id,
                name: response.data.name,
                level: response.data.level
            };

            this.languages.unshift(savedLanguage);
            this.render();
            this.hideForm();
            notification.success('Язык добавлен');
        } catch (error) {
            notification.error('Ошибка сохранения языка');
            console.error('Create language error:', error);
        } finally {
            notification.hideAll();
        }
    }

    /** Обновление редактируемой записи о владении языка*/
    async updateLanguage(languageData) {
        notification.process('Обновляем язык...');

        try {
            const response = await this.api.put(`/language/${this.currentEditId}`, languageData);

            if (response.status === 200) {
                this.languages = this.languages.map(lang => {
                    if (lang.id === this.currentEditId) {
                        return response.data;
                    }
                    return lang;
                });

                this.render();
                this.hideForm();
                notification.success('Данные языка обновлены');
            } else {
                notification.error('Ошибка обновления языка');
            }
        } catch (error) {
            notification.error('Ошибка обновления языка');
            console.error('Update language error:', error);
        } finally {
            notification.hideAll();
        }
    }

    /** Удаление языка*/
    async deleteLanguageRecord(languageId) {
        notification.process('Удаляем язык...');

        try {
            const response = await this.api.delete(`/language/${languageId}`);

            if (response.status !== 200) {
                notification.error('Не удалось удалить язык');
            }

            this.languages = this.languages.filter(lang => lang.id !== languageId);
            this.render();
            notification.success('Язык удален');
        } catch (error) {
            notification.error('Ошибка удаления языка');
            console.error('Delete language error:', error);
        } finally {
            notification.hideAll();
        }
    }
}