class ApiService {

    constructor() {
        //this.BASE_URL = 'https://saucily-admirable-piglet.cloudpub.ru';
        this.BASE_URL ='/api';
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

    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: data
        });
    }

    /**
     * Специализированный метод для загрузки файлов (FormData)
     * Чтобы не изменять основной метод request
     */
    async uploadFile(endpoint, formData) {
        const url = `${this.BASE_URL}${endpoint}`;

        console.log('🟡 API File Upload Request:', url);

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                // ВАЖНО: Мы НЕ устанавливаем Content-Type.
                // Браузер сам добавит multipart/form-data с нужным boundary.
                headers: {
                    // Здесь можно добавить заголовки авторизации, если они появятся в будущем
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Ошибка загрузки: ${response.status}`);
            }

            const data = await response.json();
            console.log('🟢 API File Upload Success:', data);

            return { data, status: response.status };
        } catch (error) {
            console.error('🔴 API File Upload Error:', error);
            throw error;
        }
    }
}

// глобальный экземпляр
const apiService = new ApiService();
