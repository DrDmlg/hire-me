class SkillsComponent {

    constructor() {
        this.skills = []; //Массив добавленных навыков пользователя
        this.availableSkills = []; //Список доступных для выбора навыков (получаем с бэкенда)
        this.maxSkills = 10; //Максимальное количество навыков, которое можно добавить
        this.isAdding = false;// // Режим добавления (true = показываем input)
        this.api = apiService;
        this.profileData = null;
    }

    // ============ ИНИЦИАЛИЗАЦИЯ ============
    async init(skills = [], profileData = null) {
        try {
            this.profileData = profileData;
            await this.loadAvailableSkills();
            this.skills = skills;
            this.render();
            this.bindEvents();
            console.log('SkillsComponent initialized with data:', this.skills);
        } catch (error) {
            console.error('SkillsComponent init error:', error);
            notification.error('Не удалось инициализировать навыки');
        }
    }

    //  Постоянные обработчики. Вызываются один раз в init()
    bindEvents() {
        const addSkillBtn = document.getElementById('addSkillBtn');
        const skillsList = document.getElementById('skillsList');

        if (addSkillBtn) {
            addSkillBtn.addEventListener('click', () => this.showSkillInput());
        }

        // Удаление навыков
        if (skillsList) {
            skillsList.addEventListener('click', (event) => {
                const removeBtn = event.target.closest('.skill-remove-btn');
                if (removeBtn) {
                    const skillItem = removeBtn.closest('.skill-tag');
                    const skillId = parseInt(skillItem.dataset.id);
                    this.deleteSkillRecord(skillId);
                }
            });
        }

        // Подсказки
        document.addEventListener('click', (event) => {
            const suggestion = event.target.closest('.skill-suggestion');
            if (suggestion && !suggestion.classList.contains('empty')) {
                const skillName = suggestion.dataset.skill; // Берем из data-attribute
                this.selectSuggestion(skillName);
            }
        });
    }

    // ============ ОТОБРАЖЕНИЕ ============
    render() {
        const container = document.getElementById('skillsList');
        if (!container) return;

        if (this.skills.length === 0 && !this.isAdding) {
            container.innerHTML = this.getEmptyState();
            this.updateCounter();
            return;
        }

        let skillsHTML = this.skills.map(skill => `
            <div class="skill-tag fade-in" data-id="${skill.id}">
                <span class="skill-name">${Helpers.escapeHtml(skill.displayName)}</span>
                <button class="skill-remove-btn">×</button>
            </div>
        `).join('');

        // Добавляем input для ввода, если в режиме добавления
        if (this.isAdding) {
            skillsHTML += `
                <div class="skill-input-tag">
                    <input type="text" class="skill-input-field" id="skillInputField" 
                           placeholder="Введите навык..." maxlength="50">
                    <div class="skill-input-actions">
                        <button class="skill-input-btn skill-input-confirm" id="skillInputConfirm">✓</button>
                        <button class="skill-input-btn skill-input-cancel" id="skillInputCancel">×</button>
                    </div>
                </div>
            `;
        }

        container.innerHTML = skillsHTML;

        if (this.isAdding) {
            this.bindInputEvents();
        }

        this.updateCounter();
    }

    // Временные обработчики. Вызываются каждый раз когда показывается input (в render() когда this.isAdding = true)
    bindInputEvents() {
        const inputField = document.getElementById('skillInputField');
        const confirmBtn = document.getElementById('skillInputConfirm');
        const cancelBtn = document.getElementById('skillInputCancel');

        if (inputField) {
            inputField.focus();

            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.confirmAddSkill();
                } else if (e.key === 'Escape') {
                    this.cancelAddSkill();
                }
            });

            inputField.addEventListener('input', (e) => {
                this.handleInputChange(e.target.value);
            });
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmAddSkill());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelAddSkill());
        }
    }

    handleInputChange(value) {
        this.showSuggestions(value);
        this.updateInputState(value);
    }

    showSuggestions(filter = '') {
        const suggestionsContainer = document.getElementById('skillSuggestions') || this.createSuggestionsContainer();

        // Фильтруем доступные навыки по введенному тексту и убираем уже добавленные
        const filteredSkills = this.availableSkills.filter(skill =>
            skill.toLowerCase().includes(filter.toLowerCase()) &&
            !this.skills.some(existingSkill => existingSkill.displayName.toLowerCase() === skill.toLowerCase())
        ).slice(0, 8); // Ограничиваем количество подсказок

        if (filteredSkills.length === 0) {
            suggestionsContainer.style.display = 'none';

            // Показываем сообщение, если ничего не найдено
            if (filter.length >= 2) {
                suggestionsContainer.innerHTML = `
                    <div class="skill-suggestion empty">
                        Навык не найден. Выберите из списка.
                    </div>
                `;
                suggestionsContainer.style.display = 'block';
            }
            return;
        }

        suggestionsContainer.innerHTML = filteredSkills.map(skill => `
           <div class="skill-suggestion" data-skill="${Helpers.escapeHtml(skill)}">
            ${Helpers.escapeHtml(skill)}
        </div>
        `).join('');

        suggestionsContainer.style.display = 'block';
    }

    createSuggestionsContainer() {
        const container = document.createElement('div');
        container.id = 'skillSuggestions';
        container.className = 'skill-suggestions';

        const inputRow = document.querySelector('.skill-input-tag');
        if (inputRow) {
            inputRow.appendChild(container);
        }

        return container;
    }

    selectSuggestion(skillName) {
        const skillInput = document.getElementById('skillInputField');
        skillInput.value = skillName;
        this.hideSuggestions();
        this.updateInputState(skillName);
        skillInput.focus();
    }

    hideSuggestions() {
        const suggestionsContainer = document.getElementById('skillSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    updateInputState(value) {
        const confirmBtn = document.getElementById('skillInputConfirm');
        if (confirmBtn) {
            const trimmedValue = value.trim();
            // Проверяем, что значение есть в списке доступных навыков
            const isValid = trimmedValue.length >= 2 &&
                this.availableSkills.some(skill =>
                    skill.toLowerCase() === trimmedValue.toLowerCase()
                ) &&
                !this.skills.some(skill =>
                    skill.displayName.toLowerCase() === trimmedValue.toLowerCase()
                );
            confirmBtn.disabled = !isValid;
            confirmBtn.style.opacity = isValid ? '1' : '0.5';
        }
    }

    // ============ ИНТЕРАКТИВ ============
    showSkillInput() {
        if (this.skills.length >= this.maxSkills) {
            notification.error(`Максимум ${this.maxSkills} навыков`);
            return;
        }

        this.isAdding = true;
        this.render();
    }

    confirmAddSkill() {
        const inputField = document.getElementById('skillInputField');
        if (!inputField) return;

        const skillName = inputField.value.trim();

        // Проверяем, что навык есть в доступных
        const isAvailable = this.availableSkills.some(skill =>
            skill.toLowerCase() === skillName.toLowerCase()
        );

        if (!isAvailable) {
            notification.error('Выберите навык из списка');
            return;
        }

        if (this.validateSkill(skillName)) {
            this.createSkill(skillName);
            this.isAdding = false;
        }
    }

    cancelAddSkill() {
        this.isAdding = false;
        this.render();
        this.hideSuggestions();
    }

    updateCounter() {
        const counter = document.getElementById('skillsCounter');
        if (counter) {
            counter.textContent = `(${this.skills.length}/${this.maxSkills})`;

            // Убираем предыдущие классы
            counter.classList.remove('warning', 'error');

            // Меняем цвет при приближении к лимиту
            if (this.skills.length >= this.maxSkills) {
                counter.classList.add('error');
            } else if (this.skills.length >= this.maxSkills - 2) {
                counter.classList.add('warning');
            }
        }
    }

    getEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-text">Здесь пока ничего нет</div>
            </div>
        `;
    }

    validateSkill(skillName) {
        if (!skillName) {
            notification.error('Введите название навыка');
            return false;
        }

        if (skillName.length < 2) {
            notification.error('Название навыка слишком короткое');
            return false;
        }

        // Проверяем, что навык есть в доступных
        const isAvailable = this.availableSkills.some(skill =>
            skill.toLowerCase() === skillName.toLowerCase()
        );

        if (!isAvailable) {
            notification.error('Выберите навык из списка предложенных');
            return false;
        }

        // Проверка на дубликаты
        const isDuplicate = this.skills.some(skill =>
            skill.displayName.toLowerCase() === skillName.toLowerCase()
        );

        if (isDuplicate) {
            notification.error('Этот навык уже добавлен');
            return false;
        }

        // Проверка лимита
        if (this.skills.length >= this.maxSkills) {
            notification.error(`Максимум ${this.maxSkills} навыков`);
            return false;
        }

        return true;
    }

    // ============ API ОПЕРАЦИИ ============
    /** Подгрузка всех существующих навыков в системе*/
    async loadAvailableSkills() {
        try {
            const response = await this.api.get(`/skill/available`);
            if (response.status !== 200) {
                notification.error('Произошла ошибка при загрузке навыков с сервера');
            } else {
                this.availableSkills = response.data;
            }
        } catch (error) {

        }
    }

    /** Добавление нового навыка*/
    async createSkill(skillName) {
        if (!skillName) return;

        notification.process('Добавляем навык...');

        try {
            const newSkill = {
                displayName: skillName,
            };

            let candidateId = this.profileData.candidate.id;
            const response = await this.api.post(`/candidate/${candidateId}/skill`, newSkill);

            if (response.status !== 200) {
                notification.error('Ошибка добавления навыка');
            }

            const savedSkill = {
                id: response.data.id,
                displayName: response.data.displayName,
            };

            this.skills.unshift(savedSkill);
            this.render();
            notification.success('Навык добавлен');

        } catch (error) {
            notification.error('Ошибка добавления навыка');
            console.error('Add skill error:', error);
        } finally {
            notification.hideAll();
        }
    }

    /** Удаление навыка*/
    async deleteSkillRecord(skillId) {
        notification.process('Удаляем навык');

        try {
            const response = await this.api.delete(`/skill/${skillId}`);

            if (response.status !== 200) {
                notification.error('Не удалось удалить навык');
            }

            this.skills = this.skills.filter(skill => skill.id !== skillId);
            this.render();
            notification.success("Навык удален")
        } catch (error) {
            notification.error('Ошибка удаления навыка');
            console.error('Remove skill error:', error);
        } finally {
            notification.hideAll();
        }
    }
}