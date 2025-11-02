import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import MyAnimeList from './components/MyAnimeList';
import './index.css';
import axioConfig from './axiosConfig';

function App() {
    // 🚨 CORRIGIDO: Lendo e escrevendo com a chave 'token' em vez de 'jwtToken'
    // A chave 'token' é a que o LoginPage está salvando corretamente.
    const [jwtToken, setJwtToken] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();

    // Este bloco garante que o token esteja no cabeçalho.
    useEffect(() => {
        if (jwtToken) {
            axioConfig.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        } else {
            delete axioConfig.defaults.headers.common['Authorization'];
        }
    }, [jwtToken]);

    // O Interceptor para lidar com 401/403 e limpar o token.
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
        // 🚨 CORRIGIDO: Salva o token na chave 'token'
        localStorage.setItem('token', token);
        setJwtToken(token);
        navigate('/dashboard');
    };

    const handleLogout = () => {
        // 🚨 CORRIGIDO: Remove o token na chave 'token'
        localStorage.removeItem('token');
        setJwtToken(null);
        navigate('/login');
    };

    return (
        <div className="App">
            <Routes>
                <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={
                    // A condição agora verifica o estado JWT correto (lido da chave 'token')
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

export default App