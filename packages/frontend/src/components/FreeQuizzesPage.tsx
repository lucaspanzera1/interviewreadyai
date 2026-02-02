import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import {
    AcademicCapIcon,
    PlayCircleIcon,
    BoltIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const DISPLAY_DIFFICULTY: Record<string, string> = {
    'INICIANTE': 'Iniciante',
    'MEDIO': 'Intermediário',
    'DIFÍCIL': 'Avançado',
    'EXPERT': 'Expert'
};

const FreeQuizzesPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();
    const [categories, setCategories] = useState<string[]>([]);
    const [difficulties, setDifficulties] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [selectedDifficulty, setSelectedDifficulty] = useState('Todas');
    const [searchQuery, setSearchQuery] = useState('');
    const [publicQuizzes, setPublicQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [startingQuiz, setStartingQuiz] = useState<string | null>(null);
    const [highlightQuiz, setHighlightQuiz] = useState<any>(null);
    const [freeQuizLimit, setFreeQuizLimit] = useState<{ used: number; remaining: number; resetTime?: Date } | null>(null);

    const formatResetTime = (resetTime: Date) => {
        const now = new Date();
        const reset = new Date(resetTime);
        const diffMs = reset.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}min`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes}min`;
        } else {
            return 'menos de 1min';
        }
    };

    // Load initial data
    useEffect(() => {
        loadHighlightQuiz();
        loadFreeQuizLimit();
        loadFilters();
    }, []);

    // Load public quizzes when filters or page change
    useEffect(() => {
        loadPublicQuizzes();
    }, [selectedCategory, selectedDifficulty, currentPage]);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            loadPublicQuizzes();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadFilters = async () => {
        try {
            const { categories, levels } = await apiClient.getPublicFilters();
            setCategories(['Todas', ...categories]);
            setDifficulties(['Todas', ...levels]);
        } catch (error) {
            console.error('Erro ao carregar filtros:', error);
            // Fallbacks in case API fails
            setCategories(['Todas', 'Fundamentos', 'Frontend', 'Backend', 'DevOps']);
            setDifficulties(['Todas', 'INICIANTE', 'MEDIO', 'DIFÍCIL', 'EXPERT']);
        }
    };

    const loadHighlightQuiz = async () => {
        try {
            const response = await apiClient.getPublicQuizzes(1, 50);
            if (response.quizzes && response.quizzes.length > 0) {
                const sorted = [...response.quizzes].sort((a: any, b: any) =>
                    (b.totalAttempts || 0) - (a.totalAttempts || 0)
                );
                setHighlightQuiz(sorted[0]);
            }
        } catch (error) {
            console.error('Erro ao carregar quiz em destaque:', error);
        }
    };

    const loadFreeQuizLimit = async () => {
        try {
            const limit = await apiClient.getFreeQuizLimit();
            setFreeQuizLimit(limit);

            const lastRewardShown = localStorage.getItem('lastRewardShown');
            const rewardCheck = await apiClient.checkRecentReward();

            if (rewardCheck.hasRecentReward && lastRewardShown !== rewardCheck.rewardTime?.toString()) {
                showToast('🎉 Parabéns! Você ganhou 1 token por completar 5 quizzes gratuitos!', 'success');
                localStorage.setItem('lastRewardShown', rewardCheck.rewardTime?.toString() || '');
                await refreshUser();
            }
        } catch (error) {
            console.error('Erro ao carregar limite de quizzes gratuitos:', error);
        }
    };

    const loadPublicQuizzes = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getPublicQuizzes(
                currentPage,
                12,
                selectedCategory,
                selectedDifficulty,
                searchQuery
            );
            setPublicQuizzes(response.quizzes);
            setTotalPages(response.totalPages);
        } catch (error: any) {
            console.error('Erro ao carregar quizzes:', error);
            const statusCode = error.response?.status || error.statusCode || error.status;
            if (statusCode === 403) {
                const message = error.response?.data?.message || 'Acesso negado.';
                showToast(message, 'error');
            } else if (statusCode === 429) {
                showToast('Muitas requisições! Aguarde um momento.', 'error');
            } else {
                showToast('Não foi possível carregar os quizzes.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const startPublicQuiz = async (quiz: any) => {
        setStartingQuiz(quiz._id);
        try {
            if (!user) {
                showToast('Faça login para jogar os quizzes gratuitos! 🚀', 'info');
                navigate('/login');
                return;
            }

            await apiClient.recordQuizAccess(quiz._id);
            const fullQuiz = await apiClient.getQuizForPlaying(quiz._id);

            if (!fullQuiz || !fullQuiz.questions || fullQuiz.questions.length === 0) {
                showToast('Este quiz não está disponível ou não tem questões.', 'error');
                return;
            }

            localStorage.setItem('generatedQuiz', JSON.stringify(fullQuiz));
            localStorage.setItem('currentQuizId', fullQuiz._id);

            showToast('Quiz iniciado! Boa sorte! 🎯', 'success');
            navigate('/quiz/generated');
        } catch (error: any) {
            console.error('Erro ao iniciar quiz público:', error);
            const message = error.response?.data?.message || 'Erro ao iniciar o quiz.';
            showToast(message, 'error');
        } finally {
            setStartingQuiz(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <PageTitle title="Quizzes Gratuitos" />
                <div className="flex flex-col items-end gap-2">
                    <p className="text-sm text-slate-500 dark:text-slate-400 hidden md:block">
                        Pratique sem gastar tokens. <br />
                        Ganhe 1 token a cada 5 quizzes gratuitos completados!
                        <br />
                        {freeQuizLimit ? (
                            <span className="text-xs font-medium">
                                {freeQuizLimit.remaining > 0 ? (
                                    <span className="text-green-600 dark:text-green-400">
                                        Você pode fazer mais {freeQuizLimit.remaining} quiz{freeQuizLimit.remaining !== 1 ? 'zes' : ''} gratuito{freeQuizLimit.remaining !== 1 ? 's' : ''} hoje.
                                    </span>
                                ) : (
                                    <span className="text-red-600 dark:text-red-400">
                                        Limite diário de 3 quizzes atingido.
                                        {freeQuizLimit.resetTime && (
                                            <span className="block text-xs mt-1 text-slate-500 dark:text-slate-400">
                                                Reseta em {formatResetTime(freeQuizLimit.resetTime)}.
                                            </span>
                                        )}
                                    </span>
                                )}
                            </span>
                        ) : (
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Ganhe 1 token a cada 5 quizzes.</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Hero Banner */}
            {highlightQuiz ? (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-900 dark:to-indigo-900 text-white shadow-lg">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl"></div>

                    <div className="relative p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 text-violet-100 text-sm font-semibold uppercase tracking-wider">
                                <BoltIcon className="w-4 h-4 text-yellow-300" />
                                <span>Destaque da Semana</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                                    {highlightQuiz.totalAttempts} tentativas
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">{highlightQuiz.titulo}</h2>
                            <p className="text-violet-100 max-w-xl text-sm md:text-base leading-relaxed line-clamp-2">
                                {highlightQuiz.descricao}
                            </p>
                            <div className="flex gap-2 mt-2">
                                <span className="text-xs bg-white/10 px-2 py-1 rounded text-violet-100">
                                    {highlightQuiz.categoria}
                                </span>
                                <span className="text-xs bg-white/10 px-2 py-1 rounded text-violet-100">
                                    {highlightQuiz.quantidade_questoes} Questões
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => startPublicQuiz(highlightQuiz)}
                            className="shrink-0 px-6 py-3 bg-white text-violet-700 rounded-xl font-bold shadow-xl shadow-violet-900/20 hover:bg-violet-50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            {startingQuiz === highlightQuiz._id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-violet-600 border-t-transparent"></div>
                            ) : (
                                <PlayCircleIcon className="w-5 h-5" />
                            )}
                            Aceitar Desafio
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-800 h-64 animate-pulse"></div>
            )}

            {/* Filters & Search */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar quiz..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-700 pr-4 mr-2">
                        <FunnelIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Filtros:</span>
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>

                    <select
                        value={selectedDifficulty}
                        onChange={(e) => {
                            setSelectedDifficulty(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                        {difficulties.map(diff => (
                            <option key={diff} value={diff}>
                                {diff === 'Todas' ? 'Todas' : (DISPLAY_DIFFICULTY[diff] || diff)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid of Quizzes */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : publicQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publicQuizzes.map((quiz) => (
                        <div
                            key={quiz._id}
                            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-500 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
                            onClick={() => startPublicQuiz(quiz)}
                        >
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${quiz.categoria === 'Frontend' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' :
                                            quiz.categoria === 'Backend' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800' :
                                                quiz.categoria === 'DevOps' ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800' :
                                                    'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                        }`}>
                                        {quiz.categoria}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <StarIconSolid className="w-4 h-4 text-amber-400" />
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {quiz.averageScore > 0 ? ((quiz.averageScore / 100) * 5).toFixed(1) : 'N/A'}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                                            ({quiz.totalAccess || 0})
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {quiz.titulo}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                                    {quiz.descricao}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {quiz.tags?.map((tag: string) => (
                                        <span key={tag} className="text-[10px] font-medium px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md border border-slate-100 dark:border-slate-700">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <AcademicCapIcon className="w-4 h-4" />
                                        {quiz.quantidade_questoes}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <PlayCircleIcon className="w-4 h-4" />
                                        {quiz.totalAttempts}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full ${quiz.nivel === 'INICIANTE' ? 'bg-green-500' :
                                                quiz.nivel === 'MEDIO' ? 'bg-amber-500' : 'bg-red-500'
                                            }`}></span>
                                        {DISPLAY_DIFFICULTY[quiz.nivel] || quiz.nivel}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    {startingQuiz === quiz._id ? 'Carregando...' : 'Começar'}
                                    <PlayCircleIcon className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <AcademicCapIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nenhum quiz encontrado</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Tente ajustar os filtros ou sua busca.</p>
                    <button
                        onClick={() => { setSearchQuery(''); setSelectedCategory('Todas'); setSelectedDifficulty('Todas'); }}
                        className="mt-4 text-primary-600 font-medium text-sm hover:underline"
                    >
                        Limpar filtros
                    </button>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
                    >
                        Próxima
                    </button>
                </div>
            )}
        </div>
    );
};

export default FreeQuizzesPage;
