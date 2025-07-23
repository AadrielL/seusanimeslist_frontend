import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';

function App() {
    const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken') || null);
    const [loginMessage, setLoginMessage] = useState('');
    const [registerMessage, setRegisterMessage] = useState('');

    const handleLogout = () => {
        setJwtToken(null);
        localStorage.removeItem('jwtToken');
        setLoginMessage('Você foi desconectado.');
        setRegisterMessage('');
    };

    return (
        <Router>
            <div className="app-container"> {/* Adicionada classe para estilização */}
                <Routes>
                    <Route
                        path="/login"
                        element={
                            jwtToken ? (
                                <Navigate to="/dashboard" replace />
                            ) : (
                                <LoginPage
                                    setJwtToken={setJwtToken}
                                    setLoginMessage={setLoginMessage}
                                    loginMessage={loginMessage}
                                />
                            )
                        }
                    />

                    <Route
                        path="/register"
                        element={
                            jwtToken ? (
                                <Navigate to="/dashboard" replace />
                            ) : (
                                <RegisterPage
                                    setRegisterMessage={setRegisterMessage}
                                    registerMessage={registerMessage}
                                />
                            )
                        }
                    />

                    <Route
                        path="/dashboard"
                        element={
                            jwtToken ? (
                                <Dashboard jwtToken={jwtToken} handleLogout={handleLogout} />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    <Route
                        path="/"
                        element={
                            jwtToken ? (
                                <Navigate to="/dashboard" replace />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;