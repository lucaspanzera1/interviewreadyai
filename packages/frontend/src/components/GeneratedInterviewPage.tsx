import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import {
    CheckCircleIcon,
    ArrowLeftIcon,
    BuildingOfficeIcon,
    LightBulbIcon,
    TagIcon,
    VideoCameraIcon,
    DocumentTextIcon,
    SparklesIcon,
    GlobeAltIcon,
    ChartBarIcon,
    ClockIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { apiClient, Interview } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

interface InterviewAttempt {
    _id: string;
    interviewId: string | {
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

const GeneratedInterviewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [interview, setInterview] = useState<Interview | null>(null);
    const [latestAttempt, setLatestAttempt] = useState<InterviewAttempt | null>(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        if (id) {
            loadInterview();
        }
    }, [id]);

    const loadInterview = async () => {
        try {
            setLoading(true);
            const [interviewData, attemptsData] = await Promise.all([
                apiClient.getInterviewById(id!),
                apiClient.getUserInterviewAttempts(1, 1, id!)
            ]);

            setInterview(interviewData);
            if (attemptsData && attemptsData.attempts && attemptsData.attempts.length > 0) {
                setLatestAttempt(attemptsData.attempts[0]);
            }
        } catch (error) {
            console.error('Error loading interview:', error);
            showToast('Erro ao carregar simulação de entrevista', 'error');
            navigate('/my-interviews');
        } finally {
            setLoading(false);
        }
    };

    const startInterview = async (mode: 'text' | 'video' = 'text') => {
        if (!interview) return;

        setStarting(true);
        try {
            await apiClient.recordInterviewAccess(interview._id);
            const fullInterview = await apiClient.getInterviewForPlaying(interview._id);

            if (!fullInterview || !fullInterview.questions || fullInterview.questions.length === 0) {
                showToast('Esta simulação não está disponível ou não tem perguntas.', 'error');
                return;
            }

            localStorage.setItem('generatedInterview', JSON.stringify(fullInterview));
            localStorage.setItem('currentInterviewId', fullInterview._id);

            showToast(`Simulação ${mode === 'video' ? 'de vídeo' : 'de texto'} iniciada! Boa sorte! 🎯`, 'success');

            // Redirecionar baseado no modo escolhido
            if (mode === 'video') {
                navigate('/interview/video');
            } else {
                navigate('/interview/play');
            }
        } catch (error: any) {
            console.error('Erro ao iniciar simulação:', error);
            const message = error.response?.data?.message || 'Erro ao iniciar a simulação.';
            showToast(message, 'error');
        } finally {
            setStarting(false);
        }
    };

    const getQuestionTypeColor = (type: string) => {
        const colors = {
            'technical': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-blue-700/10 dark:ring-blue-400/20',
            'behavioral': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 ring-1 ring-emerald-700/10 dark:ring-emerald-400/20',
            'situational': 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 ring-1 ring-violet-700/10 dark:ring-violet-400/20',
            'company_specific': 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 ring-1 ring-amber-700/10 dark:ring-amber-400/20'
        };
        return colors[type as keyof typeof colors] || 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    };

    const getQuestionTypeLabel = (type: string) => {
        const labels = {
            'technical': 'Técnica',
            'behavioral': 'Comportamental',
            'situational': 'Situacional',
            'company_specific': 'Empresa'
        };
        return labels[type as keyof typeof labels] || type;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
            case 'processing': return 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20';
            case 'completed_with_errors': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
            default: return 'text-slate-500 bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
        if (score >= 60) return 'text-amber-600 dark:text-amber-400';
        return 'text-rose-600 dark:text-rose-400';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 animate-pulse">Preparando sua entrevista...</p>
                </div>
            </div>
        );
    }

    if (!interview) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircleIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Simulação não encontrada
                    </h2>
                    <p className="text-slate-500 mb-6">Não conseguimos encontrar os dados desta simulação. Ela pode ter sido removida.</p>
                    <button
                        onClick={() => navigate('/my-interviews')}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all hover:-translate-y-1 shadow-lg shadow-primary-600/20"
                    >
                        Voltar para Minhas Simulações
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full pb-10">
            <PageTitle title={`${interview.jobTitle} - ${interview.companyName} - TreinaVagaAI`} />

            {/* Immersive Header */}
            <header className="relative bg-slate-900 py-12 px-4 sm:px-8 -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 mb-8 overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 max-w-6xl mx-auto">
                    <button
                        onClick={() => navigate('/my-interviews')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
                    >
                        <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Voltar para listagem</span>
                    </button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white border border-white/10 text-xs font-medium flex items-center gap-1.5">
                                    <GlobeAltIcon className="w-3.5 h-3.5" />
                                    TreinaVaga AI
                                </span>
                                {interview.experienceLevel && (
                                    <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-200 border border-primary-500/30 text-xs font-medium">
                                        {interview.experienceLevel}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">
                                {interview.jobTitle}
                            </h1>
                            <div className="flex items-center gap-2 text-lg text-slate-300">
                                <BuildingOfficeIcon className="w-5 h-5" />
                                <span className="font-medium">{interview.companyName}</span>
                            </div>
                        </div>

                        {/* Quick Stats in Header */}
                        <div className="flex gap-4 md:gap-8 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <div className="text-center px-2">
                                <div className="text-2xl font-bold text-white mb-1">{interview.numberOfQuestions}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Perguntas</div>
                            </div>
                            <div className="w-px bg-white/10"></div>
                            <div className="text-center px-2">
                                <div className="text-2xl font-bold text-white mb-1">{interview.estimatedDuration}'</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Minutos</div>
                            </div>
                            <div className="w-px bg-white/10"></div>
                            <div className="text-center px-2">
                                <div className="text-2xl font-bold text-white mb-1">{interview.totalAttempts}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Tentativas</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 md:px-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Recent Feedback Teaser - NEW SECTION */}
                        {latestAttempt && latestAttempt.analysisStatus === 'completed' && latestAttempt.videoAnalysis && (
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <SparklesIcon className="w-5 h-5 text-amber-500" />
                                            Último Feedback de Vídeo
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Realizado {new Date(latestAttempt.createdAt).toLocaleDateString()} · {new Date(latestAttempt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/interview-analysis/${latestAttempt._id}`)}
                                        className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline flex items-center gap-1 transition-colors"
                                    >
                                        Ver análise detalhada
                                        <ArrowLeftIcon className="w-4 h-4 rotate-180" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 relative z-10">
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Score Geral</div>
                                        <div className={`text-3xl font-bold ${getScoreColor(latestAttempt.preparednessScore || 0)}`}>
                                            {latestAttempt.preparednessScore || 0}<span className="text-base font-normal text-slate-400">/100</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pontos Fortes</div>
                                        <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                                            <CheckCircleIcon className="w-5 h-5" />
                                            {latestAttempt.videoAnalysis.summary.strengths.length} identificados
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Melhorias</div>
                                        <div className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-2">
                                            <ArrowPathIcon className="w-5 h-5" />
                                            {latestAttempt.videoAnalysis.summary.improvements.length} sugestões
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 relative z-10">
                                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Resumo Rápido</h4>
                                    <div className="space-y-2">
                                        {latestAttempt.videoAnalysis.summary.strengths.slice(0, 1).map((point, i) => (
                                            <div key={`s-${i}`} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></div>
                                                <p>{point}</p>
                                            </div>
                                        ))}
                                        {latestAttempt.videoAnalysis.summary.improvements.slice(0, 1).map((point, i) => (
                                            <div key={`i-${i}`} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0"></div>
                                                <p>{point}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Feedback Processing State */}
                        {latestAttempt && (latestAttempt.analysisStatus === 'pending' || latestAttempt.analysisStatus === 'processing') && (
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-700"></div>
                                        <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Processando sua última entrevista...</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Nossa IA está analisando seu vídeo para gerar feedback detalhado.</p>
                                    </div>
                                    <div className="ml-auto">
                                        <button
                                            onClick={() => navigate(`/interview-analysis/${latestAttempt._id}`)}
                                            className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                        >
                                            Acompanhar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Preparation Tips */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <LightBulbIcon className="w-32 h-32" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <span className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                                    <LightBulbIcon className="w-6 h-6" />
                                </span>
                                Dicas de Preparação
                            </h3>

                            <div className="space-y-4 relative z-10">
                                {interview.preparationTips && interview.preparationTips.map((tip, index) => (
                                    <div key={index} className="flex gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400">
                                            {index + 1}
                                        </span>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                                            {tip}
                                        </p>
                                    </div>
                                ))}
                                {(!interview.preparationTips || interview.preparationTips.length === 0) && (
                                    <p className="text-slate-500 italic">Nenhuma dica específica disponível.</p>
                                )}
                            </div>
                        </div>

                        {/* Requirements */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <span className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <TagIcon className="w-6 h-6" />
                                </span>
                                Requisitos e Habilidades
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {interview.jobRequirements && interview.jobRequirements.map((req, index) => (
                                    <span key={index} className="px-4 py-2 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 hover:dark:bg-slate-700 transition-colors cursor-default">
                                        {req}
                                    </span>
                                ))}
                                {(!interview.jobRequirements || interview.jobRequirements.length === 0) && (
                                    <p className="text-slate-500 italic">Sem requisitos listados.</p>
                                )}
                            </div>
                        </div>

                        {/* Questions Preview */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 ml-2">Preview das Perguntas</h3>
                            <div className="space-y-4">
                                {interview.questions.slice(0, 3).map((question, index) => (
                                    <div key={question.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start gap-4 mb-3">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Pergunta {index + 1}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${question.type ? getQuestionTypeColor(question.type) : 'bg-slate-100 text-slate-600'}`}>
                                                {question.type ? getQuestionTypeLabel(question.type) : 'Geral'}
                                            </span>
                                        </div>
                                        <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
                                            {question.question}
                                        </p>
                                    </div>
                                ))}
                                {interview.questions.length > 3 && (
                                    <div className="text-center py-4">
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                            E mais {interview.questions.length - 3} perguntas esperando por você...
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Action Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">

                            {/* NEW: Last Result Card (if exists) */}
                            {latestAttempt && latestAttempt.analysisStatus === 'completed' ? (
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl shadow-slate-900/20 text-white relative overflow-hidden group">
                                    {/* Background Glow */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-600/30 transition-colors"></div>

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="font-bold text-lg">Último Resultado</h3>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(latestAttempt.analysisStatus)}`}>
                                                Concluído
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-center mb-8">
                                            <div className="relative mb-2 w-32 h-32">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle className="text-white/10" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                                                    <circle
                                                        className={`${latestAttempt.preparednessScore >= 80 ? 'text-emerald-500' : latestAttempt.preparednessScore >= 60 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-out`}
                                                        strokeWidth="8"
                                                        strokeDasharray={365}
                                                        strokeDashoffset={365 - (365 * (latestAttempt.preparednessScore || 0) / 100)}
                                                        strokeLinecap="round"
                                                        stroke="currentColor"
                                                        fill="transparent"
                                                        r="58"
                                                        cx="64"
                                                        cy="64"
                                                    />
                                                </svg>
                                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                                    <div className="text-3xl font-bold">{latestAttempt.preparednessScore || 0}</div>
                                                    <div className="text-xs text-slate-400">SCORE</div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-300 text-center max-w-[200px]">
                                                {latestAttempt.preparednessScore >= 80 ? 'Excelente trabalho! Você está pronto.' : 'Bom começo! Vamos praticar mais.'}
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <button
                                                onClick={() => navigate(`/interview-analysis/${latestAttempt._id}`)}
                                                className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg shadow-white/10 flex items-center justify-center gap-2"
                                            >
                                                <ChartBarIcon className="w-5 h-5" />
                                                Ver Análise Completa
                                            </button>

                                            <button
                                                onClick={() => startInterview('video')}
                                                className="w-full py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/10 flex items-center justify-center gap-2"
                                            >
                                                <ArrowPathIcon className="w-5 h-5" />
                                                Tentar Novamente
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Default Start Card */
                                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl shadow-primary-900/5 ring-1 ring-slate-900/5">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 hover:rotate-6 transition-transform">
                                            <SparklesIcon className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                            Pronto para praticar?
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                                            Escolha o modo de simulação ideal para você.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => startInterview('video')}
                                            disabled={starting}
                                            className="w-full group relative flex items-center p-4 rounded-xl border-2 border-red-100 dark:border-red-900/30 hover:border-red-500 dark:hover:border-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200 shadow-sm"
                                        >
                                            <div className="p-3 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 rounded-lg group-hover:scale-110 transition-transform shadow-sm">
                                                <VideoCameraIcon className="w-6 h-6" />
                                            </div>
                                            <div className="ml-4 text-left">
                                                <div className="font-bold text-slate-900 dark:text-white">Modo Vídeo</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Recomendado para melhor feedback</div>
                                            </div>
                                            {starting && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center rounded-xl"><div className="animate-spin w-6 h-6 border-2 border-red-600 rounded-full border-t-transparent" /></div>}
                                        </button>

                                        <button
                                            onClick={() => startInterview('text')}
                                            disabled={starting}
                                            className="w-full group relative flex items-center p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all duration-200"
                                        >
                                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                                                <DocumentTextIcon className="w-6 h-6" />
                                            </div>
                                            <div className="ml-4 text-left">
                                                <div className="font-bold text-slate-900 dark:text-white">Modo Texto</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Responda via chat</div>
                                            </div>
                                            {starting && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center rounded-xl"><div className="animate-spin w-6 h-6 border-2 border-primary-600 rounded-full border-t-transparent" /></div>}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Secondary Actions */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <button
                                    onClick={() => navigate(`/my-interview-attempts?interviewId=${interview._id}`)}
                                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-slate-600 dark:text-slate-300 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            <ClockIcon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-sm">Histórico de Tentativas</span>
                                    </div>
                                    <ArrowLeftIcon className="w-4 h-4 rotate-180 text-slate-400" />
                                </button>
                            </div>

                            <div className="text-center">
                                <p className="text-xs text-slate-400">
                                    Ao iniciar, o tempo começará a contar.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default GeneratedInterviewPage;