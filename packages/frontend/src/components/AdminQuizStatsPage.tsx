import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageTitle from './PageTitle';
import {
    ArrowLeftIcon,
    UserIcon,
    ClockIcon,
    CheckCircleIcon,
    ChartBarIcon,
    AcademicCapIcon
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
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                    Estatísticas não encontradas
                </h3>
            </div>
        );
    }

    const completionRate = stats.totalAttempts > 0 ? (stats.completedAttempts / stats.totalAttempts) * 100 : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/quizzes')}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <PageTitle title={`Estatísticas: ${stats.quiz.titulo}`} />
            </div>

            {/* Quiz Overview */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Informações do Quiz
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <div className="flex items-center">
                            <AcademicCapIcon className="w-8 h-8 text-primary-600 mr-3" />
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Questões</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.quiz.quantidade_questoes}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <div className="flex items-center">
                            <UserIcon className="w-8 h-8 text-green-600 mr-3" />
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Acessos</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.quiz.totalAccess}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <div className="flex items-center">
                            <CheckCircleIcon className="w-8 h-8 text-blue-600 mr-3" />
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Tentativas</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.totalAttempts}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <div className="flex items-center">
                            <ChartBarIcon className="w-8 h-8 text-purple-600 mr-3" />
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Média</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.averageScore.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                            {stats.completedAttempts}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Quizzes Completados
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                            {completionRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Taxa de Conclusão
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                            {stats.quiz.categoria}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Categoria
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Attempts */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Últimas Tentativas
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Usuário
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Pontuação
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Tempo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Data
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                            {stats.attempts.map((attempt) => (
                                <tr key={attempt._id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                                            {attempt.userId.name}
                                        </div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            {attempt.userId.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900 dark:text-white">
                                            {attempt.score}/{attempt.totalQuestions}
                                        </div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            {attempt.percentage.toFixed(1)}%
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-slate-900 dark:text-white">
                                            <ClockIcon className="w-4 h-4 mr-1 text-slate-400" />
                                            {Math.floor(attempt.timeSpent / 60)}:{(attempt.timeSpent % 60).toString().padStart(2, '0')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {attempt.completed ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                                Completado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                Em andamento
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(attempt.createdAt).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {stats.attempts.length === 0 && (
                    <div className="text-center py-12">
                        <UserIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                            Nenhuma tentativa ainda
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            As tentativas dos usuários aparecerão aqui.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminQuizStatsPage;