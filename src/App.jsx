// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage'; // <<<<< Adicione esta linha
import Dashboard from './components/Dashboard';
import MyAnimeList from './components/MyAnimeList';
import './index.css';
import axioConfig from './axiosConfig';

function App() {
    const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken'));
    const navigate = useNavigate();

    useEffect(() => {
        const interceptor = axioConfig.interceptors.response.use(
            response => response,
            error => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    console.error('Token JWT expirado ou inválido. Redirecionando para o login.');
                    handleLogout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axioConfig.interceptors.response.eject(interceptor);
        };
    }, []);

    const handleLogin = (token) => {
        localStorage.setItem('jwtToken', token);
        setJwtToken(token);
        navigate('/dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        setJwtToken(null);
        navigate('/login');
    };

    return (
        <div className="App">
            <Routes>
                {/* A página de login */}
                <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                {/* A página de registro (agora incluída) */}
                <Route path="/register" element={<RegisterPage />} /> {/* <<<<< Adicione esta linha */}
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