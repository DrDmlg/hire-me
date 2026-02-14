class EmployerDetailComponent extends BaseInfoComponent {
    getIds() {
        return {
            editBtn: 'editEmployerBtn',
            cancelBtn: 'cancelEmployerBtn',
            formElement: 'employerFormElement',
            formContainer: 'employerForm'
        };
    }

    updateDisplay() {
        const emp = this.profileData?.employer || {};
        const companyEl = document.getElementById('companyNameValue');
        const locationEl = document.getElementById('employerLocationValue');
        const positionEl = document.getElementById('employerPositionValue');

        if (companyEl) companyEl.textContent = emp.companyName || 'Не указано';
        if (locationEl) locationEl.textContent = emp.companyAddress || 'Не указано';
        if (positionEl) positionEl.textContent = emp.position || 'Не указано';
    }

    fillForm() {
        const emp = this.profileData?.employer || {};
        const companyNameInput = document.getElementById('editCompanyNameInput');
        const locationInput = document.getElementById('editEmployerLocationInput');
        const positionInput = document.getElementById('editEmployerPositionInput');

        if (companyNameInput) companyNameInput.value = emp.companyName || '';
        if (locationInput) locationInput.value = emp.companyAddress || '';
        if (positionInput) positionInput.value = emp.position || '';
    }

    async onFormSubmit(event) {
        event.preventDefault();

        const data = {
            companyName: document.getElementById('editCompanyNameInput').value.trim(),
            companyAddress: document.getElementById('editEmployerLocationInput').value.trim(),
            position: document.getElementById('editEmployerPositionInput').value.trim()

        };

        const employerid = this.profileData?.employer?.id;
        await this.sendRequest(`/employer/detail/${employerid}`, data, 'employer');
    }
}