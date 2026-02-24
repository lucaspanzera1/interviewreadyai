import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageTitle from './PageTitle';
import { PlusCircleIcon, SparklesIcon, QuestionMarkCircleIcon, XMarkIcon, PlayIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { getNicheIcon } from '../utils/nicheIcons';

interface Quiz {
    _id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    nivel: string;
    quantidade_questoes: number;
    tags: string[];
    createdAt: string;
    totalAccess: number;
    totalAttempts: number;
}

const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
        case 'iniciante':
        case 'júnior':
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        case 'intermediário':
        case 'pleno':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'avançado':
        case 'sênior':
            return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
        case 'especialista':
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        default:
            return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
};

const QuizSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 animate-pulse">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl shrink-0" />
            <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-2 w-full">
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="flex gap-2">
                            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                </div>
                <div className="pt-2 flex gap-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                </div>
            </div>
        </div>
    </div>
);

const MyQuizzesPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { t } = useTranslation('quiz');
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [startingQuiz, setStartingQuiz] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        loadQuizzes();
    }, [page]);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getUserQuizzes(page, 10);
            setQuizzes(response.data);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Error loading quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = async (quiz: Quiz) => {
        setStartingQuiz(quiz._id);
        try {
            await apiClient.recordQuizAccess(quiz._id);
            const fullQuiz = await apiClient.getQuizForPlaying(quiz._id);

            if (!fullQuiz || !fullQuiz.questions || fullQuiz.questions.length === 0) {
                showToast(t('myQuizzes.quizNotAvailable'), 'error');
                return;
            }

            localStorage.setItem('generatedQuiz', JSON.stringify(fullQuiz));
            localStorage.setItem('currentQuizId', fullQuiz._id);

            showToast(t('myQuizzes.quizStarted'), 'success');
            navigate('/quiz/user');
        } catch (error: any) {
            console.error('Erro ao iniciar quiz:', error);
            const message = error.response?.data?.message || t('myQuizzes.errorStarting');
            showToast(message, 'error');
        } finally {
            setStartingQuiz(null);
        }
    };

    return (
        <div className="flex flex-col min-h-full transition-colors duration-300">
            <PageTitle title={t('myQuizzes.pageTitle')} />

            {/* Header Sticky com Glassmorphism aprimorado */}
            <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 px-4 lg:px-8 py-4 mb-6 sm:mb-8 shadow-sm">
                <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            {t('myQuizzes.title')}
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700">
                                {loading ? '-' : quizzes.length || 0}
                            </span>
                        </h1>
                        <p className="hidden sm:block mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {t('myQuizzes.subtitle')}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/create-quiz')}
                        className="group relative flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 shrink-0"
                    >
                        <PlusCircleIcon className="w-5 h-5 transition-transform group-hover:rotate-90" />
                        <span className="hidden sm:inline">{t('myQuizzes.createNew')}</span>
                        <span className="sm:hidden">{t('myQuizzes.create')}</span>
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-white dark:border-slate-900 animate-bounce">
                            {t('myQuizzes.freeBadge', 'GRÁTIS')}
                        </span>
                    </button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-4xl mx-auto px-1 sm:px-0 pb-20">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => <QuizSkeleton key={i} />)}
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 border-dashed px-4 text-center">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                            <SparklesIcon className="w-12 h-12 text-primary-400" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                            {t('myQuizzes.emptyStateTitle')}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
                            {t('myQuizzes.emptyStateDescription')}
                        </p>
                        <button
                            onClick={() => navigate('/create-quiz')}
                            className="flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-primary-600/20 hover:shadow-primary-600/40 hover:-translate-y-1"
                        >
                            <PlusCircleIcon className="w-6 h-6" />
                            {t('myQuizzes.emptyStateAction')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 sm:space-y-6">
                        {quizzes.map((quiz, index) => (
                            <div
                                key={quiz._id}
                                className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 hover:shadow-xl hover:border-primary-500/30 transition-all duration-300 cursor-pointer overflow-hidden"
                                onClick={() => startQuiz(quiz)}
                            >
                                {/* Hover Effect Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-50/50 to-transparent dark:from-primary-900/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                <div className="relative flex flex-col sm:flex-row gap-5 sm:gap-6">
                                    {/* Icon Column */}
                                    <div className="flex justify-between items-start sm:block">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:shadow-md transition-all duration-300 shrink-0 border border-slate-200 dark:border-slate-600">
                                            {getNicheIcon(quiz.categoria, "w-6 h-6 sm:w-7 sm:h-7")}
                                        </div>
                                        {/* Mobile Only: Date/Time */}
                                        <div className="sm:hidden text-xs font-medium text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                                            {new Date(quiz.createdAt).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>

                                    {/* Content Column */}
                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="w-full">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset ${getLevelColor(quiz.nivel).replace('bg-', 'ring-').replace('text-', 'bg-opacity-10 ')} ${getLevelColor(quiz.nivel)}`}>
                                                        {quiz.nivel}
                                                    </span>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                                        {quiz.categoria}
                                                    </span>

                                                    {/* Latest/Featured Badge Logic */}
                                                    {index === 0 && page === 1 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-full animate-pulse">
                                                            <SparklesIcon className="w-3 h-3" />
                                                            {t('myQuizzes.new')}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                    {quiz.titulo}
                                                </h3>

                                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                                                    {quiz.descricao}
                                                </p>
                                            </div>

                                            {/* Desktop Date */}
                                            <div className="hidden sm:block text-xs font-medium text-slate-400 shrink-0">
                                                {new Date(quiz.createdAt).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>

                                        {/* Footer Stats & Tags */}
                                        <div className="mt-auto pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/50 pt-3">
                                            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                                                <QuestionMarkCircleIcon className="w-3.5 h-3.5" />
                                                {t('myQuizzes.questionsCount', { count: quiz.quantidade_questoes })}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                                                <PlayIcon className="w-3.5 h-3.5" />
                                                {t('myQuizzes.accessesCount', { count: quiz.totalAccess || 0 })}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                                                <ClockIcon className="w-3.5 h-3.5" />
                                                {t('myQuizzes.attemptsCount', { count: quiz.totalAttempts || 0 })}
                                            </span>

                                            {/* Tags (Desktop only if space permits, or just show overflow) */}
                                            {quiz.tags && quiz.tags.length > 0 && (
                                                <div className="hidden md:flex gap-1.5 ml-auto">
                                                    {quiz.tags.slice(0, 2).map((tag, i) => (
                                                        <span key={i} className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                    {quiz.tags.length > 2 && (
                                                        <span className="text-[10px] text-slate-400 px-1.5 py-0.5">+{quiz.tags.length - 2}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Column */}
                                    <div className="mt-2 sm:mt-0 sm:self-center shrink-0 w-full sm:w-auto">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startQuiz(quiz);
                                            }}
                                            disabled={startingQuiz === quiz._id}
                                            className="w-full sm:w-auto min-w-[120px] px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
                                        >
                                            {startingQuiz === quiz._id ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                    <span>{t('myQuizzes.opening')}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>{t('myQuizzes.play')}</span>
                                                    <PlayIcon className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 fill-current" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8 pb-8">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-slate-600 dark:text-slate-300 shadow-sm"
                                >
                                    {t('pagination.previous')}
                                </button>
                                <span className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-slate-600 dark:text-slate-300 shadow-sm"
                                >
                                    {t('pagination.next')}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Support Badge */}
                <div className="mt-8 mb-8 flex justify-center px-4">
                    {!showHelp ? (
                        <button
                            onClick={() => setShowHelp(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                        >
                            <QuestionMarkCircleIcon className="w-5 h-5 text-primary-500" />
                            <span>{t('myQuizzes.helpQuestion')}</span>
                        </button>
                    ) : (
                        <div className="relative w-full max-w-2xl p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-slate-800 rounded-2xl border border-blue-100 dark:border-slate-700 flex flex-col sm:flex-row gap-5 animate-slide-up shadow-lg">
                            <button
                                onClick={() => setShowHelp(false)}
                                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0 w-fit h-fit shadow-inner">
                                <QuestionMarkCircleIcon className="w-8 h-8" />
                            </div>
                            <div className="flex-1 pr-8">
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    {t('myQuizzes.helpTitle')}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                                    {t('myQuizzes.helpText')}
                                </p>
                                <a
                                    href="https://wa.me/5531997313160"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-600 rounded-lg text-primary-700 dark:text-primary-400 text-sm font-bold hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                                >
                                    {t('myQuizzes.contactSupport')}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500">
                                        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyQuizzesPage;
