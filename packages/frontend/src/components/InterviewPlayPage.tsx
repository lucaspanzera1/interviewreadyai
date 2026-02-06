import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import { 
    ArrowRightIcon,
    ArrowLeftIcon, 
    CheckIcon,
    LightBulbIcon
} from '@heroicons/react/24/outline';
import { apiClient, InterviewQuestion } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

const InterviewTimer: React.FC<{ startTime: number }> = ({ startTime }) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
        const timer = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime]);

    const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const secs = (elapsed % 60).toString().padStart(2, '0');

    return (
        <div className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 backdrop-blur-sm flex items-center gap-2 shadow-sm min-w-[80px] justify-center">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {mins}:{secs}
        </div>
    );
};

const InterviewPlayPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [interview, setInterview] = useState<{
        questions: InterviewQuestion[];
        jobTitle?: string;
        companyName?: string;
        _id?: string;
        estimatedDuration?: number;
        preparationTips?: string[];
    } | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [startTime] = useState<number>(Date.now());
    const [interviewId, setInterviewId] = useState<string>('');
    const [showTimer] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [difficultyRating, setDifficultyRating] = useState<number>(3);
    const [feedback, setFeedback] = useState<string>('');

    useEffect(() => {
        const storedInterview = localStorage.getItem('generatedInterview');
        const storedInterviewId = localStorage.getItem('currentInterviewId');

        if (storedInterview) {
            const parsedData = JSON.parse(storedInterview);
            setInterview(parsedData);
            setUserAnswers(new Array(parsedData.questions.length).fill(''));
        } else {
            showToast('Nenhuma simulação encontrada. Redirecionando...', 'error');
            navigate('/my-interviews');
        }

        if (storedInterviewId) {
            setInterviewId(storedInterviewId);
        }
    }, [navigate, showToast]);

    const handleAnswerChange = (answer: string) => {
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestion] = answer;
        setUserAnswers(newAnswers);
    };

    const nextQuestion = () => {
        if (interview && currentQuestion < interview.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const finishInterview = () => {
        setShowResults(true);
    };

    const submitInterview = async () => {
        if (!interview || !interviewId) return;

        setIsSubmitting(true);
        try {
            const actualDuration = Math.floor((Date.now() - startTime) / 1000 / 60); // em minutos
            
            await apiClient.recordInterviewAttempt(interviewId, {
                userAnswers,
                actualDuration,
                difficultyRating,
                feedback: feedback.trim() || undefined
            });

            await apiClient.completeInterview(interviewId);

            showToast('Simulação concluída com sucesso! 🎉', 'success');
            
            // Limpar localStorage
            localStorage.removeItem('generatedInterview');
            localStorage.removeItem('currentInterviewId');

            // Redirecionar
            setTimeout(() => {
                navigate('/my-interviews');
            }, 1000);

        } catch (error: any) {
            console.error('Erro ao submeter simulação:', error);
            const message = error.response?.data?.message || 'Erro ao salvar resultados.';
            showToast(message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getQuestionTypeColor = (type: string) => {
        const colors = {
            'technical': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'behavioral': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'situational': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            'company_specific': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

    if (!interview) {
        return (
            <div className="min-h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const currentQ = interview.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / interview.questions.length) * 100;

    if (showResults) {
        return (
            <div className="min-h-full">
                <PageTitle title="Resultados da Simulação - TreinaVagaAI" />
                
                <div className="max-w-2xl mx-auto">
                    {/* Header de Conclusão */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Simulação Concluída!
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Você respondeu todas as {interview.questions.length} perguntas da simulação para:
                        </p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                            {interview.jobTitle} - {interview.companyName}
                        </p>
                    </div>

                    {/* Estatísticas */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Estatísticas da Simulação
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Tempo Total</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {Math.floor((Date.now() - startTime) / 1000 / 60)} min
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Perguntas Respondidas</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {interview.questions.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Formulário de Avaliação */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Avalie a Simulação
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Como você avalia a dificuldade da simulação?
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                            key={rating}
                                            onClick={() => setDifficultyRating(rating)}
                                            className={`w-10 h-10 rounded-full border-2 text-sm font-medium transition-colors ${
                                                difficultyRating >= rating 
                                                    ? 'bg-primary-600 border-primary-600 text-white' 
                                                    : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-primary-400'
                                            }`}
                                        >
                                            {rating}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    1 = Muito fácil, 5 = Muito difícil
                                </p>
                            </div>

                            <div>
                                <label htmlFor="feedback" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Comentários (opcional)
                                </label>
                                <textarea
                                    id="feedback"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Como foi sua experiência? Alguma sugestão?"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ações Finais */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/my-interviews')}
                            className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Voltar sem Salvar
                        </button>
                        
                        <button
                            onClick={submitInterview}
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Salvando...
                                </span>
                            ) : (
                                'Finalizar e Salvar'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full">
            <PageTitle title={`Simulação - ${interview.jobTitle} - TreinaVagaAI`} />
            
            {/* Header com progresso */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 px-4 lg:px-8 py-4 mb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                                {interview.jobTitle}
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {interview.companyName}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                {currentQuestion + 1} de {interview.questions.length}
                            </span>
                            {showTimer && <InterviewTimer startTime={startTime} />}
                        </div>
                    </div>
                    
                    {/* Barra de progresso */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
                    
                    {/* Cabeçalho da pergunta */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Pergunta {currentQuestion + 1}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQuestionTypeColor(currentQ.type)}`}>
                                {getQuestionTypeLabel(currentQ.type)}
                            </span>
                            {currentQ.difficulty && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border border-slate-300 dark:border-slate-600`}>
                                    {currentQ.difficulty === 'easy' ? 'Fácil' : currentQ.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Pergunta */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 leading-relaxed">
                            {currentQ.question}
                        </h2>
                    </div>

                    {/* Dicas */}
                    {currentQ.tips && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-start gap-3">
                                <LightBulbIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                        Dica para sua resposta:
                                    </h4>
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        {currentQ.tips}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Palavras-chave sugeridas */}
                    {currentQ.keywords && currentQ.keywords.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                💡 Palavras-chave importantes:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {currentQ.keywords.map((keyword, index) => (
                                    <span key={index} className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-sm">
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Área de resposta */}
                    <div className="mb-8">
                        <label htmlFor="answer" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Sua resposta:
                        </label>
                        <textarea
                            id="answer"
                            value={userAnswers[currentQuestion] || ''}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            placeholder="Digite aqui sua resposta para esta pergunta da entrevista..."
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                            rows={6}
                        />
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Esta é uma simulação. Pratique como se fosse uma entrevista real!
                        </p>
                    </div>

                    {/* Navegação */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={prevQuestion}
                            disabled={currentQuestion === 0}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            Anterior
                        </button>

                        {currentQuestion === interview.questions.length - 1 ? (
                            <button
                                onClick={finishInterview}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <CheckIcon className="w-4 h-4" />
                                Finalizar Simulação
                            </button>
                        ) : (
                            <button
                                onClick={nextQuestion}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Próxima
                                <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InterviewPlayPage;