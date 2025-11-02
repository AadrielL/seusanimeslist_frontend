// ARQUIVO: src/main/frontend/seusanimeslist/src/App.js

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import MyAnimeList from './components/MyAnimeList';
import './index.css';
import axioConfig from './axiosConfig';

function App() {
    const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken'));
    const navigate = useNavigate();

    // NOVO: Este useEffect configura o token no cabeçalho do axios
    // sempre que o estado 'jwtToken' muda.
    useEffect(() => {
        if (jwtToken) {
            axioConfig.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        } else {
            delete axioConfig.defaults.headers.common['Authorization'];
        }
    }, [jwtToken]);

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
                <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={
                    jwtToken ? <Dashboard jwtToken={jwtToken} handleLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />
                } />
                <Route path="/my-animes" element={
                    jwtToken ? <MyAnimeList jwtToken={jwtToken} /> : <LoginPage onLogin={handleLogin} />
                } />
                <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
            </Routes>
        </div>
    );
}

export default App;