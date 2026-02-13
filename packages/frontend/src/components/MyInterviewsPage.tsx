import React, { useState, useEffect } from 'react';
import PageTitle from './PageTitle';
import {
    PlusCircleIcon,
    ChatBubbleLeftRightIcon,
    SparklesIcon,
    ClockIcon,
    BuildingOfficeIcon,
    UserIcon,
    PlayIcon,
    ChevronRightIcon,
    QuestionMarkCircleIcon,
    XMarkIcon
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
    const [showHelp, setShowHelp] = useState(false);

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

    const getInterviewTypeStyles = (type: string) => {
        const styles = {
            'TECHNICAL': 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-400/20',
            'BEHAVIORAL': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-400/20',
            'MIXED': 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-900/20 dark:text-violet-300 dark:ring-violet-400/20'
        };
        return styles[type as keyof typeof styles] || 'bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-400/20';
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
            year: 'numeric'
        });
    };

    return (
        <div className="flex flex-col min-h-full">
            <PageTitle title="Minhas Simulações - TreinaVagaAI" />

            {/* Elegant Header */}
            <div className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 pb-8 pt-6 px-4 sm:px-8 border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 mb-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                                Minhas Simulações
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 max-w-xl">
                                Acompanhe seu progresso e continue praticando para conquistar sua vaga dos sonhos.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/create-interview')}
                            className="group relative inline-flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 hover:-translate-y-0.5"
                        >
                            <PlusCircleIcon className="w-5 h-5 transition-transform group-hover:rotate-90" />
                            <span>Nova Simulação</span>
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
                        <p className="text-slate-500 dark:text-slate-400 animate-pulse font-medium">Carregando suas simulações...</p>
                    </div>
                ) : (
                    <>
                        {interviews.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
                                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 max-w-lg w-full">
                                    <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <SparklesIcon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                        Comece sua Jornada
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                        Você ainda não criou nenhuma simulação. Crie sua primeira entrevista baseada em uma vaga real e comece a treinar agora mesmo!
                                    </p>
                                    <button
                                        onClick={() => navigate('/create-interview')}
                                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                                    >
                                        <PlusCircleIcon className="w-6 h-6" />
                                        Criar Primeira Simulação
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:gap-6">
                                {interviews.map((interview) => (
                                    <div
                                        key={interview._id}
                                        className="group bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800/50 transition-all duration-300 relative overflow-hidden"
                                    >
                                        {/* Decorative gradient blob on hover */}
                                        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                                        <div className="flex flex-col sm:flex-row gap-5 relative z-10">
                                            {/* Icon/Logo Placeholder */}
                                            <div className="hidden sm:flex shrink-0 w-12 h-12 bg-slate-100 dark:bg-slate-700/50 rounded-xl items-center justify-center text-2xl">
                                                <BuildingOfficeIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getInterviewTypeStyles(interview.interviewType)}`}>
                                                        {getInterviewTypeLabel(interview.interviewType)}
                                                    </span>
                                                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                                        <ClockIcon className="w-3.5 h-3.5" />
                                                        {formatDate(interview.createdAt)}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                                                    {interview.jobTitle}
                                                </h3>

                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                                                    <span className="font-medium">{interview.companyName}</span>
                                                    {interview.experienceLevel && (
                                                        <>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                            <span className="flex items-center gap-1">
                                                                <UserIcon className="w-3.5 h-3.5" />
                                                                {interview.experienceLevel}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1.5 rounded-lg">
                                                        <ChatBubbleLeftRightIcon className="w-4 h-4 text-slate-400" />
                                                        {interview.numberOfQuestions} perguntas
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1.5 rounded-lg">
                                                        <ClockIcon className="w-4 h-4 text-slate-400" />
                                                        ~{interview.estimatedDuration} min
                                                    </div>
                                                    {interview.totalAttempts > 0 ? (
                                                        <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/10 px-2.5 py-1.5 rounded-lg text-green-700 dark:text-green-400">
                                                            <SparklesIcon className="w-4 h-4" />
                                                            {interview.totalAttempts} tentativas
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/10 px-2.5 py-1.5 rounded-lg text-amber-700 dark:text-amber-400">
                                                            <SparklesIcon className="w-4 h-4" />
                                                            Nova
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-row sm:flex-col gap-3 shrink-0 pt-4 sm:pt-0 sm:border-l sm:border-slate-100 sm:dark:border-slate-700 sm:pl-6">
                                                <button
                                                    onClick={() => startInterview(interview)}
                                                    disabled={startingInterview === interview._id}
                                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-400 text-white rounded-xl font-medium transition-all shadow-md shadow-primary-600/20 hover:shadow-lg hover:shadow-primary-600/30 active:scale-95 min-w-[120px]"
                                                >
                                                    {startingInterview === interview._id ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                                                            <span>...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <PlayIcon className="w-4 h-4" />
                                                            <span>Praticar</span>
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/interview/${interview._id}`)}
                                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl font-medium transition-colors"
                                                >
                                                    <span>Detalhes</span>
                                                    <ChevronRightIcon className="w-4 h-4" />
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
                {/* Help/Support Badge */}
                <div className="mt-8 mb-8 flex justify-center">
                    {!showHelp ? (
                        <button
                            onClick={() => setShowHelp(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shadow-sm"
                        >
                            <QuestionMarkCircleIcon className="w-5 h-5" />
                            <span>Dúvidas sobre Simulações?</span>
                        </button>
                    ) : (
                        <div className="relative w-full p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 animate-fade-in-up">
                            <button
                                onClick={() => setShowHelp(false)}
                                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 w-fit h-fit">
                                <QuestionMarkCircleIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 pr-8">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                                    Como funcionam as Simulações?
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                                    Aqui você treina para entrevistas reais! A IA atua como uma recrutadora, criando perguntas técnicas e comportamentais baseadas na vaga.
                                    Ela te da dicas de preparação, você grava um vídeo respondendo as perguntas.
                                    Ao final, você recebe um feedback detalhado sobre suas respostas.
                                </p>
                                <a
                                    href="https://wa.me/5531997313160"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-semibold hover:underline inline-flex items-center gap-2"
                                >
                                    Precisa de ajuda? Fale com nosso suporte
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    )}
                </div>
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

export default MyInterviewsPage;