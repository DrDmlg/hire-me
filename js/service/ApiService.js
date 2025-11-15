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
            headers: {'Content-Type': 'application/json'},
            ...options
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        // 🔴 Логируем исходящий запрос
        console.log('🟡 API Request:', {
            url,
            method: config.method,
            body: options.body ? JSON.parse(config.body) : undefined
        });

        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const contentType = response.headers.get('content-type');

        let data = null;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();

            // 🟢 Логируем полученные JSON данные
            console.log('🟢 API Response JSON:', {
                url,
                status: response.status,
                data: data
            });
        } else {
            // 🔵 Логируем не-JSON ответы
            console.log('🔵 API Response (non-JSON):', {
                url,
                status: response.status,
                contentType: contentType
            });
        }

        // Возвращаем объект с данными и статусом (можно будет добавить нужный параметр для возврата если понадобится)
        return {
            data: data,
            status: response.status,
        };
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