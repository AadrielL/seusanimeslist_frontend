import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axioConfig from '../axiosConfig';

function Dashboard({ jwtToken, handleLogout }) {

    // 🛑 LÓGICA DO HOOK DE SCROLL REINTRODUZIDA 🛑
    const [scrollDir, setScrollDir] = useState("up");
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const updateScrollDir = () => {
            const { scrollY } = window;
            const direction = scrollY > lastScrollY ? "down" : "up";

            if ((direction !== scrollDir && Math.abs(lastScrollY - scrollY) > 5) || scrollY === 0) {
                setScrollDir(direction);
            }
            setLastScrollY(scrollY > 0 ? scrollY : 0);
        };

        const onScroll = () => window.requestAnimationFrame(updateScrollDir);
        window.addEventListener("scroll", onScroll);

        return () => window.removeEventListener("scroll", onScroll);
    }, [lastScrollY, scrollDir]);

    // Variável de controle para o JSX (esconde se rolar para baixo, exceto se estiver no topo)
    const isHeaderHidden = scrollDir === "down" && window.scrollY > 100;
    // 🛑 FIM DA LÓGICA DO SCROLL 🛑


    // ESTADOS
    const [animes, setAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalMessage, setGlobalMessage] = useState({ text: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [expandedAnimeId, setExpandedAnimeId] = useState(null);
    const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const navigate = useNavigate();

    // Paginação
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const tamanhoPagina = 20;


    // 🆕 EFEITO TEMA: Alterna a classe 'light-mode' no body
    useEffect(() => {
        // Inicializa com base no estado (pode ser carregado do localStorage se desejar persistência)
        if (isDarkMode) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    // Efeito para mensagens globais
    useEffect(() => {
        if (globalMessage.text || error) {
            const timer = setTimeout(() => {
                setGlobalMessage({ text: '', type: '' });
                setError(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [globalMessage, error]);

    // Efeito para carregamento inicial e scroll to top
    useEffect(() => {
        if (localStorage.getItem('token')) {
            fetchAllAnimes(0);
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

    const fetchAllAnimes = async (page = 0) => {
        setLoading(true);
        setError(null);
        setGlobalMessage({ text: '', type: '' });
        try {
            const response = await axioConfig.get(`/api/animes?page=${page}&size=${tamanhoPagina}`);
            setAnimes(response.data.content);
            setTotalPaginas(response.data.totalPages);
            setPaginaAtual(page);

            if (response.data.content.length > 0) {
                setGlobalMessage({ text: `Página ${page + 1} de animes carregada!`, type: 'success' });
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

    const handleUnifiedSearch = async (e) => {
        e.preventDefault();
        setExpandedAnimeId(null);
        setLoading(true);
        setError(null);
        setGlobalMessage({ text: '', type: '' });

        const trimmedSearchTerm = searchTerm.trim();
        const trimmedSearchCategory = searchCategory.trim();

        if (!trimmedSearchTerm && !trimmedSearchCategory) {
            fetchAllAnimes(0);
            return;
        }

        let params = new URLSearchParams();
        let searchType = '';
        let searchValue = '';

        if (trimmedSearchCategory) {
            params.append('categoria', trimmedSearchCategory);
            searchType = 'categoria';
            searchValue = trimmedSearchCategory;
        } else {
            const yearNum = parseInt(trimmedSearchTerm, 10);
            if (!isNaN(yearNum) && trimmedSearchTerm.length === 4) {
                params.append('ano', yearNum);
                searchType = 'ano';
                searchValue = trimmedSearchTerm;
            } else {
                params.append('titulo', trimmedSearchTerm);
                searchType = 'título';
                searchValue = trimmedSearchTerm;
            }
        }

        params.append('page', 0);
        params.append('size', tamanhoPagina);

        try {
            const response = await axioConfig.get(`/api/animes?${params.toString()}`);
            setAnimes(response.data.content);
            setTotalPaginas(response.data.totalPages);
            setPaginaAtual(0);

            if (response.data.content.length > 0) {
                setGlobalMessage({ text: `Busca por ${searchType} "${searchValue}" realizada com sucesso.`, type: 'success' });
            } else {
                setGlobalMessage({ text: `Nenhum anime encontrado com ${searchType} "${searchValue}".`, type: 'info' });
            }
        } catch (err) {
            console.error('Erro na requisição de busca unificada:', err);
            if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                setError('Acesso negado ou sessão expirada. Por favor, faça login novamente.');
            } else {
                setError(`Erro ao buscar animes. Verifique o backend ou sua conexão.`);
            }
            setAnimes([]);
        } finally {
            setLoading(false);
        }
    };

    // Funções de Lista e Botões
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

    // Botão "Resetar Busca" removido do menu, mas mantido a função caso precise.
    // const handleResetSearch = () => { ... }


    return (
        <div className="app-container">
            {/* 🛑 HEADER ÚNICO QUE SOME E APARECE 🛑 */}
            <div className={`header-fixed-container full-nav-bar ${isHeaderHidden ? 'hidden' : ''}`}>

                {/* 1. Botões de Navegação (Minha Lista e Modo) */}
                <div className="main-nav-buttons">
                    <Link to="/my-animes" className="nav-button">
                        Minha Lista
                    </Link>
                    <button onClick={toggleTheme} className="nav-button theme-toggle-button">
                        {isDarkMode ? '🌞 Modo Light' : '🌙 Modo Dark'}
                    </button>
                </div>

                {/* 2. Formulário de Busca */}
                <form onSubmit={handleUnifiedSearch} className="header-search-form">
                    <input
                        type="text"
                        placeholder="Buscar Título ou Ano..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit">Buscar</button>
                </form>

                {/* 3. Botão de Logout */}
                <button onClick={handleLogout} className="fixed-logout-button">LOGOUT</button>
            </div>


            {(globalMessage.text || error) && (
                // Ajuste o margin-top para que a mensagem apareça abaixo do header
                <div className="global-message-container" style={{ marginTop: '70px' }}>
                    <div className={`global-message ${error ? 'error' : globalMessage.type}`}>
                        {error ? error : globalMessage.text}
                    </div>
                </div>
            )}

            <div className="dashboard-content">
                <h1>BEM-VINDO AO SEUSANIMELIST!</h1>
                <p>Aqui você pode explorar animes, buscar e gerenciar sua lista pessoal.</p>

                <hr />
                <h2>ANIMES DISPONÍVEIS (OU LANÇAMENTOS/POPULARES)</h2>

                {loading && <p>Carregando animes...</p>}

                {!loading && animes.length === 0 && !error && (
                    <p>Nenhum anime encontrado. Tente ajustar sua busca ou verifique se há animes disponíveis no servidor.</p>
                )}

                {!loading && animes.length > 0 && (
                    <>
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

                        {/* Controles de Paginação */}
                        <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '30px 0', gap: '20px' }}>
                            <button
                                onClick={() => fetchAllAnimes(paginaAtual - 1)}
                                disabled={paginaAtual === 0}
                                className="pagination-button"
                            >
                                &larr; Página Anterior
                            </button>

                            <span className="page-info" style={{ fontWeight: 'bold' }}>
                                Página {paginaAtual + 1} de {totalPaginas}
                            </span>

                            <button
                                onClick={() => fetchAllAnimes(paginaAtual + 1)}
                                disabled={paginaAtual >= totalPaginas - 1}
                                className="pagination-button"
                            >
                                Próxima Página &rarr;
                            </button>
                        </div>
                    </>
                )}
            </div>

            {showScrollToTopButton && (
                <button onClick={scrollToTop} className="scroll-to-top-button">↑</button>
            )}
        </div>
    );
}

export default Dashboard;