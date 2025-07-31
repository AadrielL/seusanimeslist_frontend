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
            const { token } = response.data;
            onLogin(token);
            navigate('/dashboard');
        } catch (error) {
            console.error('Erro de login:', error);
            if (error.response && error.response.data && error.response.data.message) {
                setLoginMessage(`Erro: ${error.response.data.message}`);
            } else {
                setLoginMessage('Erro ao fazer login. Verifique suas credenciais.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
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
    );
}

export default LoginPage;