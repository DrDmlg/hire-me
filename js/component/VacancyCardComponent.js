class VacancyCardComponent {
    constructor() {
        this.api = apiService;
    }

    createCard(v) {
        const firstLetter = (v.companyName || 'H').charAt(0).toUpperCase();
        const salary = this.formatSalary(v.salary);

        return `
            <div class="vacancy-card" data-id="${v.id}">
                <div class="vacancy-main-content">
                    <div class="vacancy-header-flex">
                        <div class="company-logo-badge">
                            ${firstLetter}
                        </div>
                        <div class="title-area">
                            <h3 class="vacancy-title">${(v.title)}</h3>
                            <div class="vacancy-company">${(v.companyName)}</div>
                        </div>
                    </div>

                    <div class="vacancy-meta-tags">
                        ${salary ? `<span class="tag-salary">${salary}</span>` : ''}
                        <span class="tag-pill"><i class="icon-exp"></i> ${(v.experience)}</span>
                        <span class="tag-pill"><i class="icon-loc"></i> ${(v.workFormat)}</span>
                    </div>

                    <p class="vacancy-description-preview">
                        ${this.createPreview(v.responsibilities || v.aboutCompany)}
                    </p>

                    <div class="vacancy-card-footer">
                        <button type="button" class="btn-toggle-details">Подробнее</button>
                        <button type="button" class="btn-quick-apply">Откликнуться</button>
                    </div>
                </div>

                <div class="vacancy-expandable-content" style="display: none; height: 0; opacity: 0; overflow: hidden;">
                    <div class="details-inner">
                        ${this.renderDetailSection('О компании', v.aboutCompany)}
                        ${this.renderDetailSection('Обязанности', v.responsibilities)}
                        ${this.renderDetailSection('Требования и навыки', v.skills)}
                        ${this.renderDetailSection('Что мы предлагаем', v.suggestion)}
                        ${this.renderDetailSection('Дополнительная информация', v.additionalInformation)}
                        
                        <div class="detail-section">
                            <h4>Локация и график</h4>
                            <p>${v.address || 'Адрес не указан'} • ${v.workSchedule}</p>
                        </div>

                    </div>
                </div>
            </div>
        `;
    }

    renderDetailSection(title, content) {
        if (!content) return '';
        return `
            <div class="detail-section">
                <h4>${title}</h4>
                <p>${(content)}</p>
            </div>
        `;
    }

    formatSalary(salaryObj) {
        if (!salaryObj || !salaryObj.min || !salaryObj.max) return null;

        const curr = salaryObj.currency === 'USD' ? '$' : '₽';
        return `${salaryObj.min.toLocaleString()} — ${salaryObj.max.toLocaleString()} ${curr}`;
    }

    createPreview(text) {
        if (!text) return '';
        return text.length > 130 ? text.substring(0, 130) + '...' : text;
    }

    bindCardEvents(cardElement) {
        const toggleBtn = cardElement.querySelector('.btn-toggle-details');
        const expandable = cardElement.querySelector('.vacancy-expandable-content');
        const applyBtns = cardElement.querySelectorAll('.btn-quick-apply');

        toggleBtn.addEventListener('click', () => {
            const isExpanding = expandable.style.display === 'none';

            if (isExpanding) {
                cardElement.classList.add('is-active');
                expandable.style.display = 'block';
                const fullHeight = expandable.scrollHeight + 'px';

                // Анимация раскрытия
                setTimeout(() => {
                    expandable.style.height = fullHeight;
                    expandable.style.opacity = '1';
                    toggleBtn.textContent = 'Свернуть';

                    // Плавный скролл к карточке
                    cardElement.scrollIntoView({behavior: 'smooth', block: 'start'});
                }, 10);
            } else {
                expandable.style.height = '0';
                expandable.style.opacity = '0';
                toggleBtn.textContent = 'Подробнее';
                cardElement.classList.remove('is-active');
                setTimeout(() => {
                    expandable.style.display = 'none';
                }, 300);
            }
        });

        applyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.submitApplication(cardElement.dataset.id);
            });
        });
    }

    async submitApplication(vacancyId) {
        try {
            const userId = Helpers.getTelegramUserId();
            const response = await this.api.post(`/application/apply`, {vacancyId, telegramUserId: userId});

            if (response.status === 200) {
                notification.success('Отклик успешно отправлен');
            } else {
                notification.error('Ошибка при отправке отклика');
            }
        } catch (error) {
            notification.error(error.message);
        }
    }
}

const vacancyCardComponent = new VacancyCardComponent();