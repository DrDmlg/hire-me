// Vue 3 Composition API версия ExperienceComponent
const VueExperienceComponent = {
    template: `
    <div class="experience-section">
      <div class="section-header">
        <div class="section-title">Опыт работы</div>
        <button class="add-button" @click="showForm()">+</button>
      </div>

      <!-- Форма -->
      <div v-if="showFormFlag" class="experience-form">
        <div class="form-title">{{ formTitle }}</div>
        <form @submit.prevent="handleFormSubmit">
          <div class="form-group">
            <label class="form-label">Компания *</label>
            <input v-model="form.company" type="text" class="form-input" required
                   placeholder="Например: Яндекс, Google, Сбер">
          </div>
          <div class="form-group">
            <label class="form-label">Должность *</label>
            <input v-model="form.position" type="text" class="form-input" required
                   placeholder="Например: Frontend Developer, Product Manager">
          </div>
          <div class="form-group">
            <label class="form-label">Период работы *</label>
            <input v-model="form.period" type="text" class="form-input" required
                   placeholder="Например: 2020 — 2023 или 2022 — настоящее время">
          </div>
          <div class="form-group">
            <label class="form-label">Описание обязанностей и достижений</label>
            <textarea v-model="form.description" class="form-input form-textarea"
                      placeholder="Опишите ваши основные обязанности, проекты и достижения..."></textarea>
          </div>
          <div class="form-group">
            <div class="checkbox-group">
              <input v-model="form.isCurrent" type="checkbox" id="currentJob">
              <label class="form-label" for="currentJob">Это моё текущее место работы</label>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="hideForm">Отмена</button>
            <button type="submit" class="btn btn-primary">{{ currentEditId ? 'Обновить' : 'Сохранить' }}</button>
          </div>
        </form>
      </div>

      <!-- Список опыта -->
      <div class="experience-list">
        <div v-if="experiences.length === 0" class="empty-state">
          <div style="font-size: 3rem; margin-bottom: 1rem;">💼</div>
          <div style="font-weight: 500; margin-bottom: 0.5rem;">Опыт работы пока не добавлен</div>
          <div style="font-size: 0.9rem;">Нажмите "+" чтобы добавить первое место работы</div>
        </div>

        <div v-else v-for="exp in experiences" :key="exp.id" 
             class="experience-item fade-in" :class="{ past: !exp.isCurrent }">
          <div class="experience-actions">
            <button class="action-btn edit-btn" @click="editExperienceRecord(exp.id)">✏️</button>
            <button class="action-btn delete-btn" @click="deleteExperienceRecord(exp.id)">🗑️</button>
          </div>
          <div class="experience-company">{{ exp.company }}</div>
          <div class="experience-position">{{ exp.position }}</div>
          <div class="experience-period">{{ formatPeriod(exp.startDate, exp.endDate, exp.isCurrent) }}</div>
          <div class="experience-description">{{ exp.description || 'Описание не указано' }}</div>
        </div>
      </div>
    </div>
  `,

    data() {
        return {
            experiences: [],
            showFormFlag: false,
            currentEditId: null,
            form: {
                company: '',
                position: '',
                period: '',
                description: '',
                isCurrent: false
            }
        }
    },

    computed: {
        formTitle() {
            return this.currentEditId ? 'Редактировать опыт работы' : 'Добавить опыт работы'
        }
    },

    methods: {
        // ============ ИНИЦИАЛИЗАЦИЯ ============
        init(initialExperiences = []) {
            try {
                this.experiences = [...initialExperiences];
                console.log('VueExperienceComponent initialized with data', this.experiences);
            } catch (error) {
                console.error('VueExperienceComponent init error:', error);
                this.showError('Не удалось инициализировать опыт работы');
            }
        },

        // ============ ФОРМА ============
        showForm(experience = null) {
            if (experience) {
                this.currentEditId = experience.id;
                this.form = { ...experience };
            } else {
                this.currentEditId = null;
                this.clearForm();
            }
            this.showFormFlag = true;
        },

        hideForm() {
            this.showFormFlag = false;
            this.clearForm();
            this.currentEditId = null;
        },

        clearForm() {
            this.form = {
                company: '',
                position: '',
                period: '',
                description: '',
                isCurrent: false
            };
        },

        // ============ ОБРАБОТКА ФОРМЫ ============
        async handleFormSubmit() {
            if (!this.validateForm()) return;

            try {
                if (this.currentEditId) {
                    await this.updateExperience(this.form);
                } else {
                    await this.createExperience(this.form);
                }
                this.hideForm();
            } catch (error) {
                this.showError('Ошибка операции');
            }
        },

        validateForm() {
            if (!this.form.company || !this.form.position || !this.form.period) {
                this.showError('Заполните обязательные поля');
                return false;
            }
            return true;
        },

        // ============ API ОПЕРАЦИИ ============
        async createExperience(experienceData) {
            this.showLoading('Сохранение...');

            try {
                const telegramUserId = Helpers.getTelegramUserId();
                const response = await fetch(`https://hireme.serveo.net/work-experience/${telegramUserId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(experienceData),
                });

                if (!response.ok) {
                    throw new Error('Network error');
                }

                const savedExperience = await response.json();
                this.experiences.unshift(savedExperience);
                this.showSuccess('Опыт работы добавлен');

            } catch (error) {
                this.showError('Ошибка сохранения');
            } finally {
                Helpers.hideMessage();
            }
        },

        async updateExperience(experienceData) {
            this.showLoading('Обновляем запись...');

            try {
                const response = await fetch(`https://hireme.serveo.net/work-experience/${this.currentEditId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(experienceData),
                });

                if (!response.ok) {
                    throw new Error('Network error');
                }

                const updatedExperience = await response.json();
                this.experiences = this.experiences.map(exp =>
                    exp.id === this.currentEditId ? updatedExperience : exp
                );
                this.showSuccess('Данные обновлены');

            } catch (error) {
                this.showError('Ошибка обновления');
            } finally {
                Helpers.hideMessage();
            }
        },

        async deleteExperienceRecord(id) {
            if (!confirm('Вы уверены, что хотите удалить этот опыт работы?')) return;

            this.showLoading('Удаление...');

            try {
                const response = await fetch(`https://hireme.serveo.net/work-experience/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Network error');
                }

                this.experiences = this.experiences.filter(exp => exp.id !== id);
                this.showSuccess('Опыт работы удален');

            } catch (error) {
                this.showError('Ошибка удаления');
            } finally {
                Helpers.hideMessage();
            }
        },

        editExperienceRecord(id) {
            const experience = this.experiences.find(exp => exp.id === id);
            if (experience) {
                this.showForm(experience);
            }
        },

        // ============ ВСПОМОГАТЕЛЬНЫЕ ============
        formatPeriod(startDate, endDate, isCurrent) {
            const start = startDate;
            let end = endDate;

            if (isCurrent) {
                end = 'По настоящее время';
            }

            return `${start} - ${end}`;
        },

        showLoading(text) {
            Helpers.showMessage(text, 'loading');
        },

        showSuccess(text) {
            Helpers.showMessage(text, 'success');
        },

        showError(text) {
            Helpers.showMessage(text, 'error');
        }
    }
};