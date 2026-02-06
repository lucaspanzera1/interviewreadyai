import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import { 
    CheckCircleIcon, 
    ArrowLeftIcon, 
    PlayIcon, 
    ClockIcon,
    ChatBubbleLeftRightIcon,
    BuildingOfficeIcon,
    LightBulbIcon,
    TagIcon,
    VideoCameraIcon,
    DocumentTextIcon,
    ChevronDownIcon
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
    const [dropdownOpen, setDropdownOpen] = useState(false);

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
            'technical': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'behavioral': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'situational': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            'company_specific': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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

    const getDifficultyColor = (difficulty: string) => {
        const colors = {
            'easy': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800',
            'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
            'hard': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800'
        };
        return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getDifficultyLabel = (difficulty: string) => {
        const labels = {
            'easy': 'Fácil',
            'medium': 'Médio', 
            'hard': 'Difícil'
        };
        return labels[difficulty as keyof typeof labels] || difficulty;
    };

    if (loading) {
        return (
            <div className="min-h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!interview) {
        return (
            <div className="min-h-full flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                        Simulação não encontrada
                    </h2>
                    <button
                        onClick={() => navigate('/my-interviews')}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                    >
                        Voltar para Minhas Simulações
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full">
            <PageTitle title={`${interview.jobTitle} - ${interview.companyName} - TreinaVagaAI`} />
            
            {/* Header com ação */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 px-4 lg:px-8 py-4 mb-8">
                <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/my-interviews')}
                            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Voltar</span>
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {interview.jobTitle}
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
                                <BuildingOfficeIcon className="w-4 h-4" />
                                <span>{interview.companyName}</span>
                            </div>
                        </div>
                    </div>
                    
                    
                    <div className="relative shrink-0">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            disabled={starting}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg font-medium transition-colors shadow-sm"
                        >
                            {starting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span className="hidden sm:inline">Iniciando...</span>
                                </>
                            ) : (
                                <>
                                    <PlayIcon className="w-5 h-5" />
                                    <span className="hidden sm:inline">Iniciar Simulação</span>
                                    <span className="sm:hidden">Iniciar</span>
                                    <ChevronDownIcon className="w-4 h-4" />
                                </>
                            )}
                        </button>
                        
                        {dropdownOpen && !starting && (
                            <>
                                <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setDropdownOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20">
                                    <div className="p-2">
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                startInterview('text');
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                                        >
                                            <DocumentTextIcon className="w-5 h-5 text-slate-500" />
                                            <div className="text-left">
                                                <div className="font-medium">Modo Texto</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    Responda por texto digitado
                                                </div>
                                            </div>
                                        </button>
                                        
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                startInterview('video');
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                                        >
                                            <VideoCameraIcon className="w-5 h-5 text-red-500" />
                                            <div className="text-left">
                                                <div className="font-medium">Modo Vídeo</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    Grave suas respostas em vídeo
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto space-y-8">
                {/* Informações Gerais */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Perguntas</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {interview.numberOfQuestions}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                                <ClockIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Duração estimada</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {interview.estimatedDuration} min
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                                <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Tentativas</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {interview.totalAttempts}
                                </p>
                            </div>
                        </div>
                    </div>

                    {interview.experienceLevel && (
                        <div className="mb-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Nível: {interview.experienceLevel}
                            </span>
                        </div>
                    )}
                </div>

                {/* Dicas de Preparação */}
                {interview.preparationTips && interview.preparationTips.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <LightBulbIcon className="w-5 h-5" />
                            Dicas de Preparação
                        </h3>
                        <ul className="space-y-2">
                            {interview.preparationTips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 shrink-0" />
                                    <span className="text-slate-600 dark:text-slate-400">{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Requisitos da Vaga */}
                {interview.jobRequirements && interview.jobRequirements.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <TagIcon className="w-5 h-5" />
                            Principais Requisitos
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {interview.jobRequirements.map((requirement, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
                                >
                                    {requirement}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Preview das Perguntas */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Preview das Perguntas
                    </h3>
                    <div className="space-y-4">
                        {interview.questions.slice(0, 3).map((question, index) => (
                            <div key={question.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Pergunta {index + 1}
                                    </span>
                                    <div className="flex gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQuestionTypeColor(question.type)}`}>
                                            {getQuestionTypeLabel(question.type)}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}>
                                            {getDifficultyLabel(question.difficulty)}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 mb-2">
                                    {question.question}
                                </p>
                                {question.tips && (
                                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            💡 <strong>Dica:</strong> {question.tips}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {interview.questions.length > 3 && (
                            <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                                +{interview.questions.length - 3} pergunta(s) adicional(is)
                                <br />
                                <span className="text-xs">Inicie a simulação para ver todas as perguntas</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Call to Action Final */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
                        Pronto para começar?
                    </h3>
                    <p className="text-primary-700 dark:text-primary-200 mb-4 text-sm">
                        Escolha o formato da simulação: respostas por escrito ou gravação de vídeo para análise com IA
                    </p>
                    <div className="flex gap-3 justify-center flex-wrap">
                        <button
                            onClick={() => startInterview('text')}
                            disabled={starting}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors shadow-sm"
                        >
                            {starting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Iniciando...
                                </>
                            ) : (
                                <>
                                    <DocumentTextIcon className="w-5 h-5" />
                                    Simulação por Texto
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => startInterview('video')}
                            disabled={starting}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors shadow-sm"
                        >
                            {starting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Iniciando...
                                </>
                            ) : (
                                <>
                                    <VideoCameraIcon className="w-5 h-5" />
                                    Simulação por Vídeo
                                </>
                            )}
                        </button>
                    </div>
                    <div className="mt-4 text-sm text-primary-600 dark:text-primary-200">
                        <div className="flex justify-center gap-8 flex-wrap">
                            <div className="flex items-center gap-2">
                                <DocumentTextIcon className="w-4 h-4" />
                                <span>Texto: 4 perguntas, feedback imediato</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <VideoCameraIcon className="w-4 h-4" />
                                <span>Vídeo: 4 perguntas, análise com IA</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GeneratedInterviewPage;