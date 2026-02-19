class VacancyCardComponent {
    constructor() {
        this.api = apiService;
    }

    // Создает HTML карточки из данных вакансии
    createCard(vacancyData) {
        const salaryText = this.formatSalary(vacancyData.salary);
        const previewText = this.createPreview(vacancyData.aboutCompany || vacancyData.responsibilities || '');

        return `
            <div class="vacancy-card" data-id="${vacancyData.id}">
                <div class="vacancy-header">
                    <h3 class="vacancy-title">${Helpers.escapeHtml(vacancyData.title)}</h3>
                    <div class="vacancy-company">${Helpers.escapeHtml(vacancyData.companyName)}</div>
                </div>
                
                <div class="vacancy-meta">
                    ${salaryText ? `<span class="vacancy-salary">${salaryText}</span>` : ''}
                    ${vacancyData.experience?.name ? `<span class="vacancy-experience">${Helpers.escapeHtml(vacancyData.experience.name)}</span>` : ''}
                    ${vacancyData.workFormat ? `<span class="vacancy-format">${Helpers.escapeHtml(vacancyData.workFormat)}</span>` : ''}
                </div>
                
                ${previewText ? `
                <div class="vacancy-preview">
                    ${Helpers.escapeHtml(previewText)}
                </div>
                ` : ''}
                
                <div class="vacancy-actions">
                    <button class="btn-view-more" type="button">Подробнее</button>
                    <button class="btn-apply" type="button">Откликнуться</button>
                </div>
                
                <!-- Детальная информация (скрыта) -->
                <div class="vacancy-details">
                    ${this.createDetails(vacancyData)}
                    <button class="btn-apply-full" type="button">Откликнуться на вакансию</button>
                </div>
            </div>
        `;
    }

    // Форматирует зарплату
    formatSalary(salary) {
        if (!salary) return '';

        const from = salary.from ? this.formatNumber(salary.from) : '';
        const to = salary.to ? this.formatNumber(salary.to) : '';

        if (from && to) {
            return `${from} - ${to} ₽`;
        } else if (from) {
            return `от ${from} ₽`;
        } else if (to) {
            return `до ${to} ₽`;
        }

        return '';
    }

    formatNumber(num) {
        return new Intl.NumberFormat('ru-RU').format(num);
    }

    // Создает превью текста (первые 100 символов)
    createPreview(text) {
        if (!text) return '';

        const cleanText = text.trim();
        if (cleanText.length <= 100) return cleanText;

        return cleanText.substring(0, 100) + '...';
    }

    // Создает детальную информацию
    createDetails(vacancyData) {
        const sections = [];

        // О компании
        if (vacancyData.aboutCompany) {
            sections.push(`
                <div class="detail-section">
                    <h4>О компании</h4>
                    <p>${Helpers.escapeHtml(vacancyData.aboutCompany)}</p>
                </div>
            `);
        }

        // Обязанности
        if (vacancyData.responsibilities) {
            sections.push(`
                <div class="detail-section">
                    <h4>Обязанности</h4>
                    <p>${Helpers.escapeHtml(vacancyData.responsibilities)}</p>
                </div>
            `);
        }

        // Навыки
        if (vacancyData.skills) {
            sections.push(`
                <div class="detail-section">
                    <h4>Требования и навыки</h4>
                    <p>${Helpers.escapeHtml(vacancyData.skills)}</p>
                </div>
            `);
        }

        // Что предлагаем
        if (vacancyData.suggestion) {
            sections.push(`
                <div class="detail-section">
                    <h4>Что мы предлагаем</h4>
                    <p>${Helpers.escapeHtml(vacancyData.suggestion)}</p>
                </div>
            `);
        }

        // Дополнительная информация
        if (vacancyData.additionalInformation) {
            sections.push(`
                <div class="detail-section">
                    <h4>Дополнительная информация</h4>
                    <p>${Helpers.escapeHtml(vacancyData.additionalInformation)}</p>
                </div>
            `);
        }

        // Адрес
        if (vacancyData.address?.name) {
            sections.push(`
                <div class="detail-section">
                    <h4>Адрес</h4>
                    <p>${Helpers.escapeHtml(vacancyData.address.name)}</p>
                </div>
            `);
        }

        // График работы
        if (vacancyData.workDays) {
            sections.push(`
                <div class="detail-section">
                    <h4>График работы</h4>
                    <p>${Helpers.escapeHtml(vacancyData.workDays)}</p>
                </div>
            `);
        }

        // Дата публикации
        if (vacancyData.publishedDate) {
            const date = new Date(vacancyData.publishedDate);
            const formattedDate = date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            sections.push(`
                <div class="detail-section">
                    <h4>Дата публикации</h4>
                    <p>${formattedDate}</p>
                </div>
            `);
        }

        return sections.join('');
    }

    // Привязывает обработчики событий к карточке
    bindCardEvents(cardElement) {
        const viewMoreBtn = cardElement.querySelector('.btn-view-more');
        const applyBtn = cardElement.querySelector('.btn-apply');
        const applyFullBtn = cardElement.querySelector('.btn-apply-full');
        const detailsSection = cardElement.querySelector('.vacancy-details');

        if (viewMoreBtn && detailsSection) {
            viewMoreBtn.addEventListener('click', () => {
                const isHidden = detailsSection.style.display === 'none' ||
                    detailsSection.style.display === '';

                detailsSection.style.display = isHidden ? 'block' : 'none';
                viewMoreBtn.textContent = isHidden ? 'Свернуть' : 'Подробнее';

                if (isHidden) {
                    detailsSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }
            });
        }

        // Обработчик для кнопки "Откликнуться" вверху
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const vacancyId = cardElement.dataset.id;
                this.submitApplication(vacancyId);
            });
        }

        // Обработчик для кнопки "Откликнуться" в деталях
        if (applyFullBtn) {
            applyFullBtn.addEventListener('click', () => {
                const vacancyId = cardElement.dataset.id;
                this.submitApplication(vacancyId);
            });
        }
    }

    // Обработчик отклика на вакансию
    async submitApplication(vacancyId) {
        console.log('Отклик на вакансию:', vacancyId);
        try {
            let telegramUserId = Helpers.getTelegramUserId();

            const response = await this.api.post(`/application/apply`, {
                vacancyId: vacancyId,
                telegramUserId: telegramUserId
            });

            if (response.status === 200) {
                notification.success('Ваш отклик отправлен!');
            }

        } catch (error) {
            console.error('error:', error);
        }
    }
}

// Экспортируем для использования
const vacancyCardComponent = new VacancyCardComponent();