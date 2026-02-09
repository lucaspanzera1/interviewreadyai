import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import {
    ArrowRightIcon,
    ArrowLeftIcon,
    CheckIcon,
    LightBulbIcon,
    Bars3CenterLeftIcon,
    ClockIcon,
    XMarkIcon
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
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full font-mono text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
            <ClockIcon className="w-4 h-4 text-primary-500" />
            <span>{mins}:{secs}</span>
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
    const [showTips, setShowTips] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [difficultyRating, setDifficultyRating] = useState<number>(0);
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
            setShowTips(false);
        }
    };

    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setShowTips(false);
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
                difficultyRating: difficultyRating || 3,
                feedback: feedback.trim() || undefined
            });

            await apiClient.completeInterview(interviewId);

            // Celebration effect could go here
            showToast('Simulação concluída com sucesso! 🎉', 'success');

            // Limpar localStorage
            localStorage.removeItem('generatedInterview');
            localStorage.removeItem('currentInterviewId');

            // Redirecionar
            setTimeout(() => {
                navigate('/my-interviews');
            }, 1500);

        } catch (error: any) {
            console.error('Erro ao submeter simulação:', error);
            const message = error.response?.data?.message || 'Erro ao salvar resultados.';
            showToast(message, 'error');
        } finally {
            setIsSubmitting(false);
        }
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
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
            </div>
        );
    }

    const currentQ = interview.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / interview.questions.length) * 100;

    if (showResults) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
                <PageTitle title="Resultados da Simulação - TreinaVagaAI" />

                <div className="max-w-xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700 animate-fade-in-up">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50 dark:ring-green-900/10">
                            <CheckIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Parabéns!
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Você completou a simulação para <span className="font-semibold text-primary-600 dark:text-primary-400">{interview.jobTitle}</span>.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Tempo</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                                {Math.floor((Date.now() - startTime) / 1000 / 60)}<span className="text-sm font-normal text-slate-500 ml-1">min</span>
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Perguntas</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                                {interview.questions.length}
                            </p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 text-center">
                            Como foi a dificuldade?
                        </label>
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                    key={rating}
                                    onClick={() => setDifficultyRating(rating)}
                                    className={`w-12 h-12 rounded-xl text-lg font-bold transition-all transform hover:scale-110 ${difficultyRating === rating
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 ring-2 ring-primary-600 ring-offset-2 dark:ring-offset-slate-800'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    {rating}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-2 px-8">
                            <span>Muito Fácil</span>
                            <span>Muito Difícil</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Algum comentário sobre a simulação? (Opcional)"
                            className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none h-24 text-sm"
                        />
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={submitInterview}
                            disabled={isSubmitting}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary-600/20 active:translate-y-0.5"
                        >
                            {isSubmitting ? 'Salvando...' : 'Finalizar e Salvar'}
                        </button>
                        <button
                            onClick={() => navigate('/my-interviews')}
                            className="w-full py-4 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-semibold rounded-xl transition-colors"
                        >
                            Sair sem salvar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-slate-900 overflow-hidden">
            <PageTitle title={`Simulação - ${interview.jobTitle}`} />

            {/* Minimal Header */}
            <header className="flex-none bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 z-20">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/my-interviews')}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                        <div className="hidden sm:block">
                            <h1 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                {interview.jobTitle}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">{interview.companyName}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                                    Pergunta {currentQuestion + 1} de {interview.questions.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    <InterviewTimer startTime={startTime} />
                </div>
            </header>

            {/* Progress Bar */}
            <div className="h-1 bg-slate-100 dark:bg-slate-800 w-full">
                <div
                    className="h-full bg-primary-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Main Content Areas */}
            <div className="flex-1 flex overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 lg:p-16 relative">
                    <div className="max-w-3xl mx-auto pb-24">
                        {/* Question Badge */}
                        <div className="mb-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {getQuestionTypeLabel(currentQ.type)}
                            </span>
                        </div>

                        {/* Question Text */}
                        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-8">
                            {currentQ.question}
                        </h2>

                        {/* Answer Area */}
                        <div className="relative group">
                            <div className="absolute top-0 left-0 -ml-12 mt-2 hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400">
                                    <Bars3CenterLeftIcon className="w-6 h-6" />
                                </div>
                            </div>
                            <textarea
                                value={userAnswers[currentQuestion] || ''}
                                onChange={(e) => handleAnswerChange(e.target.value)}
                                placeholder="Digite sua resposta aqui... Sinta-se à vontade para estruturar seus pensamentos."
                                className="w-full min-h-[300px] bg-transparent border-none text-lg leading-relaxed text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 focus:ring-0 resize-none outline-none font-serif md:font-sans"
                            />
                        </div>
                    </div>
                </main>

                {/* Tips Sidebar / Drawer */}
                <div className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 shadow-2xl transform transition-transform duration-300 z-30 ${showTips ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <LightBulbIcon className="w-5 h-5 text-amber-500" />
                                Dicas da IA
                            </h3>
                            <button onClick={() => setShowTips(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            {currentQ.tips && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Sugestão</h4>
                                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                                        {currentQ.tips}
                                    </p>
                                </div>
                            )}

                            {currentQ.keywords && currentQ.keywords.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Palavras-chave</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {currentQ.keywords.map((kw, i) => (
                                            <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-md">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Navigation */}
            <footer className="flex-none bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 z-20">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        onClick={prevQuestion}
                        disabled={currentQuestion === 0}
                        className="flex items-center gap-2 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors font-medium"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Anterior
                    </button>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowTips(!showTips)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${showTips
                                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            <LightBulbIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Dicas</span>
                        </button>

                        {currentQuestion === interview.questions.length - 1 ? (
                            <button
                                onClick={finishInterview}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-600/20 active:translate-y-0.5"
                            >
                                Finalizar
                                <CheckIcon className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={nextQuestion}
                                className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 active:translate-y-0.5"
                            >
                                Próxima
                                <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default InterviewPlayPage;