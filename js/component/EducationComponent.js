class EducationComponent {
    constructor() {
        this.educations = []; //Массив добавленных записей об образовании пользователя
        this.currentEditId = null;
        this.api = apiService;
        this.profileData = null;
    }

    // ============ ИНИЦИАЛИЗАЦИЯ ============
    async init(educations = [], profileData = null) {
        try {
            this.profileData = profileData;
            this.educations = educations;
            this.render();
            this.bindEvents();
            console.log('EducationComponent initialized with data:', this.educations);
        } catch (error) {
            console.error('EducationComponent init error:', error);
            notification.error('Не удалось инициализировать образование');
        }
    }

    bindEvents() {
        const educationList = document.getElementById('educationList');
        const addEducationBtn = document.getElementById('addEducationBtn');
        const cancelBtn = document.getElementById('cancelEducationBtn');
        const form = document.getElementById('educationFormElement');

        if (addEducationBtn) {
            addEducationBtn.addEventListener('click', () => this.showForm());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideForm());
        }

        if (form) {
            form.addEventListener('submit', (e) => this.onEducationAction(e));
        }

        // Делегирование событий для edit/delete
        if (educationList) {
            educationList.addEventListener('click', (event) => {
                const editBtn = event.target.closest('.edit-education-btn');
                const deleteBtn = event.target.closest('.delete-education-btn');

                if (editBtn) {
                    const id = parseInt(editBtn.closest('.education-item').dataset.id);
                    this.editEducationRecord(id);
                } else if (deleteBtn) {
                    const id = parseInt(deleteBtn.closest('.education-item').dataset.id);
                    this.deleteEducationRecord(id);
                }
            });
        }
    }

    // ============ ФОРМА ============
    showForm(education = null) {
        const form = document.getElementById('educationForm');
        const formTitle = document.getElementById('educationFormTitle');
        const saveButton = document.getElementById('saveEducationButton');
        const updateButton = document.getElementById('updateEducationButton');

        if (education) {
            // Режим редактирования
            formTitle.textContent = 'Редактировать образование';
            this.fillForm(education);
            this.currentEditId = education.id;
            saveButton.style.display = 'none';
            updateButton.style.display = 'block';
        } else {
            // Режим добавления
            formTitle.textContent = 'Добавить образование';
            this.clearForm();
            this.currentEditId = null;
            saveButton.style.display = 'block';
            updateButton.style.display = 'none';
        }

        form.style.display = 'block';
        form.scrollIntoView({behavior: 'smooth'});
    }

    hideForm() {
        const form = document.getElementById('educationForm');
        const saveButton = document.getElementById('saveEducationButton');
        const updateButton = document.getElementById('updateEducationButton');

        if (form) {
            form.style.display = 'none';
        }

        saveButton.style.display = 'block';
        updateButton.style.display = 'none';
        this.clearForm();
        this.currentEditId = null;
    }

    fillForm(education) {
        document.getElementById('institutionName').value = education.institutionName || '';
        document.getElementById('faculty').value = education.faculty || '';
        document.getElementById('specialization').value = education.specialization || '';

        // Год окончания
        const graduationYear = education.graduationYear;
        if (graduationYear) {
            document.getElementById('graduationYear').value = graduationYear.toString();
        } else {
            document.getElementById('graduationYear').value = '';
        }
    }

    clearForm() {
        const form = document.getElementById('educationFormElement');
        if (form) {
            form.reset();
        }
    }

    // ============ ОБРАБОТЧИКИ ФОРМЫ ============
    async onEducationAction(event) {
        event.preventDefault();

        const clickedButton = event.submitter;
        const formData = this.collectFormData();

        if (!this.validateFormData(formData)) {
            return;
        }

        if (clickedButton.id === 'saveEducationButton') {
            await this.createEducation(formData);
        } else if (clickedButton.id === 'updateEducationButton') {
            await this.updateEducation(formData);
        }
    }

    validateFormData(formData) {
        if (!formData.institutionName) {
            notification.error('Укажите учебное заведение');
            return false;
        }

        if (!formData.graduationYear) {
            notification.error('Укажите год окончания');
            return false;
        }

        // Проверка года (от 1950 до текущего года + 5 лет)
        const currentYear = new Date().getFullYear();
        const year = parseInt(formData.graduationYear);
        if (year < 1950 || year > currentYear + 5) {
            notification.error('Укажите корректный год окончания');
            return false;
        }

        return true;
    }

    collectFormData() {
        return {
            institutionName: document.getElementById('institutionName').value.trim(),
            faculty: document.getElementById('faculty').value.trim(),
            specialization: document.getElementById('specialization').value.trim(),
            graduationYear: parseInt(document.getElementById('graduationYear').value)
        };
    }

    // ============ ОТОБРАЖЕНИЕ ============
    render() {
        const container = document.getElementById('educationList');
        if (!container) return;

        if (this.educations.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        // Сортируем по году окончания (от новых к старым)
        const sortedEducations = [...this.educations].sort((a, b) =>
            (b.graduationYear || 0) - (a.graduationYear || 0)
        );

        container.innerHTML = sortedEducations.map(edu => `
            <div class="education-item fade-in" data-id="${edu.id}">
                <div class="education-actions">
                    <button class="edit-button edit-education-btn">
                        <img src="../../images/icons/edit.png" alt="Редактировать">
                    </button>
                    <button class="delete-button delete-education-btn">
                        <img src="../../images/icons/trash.png" alt="Удалить">
                    </button>
                </div>
                <div class="institution-name">${Helpers.escapeHtml(edu.institutionName)}</div>
                ${edu.faculty ? `<div class="faculty">${Helpers.escapeHtml(edu.faculty)}</div>` : ''}
                ${edu.specialization ? `<div class="specialization">${Helpers.escapeHtml(edu.specialization)}</div>` : ''}
                ${edu.graduationYear ? `<div class="graduation-year">Год окончания: ${edu.graduationYear}</div>` : ''}
            </div>
        `).join('');
    }

    getEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-text">Здесь пока ничего нет</div>
            </div>
        `;
    }

    // ============ ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ============
    editEducationRecord(id) {
        const education = this.educations.find(edu => edu.id === id);
        if (education) {
            this.showForm(education);
        }
    }

    // ============ API ОПЕРАЦИИ ============
    /** Добавление новой записи об образовании */
    async createEducation(educationData) {
        try {
            let candidateId = this.profileData.candidate.id;
            const response = await this.api.post(`/candidate/${candidateId}/education`, educationData);

            if (response.status !== 200) {
                notification.error('Ошибка добавления образования');
                return;
            }

            const savedEducation = {
                id: response.data.id,
                institutionName: response.data.institutionName,
                faculty: response.data.faculty,
                specialization: response.data.specialization,
                graduationYear: response.data.graduationYear
            };

            this.educations.unshift(savedEducation);
            this.render();
            this.hideForm();
            notification.success('Образование добавлено');
        } catch (error) {
            notification.error('Ошибка сохранения образования');
            console.error('Create education error:', error);
        } finally {
            notification.hideAll();
        }
    }

    /** Обновление записи об образовании */
    async updateEducation(educationData) {
        try {
            const response = await this.api.put(`/education/${this.currentEditId}`, educationData);

            if (response.status === 200) {
                this.educations = this.educations.map(edu => {
                    if (edu.id === this.currentEditId) {
                        return response.data;
                    }
                    return edu;
                });

                this.render();
                this.hideForm();
                notification.success('Данные об образовании обновлены');
            } else {
                notification.error('Ошибка обновления образования');
            }
        } catch (error) {
            notification.error('Ошибка обновления образования');
            console.error('Update education error:', error);
        } finally {
            notification.hideAll();
        }
    }

    /** Удаление записи об образовании */
    async deleteEducationRecord(educationId) {
        try {
            const response = await this.api.delete(`/education/${educationId}`);

            if (response.status !== 200) {
                notification.error('Не удалось удалить образование');
                return;
            }

            this.educations = this.educations.filter(edu => edu.id !== educationId);
            this.render();
            notification.success('Образование удалено');
        } catch (error) {
            notification.error('Ошибка удаления образования');
            console.error('Delete education error:', error);
        } finally {
            notification.hideAll();
        }
    }
}