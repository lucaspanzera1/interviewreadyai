import React, { useState, useEffect } from 'react';
import PageTitle from './PageTitle';
import { PlusCircleIcon, SparklesIcon, AcademicCapIcon, ClockIcon, ChartBarIcon, QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { useTranslation } from 'react-i18next';

interface Flashcard {
    _id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    nivel: string;
    quantidade_cards: number;
    tags: string[];
    createdAt: string;
    vaga_titulo?: string;
    vaga_empresa?: string;
    vaga_localizacao?: string;
}

interface StudyStats {
    totalReviews: number;
    totalStudyTime: number;
    streak: number;
    lastStudySession?: string;
    cardsStudied: number;
}

const MyFlashcardsPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { t } = useTranslation('flashcard');
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [startingFlashcard, setStartingFlashcard] = useState<string | null>(null);
    const [studyStats, setStudyStats] = useState<Record<string, StudyStats>>({});
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        loadFlashcards();
    }, [page]);

    const loadFlashcards = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getUserFlashcards(page, 10);
            setFlashcards(response.flashcards);
            setTotalPages(response.totalPages);

            // Load study stats for each flashcard
            const statsPromises = response.flashcards.map(async (flashcard: Flashcard) => {
                try {
                    const progress = await apiClient.getStudyProgress(flashcard._id);
                    return {
                        flashcardId: flashcard._id,
                        stats: {
                            totalReviews: progress.totalReviews || 0,
                            totalStudyTime: progress.totalStudyTime || 0,
                            streak: progress.streak || 0,
                            lastStudySession: progress.lastStudySession,
                            cardsStudied: progress.cardProgress?.filter((cp: any) => cp.timesStudied > 0).length || 0
                        }
                    };
                } catch (error) {
                    // If no progress exists yet, return default stats
                    return {
                        flashcardId: flashcard._id,
                        stats: {
                            totalReviews: 0,
                            totalStudyTime: 0,
                            streak: 0,
                            cardsStudied: 0
                        }
                    };
                }
            });

            const statsResults = await Promise.all(statsPromises);
            const statsMap: Record<string, StudyStats> = {};
            statsResults.forEach(({ flashcardId, stats }) => {
                statsMap[flashcardId] = stats;
            });
            setStudyStats(statsMap);
        } catch (error) {
            console.error('Error loading flashcards:', error);
        } finally {
            setLoading(false);
        }
    };

    const startStudy = async (flashcard: Flashcard) => {
        setStartingFlashcard(flashcard._id);
        try {
            navigate(`/flashcard/study/${flashcard._id}`);
            showToast(t('myFlashcards.startingSession'), 'success');
        } catch (error: any) {
            console.error('Erro ao iniciar estudo:', error);
            const message = error.response?.data?.message || t('myFlashcards.errorStartingStudy');
            showToast(message, 'error');
        } finally {
            setStartingFlashcard(null);
        }
    };

    const getLevelColor = (nivel: string) => {
        switch (nivel) {
            case 'FACIL':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700/50';
            case 'MEDIO':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700/50';
            case 'DIFICIL':
                return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700/50';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-700/50';
        }
    };

    const formatLevel = (nivel: string) => {
        switch (nivel) {
            case 'FACIL':
                return t('create.easy');
            case 'MEDIO':
                return t('create.medium');
            case 'DIFICIL':
                return t('create.hard');
            default:
                return nivel;
        }
    };

    return (
        <div className="flex flex-col min-h-full transition-colors duration-300">
            <PageTitle title={t('myFlashcards.pageTitle')} />
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 px-4 lg:px-8 py-4 mb-8">
                <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {t('myFlashcards.title')}
                        </h1>
                        <p className="mt-1 text-sm sm:text-base text-slate-500 dark:text-slate-400">
                            {t('myFlashcards.subtitle')}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/create-flashcard')}
                        className="group relative flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-sm shrink-0"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">{t('myFlashcards.createNew')}</span>
                        <span className="sm:hidden">{t('myFlashcards.createShort')}</span>
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-white dark:border-slate-900 animate-bounce">
                            GRÁTIS
                        </span>
                    </button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-4xl mx-auto">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : flashcards.length === 0 ? (
                    <div className="text-center py-20">
                        <SparklesIcon className="mx-auto h-24 w-24 text-slate-400 dark:text-slate-600 mb-6" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            {t('myFlashcards.emptyState')}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                            {t('myFlashcards.emptyStateDesc')}
                        </p>
                        <button
                            onClick={() => navigate('/create-flashcard')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                        >
                            <PlusCircleIcon className="w-5 h-5" />
                            {t('myFlashcards.createFirst')}
                            <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold tracking-wide"></span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                            {flashcards.map((flashcard) => (
                                <div
                                    key={flashcard._id}
                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {flashcard.titulo}
                                            </h3>
                                            {flashcard.vaga_empresa && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1">
                                                    <span className="font-medium">{flashcard.vaga_empresa}</span>
                                                    {flashcard.vaga_localizacao && (
                                                        <span>• {flashcard.vaga_localizacao}</span>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getLevelColor(flashcard.nivel)}`}>
                                            {formatLevel(flashcard.nivel)}
                                        </div>
                                    </div>

                                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                                        {flashcard.descricao}
                                    </p>

                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-sm text-slate-700 dark:text-slate-300">
                                            {flashcard.categoria}
                                        </div>
                                        <div className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-sm text-slate-700 dark:text-slate-300">
                                            {flashcard.quantidade_cards} cards
                                        </div>
                                    </div>

                                    {flashcard.tags && flashcard.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {flashcard.tags.slice(0, 3).map((tag, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded text-xs"
                                                >
                                                    {tag}
                                                </div>
                                            ))}
                                            {flashcard.tags.length > 3 && (
                                                <div className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-xs">
                                                    +{flashcard.tags.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Study Stats */}
                                    {studyStats[flashcard._id] && (
                                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 mb-4">
                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                <div>
                                                    <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400 mb-1">
                                                        <AcademicCapIcon className="w-3 h-3" />
                                                        <span className="text-xs">{t('myFlashcards.studied')}</span>
                                                    </div>
                                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {studyStats[flashcard._id].cardsStudied}/{flashcard.quantidade_cards}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400 mb-1">
                                                        <ClockIcon className="w-3 h-3" />
                                                        <span className="text-xs">{t('myFlashcards.time')}</span>
                                                    </div>
                                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {studyStats[flashcard._id].totalStudyTime}min
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400 mb-1">
                                                        <ChartBarIcon className="w-3 h-3" />
                                                        <span className="text-xs">{t('myFlashcards.reviews')}</span>
                                                    </div>
                                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {studyStats[flashcard._id].totalReviews}
                                                    </div>
                                                </div>
                                            </div>
                                            {studyStats[flashcard._id].lastStudySession && (
                                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                                        {t('myFlashcards.lastStudy')} {new Date(studyStats[flashcard._id].lastStudySession!).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {t('myFlashcards.createdAt')} {new Date(flashcard.createdAt).toLocaleDateString('pt-BR')}
                                        </p>

                                        <button
                                            onClick={() => startStudy(flashcard)}
                                            disabled={startingFlashcard === flashcard._id}
                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-slate-400 disabled:to-slate-500 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                                        >
                                            {startingFlashcard === flashcard._id ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    {t('myFlashcards.loading')}
                                                </>
                                            ) : (
                                                <>
                                                    <AcademicCapIcon className="w-4 h-4" />
                                                    {t('myFlashcards.studyButton')}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => setPage(index + 1)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${page === index + 1
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                        )}
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
                            <span>{t('myFlashcards.faqTitle')}</span>
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
                                    {t('myFlashcards.faqHow')}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                                    {t('myFlashcards.faqSRS')}
                                </p>
                                <a
                                    href="https://wa.me/5531997313160"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-semibold hover:underline inline-flex items-center gap-2"
                                >
                                    {t('myFlashcards.faqSupport')}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
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

export default MyFlashcardsPage;