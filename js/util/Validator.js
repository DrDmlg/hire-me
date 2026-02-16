class Validator {
    constructor() {
        this.tg = window.Telegram.WebApp;
    }

    validatePhone(phoneInput) {
        if (phoneInput) {
            return IMask(phoneInput, {
                mask: '+{7} (000) 000-00-00',
            });
        }
    }

    validateSalary(salaryInput) {
        if (salaryInput) {
            return IMask(salaryInput, {
                mask: Number,
                thousandsSeparator: ' ',
                min: 0,
                max: 100000000,
            });
        }
    }
}

const validator = new Validator();