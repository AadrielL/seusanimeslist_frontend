import axios from 'axios';

// A URL base do seu backend no Render
const backendUrl = 'https://seusanimeslist-backendd2.onrender.com';

const api = axios.create({
    baseURL: backendUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar o token JWT a cada requisição
api.interceptors.request.use(
    (config) => {
        // CORRIGIDO: Usando 'token' (chave curta) em vez de 'jwtToken'
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Opcional: Interceptor para lidar com 401 e limpar o token
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // CORRIGIDO: Também limpando a chave 'token'
            localStorage.removeItem('token');
            // window.location.href = '/login'; // Opcional
        }
        return Promise.reject(error);
    }
);

export default api;