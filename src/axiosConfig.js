import axios from 'axios';

// A URL base do seu backend no Render
const backendUrl = 'https://seusanimeslist-backendd2.onrender.com';

const api = axios.create({
    baseURL: backendUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar o token JWT a cada lll
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
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
            localStorage.removeItem('jwtToken');
            // Opcional: Você pode redirecionar o usuário para a página de login aqui
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;