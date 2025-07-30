import React, { useState } from 'react';
import axioConfig from '../axiosConfig'; // Importe seu axiosConfig
import { Link, useNavigate } from 'react-router-dom'; // Importe Link e useNavigate

function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginMessage, setLoginMessage] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoginMessage('');

        try {
            // CORREÇÃO: URL do endpoint de login com /api/
            const response = await axioConfig.post('/api/auth/login', { username, password });
            const { token } = response.data;
            onLogin(token);
            navigate('/dashboard'); // Redireciona para o dashboard após login bem-sucedido
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

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoginMessage('');

        try {
            // CORREÇÃO: URL do endpoint de registro com /api/ (ASSUMINDO /api/auth/register)
            // IMPORTANTE: VERIFIQUE NO SEU BACKEND QUAL É O ENDPOINT CORRETO PARA REGISTRO!
            const response = await axioConfig.post('/api/auth/register', { username, password });
            setLoginMessage('Registro bem-sucedido! Faça login agora.');
            setUsername(''); // Limpa o campo após o registro
            setPassword('');
            setIsRegistering(false); // Volta para o formulário de login
        } catch (error) {
            console.error('Erro de registro:', error);
            if (error.response && error.response.data && error.response.data.message) {
                setLoginMessage(`Erro: ${error.response.data.message}`);
            } else {
                setLoginMessage('Erro ao registrar. Tente novamente mais tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>{isRegistering ? 'Registrar' : 'Login'}</h2>
            <form onSubmit={isRegistering ? handleRegister : handleLogin}>
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
                    {loading ? (isRegistering ? 'Registrando...' : 'Entrando...') : (isRegistering ? 'Registrar' : 'Login')}
                </button>
            </form>

            {loginMessage && <p className={`message ${loginMessage.includes('Erro') ? 'error' : 'success'}`}>{loginMessage}</p>}

            <p>
                {isRegistering ? (
                    <>
                        Já tem uma conta?{' '}
                        <Link to="#" onClick={() => setIsRegistering(false)}>
                            Faça login
                        </Link>
                    </>
                ) : (
                    <>
                        Não tem uma conta?{' '}
                        <Link to="#" onClick={() => setIsRegistering(true)}>
                            Registre-se
                        </Link>
                    </>
                )}
            </p>
        </div>
    );
}

export default LoginPage;