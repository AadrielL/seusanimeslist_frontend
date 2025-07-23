// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';

function Dashboard({ jwtToken, handleLogout }) {
    const [animes, setAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(''); // Para mensagens de adicionar/atualizar

    // Função para buscar todos os animes disponíveis
    const fetchAllAnimes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8081/api/animes', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAnimes(data);
            } else {
                const errorText = await response.text();
                setError(`Erro ao carregar animes: ${errorText}`);
            }
        } catch (err) {
            console.error('Erro na requisição de animes:', err);
            setError('Erro de conexão ao carregar animes. Verifique o backend.');
        } finally {
            setLoading(false);
        }
    };

    // Função para adicionar um anime à lista do usuário
    const addAnimeToUserList = async (animeId) => {
        setMessage('');
        try {
            const response = await fetch('http://localhost:8081/api/user-animes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`,
                },
                body: JSON.stringify({
                    animeId: animeId,
                    status: 'PLANEJANDO' // Status inicial ao adicionar
                }),
            });

            if (response.ok) {
                setMessage('Anime adicionado à sua lista com sucesso!');
            } else {
                const errorText = await response.text();
                setMessage(`Erro ao adicionar anime à lista: ${errorText}`);
            }
        } catch (err) {
            console.error('Erro ao adicionar anime à lista:', err);
            setMessage('Erro de conexão ao adicionar anime à lista.');
        }
    };

    // Efeito para carregar os animes quando o componente é montado
    useEffect(() => {
        fetchAllAnimes();
    }, []);

    return (
        <div className="dashboard-container">
            <h2>Bem-vindo ao Dashboard!</h2>
            <p>Aqui você verá a lista de animes e sua lista pessoal.</p>
            <button onClick={handleLogout}>Logout</button>

            {message && <p style={{ color: message.includes('Erro') ? 'red' : 'green' }}>{message}</p>}

            <h3>Animes Disponíveis</h3>
            {loading && <p>Carregando animes...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!loading && animes.length === 0 && !error && (
                <p>Nenhum anime encontrado.</p>
            )}

            {!loading && animes.length > 0 && (
                <div className="anime-cards-grid"> {/* Contêiner do grid */}
                    {animes.map(anime => (
                        <div key={anime.id} className="anime-card"> {/* Aplicando a classe do card */}
                            {/* Adicionando a imagem do anime usando imagemUrl */}
                            {anime.imagemUrl && (
                                <img src={anime.imagemUrl} alt={anime.titulo} className="anime-cover" />
                            )}
                            
                            {/* Corrigindo para 'titulo' e 'anoLancamento' */}
                            <h4 className="anime-title">{anime.titulo} ({anime.anoLancamento ? anime.anoLancamento.substring(0, 4) : 'N/A'})</h4>
                            
                            {/* Exibindo os gêneros corretamente */}
                            <p className="anime-genre">
                                Gênero: {anime.categorias && anime.categorias.length > 0
                                    ? anime.categorias.map(cat => cat.nome).join(', ')
                                    : 'N/A'}
                            </p>
                            
                            {/* Sinopse exibida diretamente, limitada por CSS.
                                Corrigindo para 'sinopse'. */}
                            <p className="anime-description">
                                {anime.sinopse}
                            </p>
                            
                            <button className="add-to-list-button" onClick={() => addAnimeToUserList(anime.id)}>
                                Adicionar à sua lista
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Sua Lista de Animes (ainda não implementada neste snippet) */}
            <h3>Sua Lista de Animes</h3>
            <p>Aqui aparecerão os animes que você adicionou à sua lista pessoal.</p>
        </div>
    );
}

export default Dashboard;