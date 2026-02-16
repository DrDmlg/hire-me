class Validator {

    static EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

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

    validateEmail(emailInput) {
        return Validator.EMAIL_PATTERN.test(emailInput);
    }
}

const validator = new Validator();