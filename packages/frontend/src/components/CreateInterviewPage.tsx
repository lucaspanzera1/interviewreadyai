import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import { ChatBubbleLeftRightIcon, LinkIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline';
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Validar que é uma URL do LinkedIn
            if (!jobLink.includes('linkedin.com/jobs')) {
                throw new Error('Por favor, insira um link válido de vaga do LinkedIn');
            }

            // Verificar se o usuário tem tokens suficientes (2 tokens)
            if (!user?.tokens || user.tokens < 2) {
                throw new Error('Você não tem tokens suficientes. Você precisa de pelo menos 2 tokens para gerar uma simulação de entrevista.');
            }

            // Gerar a simulação de entrevista
            const result = await apiClient.generateInterview({ 
                linkedinUrl: jobLink,
                numberOfQuestions,
                experienceLevel: experienceLevel || undefined
            });

            // Atualizar dados do usuário (para atualizar saldo de tokens)
            await refreshUser();

            // Mostrar mensagem de sucesso
            showToast('Simulação de entrevista gerada com sucesso! 2 tokens foram deduzidos.', 'success');

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
            const errorMessage = err.response?.data?.message || err.message || 'Erro ao gerar simulação de entrevista. Tente novamente.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const experienceLevels = [
        { value: '', label: 'Selecione o nível' },
        { value: 'Estagiário', label: 'Estagiário' },
        { value: 'Junior', label: 'Junior (0-2 anos)' },
        { value: 'Pleno', label: 'Pleno (2-5 anos)' },
        { value: 'Senior', label: 'Senior (5-8 anos)' },
        { value: 'Especialista', label: 'Especialista (8+ anos)' },
        { value: 'Liderança', label: 'Liderança/Gestão' },
    ];

    return (
        <div className="min-h-full">
            <PageTitle title="Criar Simulação de Entrevista - TreinaVagaAI" />
            
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 px-4 lg:px-8 py-4 mb-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Simulação de Entrevista com IA
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                        Gere uma simulação de entrevista personalizada baseada em uma vaga real do LinkedIn. 
                        <span className="font-medium text-primary-600 dark:text-primary-400"> Custa 2 tokens.</span>
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
                                    Como funciona?
                                </h3>
                                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                    <li>• Nossa IA analisa a vaga do LinkedIn em detalhes</li>
                                    <li>• Gera perguntas técnicas, comportamentais e situacionais</li>
                                    <li>• Inclui dicas específicas para cada pergunta</li>
                                    <li>• Fornece palavras-chave importantes para suas respostas</li>
                                    <li>• Tempo estimado: {numberOfQuestions * 3}-{numberOfQuestions * 4} minutos</li>
                                </ul>
                                
                                {user && (
                                    <div className="mt-3 text-sm font-medium">
                                        <span className="text-slate-700 dark:text-slate-300">Seus tokens: </span>
                                        <span className={`${user?.tokens && user.tokens >= 2 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {user.tokens} {user.tokens === 1 ? 'token' : 'tokens'}
                                        </span>
                                        {user?.tokens && user.tokens < 2 && (
                                            <span className="ml-2 text-red-600 dark:text-red-400">
                                                (Insuficiente - precisa de 2 tokens)
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
                                Link da vaga do LinkedIn
                            </label>
                            <input
                                type="url"
                                id="jobLink"
                                value={jobLink}
                                onChange={(e) => setJobLink(e.target.value)}
                                placeholder="https://linkedin.com/jobs/view/..."
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                                disabled={isLoading}
                            />
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Cole o link completo da vaga do LinkedIn aqui
                            </p>
                        </div>

                        {/* Número de perguntas */}
                        <div>
                            <label htmlFor="numberOfQuestions" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <ClockIcon className="w-4 h-4 inline mr-1" />
                                Número de perguntas
                            </label>
                            <select
                                id="numberOfQuestions"
                                value={numberOfQuestions}
                                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                disabled={isLoading}
                            >
                                <option value={5}>5 perguntas (15-20 min)</option>
                                <option value={8}>8 perguntas (24-32 min)</option>
                                <option value={10}>10 perguntas (30-40 min)</option>
                                <option value={12}>12 perguntas (36-48 min)</option>
                                <option value={15}>15 perguntas (45-60 min)</option>
                            </select>
                        </div>

                        {/* Nível de experiência */}
                        <div>
                            <label htmlFor="experienceLevel" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <UserIcon className="w-4 h-4 inline mr-1" />
                                Seu nível de experiência (opcional)
                            </label>
                            <select
                                id="experienceLevel"
                                value={experienceLevel}
                                onChange={(e) => setExperienceLevel(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                disabled={isLoading}
                            >
                                {experienceLevels.map((level) => (
                                    <option key={level.value} value={level.value}>
                                        {level.label}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Ajuda a personalizar o nível das perguntas para sua experiência
                            </p>
                        </div>

                        {/* Erro */}
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Botões */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 sm:flex-none px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !user || !user.tokens || user.tokens < 2}
                                className="flex-1 sm:flex-auto px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed shadow-sm"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Gerando simulação...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                        Gerar Simulação (2 tokens)
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreateInterviewPage;