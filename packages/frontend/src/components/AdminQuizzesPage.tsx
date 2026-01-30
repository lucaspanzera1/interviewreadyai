import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import {
    TrashIcon,
    ChartBarIcon,
    CheckCircleIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
    EllipsisHorizontalIcon
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

    const handleStatusToggle = async (quizId: string, currentStatus: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await apiClient.updateQuizStatus(quizId, !currentStatus);
            toast.success(currentStatus ? 'Quiz desativado' : 'Quiz ativado');
            loadQuizzes();
        } catch (error) {
            toast.error('Erro ao atualizar status');
            console.error(error);
        }
    };

    const handleDeleteQuiz = async (quizId: string, e: React.MouseEvent) => {
        e.stopPropagation();
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
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <PageTitle title="Gerenciar Quizzes" />
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Administre todos os quizzes disponíveis na plataforma
                        </p>
                    </div>
                    <div className="text-sm font-medium bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300">
                        Total: <span className="text-primary-600 dark:text-primary-400 font-bold">{quizzes.length}</span> quizzes
                    </div>
                </div>

                {/* Filters Toolbar */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full md:w-96 group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar por título, categoria ou criador..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg leading-5 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <FunnelIcon className="w-5 h-5 text-slate-400 hidden md:block" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full md:w-48 text-sm border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 focus:ring-primary-500 focus:border-primary-500 py-2.5"
                            >
                                <option value="all">Todos os Status</option>
                                <option value="active">Ativos</option>
                                <option value="inactive">Inativos</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Quizzes List */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700/50">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Quiz Detalhes
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Criador
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Analytics
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {filteredQuizzes.map((quiz, index) => (
                                    <tr
                                        key={quiz._id}
                                        onClick={() => navigate(`/admin/quizzes/${quiz._id}/details`)}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                    {quiz.titulo}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                        {quiz.categoria}
                                                    </span>
                                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {quiz.quantidade_questoes} questões
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xs mr-3">
                                                    {quiz.createdBy.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {quiz.createdBy.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        {quiz.createdBy.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                <div className="text-center">
                                                    <div className="font-bold text-slate-900 dark:text-white">{quiz.totalAccess}</div>
                                                    <div className="text-xs">Acessos</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold text-slate-900 dark:text-white">{quiz.totalCompletions}</div>
                                                    <div className="text-xs">Concluídos</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold text-slate-900 dark:text-white">{quiz.averageScore.toFixed(0)}%</div>
                                                    <div className="text-xs">Média</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={(e) => handleStatusToggle(quiz._id, quiz.isActive, e)}
                                                className={`
                                                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2
                                                    ${quiz.isActive ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}
                                                `}
                                            >
                                                <span
                                                    className={`
                                                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                                        ${quiz.isActive ? 'translate-x-5' : 'translate-x-0'}
                                                    `}
                                                />
                                            </button>
                                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {quiz.isActive ? 'Ativo' : 'Inativo'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/quizzes/${quiz._id}/stats`); }}
                                                    className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                                    title="Estatísticas"
                                                >
                                                    <ChartBarIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/quizzes/${quiz._id}/details`); }}
                                                    className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Detalhes"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteQuiz(quiz._id, e)}
                                                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Excluir"
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
                        <div className="text-center py-20 bg-white dark:bg-slate-800">
                            <div className="mx-auto h-12 w-12 text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                <MagnifyingGlassIcon className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                                Nenhum quiz encontrado
                            </h3>
                            <p className="mt-1 text-slate-500 dark:text-slate-400">
                                Tente ajustar os filtros de busca.
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Mostrando página <span className="font-semibold text-slate-900 dark:text-white">{page}</span> de <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminQuizzesPage;