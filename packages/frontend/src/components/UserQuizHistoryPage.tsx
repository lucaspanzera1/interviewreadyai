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



    const getDifficultyColor = (nivel: string) => {
        switch (nivel) {
            case 'INICIANTE': return 'bg-green-100/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'MEDIO': return 'bg-amber-100/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            case 'DIFÍCIL': return 'bg-orange-100/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
            case 'EXPERT': return 'bg-red-100/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
            default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        }
    };

    const StatCard = ({ icon: Icon, label, value, colorClass }: any) => (
        <div className={`relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft hover:shadow-lifted transition-all duration-300 border border-slate-100 dark:border-slate-700 group hover:-translate-y-1`}>
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 p-4 -mr-4 -mt-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                <Icon className="w-32 h-32 transform rotate-12" />
            </div>

            <div className="relative z-10 flex items-center gap-4">
                <div className={`p-4 rounded-xl ${colorClass} bg-opacity-10 backdrop-blur-sm ring-1 ring-inset ring-black/5 dark:ring-white/5`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white font-sans tracking-tight mt-0.5">{value}</p>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            <PageTitle title="Meu Histórico - TreinaVagaAI" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="group p-3 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
                        >
                            <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
                                Meu Histórico
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                Acompanhe sua evolução e conquistas
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={AcademicCapIcon}
                        label="Total de Quizzes"
                        value={stats.totalAttempts}
                        colorClass="text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900"
                    />
                    <StatCard
                        icon={TrophyIcon}
                        label="Melhor Pontuação"
                        value={`${stats.bestScore.toFixed(0)}%`}
                        colorClass="text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900"
                    />
                    <StatCard
                        icon={ChartBarIcon}
                        label="Média Geral"
                        value={`${stats.averageScore.toFixed(0)}%`}
                        colorClass="text-primary-600 bg-primary-100 dark:text-primary-300 dark:bg-primary-900"
                    />
                    <StatCard
                        icon={ClockIcon}
                        label="Tempo Total"
                        value={formatTime(stats.totalTime)}
                        colorClass="text-amber-600 bg-amber-100 dark:text-amber-300 dark:bg-amber-900"
                    />
                </div>

                {/* Attempts List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
                            Atividades Recentes
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {attempts.length > 0 ? (
                            attempts.map((attempt) => (
                                <div
                                    key={attempt._id}
                                    className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft hover:shadow-lifted border border-slate-100 dark:border-slate-700 transition-all duration-300 overflow-hidden hover:border-primary-100 dark:hover:border-primary-900/50"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                                        <AcademicCapIcon className="h-32 w-32 text-primary-600 transform rotate-12" />
                                    </div>

                                    <div className="relative z-10 flex flex-col sm:flex-row gap-6">
                                        {/* Score Badge */}
                                        <div className="flex-shrink-0 flex items-center justify-center sm:block">
                                            <div className={`
                                                relative w-24 h-24 rounded-2xl flex flex-col items-center justify-center border-4 transition-transform group-hover:scale-105
                                                ${attempt.percentage >= 80
                                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-700 dark:text-green-400'
                                                    : attempt.percentage >= 60
                                                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                                                        : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-700 dark:text-red-400'
                                                }
                                            `}>
                                                <span className="text-2xl font-bold tracking-tight">{attempt.percentage.toFixed(0)}%</span>
                                                <div className="flex gap-0.5 mt-1">
                                                    {Array.from({ length: 3 }, (_, i) => (
                                                        <StarIconSolid
                                                            key={i}
                                                            className={`h-3 w-3 ${i < Math.round(attempt.percentage / 33)
                                                                ? 'opacity-100'
                                                                : 'opacity-20'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 py-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${getDifficultyColor(attempt.quizId.nivel)}`}>
                                                    {attempt.quizId.nivel === 'INICIANTE' ? 'INICIANTE' :
                                                        attempt.quizId.nivel === 'MEDIO' ? 'MÉDIO' :
                                                            attempt.quizId.nivel === 'DIFÍCIL' ? 'DIFÍCIL' : 'EXPERT'}
                                                </span>
                                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                    {attempt.quizId.categoria}
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {attempt.quizId.titulo}
                                            </h3>

                                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                                                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                                                    {formatDate(attempt.createdAt)}
                                                </div>
                                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                                                    <ClockIcon className="h-4 w-4 text-slate-400" />
                                                    {formatTime(attempt.timeSpent)}
                                                </div>
                                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                                                    <AcademicCapIcon className="h-4 w-4 text-slate-400" />
                                                    {attempt.score}/{attempt.totalQuestions} acertos
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <div className="flex items-center justify-end sm:justify-center pl-4 border-l border-slate-100 dark:border-slate-700 sm:w-48">
                                            <button
                                                onClick={() => navigate(`/profile/quiz-history/${attempt._id}`)}
                                                className="w-full px-6 py-3 text-sm font-semibold text-white bg-slate-900 dark:bg-slate-700 rounded-xl hover:bg-primary-600 dark:hover:bg-primary-600 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                            >
                                                Ver Detalhes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                                <div className="bg-slate-50 dark:bg-slate-900/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AcademicCapIcon className="h-12 w-12 text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                    Nenhuma atividade encontrada
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto text-lg">
                                    Você ainda não realizou nenhum quiz. Que tal testar seus conhecimentos agora?
                                </p>
                                <button
                                    onClick={() => navigate('/free-quizzes')}
                                    className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-bold text-lg shadow-primary-600/20"
                                >
                                    Explorar Quizzes
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 py-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-sm"
                        >
                            Anterior
                        </button>

                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            {currentPage} / {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-sm"
                        >
                            Próxima
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserQuizHistoryPage;