import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axioConfig from '../axiosConfig'; // Usando o axioConfig para consistência

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [registerMessage, setRegisterMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setRegisterMessage('Registrando...');

        try {
            const response = await axioConfig.post('/api/auth/register', { username, email, password });
            
            setRegisterMessage('Usuário registrado com sucesso! Faça login.');
            setUsername('');
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error('Erro de registro:', error);
            if (error.response && error.response.data && error.response.data.message) {
                setRegisterMessage(`Erro: ${error.response.data.message}`);
            } else {
                setRegisterMessage('Erro ao registrar. Tente novamente mais tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>Registro de Usuário</h2>
            <form onSubmit={handleRegister}>
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
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="seuemail@exemplo.com"
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
                    {loading ? 'Registrando...' : 'Registrar'}
                </button>
            </form>

            {registerMessage && <p className={`message ${registerMessage.includes('Erro') ? 'error' : 'success'}`}>{registerMessage}</p>}
            
            <p>
                Já tem uma conta?{' '}
                <Link to="/login">
                    Faça Login!
                </Link>
            </p>
        </div>
    );
}

export default RegisterPage;