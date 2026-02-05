import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import { SparklesIcon, LinkIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';


const CreateQuizByLinkPage: React.FC = () => {
    const [jobLink, setJobLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Validar que é uma URL do LinkedIn
            if (!jobLink.includes('linkedin.com/jobs')) {
                throw new Error('Por favor, insira um link válido de vaga do LinkedIn');
            }

            // Verificar se o usuário tem tokens
            if (!user?.tokens || user.tokens < 1) {
                throw new Error('Você não tem tokens suficientes. Você precisa de pelo menos 1 token para gerar um quiz.');
            }

            // Gerar o quiz
            await apiClient.generateJobQuiz({ linkedinUrl: jobLink });

            // Atualizar dados do usuário (para atualizar saldo de tokens)
            await refreshUser();

            // Mostrar mensagem de sucesso
            showToast('Quiz gerado com sucesso! 1 token foi deduzido.', 'success');

            // Redirecionar para página de Meus Quizzes
            setTimeout(() => {
                navigate('/my-quizzes');
            }, 500);
        } catch (err: any) {
            console.error('Error generating quiz:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Erro ao gerar quiz. Tente novamente.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const isValidLinkedInUrl = jobLink.includes('linkedin.com/jobs');

    return (
        <div className="flex flex-col min-h-full transition-colors duration-300">
            <PageTitle title="Criar Quiz com IA - TreinaVagaAI" />
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 px-4 lg:px-8 py-4 mb-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Criar Quiz com IA
                    </h1>
                    <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                        Transforme qualquer vaga de emprego em um simulado personalizado em segundos.
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
                                {/* Token Info Card */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-xl p-4 mb-6 flex items-start gap-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">
                                            Custa 1 Token
                                        </h3>
                                        <p className="text-blue-700 dark:text-blue-300 mt-1">
                                            Você tem <span className="font-bold">{user?.tokens || 0} tokens</span> disponíveis. Cada quiz personalizado custa 1 token.
                                        </p>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-4 flex items-start gap-4">
                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-red-800 dark:text-red-200">
                                                Erro
                                            </h3>
                                            <p className="text-red-700 dark:text-red-300 mt-1">
                                                {error}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label htmlFor="job-link" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Link da Vaga do LinkedIn
                                    </label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <LinkIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                        </div>
                                        <input
                                            type="url"
                                            name="job-link"
                                            id="job-link"
                                            disabled={isLoading}
                                            className="block w-full pl-11 pr-4 py-4 sm:text-lg border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="https://www.linkedin.com/jobs/view/..."
                                            value={jobLink}
                                            onChange={(e) => setJobLink(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                        Cole aqui o link completo de uma vaga do LinkedIn
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !isValidLinkedInUrl || !user?.tokens || user.tokens < 1}
                                    className={`w-full flex items-center justify-center gap-3 px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white transition-all duration-300 ${isLoading || !isValidLinkedInUrl || !user?.tokens || user.tokens < 1
                                            ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                        }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Analisando Vaga...
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="h-6 w-6" />
                                            Gerar Quiz com IA
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Features / Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Instantâneo</h3>
                            <p className="text-slate-600 dark:text-slate-400">Cole o link e receba um quiz personalizado em segundos, focado nas habilidades exigidas.</p>
                        </div>

                        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Relevante</h3>
                            <p className="text-slate-600 dark:text-slate-400">Perguntas geradas baseadas exatamente no que a vaga pede, aumentando suas chances.</p>
                        </div>

                        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Evolução</h3>
                            <p className="text-slate-600 dark:text-slate-400">Acompanhe seu desempenho e identifique pontos de melhoria antes da entrevista real.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateQuizByLinkPage;
