import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import { SparklesIcon, LinkIcon, AcademicCapIcon, PlusIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { apiClient, QuizLevel } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';


const CreateQuizByLinkPage: React.FC = () => {
    // Common states
    const [quizType, setQuizType] = useState<'job' | 'theme'>('job');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();
    
    // Job quiz states
    const [jobLink, setJobLink] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState('linkedin');
    
    // Theme quiz states
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const platforms = [
        { id: 'linkedin', name: 'LinkedIn', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png' },
        { id: 'gupy', name: 'Gupy', logo: 'https://cdn.worldvectorlogo.com/logos/gupy-1.svg' },
        { id: 'infojobs', name: 'InfoJobs', logo: 'https://cdn.worldvectorlogo.com/logos/infojobs.svg' },
        { id: 'glassdoor', name: 'Glassdoor', logo: 'https://cdn.worldvectorlogo.com/logos/glassdoor.svg' },
        { id: 'indeed', name: 'Indeed', logo: 'https://cdn.worldvectorlogo.com/logos/indeed-1.svg' },
    ];

    const handleJobSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Validar que é uma URL válida de um dos sites suportados
            const supportedSites = ['linkedin.com', 'gupy.io', 'gupy.com.br', 'infojobs.com', 'infojobs.net', 'glassdoor.com', 'glassdoor.com.br', 'indeed.com', 'indeed.com.br'];
            const isValidUrl = supportedSites.some(site => jobLink.includes(site));

            if (!isValidUrl) {
                throw new Error('Por favor, insira um link válido de vaga de um dos sites suportados: LinkedIn, Gupy, Infojobs, Glassdoor ou Indeed');
            }

            // Verificar se o usuário tem tokens
            if (!user?.tokens || user.tokens < 1) {
                throw new Error('Você não tem tokens suficientes. Você precisa de pelo menos 1 token para gerar um quiz.');
            }

            // Gerar o quiz
            await apiClient.generateJobQuiz({ jobUrl: jobLink });

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

    const handleThemeQuizSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Verificar se o usuário tem tokens
            if (!user?.tokens || user.tokens < 1) {
                throw new Error('Você não tem tokens suficientes. Você precisa de pelo menos 1 token para gerar um quiz.');
            }

            // Gerar quiz por tema
            await apiClient.generateQuiz(formData);

            // Atualizar dados do usuário (para atualizar saldo de tokens)
            await refreshUser();

            // Mostrar mensagem de sucesso
            showToast('Quiz criado com sucesso! 1 token foi deduzido.', 'success');
            
            // Fechar modal
            setIsModalOpen(false);
            
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
            setCurrentStep(1);

            // Redirecionar para página de Meus Quizzes
            setTimeout(() => {
                navigate('/my-quizzes');
            }, 500);
        } catch (err: any) {
            console.error('Error generating quiz:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Erro ao criar quiz. Tente novamente.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
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

    const steps = [
        { id: 1, name: 'Básico', icon: AcademicCapIcon },
        { id: 2, name: 'Configuração', icon: SparklesIcon },
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

    const supportedSites = ['linkedin.com', 'gupy.io', 'gupy.com.br', 'infojobs.com', 'infojobs.net', 'glassdoor.com', 'glassdoor.com.br', 'indeed.com', 'indeed.com.br'];
    const isValidJobUrl = supportedSites.some(site => jobLink.includes(site));

    return (
        <div className="flex flex-col min-h-full transition-colors duration-300">
            <PageTitle title="Criar Quiz com IA - TreinaVagaAI" />
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 px-4 lg:px-8 py-4 mb-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Criar Quiz com IA
                    </h1>
                    <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                        Crie um simulado personalizado por vaga de emprego ou por tema customizado.
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-4xl mx-auto">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Quiz Type Selector */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 text-center">
                                Escolha como criar seu quiz
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Job Quiz Option */}
                                <div
                                    className={`relative flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all ${
                                        quizType === 'job'
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md transform scale-[1.02]'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                                    onClick={() => setQuizType('job')}
                                >
                                    <LinkIcon className="h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Por Vaga de Emprego</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                                        Cole o link de uma vaga e receba um quiz personalizado baseado nos requisitos.
                                    </p>
                                    {quizType === 'job' && (
                                        <div className="absolute top-3 right-3 text-primary-600">
                                            <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Theme Quiz Option */}
                                <div
                                    className={`relative flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all ${
                                        quizType === 'theme'
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md transform scale-[1.02]'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                                    onClick={() => setQuizType('theme')}
                                >
                                    <AcademicCapIcon className="h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Por Tema Personalizado</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                                        Defina o tema, nível de dificuldade e quantidade de questões do seu quiz.
                                    </p>
                                    {quizType === 'theme' && (
                                        <div className="absolute top-3 right-3 text-primary-600">
                                            <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conditional Content Based on Quiz Type */}
                    {quizType === 'job' ? (
                        /* Job Quiz Form */
                        <>
                            {/* Job Input Section */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 relative overflow-hidden group">
                                {/* Background decorative elements */}
                                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-500"></div>
                                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <form onSubmit={handleJobSubmit} className="space-y-6">
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

                                        {/* Platform Selector */}
                                        <div className="space-y-4 mb-8">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Selecione a Plataforma
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                                {platforms.map((platform) => (
                                                    <div
                                                        key={platform.id}
                                                        className={`relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                            selectedPlatform === platform.id
                                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md transform scale-[1.02]'
                                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                        }`}
                                                        onClick={() => setSelectedPlatform(platform.id)}
                                                    >
                                                        <div className="flex flex-col items-center gap-3">
                                                            <img
                                                                src={platform.logo}
                                                                alt={platform.name}
                                                                className="h-8 w-8 object-contain"
                                                                onError={(e) => {
                                                                    // Fallback to text if logo fails to load
                                                                    e.currentTarget.style.display = 'none';
                                                                    e.currentTarget.nextElementSibling!.textContent = platform.name.charAt(0);
                                                                }}
                                                            />
                                                            <span className="font-bold text-slate-900 dark:text-white text-sm">{platform.name}</span>
                                                            {selectedPlatform === platform.id && (
                                                                <div className="absolute top-2 right-2 text-primary-600">
                                                                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="job-link" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Link da Vaga
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
                                                    placeholder={`https://www.${selectedPlatform === 'linkedin' ? 'linkedin.com/jobs/view' : selectedPlatform === 'gupy' ? 'gupy.io' : selectedPlatform === 'infojobs' ? 'infojobs.com' : selectedPlatform === 'glassdoor' ? 'glassdoor.com' : 'indeed.com'}/...`}
                                                    value={jobLink}
                                                    onChange={(e) => setJobLink(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                                Cole aqui o link completo de uma vaga do {platforms.find(p => p.id === selectedPlatform)?.name}
                                            </p>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading || !isValidJobUrl || !user?.tokens || user.tokens < 1}
                                            className={`w-full flex items-center justify-center gap-3 px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white transition-all duration-300 ${
                                                isLoading || !isValidJobUrl || !user?.tokens || user.tokens < 1
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
                        </>
                    ) : (
                        /* Theme Quiz Button */
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-500"></div>
                            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
                            
                            <div className="relative z-10 text-center">
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
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-4 flex items-start gap-4 mb-6">
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
                                
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                    Crie Seu Quiz Personalizado
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-8">
                                    Defina o tema, nível de dificuldade e contexto do seu quiz personalizado.
                                </p>
                                
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    disabled={!user?.tokens || user.tokens < 1}
                                    className={`inline-flex items-center gap-3 px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white transition-all duration-300 ${
                                        !user?.tokens || user.tokens < 1
                                            ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                    }`}
                                >
                                    <SparklesIcon className="h-6 w-6" />
                                    Criar Quiz Personalizado
                                </button>
                            </div>
                        </div>
                    )}

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

                {/* Support Badge */}
                <div className="mt-12 mb-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30 text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2 flex-wrap">
                        <span>Não gostou do quiz gerado?</span>
                        <a
                            href="https://wa.me/5531997313160"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium hover:underline inline-flex items-center gap-1"
                        >
                            Entre em contato com o suporte via WhatsApp
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 5.25V4.5z" clipRule="evenodd" />
                            </svg>
                        </a>
                    </p>
                </div>
            </main>

            {/* Theme Quiz Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <SparklesIcon className="w-6 h-6 text-primary-500" />
                                    Criar Quiz Personalizado
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
                                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                                    isActive
                                                        ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/30 scale-110'
                                                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                                                }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className={`text-xs font-medium transition-colors duration-300 ${
                                                isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500'
                                            }`}>
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
                                                {Object.values(QuizLevel).map((level) => (
                                                    <button
                                                        key={level}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, nivel: level }))}
                                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                                            formData.nivel === level
                                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                                        }`}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Quantidade de Questões
                                                </label>
                                                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
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
                                                <span>20</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Contexto Adicional (IA)
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal"> - Opcional</span>
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
                                                <input
                                                    type="text"
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm placeholder:text-slate-400"
                                                    placeholder="Digite uma tag e pressione Enter"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addTag}
                                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1 text-sm font-medium"
                                                >
                                                    <PlusIcon className="w-4 h-4" />
                                                    Adicionar
                                                </button>
                                            </div>

                                            <div className="min-h-[100px] p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                                {formData.tags.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {formData.tags.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium border border-primary-200 dark:border-primary-700"
                                                            >
                                                                {tag}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeTag(tag)}
                                                                    className="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                                                                >
                                                                    <XMarkIcon className="w-3 h-3" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                                                        Nenhuma tag adicionada ainda. Tags ajudam a categorizar e encontrar seu quiz.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 flex gap-4">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg h-fit">
                                                <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                                    Pronto para gerar!
                                                </h3>
                                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                                    Sua configuração está completa. Clique em "Gerar Quiz" para criar um quiz personalizado com IA.
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
                                disabled={isLoading}
                                className={`px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    currentStep === 1 ? 'invisible' : 'visible'
                                }`}
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                                Voltar
                            </button>

                            {currentStep < steps.length ? (
                                <button
                                    onClick={nextStep}
                                    disabled={!canProceed() || isLoading}
                                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-primary-600/20 font-medium"
                                >
                                    Próximo
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleThemeQuizSubmit}
                                    disabled={isLoading || !user?.tokens || user.tokens < 1}
                                    className="px-8 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-primary-600/20 font-medium transform active:scale-95"
                                >
                                    {isLoading ? (
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

export default CreateQuizByLinkPage;
