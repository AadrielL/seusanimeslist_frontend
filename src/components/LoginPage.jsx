// src/components/LoginPage.jsx
import React, { useState } from 'react';

function LoginPage({ setJwtToken, setLoginMessage, loginMessage }) { // Renomeado para LoginPage
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginMessage('Fazendo login...');

        try {
            const response = await fetch('http://localhost:8081/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
            });

            if (response.ok) {
                const token = await response.text();
                setJwtToken(token);
                localStorage.setItem('jwtToken', token);
                setLoginMessage('Login bem-sucedido!');
                setUsername('');
                setPassword('');
                // Em uma aplicação real, você redirecionaria para o dashboard aqui
            } else {
                const errorText = await response.text();
                setLoginMessage(`Erro ao fazer login: ${errorText}`);
            }
        } catch (error) {
            console.error('Erro na requisição de login:', error);
            setLoginMessage('Erro de conexão. Verifique se o backend está rodando.');
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <h2>Login de Usuário</h2>
            <div>
                <label>
                    Usuário:
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </label>
            </div>
            <div>
                <label>
                    Senha:
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
            </div>
            <button type="submit">Login</button>
            {loginMessage && <p>{loginMessage}</p>}
            {/* Opcional: Adicionar um link para a página de registro */}
            <p>Não tem uma conta? <a href="/register" style={{ color: 'var(--accent-red)', textDecoration: 'none', fontWeight: 'bold' }}>Registre-se!</a></p>
        </form>
    );
}

export default LoginPage; // Renomeado para LoginPage