import axios from 'axios';

const api = axios.create({
 baseURL: 'http://localhost:8081', // <--- Mude para isto!
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
            console.log("Axios Interceptor: Adicionando cabeçalho Authorization com token.");
        } else {
            console.warn("Axios Interceptor: Token JWT não encontrado no localStorage.");
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
            console.error("Axios Interceptor: 401 Unauthorized. Limpando token.");
            localStorage.removeItem('jwtToken');
            // Opcional: Você pode redirecionar o usuário para a página de login aqui
            // window.location.href = '/login'; 
            // so pra subir
        }
        return Promise.reject(error);
    }
);

export default api;