import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import {
    TrashIcon,
    ChartBarIcon,
    CheckCircleIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../lib/api';
import { toast } from 'react-toastify';

interface Quiz {
    _id: string;
    titulo: string;
    categoria: string;
    descricao: string;
    tags: string[];
    nivel: string;
    quantidade_questoes: number;
    createdBy: {
        name: string;
        email: string;
    };
    totalAccess: number;
    totalAttempts: number;
    totalCompletions: number;
    averageScore: number;
    isActive: boolean;
    createdAt: string;
}

interface QuizListResponse {
    quizzes: Quiz[];
    total: number;
    page: number;
    totalPages: number;
}

const AdminQuizzesPage: React.FC = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    useEffect(() => {
        loadQuizzes();
    }, [page, statusFilter]);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            const response: QuizListResponse = await apiClient.getAllQuizzes(page, 10);
            setQuizzes(response.quizzes);
            setTotalPages(response.totalPages);
        } catch (error) {
            toast.error('Erro ao carregar quizzes');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (quizId: string, currentStatus: boolean) => {
        try {
            await apiClient.updateQuizStatus(quizId, !currentStatus);
            toast.success('Status do quiz atualizado!');
            loadQuizzes();
        } catch (error) {
            toast.error('Erro ao atualizar status');
            console.error(error);
        }
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (!confirm('Tem certeza que deseja excluir este quiz? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            await apiClient.deleteQuiz(quizId);
            toast.success('Quiz excluído com sucesso!');
            loadQuizzes();
        } catch (error) {
            toast.error('Erro ao excluir quiz');
            console.error(error);
        }
    };

    const viewQuizStats = (quizId: string) => {
        navigate(`/admin/quizzes/${quizId}/stats`);
    };

    const filteredQuizzes = quizzes.filter(quiz => {
        const matchesSearch = quiz.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            quiz.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            quiz.createdBy.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' ||
                            (statusFilter === 'active' && quiz.isActive) ||
                            (statusFilter === 'inactive' && !quiz.isActive);

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <PageTitle title="Gerenciar Quizzes" />
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    Total: {quizzes.length} quizzes
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por título, categoria ou criador..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="w-4 h-4 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="all">Todos os Status</option>
                            <option value="active">Ativos</option>
                            <option value="inactive">Inativos</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Quizzes Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Quiz
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Criador
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Estatísticas
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredQuizzes.map((quiz) => (
                                <tr key={quiz._id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                {quiz.titulo}
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                {quiz.categoria} • {quiz.nivel} • {quiz.quantidade_questoes} questões
                                            </div>
                                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                {new Date(quiz.createdAt).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900 dark:text-white">
                                            {quiz.createdBy.name}
                                        </div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            {quiz.createdBy.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900 dark:text-white">
                                            <div>Acessos: {quiz.totalAccess}</div>
                                            <div>Tentativas: {quiz.totalAttempts}</div>
                                            <div>Completados: {quiz.totalCompletions}</div>
                                            <div>Média: {quiz.averageScore.toFixed(1)}%</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleStatusToggle(quiz._id, quiz.isActive)}
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                quiz.isActive
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}
                                        >
                                            {quiz.isActive ? (
                                                <>
                                                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                                                    Ativo
                                                </>
                                            ) : (
                                                <>
                                                    <XCircleIcon className="w-4 h-4 mr-1" />
                                                    Inativo
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => viewQuizStats(quiz._id)}
                                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                                title="Ver estatísticas detalhadas"
                                            >
                                                <ChartBarIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuiz(quiz._id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                title="Excluir quiz"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredQuizzes.length === 0 && (
                    <div className="text-center py-12">
                        <ChartBarIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                            Nenhum quiz encontrado
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Tente ajustar os filtros de busca.
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                        Página {page} de {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminQuizzesPage;