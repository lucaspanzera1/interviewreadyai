import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import { apiClient } from '../lib/api';
import { toast } from 'react-toastify';
import {
    ArrowLeftIcon,
    ClockIcon,
    AcademicCapIcon,
    ChartBarIcon,
    TrophyIcon,
    CalendarIcon
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

            // Calculate stats
            const allAttempts = response.attempts;
            const totalAttempts = allAttempts.length;
            const averageScore = totalAttempts > 0
                ? allAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts
                : 0;
            const bestScore = totalAttempts > 0
                ? Math.max(...allAttempts.map(attempt => attempt.percentage))
                : 0;
            const totalTime = allAttempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);

            setStats({
                totalAttempts,
                averageScore,
                bestScore,
                totalTime,
            });
        } catch (error) {
            toast.error('Erro ao carregar histórico de quizzes');
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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600 dark:text-green-400';
        if (percentage >= 60) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBgColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
        if (percentage >= 60) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    };

    const getDifficultyColor = (nivel: string) => {
        switch (nivel) {
            case 'INICIANTE': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
            case 'MEDIO': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
            case 'DIFÍCIL': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
            case 'EXPERT': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
            default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <>
            <PageTitle title="Meu Histórico - TreinaVagaAI" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Meu Histórico de Quizzes</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Acompanhe seu progresso e desempenho</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <AcademicCapIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Quizzes</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalAttempts}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <TrophyIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Melhor Pontuação</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.bestScore.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Média Geral</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.averageScore.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <ClockIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tempo Total</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatTime(stats.totalTime)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attempts List */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Histórico de Tentativas</h2>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {attempts.length > 0 ? (
                            attempts.map((attempt) => (
                                <div key={attempt._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(attempt.quizId.nivel)}`}>
                                                    {attempt.quizId.nivel === 'INICIANTE' ? 'Iniciante' :
                                                     attempt.quizId.nivel === 'MEDIO' ? 'Médio' :
                                                     attempt.quizId.nivel === 'DIFÍCIL' ? 'Difícil' : 'Expert'}
                                                </div>
                                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                    {attempt.quizId.categoria}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                                                {attempt.quizId.titulo}
                                            </h3>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {attempt.quizId.tags.slice(0, 3).map((tag, index) => (
                                                    <span key={index} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-xs">
                                                        #{tag}
                                                    </span>
                                                ))}
                                                {attempt.quizId.tags.length > 3 && (
                                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-xs">
                                                        +{attempt.quizId.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <CalendarIcon className="h-4 w-4" />
                                                    {formatDate(attempt.createdAt)}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <ClockIcon className="h-4 w-4" />
                                                    {formatTime(attempt.timeSpent)}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <AcademicCapIcon className="h-4 w-4" />
                                                    {attempt.score}/{attempt.totalQuestions} questões
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`flex-shrink-0 px-4 py-3 rounded-lg border text-center min-w-[80px] ${getScoreBgColor(attempt.percentage)}`}>
                                            <div className={`text-2xl font-bold ${getScoreColor(attempt.percentage)}`}>
                                                {attempt.percentage.toFixed(0)}%
                                            </div>
                                            <div className="flex items-center justify-center gap-1 mt-1">
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <StarIconSolid
                                                        key={i}
                                                        className={`h-3 w-3 ${
                                                            i < Math.round(attempt.percentage / 20)
                                                                ? 'text-amber-400'
                                                                : 'text-slate-300 dark:text-slate-600'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <AcademicCapIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    Nenhum quiz realizado ainda
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6">
                                    Comece fazendo alguns quizzes para ver seu histórico aqui.
                                </p>
                                <button
                                    onClick={() => navigate('/free-quizzes')}
                                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                                >
                                    Explorar Quizzes
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>

                        <span className="text-sm text-slate-700 dark:text-slate-300">
                            Página {currentPage} de {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próxima
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default UserQuizHistoryPage;