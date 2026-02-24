import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import { SparklesIcon, LinkIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../lib/api';
import { FlashcardLevel } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTranslation } from 'react-i18next';

const CreateFlashcardByLinkPage: React.FC = () => {
    const [jobLink, setJobLink] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<FlashcardLevel>(FlashcardLevel.MEDIO);
    const [cardCount, setCardCount] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();
    const { t } = useTranslation('flashcard');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Validar que é uma URL válida de um dos sites suportados
            const supportedSites = ['linkedin.com', 'gupy.io', 'gupy.com.br', 'infojobs.com', 'infojobs.net', 'glassdoor.com', 'glassdoor.com.br', 'indeed.com', 'indeed.com.br'];
            const isValidUrl = supportedSites.some(site => jobLink.includes(site));

            if (!isValidUrl) {
                throw new Error(t('create.invalidLink'));
            }

            // Verificar se o usuário tem tokens
            if (!user?.tokens || user.tokens < 2) {
                throw new Error(t('create.notEnoughTokens'));
            }

            // Gerar os flashcards
            await apiClient.generateJobFlashcard({
                jobUrl: jobLink,
                nivel: selectedLevel,
                quantidade_cards: cardCount
            });

            // Atualizar dados do usuário (para atualizar saldo de tokens)
            await refreshUser();

            // Mostrar mensagem de sucesso
            showToast(t('create.successGenerated'), 'success');

            // Redirecionar para página de Meus Flashcards
            setTimeout(() => {
                navigate('/my-flashcards');
            }, 500);
        } catch (err: any) {
            console.error('Error generating flashcards:', err);
            const errorMessage = err.response?.data?.message || err.message || t('create.errorGenerating');
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const supportedSites = ['linkedin.com', 'gupy.io', 'gupy.com.br', 'infojobs.com', 'infojobs.net', 'glassdoor.com', 'glassdoor.com.br', 'indeed.com', 'indeed.com.br'];
    const isValidJobUrl = supportedSites.some(site => jobLink.includes(site));

    return (
        <div className="flex flex-col min-h-full transition-colors duration-300">
            <PageTitle title={t('create.pageTitle')} />

            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 px-4 lg:px-8 py-4 mb-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {t('create.title')}
                    </h1>
                    <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                        {t('create.subtitle')}
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-4xl mx-auto">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Input Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 relative overflow-hidden group">
                        {/* Background decorative elements */}
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-500"></div>
                        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>

                        <div className="relative z-10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Free Access Info Card */}
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-xl p-4 mb-6 flex items-start gap-4 shadow-sm">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 shrink-0">
                                        <SparklesIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-green-800 dark:text-green-200">
                                                {t('create.freeAccessTitle', 'Acesso Gratuito Antecipado')}
                                            </h3>
                                            <span className="px-2 py-0.5 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-[10px] font-black uppercase tracking-wider rounded-md">BETA</span>
                                        </div>
                                        <p className="text-green-700 dark:text-green-300 mt-1 text-sm leading-relaxed">
                                            {t('create.freeAccessDesc', 'Aproveite! Durante esta fase inicial, a geração de flashcards é totalmente gratuita. No futuro, este recurso poderá fazer parte dos nossos planos premium.')}
                                        </p>
                                    </div>
                                </div>

                                {/* Platform Selection (Fixed to LinkedIn for now) */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                                        {t('create.platform')}
                                    </label>
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-900 dark:text-white">LinkedIn</h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {t('create.jobLinkPlaceholder')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Job Link Input */}
                                <div className="space-y-3">
                                    <label htmlFor="jobLink" className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                                        {t('create.jobLinkLabel')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="jobLink"
                                            type="url"
                                            value={jobLink}
                                            onChange={(e) => setJobLink(e.target.value)}
                                            placeholder="https://www.linkedin.com/jobs/view/123456789"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            required
                                        />
                                        {isValidJobUrl && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Level Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                                        {t('create.difficultyLabel')}
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { value: FlashcardLevel.FACIL, label: t('create.easy'), desc: t('create.easyDesc') },
                                            { value: FlashcardLevel.MEDIO, label: t('create.medium'), desc: t('create.mediumDesc') },
                                            { value: FlashcardLevel.DIFICIL, label: t('create.hard'), desc: t('create.hardDesc') }
                                        ].map((level) => (
                                            <label
                                                key={level.value}
                                                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedLevel === level.value
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="level"
                                                    value={level.value}
                                                    checked={selectedLevel === level.value}
                                                    onChange={(e) => setSelectedLevel(e.target.value as FlashcardLevel)}
                                                    className="sr-only"
                                                />
                                                <div className="text-center">
                                                    <div className="font-medium text-slate-900 dark:text-white">
                                                        {level.label}
                                                    </div>
                                                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                        {level.desc}
                                                    </div>
                                                </div>
                                                {selectedLevel === level.value && (
                                                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    </div>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Card Count */}
                                <div className="space-y-3">
                                    <label htmlFor="cardCount" className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                                        {t('create.cardCount')}
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            id="cardCount"
                                            type="range"
                                            min="5"
                                            max="30"
                                            value={cardCount}
                                            onChange={(e) => setCardCount(parseInt(e.target.value))}
                                            className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="text-lg font-bold text-slate-900 dark:text-white w-12 text-center">
                                            {cardCount}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {t('create.cardCountRecommendation')}
                                    </p>
                                </div>

                                {/* Error Display */}
                                {error && (
                                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 text-red-800 dark:text-red-200">
                                        <p className="text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading || !jobLink || !isValidJobUrl}
                                        className="w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                {t('create.generating')}
                                            </>
                                        ) : (
                                            <>
                                                <SparklesIcon className="w-5 h-5" />
                                                {t('create.generateButton')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateFlashcardByLinkPage;