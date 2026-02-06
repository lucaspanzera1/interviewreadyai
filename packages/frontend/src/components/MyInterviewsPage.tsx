import React, { useState, useEffect } from 'react';
import PageTitle from './PageTitle';
import { 
    PlusCircleIcon, 
    ChatBubbleLeftRightIcon, 
    SparklesIcon, 
    ClockIcon,
    BuildingOfficeIcon,
    UserIcon,
    PlayIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { apiClient, Interview } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

const MyInterviewsPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [startingInterview, setStartingInterview] = useState<string | null>(null);

    useEffect(() => {
        loadInterviews();
    }, [page]);

    const loadInterviews = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getUserInterviews(page, 10);
            setInterviews(response.interviews);
            setTotalPages(response.pagination.pages);
        } catch (error) {
            console.error('Error loading interviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const startInterview = async (interview: Interview) => {
        setStartingInterview(interview._id);
        try {
            await apiClient.recordInterviewAccess(interview._id);
            const fullInterview = await apiClient.getInterviewForPlaying(interview._id);

            if (!fullInterview || !fullInterview.questions || fullInterview.questions.length === 0) {
                showToast('Esta simulação não está disponível ou não tem perguntas.', 'error');
                return;
            }

            localStorage.setItem('generatedInterview', JSON.stringify(fullInterview));
            localStorage.setItem('currentInterviewId', fullInterview._id);

            showToast('Simulação iniciada! Boa sorte! 🎯', 'success');
            navigate('/interview/play');
        } catch (error: any) {
            console.error('Erro ao iniciar simulação:', error);
            const message = error.response?.data?.message || 'Erro ao iniciar a simulação.';
            showToast(message, 'error');
        } finally {
            setStartingInterview(null);
        }
    };

    const getInterviewTypeLabel = (type: string) => {
        const types = {
            'TECHNICAL': 'Técnica',
            'BEHAVIORAL': 'Comportamental',
            'MIXED': 'Mista'
        };
        return types[type as keyof typeof types] || type;
    };

    const getInterviewTypeColor = (type: string) => {
        const colors = {
            'TECHNICAL': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'BEHAVIORAL': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'MIXED': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col min-h-full transition-colors duration-300">
            <PageTitle title="Minhas Simulações - TreinaVagaAI" />
            
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 px-4 lg:px-8 py-4 mb-8">
                <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Minhas Simulações
                        </h1>
                        <p className="mt-1 text-sm sm:text-base text-slate-500 dark:text-slate-400">
                            Gerencie e pratique suas simulações de entrevista.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/create-interview')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-sm shrink-0"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Nova Simulação</span>
                        <span className="sm:hidden">Nova</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-4xl mx-auto">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <>
                        {interviews.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                <ChatBubbleLeftRightIcon className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500 mb-4" />
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                    Nenhuma simulação encontrada
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                                    Você ainda não criou simulações de entrevista. Que tal começar criando uma baseada em uma vaga real?
                                </p>
                                <button
                                    onClick={() => navigate('/create-interview')}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                                >
                                    <SparklesIcon className="w-5 h-5" />
                                    Criar minha primeira simulação
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {interviews.map((interview) => (
                                    <div 
                                        key={interview._id} 
                                        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                {/* Header */}
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                                                            {interview.jobTitle}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                            <BuildingOfficeIcon className="w-4 h-4" />
                                                            <span>{interview.companyName}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInterviewTypeColor(interview.interviewType)}`}>
                                                            {getInterviewTypeLabel(interview.interviewType)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Informações principais */}
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                                        <span>{interview.numberOfQuestions} perguntas</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                        <ClockIcon className="w-4 h-4" />
                                                        <span>{interview.estimatedDuration} min</span>
                                                    </div>
                                                    {interview.experienceLevel && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                            <UserIcon className="w-4 h-4" />
                                                            <span>{interview.experienceLevel}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Estatísticas */}
                                                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                                                    <span>Criado em {formatDate(interview.createdAt)}</span>
                                                    <span>•</span>
                                                    <span>{interview.totalAccess} acessos</span>
                                                    <span>•</span>
                                                    <span>{interview.totalAttempts} tentativas</span>
                                                    {interview.averageDifficulty > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span>Dificuldade média: {interview.averageDifficulty}/5</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Ações */}
                                            <div className="flex flex-col gap-2 shrink-0">
                                                <button
                                                    onClick={() => startInterview(interview)}
                                                    disabled={startingInterview === interview._id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors text-sm font-medium min-w-0"
                                                >
                                                    {startingInterview === interview._id ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                                                            <span className="hidden sm:inline">Iniciando...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <PlayIcon className="w-4 h-4 shrink-0" />
                                                            <span className="hidden sm:inline">Iniciar</span>
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/interview/${interview._id}`)}
                                                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm min-w-0"
                                                >
                                                    <span className="hidden sm:inline">Detalhes</span>
                                                    <span className="sm:hidden">Ver</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Paginação */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 mt-8">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                
                                <div className="flex space-x-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`px-3 py-2 text-sm rounded-lg ${
                                                page === pageNum
                                                    ? 'bg-primary-600 text-white'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPages}
                                    className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Próxima
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default MyInterviewsPage;