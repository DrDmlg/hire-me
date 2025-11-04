class ApiService {

    constructor() {
        // this.BASE_URL = 'https://hireme.serveo.net'; // Serveo
        this.BASE_URL = 'https://hireme.loca.lt'; // Localtunnel
    }

    // Основной метод - для кастомных запросов
    async request(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        const config = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            ...options
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        const response = await fetch(url, config);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    async get(endpoint) {
        return this.request(endpoint);
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: data
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// глобальный экземпляр
const apiService = new ApiService();