import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axioConfig from '../axiosConfig';
import useScrollDirection from './useScrollDirec    tion';
function Dashboard({ jwtToken, handleLogout }) {
    const [animes, setAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalMessage, setGlobalMessage] = useState({ text: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState(''); // Mantido, mas removido do layout fixo
    const [expandedAnimeId, setExpandedAnimeId] = useState(null);
    const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);

    const scrollDirection = useScrollDirection(); // Usa o Hook

    const navigate = useNavigate();

    // Paginação
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const tamanhoPagina = 20;

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

    const fetchAllAnimes = async (page = 0) => {
        setLoading(true);
        setError(null);
        setGlobalMessage({ text: '', type: '' });
        try {
            const response = await axioConfig.get(`/api/animes?page=${page}&size=${tamanhoPagina}`);
            setAnimes(response.data.content);
            setTotalPaginas(response.data.totalPages);
            setPaginaAtual(page);

            console.log("All animes loaded successfully:", response.data);
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
        const trimmedSearchCategory = searchCategory.trim(); // Mantido para lógica

        if (!trimmedSearchTerm && !trimmedSearchCategory) {
            fetchAllAnimes(0);
            return;
        }

        let params = new URLSearchParams();
        let searchType = '';
        let searchValue = '';

        // A lógica permanece a mesma para a busca, mesmo que o campo de categoria não esteja no header fixo
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
            console.log("Busca unificada realizada com sucesso:", response.data);
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

    // useEffect para carregamento inicial e scroll to top
    useEffect(() => {
        if (localStorage.getItem('jwtToken')) {
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

    // 🛑 Lógica para a barra flutuante: Esconder se rolar para baixo e não estiver no topo.
    const isFloatingNavHidden = scrollDirection === "down" && window.scrollY > 200;

    // 🛑 FUNÇÃO PARA FORÇAR BUSCA VAZIA (Resetar Busca)
    const handleResetSearch = () => {
        setSearchTerm('');
        setSearchCategory(''); // Também limpa a categoria em memória
        fetchAllAnimes(0); // Recarrega a primeira página de todos os animes
        setGlobalMessage({ text: 'Busca resetada. Exibindo todos os animes.', type: 'info' });
    }

    return (
        <div className="app-container">
            {/* 🛑 HEADER FIXO SUPERIOR - Contém Busca ÚNICA e Logout */}
            <div className="header-fixed-container">
                <form onSubmit={handleUnifiedSearch} className="header-search-form">
                    {/* Apenas um campo para Título ou Ano */}
                    <input
                        type="text"
                        placeholder="Buscar Título ou Ano..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit">Buscar</button>
                </form>
                <button onClick={handleLogout} className="fixed-logout-button">LOGOUT</button>
            </div>

            {/* 🛑 NOVO: BARRA DE NAVEGAÇÃO FLUTUANTE */}
            <div className={`floating-nav-bar ${isFloatingNavHidden ? 'hidden' : ''}`}>
                <button
                    onClick={handleResetSearch}
                    className="nav-button"
                >
                    Resetar Busca
                </button>
                <Link to="/my-animes" className="nav-button">
                    Minha Lista
                </Link>
                <Link to="/add-anime" className="nav-button">
                    Adicionar Novo Anime
                </Link>
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
                {/* Mantido aqui para referência, mas a barra flutuante é o novo menu principal */}
                <nav className="dashboard-nav">
                    <Link to="/my-animes" className="nav-button">Minha Lista de Animes</Link>
                    <Link to="/add-anime" className="nav-button">Adicionar Novo Anime</Link>
                </nav>

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