import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import { ChatBubbleLeftRightIcon, LinkIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const CreateInterviewPage: React.FC = () => {
    const [jobLink, setJobLink] = useState('');
    const [numberOfQuestions, setNumberOfQuestions] = useState(8);
    const [experienceLevel, setExperienceLevel] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();
    const { t } = useTranslation('interview');

    const [loadingText, setLoadingText] = useState(t('create.loadingInitializing')); // State for loading messages

    // Cycle through loading messages to keep user engaged
    React.useEffect(() => {
        if (!isLoading) return;

        const messages = [
            t('create.loadingAnalyzing'),
            t('create.loadingIdentifying'),
            t('create.loadingCreating'),
            t('create.loadingTips'),
            t('create.loadingFinalizing')
        ];

        let index = 0;
        setLoadingText(messages[0]);

        const interval = setInterval(() => {
            index = (index + 1) % messages.length;
            setLoadingText(messages[index]);
        }, 2000);

        return () => clearInterval(interval);
    }, [isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Validar que é uma URL válida de um dos sites suportados
            const supportedSites = ['linkedin.com', 'gupy.io', 'gupy.com.br', 'infojobs.com', 'infojobs.net', 'glassdoor.com', 'glassdoor.com.br', 'indeed.com', 'indeed.com.br'];
            const isValidUrl = supportedSites.some(site => jobLink.includes(site));

            if (!isValidUrl) {
                throw new Error(t('create.invalidUrlError'));
            }

            // Verificar se o usuário tem tokens suficientes (2 tokens)
            if (!user?.tokens || user.tokens < 2) {
                throw new Error(t('create.notEnoughTokens'));
            }

            // Gerar a simulação de entrevista
            const result = await apiClient.generateInterview({
                jobUrl: jobLink,
                numberOfQuestions,
                experienceLevel: experienceLevel || undefined
            });

            // Atualizar dados do usuário (para atualizar saldo de tokens)
            await refreshUser();

            // Mostrar mensagem de sucesso
            showToast(t('create.successWithDeduction'), 'success');

            // Redirecionar para página de visualização da simulação
            if (result.interviewId) {
                setTimeout(() => {
                    navigate(`/interview/generated/${result.interviewId}`);
                }, 500);
            } else {
                // Fallback para página de minhas entrevistas
                setTimeout(() => {
                    navigate('/my-interviews');
                }, 500);
            }
        } catch (err: any) {
            console.error('Error generating interview:', err);
            const errorMessage = err.response?.data?.message || err.message || t('create.errorGenerating');
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const experienceLevels = [
        { value: '', label: t('create.selectLevel') },
        { value: 'Estagiário', label: t('create.intern') },
        { value: 'Junior', label: t('create.juniorYears') },
        { value: 'Pleno', label: t('create.midYears') },
        { value: 'Senior', label: t('create.seniorYears') },
        { value: 'Especialista', label: t('create.specialist') },
        { value: 'Liderança', label: t('create.leadership') },
    ];

    return (
        <div className="min-h-full">
            <PageTitle title={t('create.pageTitle')} />

            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 px-4 lg:px-8 py-4 mb-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {t('create.title')}
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                        {t('create.subtitle')}
                        <span className="font-medium text-primary-600 dark:text-primary-400"> {t('create.costs2Tokens')}.</span>
                        <br />
                        <span className="text-xs text-slate-500 dark:text-slate-400">{t('create.afterGenNote')}</span>
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">

                    {/* Informações importantes */}
                    <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start gap-3">
                            <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
                            <div>
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                    {t('create.howItWorks')}
                                </h3>
                                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                    <li>• {t('create.howStep1')}</li>
                                    <li>• {t('create.howStep2')}</li>
                                    <li>• {t('create.howStep3')}</li>
                                    <li>• {t('create.howStep4')}</li>
                                    <li>• {t('create.estimatedTime', { min: numberOfQuestions * 3, max: numberOfQuestions * 4 })}</li>
                                </ul>

                                {user && (
                                    <div className="mt-3 text-sm font-medium">
                                        <span className="text-slate-700 dark:text-slate-300">{t('create.yourTokens')} </span>
                                        <span className={`${user?.tokens && user.tokens >= 2 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {user.tokens} {user.tokens === 1 ? 'token' : 'tokens'}
                                        </span>
                                        {user?.tokens && user.tokens < 2 && (
                                            <span className="ml-2 text-red-600 dark:text-red-400">
                                                {t('create.insufficientTokens')}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* URL da vaga */}
                        <div>
                            <label htmlFor="jobLink" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <LinkIcon className="w-4 h-4 inline mr-1" />
                                {t('create.jobLinkLabel')}
                            </label>
                            <input
                                type="url"
                                id="jobLink"
                                value={jobLink}
                                onChange={(e) => setJobLink(e.target.value)}
                                placeholder={t('create.jobLinkPlaceholderFull')}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow duration-200"
                                required
                                disabled={isLoading}
                            />
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {t('create.jobLinkHint')}
                            </p>
                        </div>

                        {/* Número de perguntas */}
                        <div>
                            <label htmlFor="numberOfQuestions" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <ClockIcon className="w-4 h-4 inline mr-1" />
                                {t('create.questionCount')}
                            </label>
                            <select
                                id="numberOfQuestions"
                                value={numberOfQuestions}
                                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow duration-200"
                                disabled={isLoading}
                            >
                                <option value={5}>{t('create.questionCountOption', { count: 5, min: 15, max: 20 })}</option>
                                <option value={8}>{t('create.questionCountOption', { count: 8, min: 24, max: 32 })}</option>
                                <option value={10}>{t('create.questionCountOption', { count: 10, min: 30, max: 40 })}</option>
                                <option value={12}>{t('create.questionCountOption', { count: 12, min: 36, max: 48 })}</option>
                                <option value={15}>{t('create.questionCountOption', { count: 15, min: 45, max: 60 })}</option>
                            </select>
                        </div>

                        {/* Nível de experiência */}
                        <div>
                            <label htmlFor="experienceLevel" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <UserIcon className="w-4 h-4 inline mr-1" />
                                {t('create.experienceLevelOptional')}
                            </label>
                            <select
                                id="experienceLevel"
                                value={experienceLevel}
                                onChange={(e) => setExperienceLevel(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow duration-200"
                                disabled={isLoading}
                            >
                                {experienceLevels.map((level) => (
                                    <option key={level.value} value={level.value}>
                                        {level.label}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {t('create.experienceLevelHint')}
                            </p>
                        </div>

                        {/* Erro */}
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        {/* Botões */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 sm:flex-none px-6 py-3.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 font-medium"
                                disabled={isLoading}
                            >
                                {t('create.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !user || !user.tokens || user.tokens < 2}
                                className={`
                                    relative flex-1 sm:flex-auto px-6 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-primary-500/20
                                    transition-all duration-300 transform overflow-hidden group
                                    ${isLoading
                                        ? 'bg-slate-800 dark:bg-slate-700 cursor-not-allowed scale-[0.98]'
                                        : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 hover:scale-[1.02] hover:shadow-primary-500/30'
                                    }
                                    disabled:opacity-70 disabled:grayscale disabled:hover:scale-100
                                `}
                            >
                                {/* Background Shimmer Effect during loading */}
                                {isLoading && (
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                )}

                                <span className="relative flex items-center justify-center gap-2.5">
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" />
                                            <span className="animate-pulse font-medium">{loadingText}</span>
                                        </>
                                    ) : (
                                        <>
                                            <ChatBubbleLeftRightIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                            <span>{t('create.generateSimulation')}</span>
                                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold ml-1">{t('create.tokenCost')}</span>
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreateInterviewPage;