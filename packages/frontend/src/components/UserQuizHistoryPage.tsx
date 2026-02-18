import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import { apiClient } from '../lib/api';
import Loading from './Loading';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeftIcon,
    ClockIcon,
    AcademicCapIcon,
    ChartBarIcon,
    TrophyIcon,
    CalendarIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface QuizAttempt {
    _id: string;
    quizId: {
        _id: string;
        titulo: string;
        categoria: string;
        nivel: string;
        quantidade_questoes: number;
        tags: string[];
    };
    selectedAnswers: number[];
    score: number;
    totalQuestions: number;
    percentage: number;
    timeSpent: number;
    completed: boolean;
    createdAt: string;
}

interface UserAttemptsResponse {
    attempts: QuizAttempt[];
    total: number;
    page: number;
    totalPages: number;
}

const UserQuizHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('quiz');
    const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        totalTime: 0,
    });

    useEffect(() => {
        loadUserAttempts();
    }, [currentPage]);

    const loadUserAttempts = async () => {
        try {
            setLoading(true);
            const response: UserAttemptsResponse = await apiClient.getUserAttempts(currentPage, 10);
            setAttempts(response.attempts);
            setTotalPages(response.totalPages);

            const allAttempts = response.attempts;
            // Note: Stats here are calculated based on the fetched page. 
            // Ideally backend should provide global stats.

            const averageScore = allAttempts.length > 0
                ? allAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / allAttempts.length
                : 0;
            const bestScore = allAttempts.length > 0
                ? Math.max(...allAttempts.map(attempt => attempt.percentage))
                : 0;
            const totalTime = allAttempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);

            setStats({
                totalAttempts: response.total,
                averageScore,
                bestScore,
                totalTime,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getDifficultyColor = (nivel: string) => {
        switch (nivel) {
            case 'INICIANTE': return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'MEDIO': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
            case 'DIFÍCIL': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
            case 'EXPERT': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            default: return 'text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
        }
    };

    if (loading && attempts.length === 0) {
        return <Loading />;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 py-6 sm:py-8 pb-32 sm:pb-8">
            <PageTitle title={t('history.pageTitle')} />

            {/* Sticky Header */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 px-4 lg:px-8 py-4 mb-8 transition-all duration-300">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('history.evolution')}</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('history.subtitle')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-primary-50 dark:bg-primary-900/10 px-4 py-2 rounded-xl border border-primary-100 dark:border-primary-800/30 w-full md:w-auto justify-between md:justify-start">
                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">{t('history.overallAverage')}</span>
                        <div className="flex items-center gap-2">
                            <ChartBarIcon className="w-5 h-5 text-primary-500" />
                            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                                {stats.averageScore.toFixed(0)}%
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Highlight Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                {[
                    {
                        title: t('history.quizzes'),
                        value: stats.totalAttempts,
                        icon: AcademicCapIcon,
                        color: "text-blue-500",
                        bg: "bg-blue-50 dark:bg-blue-900/20"
                    },
                    {
                        title: t('history.bestScore'),
                        value: `${stats.bestScore.toFixed(0)}%`,
                        icon: TrophyIcon,
                        color: "text-amber-500",
                        bg: "bg-amber-50 dark:bg-amber-900/20"
                    },
                    {
                        title: t('history.totalTime'),
                        value: formatTime(stats.totalTime),
                        icon: ClockIcon,
                        color: "text-purple-500",
                        bg: "bg-purple-50 dark:bg-purple-900/20"
                    },
                    {
                        title: t('history.streak'),
                        value: "N/A",
                        icon: CalendarIcon,
                        color: "text-green-500",
                        bg: "bg-green-50 dark:bg-green-900/20"
                    }
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center sm:items-start sm:text-left gap-2 shadow-sm">
                        <div className={`p-2 rounded-lg ${item.bg} ${item.color} w-fit`}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{item.title}</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>


            {/* Content Section */}
            <div className="space-y-6 px-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('history.recentHistory')}</h2>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        {t('history.activities', { count: stats.totalAttempts })}
                    </span>
                </div>

                {attempts.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="bg-slate-50 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AcademicCapIcon className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {t('history.noActivityFound')}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto text-sm">
                            {t('history.noActivityDescription')}
                        </p>
                        <button
                            onClick={() => navigate('/free-quizzes')}
                            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold text-sm shadow-lg shadow-primary-600/20"
                        >
                            {t('history.exploreQuizzes')}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {attempts.map((attempt) => (
                            <div
                                key={attempt._id}
                                onClick={() => navigate(`/profile/quiz-history/${attempt._id}`)}
                                className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 cursor-pointer relative overflow-hidden"
                            >
                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-primary-50/0 group-hover:bg-primary-50/30 dark:group-hover:bg-primary-900/10 transition-colors duration-300 pointer-events-none" />

                                <div className="flex flex-col sm:flex-row gap-5 relative z-10">
                                    {/* Score Indicator */}
                                    <div className="flex-shrink-0 flex items-start">
                                        <div className={`
                                            flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2
                                            ${attempt.percentage >= 80
                                                ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/50 text-green-600'
                                                : attempt.percentage >= 60
                                                    ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/50 text-amber-600'
                                                    : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/50 text-red-600'
                                            }
                                        `}>
                                            <span className="text-base font-black">{attempt.percentage.toFixed(0)}%</span>
                                            <div className="flex gap-0.5 mt-0.5">
                                                {Array.from({ length: 3 }, (_, i) => (
                                                    <StarIconSolid
                                                        key={i}
                                                        className={`h-2.5 w-2.5 ${i < Math.round(attempt.percentage / 33)
                                                            ? 'opacity-100'
                                                            : 'opacity-20'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(attempt.quizId.nivel)}`}>
                                                {attempt.quizId.nivel}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium mx-1">•</span>
                                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                {attempt.quizId.categoria}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 pr-8 group-hover:text-primary-600 transition-colors">
                                            {attempt.quizId.titulo}
                                        </h3>

                                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <CalendarIcon className="h-4 w-4 text-slate-400" />
                                                {formatDate(attempt.createdAt)}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <ClockIcon className="h-4 w-4 text-slate-400" />
                                                {formatTime(attempt.timeSpent)}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <AcademicCapIcon className="h-4 w-4 text-slate-400" />
                                                {attempt.score}/{attempt.totalQuestions} {t('history.correctCount')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chevron */}
                                    <div className="hidden sm:flex items-center text-slate-300 group-hover:text-primary-500 transition-colors">
                                        <ChevronRightIcon className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Simplified Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 py-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="sr-only">{t('pagination.previous')}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                {t('pagination.pageOf', { current: currentPage, total: totalPages })}
                            </span>
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="sr-only">{t('pagination.next')}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserQuizHistoryPage;