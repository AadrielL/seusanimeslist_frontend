import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Importar Link para navegação SPA

function RegisterPage({ setRegisterMessage, registerMessage }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegisterMessage('Registrando...');

        try {
            const response = await fetch('http://localhost:8081/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                }),
            });

            if (response.ok) {
                setRegisterMessage('Usuário registrado com sucesso!');
                setUsername('');
                setEmail('');
                setPassword('');
            } else {
                const errorText = await response.text();
                setRegisterMessage(`Erro ao registrar: ${errorText}`);
            }
        } catch (error) {
            console.error('Erro na requisição de registro:', error);
            setRegisterMessage('Erro de conexão. Verifique se o backend está rodando.');
        }
    };

    return (
        <form onSubmit={handleRegister}>
            <h2>Registro de Usuário</h2>
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
                    Email:
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
            <button type="submit">Registrar</button>
            {registerMessage && <p>{registerMessage}</p>}
            <p>Já tem uma conta? <Link to="/login">Faça Login!</Link></p> {/* Usando Link */}
        </form>
    );
}

export default RegisterPage;