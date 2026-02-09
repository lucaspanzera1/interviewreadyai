import React, { useState, useEffect } from 'react';
import PageTitle from './PageTitle';
import {
    VideoCameraIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    PlayIcon,
    EyeIcon,
    SparklesIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

interface InterviewAttempt {
    _id: string;
    interviewId: {
        _id: string;
        jobTitle: string;
        companyName: string;
    };
    analysisStatus: 'pending' | 'processing' | 'completed' | 'completed_with_errors';
    videoAnalysis?: {
        overall_score: number;
        duration: number;
        moments: any[];
        summary: {
            strengths: string[];
            improvements: string[];
        };
    };
    strengths: string[];
    improvements: string[];
    preparednessScore: number;
    createdAt: string;
    completedAt?: string;
    actualDuration: number;
}

const MyInterviewAttemptsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { showToast } = useToast();
    const [attempts, setAttempts] = useState<InterviewAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [interviewTitle, setInterviewTitle] = useState<string>('');

    const interviewId = searchParams.get('interviewId');

    useEffect(() => {
        loadAttempts();
    }, [page]);

    const loadAttempts = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getUserInterviewAttempts(page, 10, interviewId || undefined);
            setAttempts(response.attempts);
            setTotalPages(response.pagination.pages);
            
            // Set interview title from first attempt if available
            if (response.attempts.length > 0 && response.attempts[0].interviewId) {
                setInterviewTitle(`${response.attempts[0].interviewId.jobTitle} - ${response.attempts[0].interviewId.companyName}`);
            }
        } catch (error) {
            console.error('Error loading attempts:', error);
            showToast('Erro ao carregar tentativas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const refreshAttempts = async () => {
        setRefreshing(true);
        await loadAttempts();
        setRefreshing(false);
        showToast('Tentativas atualizadas', 'success');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'processing':
                return <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />;
            case 'completed_with_errors':
                return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
            default:
                return <ClockIcon className="w-5 h-5 text-slate-400" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Análise Completa';
            case 'processing':
                return 'Processando Vídeo';
            case 'completed_with_errors':
                return 'Análise com Erros';
            default:
                return 'Aguardando Análise';
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-400/20';
            case 'processing':
                return 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-400/20';
            case 'completed_with_errors':
                return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-300 dark:ring-yellow-400/20';
            default:
                return 'bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-400/20';
        }
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Agora mesmo';
        if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} h`;

        return d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const viewAnalysis = (attempt: InterviewAttempt) => {
        // Navigate to analysis page with attempt data
        navigate(`/interview-analysis/${attempt._id}`);
    };

    return (
        <div className="flex flex-col min-h-full">
            <PageTitle title={`Tentativas de Vídeo - ${interviewTitle || 'TreinaVagaAI'}`} />

            {/* Elegant Header */}
            <div className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 pb-8 pt-6 px-4 sm:px-8 border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 mb-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                                Tentativas de Vídeo
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 max-w-xl">
                                {interviewTitle 
                                    ? `Acompanhe suas gravações de vídeo para "${interviewTitle}" e veja as análises da IA.`
                                    : 'Acompanhe suas gravações de vídeo e veja as análises da IA para melhorar seu desempenho.'
                                }
                            </p>
                        </div>
                        <button
                            onClick={refreshAttempts}
                            disabled={refreshing}
                            className="group relative inline-flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
                        >
                            <ArrowPathIcon className={`w-5 h-5 transition-transform ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                            <span>Atualizar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
                            <div className="w-12 h-12 border-4 border-primary-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 animate-pulse font-medium">Carregando suas tentativas...</p>
                    </div>
                ) : (
                    <>
                        {attempts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
                                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 max-w-lg w-full">
                                    <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <VideoCameraIcon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                        Nenhuma Tentativa Ainda
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                        Você ainda não fez nenhuma tentativa com vídeo para esta simulação. Pratique e grave suas respostas para receber feedback da IA!
                                    </p>
                                    <button
                                        onClick={() => interviewId ? navigate(`/interview/${interviewId}`) : navigate('/my-interviews')}
                                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                                    >
                                        <PlayIcon className="w-6 h-6" />
                                        {interviewId ? 'Voltar para Simulação' : 'Ver Minhas Simulações'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:gap-6">
                                {attempts.map((attempt, index) => (
                                    <div
                                        key={attempt._id}
                                        className="group bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800/50 transition-all duration-300 relative overflow-hidden"
                                        style={{
                                            animation: `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`,
                                            opacity: 0
                                        }}
                                    >
                                        {/* Decorative gradient blob on hover */}
                                        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                                        <div className="flex flex-col sm:flex-row gap-5 relative z-10">
                                            {/* Status Icon */}
                                            <div className="hidden sm:flex shrink-0 w-12 h-12 bg-slate-100 dark:bg-slate-700/50 rounded-xl items-center justify-center">
                                                {getStatusIcon(attempt.analysisStatus)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusStyles(attempt.analysisStatus)}`}>
                                                        {getStatusIcon(attempt.analysisStatus)}
                                                        <span className="ml-1.5">{getStatusLabel(attempt.analysisStatus)}</span>
                                                    </span>
                                                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                                        <ClockIcon className="w-3.5 h-3.5" />
                                                        {formatDate(attempt.createdAt)}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                                                    Tentativa #{index + 1 + ((page - 1) * 10)}
                                                </h3>

                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                                                    <span className="font-medium">{interviewTitle || 'Simulação de Entrevista'}</span>
                                                </div>

                                                <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1.5 rounded-lg">
                                                        <VideoCameraIcon className="w-4 h-4 text-slate-400" />
                                                        {formatDuration(attempt.actualDuration || 0)}
                                                    </div>
                                                    {attempt.analysisStatus === 'completed' && attempt.preparednessScore && (
                                                        <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/10 px-2.5 py-1.5 rounded-lg text-green-700 dark:text-green-400">
                                                            <SparklesIcon className="w-4 h-4" />
                                                            Score: {attempt.preparednessScore}/100
                                                        </div>
                                                    )}
                                                    {attempt.videoAnalysis?.moments && (
                                                        <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/10 px-2.5 py-1.5 rounded-lg text-blue-700 dark:text-blue-400">
                                                            <EyeIcon className="w-4 h-4" />
                                                            {attempt.videoAnalysis.moments.length} feedbacks
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Quick Preview of Analysis */}
                                                {attempt.analysisStatus === 'completed' && attempt.videoAnalysis && (
                                                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pontos Fortes</span>
                                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                                {attempt.videoAnalysis.summary?.strengths?.length || 0} itens
                                                            </span>
                                                        </div>
                                                        {attempt.videoAnalysis.summary?.strengths?.slice(0, 2).map((strength, idx) => (
                                                            <div key={idx} className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                                                • {strength}
                                                            </div>
                                                        ))}
                                                        {attempt.videoAnalysis.summary?.strengths?.length > 2 && (
                                                            <div className="text-xs text-slate-500 dark:text-slate-500">
                                                                +{attempt.videoAnalysis.summary.strengths.length - 2} mais...
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-row sm:flex-col gap-3 shrink-0 pt-4 sm:pt-0 sm:border-l sm:border-slate-100 sm:dark:border-slate-700 sm:pl-6">
                                                {attempt.analysisStatus === 'completed' && (
                                                    <button
                                                        onClick={() => viewAnalysis(attempt)}
                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all shadow-md shadow-primary-600/20 hover:shadow-lg hover:shadow-primary-600/30 active:scale-95 min-w-[120px]"
                                                    >
                                                        <EyeIcon className="w-4 h-4" />
                                                        <span>Ver Análise</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/interview/${attempt.interviewId._id}`)}
                                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl font-medium transition-colors"
                                                >
                                                    <PlayIcon className="w-4 h-4" />
                                                    <span>Refazer</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-10">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    Anterior
                                </button>

                                <div className="flex gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${page === pageNum
                                                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    Próxima
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translate3d(0, 20px, 0);
                    }
                    to {
                        opacity: 1;
                        transform: translate3d(0, 0, 0);
                    }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default MyInterviewAttemptsPage;