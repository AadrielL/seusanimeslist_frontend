// src/components/MyAnimeList.jsx
import React, { useState, useEffect } from 'react';
import axioConfig from '../axiosConfig';
import { useNavigate } from 'react-router-dom';

function MyAnimeList({ jwtToken, handleLogout }) {
    const [userAnimes, setUserAnimes] = useState([]);
    const [loadingUserAnimes, setLoadingUserAnimes] = useState(true);
    const [userAnimesError, setUserAnimesError] = useState(null);
    const [sortStatus, setSortStatus] = useState('');
    // NOVO: Estado para armazenar as contagens de status
    const [statusCounts, setStatusCounts] = useState({});
    const navigate = useNavigate();

    // Mapeamento de status de inglês para português
    const statusMap = {
        'COMPLETED': 'Assistido',
        'WATCHING': 'Assistindo',
        'PLAN_TO_WATCH': 'Quero Assistir',
        'ON_HOLD': 'Em Pausa',
        'DROPPED': 'Abandonado'
    };

    const fetchUserAnimes = async () => {
        setLoadingUserAnimes(true);
        setUserAnimesError(null);
        try {
            const url = sortStatus ? `/api/user-animes?status=${sortStatus}` : '/api/user-animes';
            const response = await axioConfig.get(url);
            setUserAnimes(response.data);
        } catch (err) {
            console.error('Erro na requisição da lista do usuário:', err);
            if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                setUserAnimesError('Não autorizado para ver sua lista. Faça login novamente.');
                if (handleLogout) {
                    handleLogout();
                }
            } else {
                setUserAnimesError('Erro de conexão ao carregar sua lista de animes.');
            }
        } finally {
            setLoadingUserAnimes(false);
        }
    };

    // NOVO: Função para buscar as contagens de status
    const fetchStatusCounts = async () => {
        try {
            const response = await axioConfig.get('/api/user-animes/status-counts');
            setStatusCounts(response.data);
        } catch (err) {
            console.error('Erro ao buscar contagens de status:', err);
            // Pode definir um erro ou apenas não mostrar as contagens
        }
    };

    useEffect(() => {
        if (jwtToken) {
            fetchUserAnimes();
            fetchStatusCounts(); // Chamar a nova função para buscar contagens
        } else {
            setUserAnimesError('Você precisa estar logado para ver sua lista de animes.');
            setLoadingUserAnimes(false);
        }
    }, [jwtToken, sortStatus]); // sortStatus como dependência para refazer a busca de animes (não afeta contagens diretamente)

    const handleBackToList = () => {
        navigate('/dashboard');
    };

    const handleSortStatusChange = (event) => {
        setSortStatus(event.target.value);
    };

    return (
        <div className="my-anime-list-container">
            <h3>Sua Lista Pessoal de Animes</h3>

            <div className="my-anime-list-controls">
                <button onClick={handleBackToList} className="fixed-back-button">
                    Voltar para a Lista de Animes
                </button>

                <div className="sort-by-status-container">
                    <label htmlFor="sortStatus">Filtrar por Status:</label>
                    <select id="sortStatus" value={sortStatus} onChange={handleSortStatusChange}>
                        <option value="">Todos os Animes</option>
                        {Object.entries(statusMap).map(([key, value]) => (
                            <option key={key} value={key}>{value}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* NOVO: Exibição dos contadores de status */}
            {/* Renderiza apenas se não estiver carregando e houver dados de contagem */}
            {!loadingUserAnimes && Object.keys(statusCounts).length > 0 && (
                <div className="status-counters-display">
                    <h4>Resumo da sua Lista:</h4>
                    <div className="status-badges-container">
                        {/* Mapeia sobre o statusMap para garantir a ordem e todos os status */}
                        {Object.entries(statusMap).map(([key, value]) => (
                            <span key={key} className={`status-counter-badge ${key.toLowerCase().replace(/_/g, '-')}`}>
                                {value}: <strong>{statusCounts[key] || 0}</strong> {/* Usa 0 se a contagem não existir */}
                            </span>
                        ))}
                    </div>
                </div>
            )}


            {loadingUserAnimes && <p>Carregando sua lista...</p>}
            {userAnimesError && <p style={{ color: 'red' }}>{userAnimesError}</p>}

            {!loadingUserAnimes && userAnimes.length === 0 && !userAnimesError && (
                <p>Você ainda não adicionou animes à sua lista pessoal.</p>
            )}

            {!loadingUserAnimes && userAnimes.length > 0 && (
                <div className="anime-cards-grid">
                    {userAnimes.map(userAnime => (
                        <div key={userAnime.id} className="anime-card">
                            {userAnime.animeImageUrl && (
                                <img src={userAnime.animeImageUrl} alt={userAnime.animeName} className="anime-cover" />
                            )}
                            <h4 className="anime-title">
                                {userAnime.animeName} ({userAnime.animeReleaseYear ? userAnime.animeReleaseYear : 'N/A'})
                            </h4>
                            <p className="anime-genre">
                                Gênero: {userAnime.animeGenre ? userAnime.animeGenre : 'N/A'}
                            </p>
                            <p className="anime-description">
                                {userAnime.animeSynopsis}
                            </p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span>Status:</span>
                                <span className={`anime-status-highlight ${userAnime.status ? userAnime.status.toLowerCase().replace(/_/g, '-') : ''}`}>
                                    <strong>{statusMap[userAnime.status] || userAnime.status}</strong>
                                </span>
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyAnimeList;