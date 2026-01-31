import React, { useState } from 'react';
import { SparklesIcon, LinkIcon } from '@heroicons/react/24/outline';


const CreateQuizByLinkPage: React.FC = () => {
    const [jobLink, setJobLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulating API call
        setTimeout(() => {
            setIsLoading(false);
            // For now, just show an alert or console log since it's "fictional" for now
            // In the future this would navigate to the generated quiz or quiz creation flow
            console.log('Generating quiz for:', jobLink);
            alert('Funcionalidade em desenvolvimento! Em breve você poderá gerar quizzes a partir de links.');
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Header */}
            <div className="px-8 py-8 border-b border-subtle dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">
                        Criar Quiz com IA
                    </h1>
                    <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                        Transforme qualquer vaga de emprego em um simulado personalizado em segundos.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Input Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 relative overflow-hidden group">
                        {/* Background decorative elements */}
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-500"></div>
                        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>

                        <div className="relative z-10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="job-link" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Link da Vaga (LinkedIn, Gupy, etc)
                                    </label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <LinkIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                        </div>
                                        <input
                                            type="url"
                                            name="job-link"
                                            id="job-link"
                                            className="block w-full pl-11 pr-4 py-4 sm:text-lg border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                            placeholder="https://www.linkedin.com/jobs/view/..."
                                            value={jobLink}
                                            onChange={(e) => setJobLink(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !jobLink}
                                    className={`w-full flex items-center justify-center gap-3 px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg hover:shadow-primary-500/30 transition-all duration-300 transform hover:-translate-y-1 ${(isLoading || !jobLink) ? 'opacity-70 cursor-not-allowed transform-none' : ''
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
