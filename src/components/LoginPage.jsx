import React, { useState } from 'react';
import axioConfig from '../axiosConfig';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginMessage, setLoginMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoginMessage('');

        try {
            const response = await axioConfig.post('/api/auth/login', { username, password });

            // Extrai o token da resposta do backend (ex: { "token": "..." })
            const { token } = response.data;

            // 🚨 CORREÇÃO CRÍTICA: SALVA o token no localStorage com a chave 'token'
            localStorage.setItem('token', token);

            // Chama a função onLogin (geralmente para atualizar o estado global de autenticação)
            onLogin(token);

            // Redireciona para o dashboard, onde o axiosConfig usará o token salvo
            navigate('/dashboard');

        } catch (error) {
            console.error('Erro de login:', error);
            // Melhorando a mensagem de erro para o usuário
            if (error.response) {
                // Tenta usar a mensagem de erro do Spring Boot, se houver
                const errorMessage = error.response.data.message || error.response.data || 'Credenciais inválidas.';
                setLoginMessage(`Erro: ${errorMessage}`);
            } else {
                setLoginMessage('Erro de conexão ou ao fazer login. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        // 🛑 DIV DE FUNDO ADICIONADA 🛑
        <div className="auth-background-wrapper">
            <div className="auth-container">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="username">Usuário:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="seu_usuario"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Senha:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="********"
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Entrando...' : 'Login'}
                    </button>
                </form>

                {loginMessage && <p className={`message ${loginMessage.includes('Erro') ? 'error' : 'success'}`}>{loginMessage}</p>}

                <p>
                    Não tem uma conta?{' '}
                    <Link to="/register">
                        Registre-se
                    </Link>
                </p>
            </div>
        </div> // 🛑 FECHAMENTO DA DIV DE FUNDO 🛑
    );
}

export default LoginPage;