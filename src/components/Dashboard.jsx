import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axioConfig from '../axiosConfig';

function Dashboard({ jwtToken, handleLogout }) {
    const [animes, setAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalMessage, setGlobalMessage] = useState({ text: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [expandedAnimeId, setExpandedAnimeId] = useState(null);
    const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
    const navigate = useNavigate();

    // 🌟 INÍCIO DAS MODIFICAÇÕES PARA PAGINAÇÃO 🌟
    const [paginaAtual, setPaginaAtual] = useState(0); // Spring Boot Pageable começa em 0
    const [totalPaginas, setTotalPaginas] = useState(0);
    const tamanhoPagina = 20; // 20 cards por página, conforme o back-end
    // 🌟 FIM DAS MODIFICAÇÕES PARA PAGINAÇÃO 🌟

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

    // 🌟 FUNÇÃO MODIFICADA: fetchAllAnimes agora aceita um número de página 🌟
    const fetchAllAnimes = async (page = 0) => {
        setLoading(true);
        setError(null);
        setGlobalMessage({ text: '', type: '' });
        try {
            // Adicionar os parâmetros de paginação na requisição
            const response = await axioConfig.get(`/api/animes?page=${page}&size=${tamanhoPagina}`);

            // O Spring Data JPA retorna os dados em 'content' e os metadados em 'totalPages'
            setAnimes(response.data.content);
            setTotalPaginas(response.data.totalPages);
            setPaginaAtual(page); // Atualiza o estado da página

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
    // 🌟 FIM DA FUNÇÃO MODIFICADA 🌟

    // 🌟 FUNÇÃO MODIFICADA: Busca Unificada para Paginação 🌟
    const handleUnifiedSearch = async (e) => {
        e.preventDefault();
        setExpandedAnimeId(null);
        setLoading(true);
        setError(null);
        setGlobalMessage({ text: '', type: '' });

        const trimmedSearchTerm = searchTerm.trim();
        const trimmedSearchCategory = searchCategory.trim();

        if (!trimmedSearchTerm && !trimmedSearchCategory) {
            // Se a busca estiver vazia, recarrega a primeira página
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

        // Adicionar os parâmetros de paginação na busca. Sempre volta para a página 0.
        params.append('page', 0);
        params.append('size', tamanhoPagina);

        try {
            const response = await axioConfig.get(`/api/animes?${params.toString()}`);

            // Atualiza os estados com a resposta paginada
            setAnimes(response.data.content);
            setTotalPaginas(response.data.totalPages);
            setPaginaAtual(0); // Garante que volta para a primeira página de resultados de busca

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
    // 🌟 FIM DA FUNÇÃO MODIFICADA 🌟

    // 🌟 useEffect MODIFICADO (Chamada Inicial) 🌟
    useEffect(() => {
        if (localStorage.getItem('jwtToken')) {
            // Chama a primeira página (0) ao iniciar
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
    // 🌟 FIM DO useEffect MODIFICADO 🌟

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
                <form onSubmit={handleUnifiedSearch} className="header-search-form">
                    <input
                        type="text"
                        placeholder="Buscar por título ou ano..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Buscar por categoria..."
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
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

                        {/* 🌟 NOVOS CONTROLES DE PAGINAÇÃO 🌟 */}
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
                        {/* 🌟 FIM DOS CONTROLES DE PAGINAÇÃO 🌟 */}
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