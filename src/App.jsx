// src/App.jsx
import React, { useState, useEffect } from 'react';
// Removido 'Router' do import, pois BrowserRouter é usado no main.jsx
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage'; // CORRIGIDO: Importa LoginPage.jsx
import Dashboard from './components/Dashboard';
import MyAnimeList from './components/MyAnimeList';
import './index.css'; // CORRIGIDO: Importa index.css
import axioConfig from './axiosConfig'; // O axiosConfig.js que contém o interceptor

function App() {
    const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken'));
    const navigate = useNavigate(); // Hook para navegação programática

    // Configurar o interceptor para lidar com 401/403 globalmente
    useEffect(() => {
        const interceptor = axioConfig.interceptors.response.use(
            response => response,
            error => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    console.error('Token JWT expirado ou inválido. Redirecionando para o login.');
                    handleLogout(); // Limpa o token e redireciona
                }
                return Promise.reject(error);
            }
        );

        // Limpa o interceptor quando o componente é desmontado
        return () => {
            axioConfig.interceptors.response.eject(interceptor);
        };
    }, []); // Executa apenas uma vez na montagem do componente

    const handleLogin = (token) => {
        localStorage.setItem('jwtToken', token);
        setJwtToken(token);
        navigate('/dashboard'); // Redireciona para o dashboard após login
    };

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        setJwtToken(null);
        navigate('/login'); // Redireciona para a página de login
    };

    return (
        <div className="App">
            <Routes>
                <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                {/* Rota do Dashboard: a página inicial com busca e links */}
                <Route path="/dashboard" element={
                    jwtToken ? <Dashboard jwtToken={jwtToken} handleLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />
                } />
                {/* Rota para a sua lista pessoal de animes */}
                <Route path="/my-animes" element={
                    jwtToken ? <MyAnimeList jwtToken={jwtToken} /> : <LoginPage onLogin={handleLogin} />
                } />
                {/* Rota padrão redireciona para login */}
                <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
            </Routes>
        </div>
    );
}

export default App;