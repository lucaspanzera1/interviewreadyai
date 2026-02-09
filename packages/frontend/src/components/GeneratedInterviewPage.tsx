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
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import { apiClient, Interview } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

const GeneratedInterviewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [interview, setInterview] = useState<Interview | null>(null);
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
            const response = await apiClient.getInterviewById(id!);
            setInterview(response);
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
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getQuestionTypeColor(question.type)}`}>
                                                {getQuestionTypeLabel(question.type)}
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
                            {/* Start Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl shadow-primary-900/5 ring-1 ring-slate-900/5">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 hover:rotate-6 transition-transform">
                                        <SparklesIcon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                        Pronto para começar?
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                                        Escolha como você quer praticar hoje.
                                    </p>
                                </div>

                                <div className="space-y-3">
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
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Responda e receba feedback imediato</div>
                                        </div>
                                        {starting && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center rounded-xl"><div className="animate-spin w-6 h-6 border-2 border-primary-600 rounded-full border-t-transparent" /></div>}
                                    </button>

                                    <button
                                        onClick={() => startInterview('video')}
                                        disabled={starting}
                                        className="w-full group relative flex items-center p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200"
                                    >
                                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg group-hover:scale-110 transition-transform">
                                            <VideoCameraIcon className="w-6 h-6" />
                                        </div>
                                        <div className="ml-4 text-left">
                                            <div className="font-bold text-slate-900 dark:text-white">Modo Vídeo</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Simule uma call real com IA</div>
                                        </div>
                                        {starting && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center rounded-xl"><div className="animate-spin w-6 h-6 border-2 border-red-600 rounded-full border-t-transparent" /></div>}
                                    </button>

                                    <button
                                        onClick={() => navigate(`/my-interview-attempts?interviewId=${interview._id}`)}
                                        className="w-full group relative flex items-center p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all duration-200"
                                    >
                                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg group-hover:scale-110 transition-transform">
                                            <VideoCameraIcon className="w-6 h-6" />
                                        </div>
                                        <div className="ml-4 text-left">
                                            <div className="font-bold text-slate-900 dark:text-white">Tentativas Vídeo</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Veja suas gravações e análises</div>
                                        </div>
                                    </button>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
                                    <p className="text-xs text-slate-400">
                                        Ao iniciar, o tempo começará a contar.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default GeneratedInterviewPage;