class SkillsManager {
    constructor() {
        this.skills = [];
        this.availableSkills = []; // Список доступных навыков с бэкенда
        this.maxSkills = 10;
        this.isInitialized = false;
        this.isAdding = false;
    }

    // ============ ИНИЦИАЛИЗАЦИЯ ============
    init(skills = [], availableSkills = []) {
        if (this.isInitialized) return;

        try {
            // ТЕСТОВЫЕ ДАННЫЕ - можно удалить когда API будет готово
            if (skills.length === 0) {
                skills = this.getMockSkills();
            }
            if (availableSkills.length === 0) {
                availableSkills = this.getMockAvailableSkills();
            }

            this.skills = skills;
            this.availableSkills = availableSkills;
            this.render();
            this.bindEvents();
            this.isInitialized = true;
            console.log('SkillsManager initialized with data:', this.skills);
        } catch (error) {
            console.error('SkillsManager init error:', error);
            this.showError('Не удалось инициализировать навыки');
        }
    }

    // ТЕСТОВЫЕ ДАННЫЕ
    getMockSkills() {
        return [
            { id: 1, name: 'Figma' },
            { id: 2, name: 'User Research' },
            { id: 3, name: 'Prototyping' }
        ];
    }

    // ТЕСТОВЫЕ ДАННЫЕ - доступные навыки
    getMockAvailableSkills() {
        return [
            'Figma', 'User Research', 'Prototyping', 'UX Writing',
            'Design Systems', 'A/B Testing', 'Usability Testing',
            'HTML/CSS', 'JavaScript', 'React', 'TypeScript', 'Node.js',
            'Python', 'Vue.js', 'Angular', 'UI Design', 'Wireframing',
            'Product Management', 'Agile', 'Scrum', 'User Testing',
            'Information Architecture', 'Interaction Design', 'Visual Design',
            'Design Thinking', 'Data Analysis', 'UX Metrics', 'Accessibility'
        ];
    }

    bindEvents() {
        const addSkillBtn = document.getElementById('addSkillBtn');

        if (addSkillBtn) {
            addSkillBtn.addEventListener('click', () => this.showSkillInput());
        }
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
                <span class="skill-name">${Helpers.escapeHtml(skill.name)}</span>
                <button class="skill-remove-btn" onclick="app.profileManager.managers.skills.removeSkill(${skill.id})">
                    ×
                </button>
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

        // Закрываем по клику вне input
        setTimeout(() => {
            document.addEventListener('click', this.handleClickOutside.bind(this));
        }, 100);
    }

    handleClickOutside(e) {
        const inputContainer = document.querySelector('.skill-input-tag');
        if (inputContainer && !inputContainer.contains(e.target) &&
            e.target.id !== 'addSkillBtn') {
            this.cancelAddSkill();
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
            !this.skills.some(existingSkill => existingSkill.name.toLowerCase() === skill.toLowerCase())
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
            <div class="skill-suggestion" onclick="app.profileManager.managers.skills.selectSuggestion('${skill.replace(/'/g, "\\'")}')">
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
                    skill.name.toLowerCase() === trimmedValue.toLowerCase()
                );
            confirmBtn.disabled = !isValid;
            confirmBtn.style.opacity = isValid ? '1' : '0.5';
        }
    }

    // ============ ИНТЕРАКТИВ ============
    showSkillInput() {
        if (this.skills.length >= this.maxSkills) {
            this.showError(`Максимум ${this.maxSkills} навыков`);
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
            this.showError('Выберите навык из списка');
            return;
        }

        if (this.validateSkill(skillName)) {
            this.addSkill(skillName);
            this.isAdding = false;
        }
    }

    cancelAddSkill() {
        this.isAdding = false;
        this.render();
        document.removeEventListener('click', this.handleClickOutside);
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
            <div class="skills-empty-state">
                <div class="empty-icon">💡</div>
                <div class="empty-text">Навыки пока не добавлены</div>
                <div class="empty-hint">Нажмите "+" чтобы добавить навык</div>
            </div>
        `;
    }

    // ============ ОПЕРАЦИИ С НАВЫКАМИ ============
    async addSkill(skillName) {
        if (!skillName) return;

        this.showLoading('Добавляем навык...');

        try {
            const newSkill = {
                name: skillName,
            };

            // ЗАКОММЕНТИРОВАННЫЙ API CALL - раскомментируйте когда будет готово
            /*
            let telegramUserId = Helpers.getTelegramUserId();
            const response = await fetch(`https://hireme.serveo.net/skills/${telegramUserId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newSkill),
            });

            if (!response.ok) {
                throw new Error('Ошибка сохранения');
            }

            const savedSkill = await response.json();
            */

            // ТЕСТОВЫЕ ДАННЫЕ - удалите когда API будет готово
            await new Promise(resolve => setTimeout(resolve, 300));
            const savedSkill = {
                id: Date.now(),
                name: skillName
            };

            this.skills.unshift(savedSkill);
            this.render();
            this.showSuccess('Навык добавлен');

        } catch (error) {
            this.showError('Ошибка добавления навыка');
            console.error('Add skill error:', error);
        } finally {
            Helpers.hideMessage();
        }
    }

    validateSkill(skillName) {
        if (!skillName) {
            this.showError('Введите название навыка');
            return false;
        }

        if (skillName.length < 2) {
            this.showError('Название навыка слишком короткое');
            return false;
        }

        // Проверяем, что навык есть в доступных
        const isAvailable = this.availableSkills.some(skill =>
            skill.toLowerCase() === skillName.toLowerCase()
        );

        if (!isAvailable) {
            this.showError('Выберите навык из списка предложенных');
            return false;
        }

        // Проверка на дубликаты
        const isDuplicate = this.skills.some(skill =>
            skill.name.toLowerCase() === skillName.toLowerCase()
        );

        if (isDuplicate) {
            this.showError('Этот навык уже добавлен');
            return false;
        }

        // Проверка лимита
        if (this.skills.length >= this.maxSkills) {
            this.showError(`Максимум ${this.maxSkills} навыков`);
            return false;
        }

        return true;
    }

    async removeSkill(skillId) {
        // if (!confirm('Удалить этот навык?')) return;

        this.showLoading('Удаляем...');

        try {
            // ЗАКОММЕНТИРОВАННЫЙ API CALL - раскомментируйте когда будет готово
            /*
            const response = await fetch(`https://hireme.serveo.net/skills/${skillId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Ошибка удаления');
            }
            */

            // ТЕСТОВЫЕ ДАННЫЕ - удалите когда API будет готово
            await new Promise(resolve => setTimeout(resolve, 300));

            this.skills = this.skills.filter(skill => skill.id !== skillId);
            this.render();
            this.showSuccess('Навык удален');

        } catch (error) {
            this.showError('Ошибка удаления навыка');
            console.error('Remove skill error:', error);
        } finally {
            Helpers.hideMessage();
        }
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
}