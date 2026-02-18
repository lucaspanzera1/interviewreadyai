import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import PageTitle from './PageTitle';
import {
    AcademicCapIcon,
    PlayCircleIcon,
    BoltIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    QuestionMarkCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const NICHOS = [
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'educacao', label: 'Educação' },
    { value: 'recursos_humanos', label: 'Recursos Humanos' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'saude', label: 'Saúde' },
    { value: 'vendas', label: 'Vendas' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'juridico', label: 'Jurídico' },
    { value: 'engenharia', label: 'Engenharia' },
    { value: 'design', label: 'Design' },
    { value: 'produto', label: 'Produto' },
    { value: 'outro', label: 'Outro' },
];

const FreeQuizzesPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();
    const { t } = useTranslation('quiz');
    const [categories, setCategories] = useState<{ value: string, label: string }[]>([]);
    const [difficulties, setDifficulties] = useState<string[]>([]);
    const [selectedCategoryValue, setSelectedCategoryValue] = useState('Todas');
    const [selectedDifficulty, setSelectedDifficulty] = useState('Todas');
    const [searchQuery, setSearchQuery] = useState('');
    const [publicQuizzes, setPublicQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [startingQuiz, setStartingQuiz] = useState<string | null>(null);
    const [highlightQuiz, setHighlightQuiz] = useState<any>(null);
    const [freeQuizLimit, setFreeQuizLimit] = useState<{ used: number; remaining: number; resetTime?: Date } | null>(null);
    const [showHelp, setShowHelp] = useState(false);

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
            return t('freeQuizzes.lessThan1Min');
        }
    };

    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
    const observer = useRef<IntersectionObserver | null>(null);

    const lastQuizElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && currentPage < totalPages) {
                setCurrentPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, totalPages, currentPage]);

    // Load initial data
    useEffect(() => {
        loadHighlightQuiz();
        loadFreeQuizLimit();
        loadFilters();
    }, []);

    // Sync search query with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset list when filters change
    useEffect(() => {
        setCurrentPage(1);
        setPublicQuizzes([]);
    }, [selectedCategoryValue, selectedDifficulty, debouncedSearch]);

    // Load public quizzes when filters or page change
    useEffect(() => {
        loadPublicQuizzes();
    }, [selectedCategoryValue, selectedDifficulty, currentPage, debouncedSearch]);

    const loadFilters = async () => {
        try {
            const { levels } = await apiClient.getPublicFilters();
            setCategories([{ value: 'Todas', label: 'Todas' }, ...NICHOS]);
            setDifficulties(['Todas', ...levels]);
        } catch (error) {
            console.error('Erro ao carregar filtros:', error);
            // Fallbacks in case API fails
            setCategories([{ value: 'Todas', label: 'Todas' }, ...NICHOS]);
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
                showToast(t('freeQuizzes.rewardEarned'), 'success');
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
                selectedCategoryValue,
                selectedDifficulty,
                debouncedSearch
            );

            setPublicQuizzes(prev => {
                if (currentPage === 1) return response.quizzes;
                // Filter out duplicates just in case
                const newQuizzes = response.quizzes.filter((newQ: any) =>
                    !prev.some(existingQ => existingQ._id === newQ._id)
                );
                return [...prev, ...newQuizzes];
            });
            setTotalPages(response.totalPages);
        } catch (error: any) {
            console.error('Erro ao carregar quizzes:', error);
            const statusCode = error.response?.status || error.statusCode || error.status;
            if (statusCode === 403) {
                const message = error.response?.data?.message || t('freeQuizzes.accessDenied');
                showToast(message, 'error');
            } else if (statusCode === 429) {
                showToast(t('freeQuizzes.tooManyRequests'), 'error');
            } else {
                showToast(t('freeQuizzes.errorLoadingQuizzes'), 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const startPublicQuiz = async (quiz: any) => {
        setStartingQuiz(quiz._id);
        try {
            if (!user) {
                showToast(t('freeQuizzes.loginRequired'), 'info');
                navigate('/login');
                return;
            }

            await apiClient.recordQuizAccess(quiz._id);
            const fullQuiz = await apiClient.getQuizForPlaying(quiz._id);

            if (!fullQuiz || !fullQuiz.questions || fullQuiz.questions.length === 0) {
                showToast(t('freeQuizzes.quizNotAvailable'), 'error');
                return;
            }

            localStorage.setItem('generatedQuiz', JSON.stringify(fullQuiz));
            localStorage.setItem('currentQuizId', fullQuiz._id);

            showToast(t('freeQuizzes.quizStarted'), 'success');
            navigate('/quiz/generated');
        } catch (error: any) {
            console.error('Erro ao iniciar quiz público:', error);
            const message = error.response?.data?.message || t('freeQuizzes.errorStarting');
            showToast(message, 'error');
        } finally {
            setStartingQuiz(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <PageTitle title={t('freeQuizzes.pageTitle')} />
                <div className="flex flex-col items-end gap-2">
                    <p className="text-sm text-slate-500 dark:text-slate-400 hidden md:block">
                        {t('freeQuizzes.subtitle')} <br />
                        {t('freeQuizzes.earnTokensDesc')}
                        <br />
                        {freeQuizLimit ? (
                            <span className="text-xs font-medium">
                                {freeQuizLimit.remaining > 0 ? (
                                    <span className="text-green-600 dark:text-green-400">
                                        {t('freeQuizzes.remainingQuizzes', { count: freeQuizLimit.remaining })}
                                    </span>
                                ) : (
                                    <span className="text-red-600 dark:text-red-400">
                                        {t('freeQuizzes.dailyLimitReached')}
                                        {freeQuizLimit.resetTime && (
                                            <span className="block text-xs mt-1 text-slate-500 dark:text-slate-400">
                                                {t('freeQuizzes.resetsIn', { time: formatResetTime(freeQuizLimit.resetTime) })}
                                            </span>
                                        )}
                                    </span>
                                )}
                            </span>
                        ) : (
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">{t('freeQuizzes.earnTokenShort')}</span>
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
                                <span>{t('freeQuizzes.weekHighlight')}</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                                    {highlightQuiz.totalAttempts} {t('freeQuizzes.attempts')}
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
                                    {highlightQuiz.quantidade_questoes} {t('freeQuizzes.questionsLabel')}
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
                            {t('freeQuizzes.acceptChallenge')}
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
                        placeholder={t('freeQuizzes.searchPlaceholder')}
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
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('freeQuizzes.filters')}</span>
                    </div>

                    <select
                        value={selectedCategoryValue}
                        onChange={(e) => {
                            setSelectedCategoryValue(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                        {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.value === 'Todas' ? t('freeQuizzes.all') : t(`freeQuizzes.niches.${cat.value}`)}</option>)}
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
                                {diff === 'Todas' ? t('freeQuizzes.all') : t(`freeQuizzes.difficulties.${diff}`, diff)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid of Quizzes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicQuizzes.map((quiz, index) => {
                    const isLast = index === publicQuizzes.length - 1;
                    return (
                        <div
                            key={quiz._id}
                            ref={isLast ? lastQuizElementRef : null}
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
                                        {t(`freeQuizzes.difficulties.${quiz.nivel}`, quiz.nivel) as string}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    {startingQuiz === quiz._id ? t('freeQuizzes.loadingMore') : t('freeQuizzes.begin')}
                                    <PlayCircleIcon className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {loading && (
                <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            )}

            {!loading && publicQuizzes.length === 0 && (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <AcademicCapIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t('freeQuizzes.noQuizzesFound')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('freeQuizzes.adjustFilters')}</p>
                    <button
                        onClick={() => { setSearchQuery(''); setSelectedCategoryValue('Todas'); setSelectedDifficulty('Todas'); }}
                        className="mt-4 text-primary-600 font-medium text-sm hover:underline"
                    >
                        {t('freeQuizzes.clearFilters')}
                    </button>
                </div>
            )}

            {/* Help/Support Badge */}
            <div className="mt-8 mb-8 flex justify-center">
                {!showHelp ? (
                    <button
                        onClick={() => setShowHelp(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shadow-sm"
                    >
                        <QuestionMarkCircleIcon className="w-5 h-5" />
                        <span>{t('freeQuizzes.helpQuestion')}</span>
                    </button>
                ) : (
                    <div className="relative w-full p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 animate-fade-in-up">
                        <button
                            onClick={() => setShowHelp(false)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 w-fit h-fit">
                            <QuestionMarkCircleIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 pr-8">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                                {t('freeQuizzes.helpTitle')}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                                <Trans i18nKey="freeQuizzes.helpText" ns="quiz" components={{ strong: <strong /> }} />
                            </p>
                            <a
                                href="https://wa.me/5531997313160"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-semibold hover:underline inline-flex items-center gap-2"
                            >
                                {t('freeQuizzes.contactUs')}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                    <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FreeQuizzesPage;
