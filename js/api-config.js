// js/api-config.js

// Configuración de la API
const API_CONFIG = {
    BASE_URL: 'http://localhost:8081/api',  // 🔥 CAMBIAR A 8081
    ENDPOINTS: {
        auth: '/auth',
        orders: '/orders',
        orderItems: '/order-items',
        products: '/products/public',
        cart: '/cart',
        users: '/users'
    }
};

// Clase base para peticiones HTTP
class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        // 🔥 AGREGAR TOKEN SI ES NECESARIO
        if (options.requiresAuth !== false) {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorText = await response.text();
                try {
                    const error = JSON.parse(errorText);
                    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
                } catch (e) {
                    throw new Error(errorText || `Error ${response.status}: ${response.statusText}`);
                }
            }

            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('Error en petición API:', error);
            throw error;
        }
    }

    get(endpoint, requiresAuth = true) {
        return this.request(endpoint, { method: 'GET', requiresAuth });
    }

    post(endpoint, data, requiresAuth = true) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            requiresAuth
        });
    }

    put(endpoint, data, requiresAuth = true) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            requiresAuth
        });
    }

    delete(endpoint, requiresAuth = true) {
        return this.request(endpoint, { method: 'DELETE', requiresAuth });
    }
}

// Crear instancia de la API
const apiClient = new ApiClient(API_CONFIG.BASE_URL);

// 🔥 EXPONER GLOBALMENTE
window.apiClient = apiClient;
window.API_CONFIG = API_CONFIG;

console.log('✅ api-config.js cargado correctamente');
console.log('📦 API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
console.log('✅ apiClient disponible:', typeof apiClient);