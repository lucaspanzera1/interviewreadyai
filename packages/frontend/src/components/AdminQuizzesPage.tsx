import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import {
    TrashIcon,
    ChartBarIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
    PlusIcon,
    XMarkIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    SparklesIcon,
    AcademicCapIcon,
    AdjustmentsHorizontalIcon,
    TagIcon
} from '@heroicons/react/24/outline';
import { apiClient, QuizLevel } from '../lib/api';
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

    // Create Quiz Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [tagInput, setTagInput] = useState('');
    const [formData, setFormData] = useState({
        categoria: '',
        titulo: '',
        descricao: '',
        tags: [] as string[],
        quantidade_questoes: 10,
        nivel: QuizLevel.INICIANTE,
        contexto: ''
    });



    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && page < totalPages) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, page, totalPages]);

    useEffect(() => {
        loadQuizzes();
    }, [page]);


    // Reset wizard when modal opens/closes
    useEffect(() => {
        if (!isModalOpen) {
            setTimeout(() => setCurrentStep(1), 300); // Reset after animation
        }
    }, [isModalOpen]);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            const response: QuizListResponse = await apiClient.getAllQuizzes(page, 10);

            setQuizzes(prev => {
                if (page === 1) return response.quizzes;
                const newQuizzes = response.quizzes.filter(n => !prev.some(p => p._id === n._id));
                return [...prev, ...newQuizzes];
            });
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
            setQuizzes(prev => prev.map(q => q._id === quizId ? { ...q, isActive: !currentStatus } : q));
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
            setQuizzes(prev => prev.filter(q => q._id !== quizId));
        } catch (error) {
            toast.error('Erro ao excluir quiz');
            console.error(error);
        }
    };

    const handleGenerateQuiz = async () => {
        setIsGenerating(true);
        try {
            await apiClient.generateQuiz(formData);
            setIsModalOpen(false);
            toast.success('Quiz criado com sucesso!');

            // Reset to page 1 to show new quiz
            setPage(1);
            if (page === 1) loadQuizzes(); // Force reload if already on page 1

            // Reset form
            setFormData({
                categoria: '',
                titulo: '',
                descricao: '',
                tags: [],
                quantidade_questoes: 10,
                nivel: QuizLevel.INICIANTE,
                contexto: ''
            });
        } catch (error) {
            toast.error('Erro ao criar quiz. Tente novamente.');
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
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

    const steps = [
        { id: 1, name: 'Básico', icon: AcademicCapIcon },
        { id: 2, name: 'Configuração', icon: AdjustmentsHorizontalIcon },
        { id: 3, name: 'Revisão', icon: SparklesIcon },
    ];

    const canProceed = () => {
        if (currentStep === 1) {
            return formData.titulo && formData.categoria && formData.descricao;
        }
        return true;
    };

    const nextStep = () => {
        if (canProceed() && currentStep < steps.length) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

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
                    <div className="flex items-center gap-3">
                        <div className="text-sm font-medium bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300">
                            Total: <span className="text-primary-600 dark:text-primary-400 font-bold">{quizzes.length}</span> quizzes
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary-600/20 active:scale-95 transform duration-150"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Criar Quiz</span>
                        </button>
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
                                {filteredQuizzes.map((quiz) => (
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
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
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
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xs mr-3 shadow-sm border border-primary-200 dark:border-primary-800">
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



                {/* Loading Indicator for Infinite Scroll */}
                {loading && page > 1 && (
                    <div className="flex justify-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                )}

                {/* Sentinel Element */}
                <div ref={lastElementRef} className="h-10 w-full" />

            </div>

            {/* Create Quiz Wizard Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <SparklesIcon className="w-6 h-6 text-primary-500" />
                                        Criar Novo Quiz
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Passo {currentStep} de {steps.length}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Stepper */}
                            <div className="px-8 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between relative">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full -z-10" />
                                    <div
                                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-600 rounded-full -z-10 transition-all duration-300 ease-in-out"
                                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                                    />

                                    {steps.map((step) => {
                                        const Icon = step.icon;
                                        const isActive = currentStep >= step.id;
                                        const isCurrent = currentStep === step.id;

                                        return (
                                            <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-900 px-2">
                                                <div
                                                    className={`
                                                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                                    ${isActive
                                                            ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/30 scale-110'
                                                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'}
                                                `}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span className={`text-xs font-medium transition-colors duration-300 ${isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500'}`}>
                                                    {step.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                                <div className="space-y-6">
                                    {currentStep === 1 && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Título do Quiz <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.titulo}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-400"
                                                    placeholder="Ex: Fundamentos do React 2024"
                                                    autoFocus
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Categoria <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.categoria}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-400"
                                                    placeholder="Ex: Frontend, Backend, DevOps"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Descrição <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={formData.descricao}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-400"
                                                    rows={4}
                                                    placeholder="Descreva o objetivo e o conteúdo deste quiz..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 2 && (
                                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                            <div className="space-y-4">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Nível de Dificuldade
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    {[
                                                        { value: QuizLevel.INICIANTE, label: 'Iniciante', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' },
                                                        { value: QuizLevel.MEDIO, label: 'Médio', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800' },
                                                        { value: QuizLevel.DIFICIL, label: 'Difícil', color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' },
                                                        { value: QuizLevel.EXPERT, label: 'Expert', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' },
                                                    ].map((level) => (
                                                        <button
                                                            key={level.value}
                                                            onClick={() => setFormData(prev => ({ ...prev, nivel: level.value }))}
                                                            className={`
                                                            p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200
                                                            ${formData.nivel === level.value
                                                                    ? `${level.color} ring-2 ring-offset-2 ring-primary-500 border-transparent transform scale-105`
                                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-700'}
                                                        `}
                                                        >
                                                            {level.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        Número de Questões
                                                    </label>
                                                    <span className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-bold">
                                                        {formData.quantidade_questoes}
                                                    </span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="20"
                                                    step="1"
                                                    value={formData.quantidade_questoes}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, quantidade_questoes: parseInt(e.target.value) }))}
                                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                                />
                                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                                    <span>1</span>
                                                    <span>10</span>
                                                    <span>20</span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Contexto Adicional (IA)
                                                    <span className="ml-2 text-xs font-normal text-slate-400">Opcional</span>
                                                </label>
                                                <div className="relative">
                                                    <textarea
                                                        value={formData.contexto}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, contexto: e.target.value }))}
                                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-400"
                                                        rows={4}
                                                        placeholder="Cole aqui um texto, artigo ou documentação para a IA usar como base..."
                                                    />
                                                    <SparklesIcon className="absolute right-3 top-3 w-5 h-5 text-primary-400 animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Tags Relacionadas
                                                </label>
                                                <div className="flex gap-2 mb-3">
                                                    <div className="relative flex-1">
                                                        <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                        <input
                                                            type="text"
                                                            value={tagInput}
                                                            onChange={(e) => setTagInput(e.target.value)}
                                                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                                            className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                                                            placeholder="Digite uma tag e pressione Enter"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={addTag}
                                                        disabled={!tagInput.trim()}
                                                        className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl hover:bg-black dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                                    >
                                                        Adicionar
                                                    </button>
                                                </div>

                                                <div className="min-h-[100px] p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    {formData.tags.length === 0 ? (
                                                        <div className="text-center text-slate-400 py-4 text-sm">
                                                            Nenhuma tag adicionada ainda
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {formData.tags.map(tag => (
                                                                <span key={tag} className="pl-3 pr-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm flex items-center gap-2 shadow-sm animate-in zoom-in-95 duration-200">
                                                                    #{tag}
                                                                    <button
                                                                        onClick={() => removeTag(tag)}
                                                                        className="p-0.5 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 rounded-md transition-colors"
                                                                    >
                                                                        <XMarkIcon className="w-4 h-4" />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 flex gap-4">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg h-fit">
                                                    <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Pronto para gerar!</h4>
                                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                                        A IA irá analisar seus dados e o contexto fornecido para gerar {formData.quantidade_questoes} questões de nível {formData.nivel}. Isso pode levar alguns segundos.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
                                <button
                                    onClick={prevStep}
                                    className={`
                                    px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-2
                                    ${currentStep === 1 ? 'invisible' : 'visible'}
                                `}
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                    Voltar
                                </button>

                                {currentStep < steps.length ? (
                                    <button
                                        onClick={nextStep}
                                        disabled={!canProceed()}
                                        className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-primary-600/20 font-medium"
                                    >
                                        Próximo
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleGenerateQuiz}
                                        disabled={isGenerating}
                                        className="px-8 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-primary-600/20 font-medium transform active:scale-95"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                Gerando Quiz...
                                            </>
                                        ) : (
                                            <>
                                                <SparklesIcon className="w-5 h-5" />
                                                Gerar Quiz com IA
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default AdminQuizzesPage;