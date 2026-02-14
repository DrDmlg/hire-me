class CandidateExpectationComponent extends BaseInfoComponent {
    getIds() {
        return {
            editBtn: 'editBasicInfoBtn',
            cancelBtn: 'cancelBasicInfoBtn',
            formElement: 'basicInfoFormElement',
            formContainer: 'basicInfoForm'
        };
    }

    updateDisplay() {
        if (!this.profileData?.candidate) return;
        const c = this.profileData.candidate;

        document.getElementById('desiredPositionValue').textContent = c.desiredPosition || 'Не указано';

        const salaryEl = document.getElementById('desiredSalaryValue');
        if (salaryEl && c.desiredSalary) {
            const formatted = new Intl.NumberFormat('ru-RU').format(c.desiredSalary);
            const symbol = c.currency === 'USD' ? '$' : '₽';
            salaryEl.textContent = `${formatted} ${symbol}`;
        } else if (salaryEl) {
            salaryEl.textContent = 'Не указана';
        }
    }

    fillForm() {
        const c = this.profileData?.candidate || {};
        document.getElementById('editPositionInput').value = c.desiredPosition || '';
        document.getElementById('editSalaryInput').value = c.desiredSalary || '';
        document.getElementById('editCurrencySelect').value = c.currency || 'RUB';
    }

    async onFormSubmit(event) {
        event.preventDefault();
        const rawSalary = document.getElementById('editSalaryInput').value;

        const data = {
            desiredPosition: document.getElementById('editPositionInput').value.trim(),
            desiredSalary: rawSalary ? parseFloat(rawSalary.replace(/\s/g, '')) : null,
            currency: document.getElementById('editCurrencySelect').value
        };

        const candidateId = this.profileData.candidate.id;
        await this.sendRequest(`/candidate/expectation/${candidateId}`, data, 'candidate');
    }
}