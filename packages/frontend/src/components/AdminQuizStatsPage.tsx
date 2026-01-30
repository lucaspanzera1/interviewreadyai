import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageTitle from './PageTitle';
import {
    ArrowLeftIcon,
    UserIcon,
    ClockIcon,
    CheckCircleIcon,
    ChartBarIcon,
    AcademicCapIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../lib/api';
import { toast } from 'react-toastify';

interface QuizAttempt {
    _id: string;
    userId: {
        name: string;
        email: string;
    };
    selectedAnswers: number[];
    score: number;
    totalQuestions: number;
    percentage: number;
    timeSpent: number;
    completed: boolean;
    createdAt: string;
}

interface QuizStats {
    quiz: {
        _id: string;
        titulo: string;
        categoria: string;
        descricao: string;
        tags: string[];
        nivel: string;
        quantidade_questoes: number;
        totalAccess: number;
        totalAttempts: number;
        totalCompletions: number;
        averageScore: number;
        isActive: boolean;
        createdAt: string;
    };
    attempts: QuizAttempt[];
    totalAttempts: number;
    completedAttempts: number;
    averageScore: number;
}

const AdminQuizStatsPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [stats, setStats] = useState<QuizStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadQuizStats();
        }
    }, [id]);

    const loadQuizStats = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getQuizStats(id!);
            setStats(data);
        } catch (error) {
            toast.error('Erro ao carregar estatísticas do quiz');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
                    <ChartBarIcon className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Estatísticas não encontradas
                </h3>
                <button
                    onClick={() => navigate('/admin/quizzes')}
                    className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    Voltar para Quizzes
                </button>
            </div>
        );
    }

    const completionRate = stats.totalAttempts > 0 ? (stats.completedAttempts / stats.totalAttempts) * 100 : 0;

    const StatCard = ({ icon: Icon, label, value, subtext, colorClass }: any) => (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft hover:shadow-lifted transition-all border border-slate-100 dark:border-slate-700 group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">{value}</h3>
                    {subtext && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{subtext}</p>}
                </div>
                <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                    <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/quizzes')}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm border border-slate-200 dark:border-slate-700 transition-all"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                                    {stats.quiz.categoria}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    {new Date(stats.quiz.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {stats.quiz.titulo}
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(`/admin/quizzes/${id}/details`)}
                            className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm flex items-center gap-2"
                        >
                            <AcademicCapIcon className="w-4 h-4" />
                            Ver Questões
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
                    <StatCard
                        icon={UserIcon}
                        label="Total de Acessos"
                        value={stats.quiz.totalAccess}
                        colorClass="bg-blue-500 text-blue-500"
                    />
                    <StatCard
                        icon={ChartBarIcon}
                        label="Tentativas"
                        value={stats.totalAttempts}
                        subtext={`${completionRate.toFixed(1)}% taxa de conclusão`}
                        colorClass="bg-purple-500 text-purple-500"
                    />
                    <StatCard
                        icon={AcademicCapIcon}
                        label="Média de Acertos"
                        value={`${stats.averageScore.toFixed(0)}%`}
                        colorClass="bg-green-500 text-green-500"
                    />
                    <StatCard
                        icon={ClockIcon}
                        label="Questões"
                        value={stats.quiz.quantidade_questoes}
                        subtext={`${stats.quiz.nivel}`}
                        colorClass="bg-orange-500 text-orange-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Performance Visual placeholder - could normally be a chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft border border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Últimas Tentativas</h3>

                        <div className="overflow-hidden">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-700 text-left">
                                        <th className="pb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Usuário</th>
                                        <th className="pb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Desempenho</th>
                                        <th className="pb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tempo</th>
                                        <th className="pb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Data</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {stats.attempts.slice(0, 10).map((attempt) => (
                                        <tr key={attempt._id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="py-4 pr-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                                                        {attempt.userId.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-900 dark:text-white">{attempt.userId.name}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">{attempt.userId.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${attempt.percentage >= 80 ? 'bg-green-500' :
                                                                    attempt.percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${attempt.percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-12 text-right">
                                                        {attempt.percentage.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                                    <ClockIcon className="w-4 h-4" />
                                                    {Math.floor(attempt.timeSpent / 60)}:{(attempt.timeSpent % 60).toString().padStart(2, '0')}
                                                </div>
                                            </td>
                                            <td className="py-4 text-right text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(attempt.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {stats.attempts.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-slate-500 dark:text-slate-400">Nenhuma tentativa registrada ainda.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Info Side */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lifted">
                            <h3 className="text-lg font-bold mb-4 opacity-90">Resumo de Engajamento</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                    <span className="text-sm font-medium opacity-80">Conclusões com Sucesso</span>
                                    <span className="text-lg font-bold">{stats.completedAttempts}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                    <span className="text-sm font-medium opacity-80">Taxa de Abandono</span>
                                    <span className="text-lg font-bold">{(100 - completionRate).toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft border border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {stats.quiz.tags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminQuizStatsPage;