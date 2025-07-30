import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axioConfig from '../axiosConfig';

function Dashboard({ jwtToken, handleLogout }) {
    const [animes, setAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalMessage, setGlobalMessage] = useState({ text: '', type: '' });
    const [searchTerm, setSearchTerm] = useState(''); // Este será o único campo de busca
    // const [searchYear, setSearchYear] = useState(''); // REMOVIDO: Não precisamos mais de um estado separado para o ano
    const [expandedAnimeId, setExpandedAnimeId] = useState(null);
    const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
    const navigate = useNavigate();

    // Efeito para esconder a mensagem global após 3 segundos
    useEffect(() => {
        if (globalMessage.text || error) {
            const timer = setTimeout(() => {
                setGlobalMessage({ text: '', type: '' });
                setError(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [globalMessage, error]);

    const fetchAllAnimes = async () => {
        setLoading(true);
        setError(null);
        setGlobalMessage({ text: '', type: '' });
        try {
            const response = await axioConfig.get('/api/animes');
            setAnimes(response.data);
            console.log("All animes loaded successfully:", response.data);
            if (response.data.length > 0) {
                setGlobalMessage({ text: 'Todos os animes disponíveis carregados!', type: 'success' });
            } else {
                setGlobalMessage({ text: 'Nenhum anime encontrado na base de dados.', type: 'info' });
            }
        } catch (err) {
            console.error('Erro na requisição de todos os animes:', err);
            setError('Erro ao carregar animes. Verifique sua conexão ou o status do servidor.');
            setAnimes([]);
        } finally {
            setLoading(false);
        }
    };

    // NOVA FUNÇÃO: Busca Unificada por Título ou Ano
    const handleUnifiedSearch = async (e) => {
        e.preventDefault();
        setExpandedAnimeId(null);
        setLoading(true);
        setError(null);
        setGlobalMessage({ text: '', type: '' });

        const trimmedSearchTerm = searchTerm.trim();

        if (!trimmedSearchTerm) {
            // Se o campo estiver vazio, carrega todos os animes
            fetchAllAnimes();
            return;
        }

        // Tenta converter o termo de busca para um número inteiro
        const yearNum = parseInt(trimmedSearchTerm, 10);
        let params = new URLSearchParams();
        let searchType = ''; // 'titulo' ou 'ano'

        if (!isNaN(yearNum) && trimmedSearchTerm.length === 4) { // Verifica se é um número e tem 4 dígitos (comum para anos)
            params.append('ano', yearNum);
            searchType = 'ano';
        } else {
            params.append('titulo', trimmedSearchTerm);
            searchType = 'titulo';
        }

        try {
            const response = await axioConfig.get(`/api/animes?${params.toString()}`);
            setAnimes(response.data);
            if (response.data.length > 0) {
                setGlobalMessage({ text: `Busca por ${searchType === 'titulo' ? 'título' : 'ano'} "${trimmedSearchTerm}" realizada com sucesso.`, type: 'success' });
            } else {
                setGlobalMessage({ text: `Nenhum anime encontrado com ${searchType === 'titulo' ? 'o título' : 'o ano'} "${trimmedSearchTerm}".`, type: 'info' });
            }
            console.log(`Busca por ${searchType} realizada com sucesso:`, response.data);
        } catch (err) {
            console.error(`Erro na requisição de busca por ${searchType}:`, err);
            if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                setError('Acesso negado ou sessão expirada. Por favor, faça login novamente.');
            } else {
                setError(`Erro ao buscar animes por ${searchType}. Verifique o backend ou sua conexão.`);
            }
            setAnimes([]);
        } finally {
            setLoading(false);
        }
    };

    // REMOVIDO: handleSearchByTitle e handleSearchByYear não são mais necessários

    useEffect(() => {
        if (localStorage.getItem('jwtToken')) {
            fetchAllAnimes();
        } else {
            setError('Você precisa estar logado para ver os animes.');
            setLoading(false);
        }

        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollToTopButton(true);
            } else {
                setShowScrollToTopButton(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleAddButtonClick = (animeId) => {
        setExpandedAnimeId(expandedAnimeId === animeId ? null : animeId);
        setGlobalMessage({ text: '', type: '' });
    };

    const handleFormSubmitSuccess = async (animeId, status) => {
        try {
            await axioConfig.post('/api/user-animes', { animeId, status }); 
            setGlobalMessage({ text: 'Anime adicionado/atualizado na sua lista com sucesso!', type: 'success' });
            setExpandedAnimeId(null);
        } catch (err) {
            console.error('Erro ao adicionar/atualizar anime na lista:', err);
            setError('Erro ao gerenciar sua lista de animes. Verifique o backend ou tente novamente.');
        }
    };

    const handleFormCancel = () => {
        setExpandedAnimeId(null);
        setGlobalMessage({ text: '', type: '' });
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="app-container">
            <div className="header-fixed-container">
                {/* NOVO: Formulário de Busca Unificada */}
                <form onSubmit={handleUnifiedSearch} className="header-search-form">
                    <input
                        type="text"
                        placeholder="Buscar por título ou ano..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit">Buscar</button>
                </form>
                <button onClick={handleLogout} className="fixed-logout-button">LOGOUT</button>
            </div>

            {(globalMessage.text || error) && (
                <div className="global-message-container">
                    <div className={`global-message ${error ? 'error' : globalMessage.type}`}>
                        {error ? error : globalMessage.text}
                    </div>
                </div>
            )}

            <div className="dashboard-content">
                <h1>BEM-VINDO AO SEUSANIMELIST!</h1>
                <p>Aqui você pode explorar animes, buscar e gerenciar sua lista pessoal.</p>
                
                <hr />
                <h2>NAVEGAÇÃO RÁPIDA</h2>
                <nav className="dashboard-nav">
                    <Link to="/my-animes" className="nav-button">Minha Lista de Animes</Link>
                </nav>

                <hr />
                {/* REMOVIDO: Título "BUSCAR ANIMES" e o formulário de busca por ano */}
                {/* <h2>BUSCAR ANIMES</h2> */} 
                {/* <form onSubmit={handleSearchByYear} className="search-form">
                    <input
                        type="number"
                        placeholder="Buscar anime por ano (ex: 2023)..."
                        value={searchYear}
                        onChange={(e) => setSearchYear(e.target.value)}
                    />
                    <button type="submit">Buscar por Ano</button>
                </form> */}

                <hr />
                <h2>ANIMES DISPONÍVEIS (OU LANÇAMENTOS/POPULARES)</h2>
                {loading && <p>Carregando animes...</p>}

                {!loading && animes.length === 0 && !error && (
                    <p>Nenhum anime encontrado. Tente ajustar sua busca ou verifique se há animes disponíveis no servidor.</p>
                )}

                {!loading && animes.length > 0 && (
                    <div className="anime-cards-grid">
                        {animes.map(anime => (
                            <div key={anime.id} className="anime-card">
                                {anime.imagemUrl && (
                                    <img src={anime.imagemUrl} alt={anime.titulo} className="anime-cover" />
                                )}
                                <h4 className="anime-title" title={anime.titulo}>
                                    {anime.titulo} ({anime.anoLancamento ? anime.anoLancamento.substring(0, 4) : 'N/A'})
                                </h4>
                                <p className="anime-genre">
                                    Gênero: {anime.categorias && anime.categorias.length > 0
                                        ? anime.categorias.map(cat => cat.nome).join(', ')
                                        : 'N/A'}
                                </p>
                                <p className="anime-description" title={anime.sinopse}>
                                    {anime.sinopse}
                                </p>
                                {expandedAnimeId === anime.id ? (
                                    <div> 
                                        <select onChange={(e) => handleFormSubmitSuccess(anime.id, e.target.value)}>
                                            <option value="">Selecione um status</option>
                                            <option value="COMPLETED">ASSISTIDO</option>
                                            <option value="WATCHING">ASSISTINDO</option>
                                            <option value="PLAN_TO_WATCH">QUERO ASSISTIR</option>
                                            <option value="ON_HOLD">EM PAUSA</option>
                                            <option value="DROPPED">ABANDONADO</option>
                                        </select>
                                        <button onClick={handleFormCancel}>Cancelar</button>
                                    </div>
                                ) : (
                                    <button
                                        className="add-to-list-button"
                                        onClick={() => handleAddButtonClick(anime.id)}
                                    >
                                        Adicionar à Lista
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showScrollToTopButton && (
                <button onClick={scrollToTop} className="scroll-to-top-button">↑</button>
            )}
        </div>
    );
}

export default Dashboard;