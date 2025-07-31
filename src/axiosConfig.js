import axios from 'axios';

// A URL base do seu backend no Render
const backendUrl = 'https://seusanimeslist-backendd2.onrender.com';

const axioConfig = axios.create({
    baseURL: backendUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Adicionando um interceptor para o token JWT
axioConfig.interceptors.request.use(
    config => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default axioConfig;