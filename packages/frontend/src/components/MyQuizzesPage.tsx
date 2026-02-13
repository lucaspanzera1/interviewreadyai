import React, { useState, useEffect } from 'react';
import PageTitle from './PageTitle';
import { PlusCircleIcon, DocumentTextIcon, SparklesIcon, CheckBadgeIcon, QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

interface Quiz {
    _id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    nivel: string;
    quantidade_questoes: number;
    tags: string[];
    createdAt: string;
    totalAccess: number;
    totalAttempts: number;
}

const MyQuizzesPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [startingQuiz, setStartingQuiz] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        loadQuizzes();
    }, [page]);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getUserQuizzes(page, 10);
            setQuizzes(response.data);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Error loading quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = async (quiz: Quiz) => {
        setStartingQuiz(quiz._id);
        try {
            await apiClient.recordQuizAccess(quiz._id);
            const fullQuiz = await apiClient.getQuizForPlaying(quiz._id);

            if (!fullQuiz || !fullQuiz.questions || fullQuiz.questions.length === 0) {
                showToast('Este quiz não está disponível ou não tem questões.', 'error');
                return;
            }

            localStorage.setItem('generatedQuiz', JSON.stringify(fullQuiz));
            localStorage.setItem('currentQuizId', fullQuiz._id);

            showToast('Quiz iniciado! Boa sorte! 🎯', 'success');
            navigate('/quiz/user');
        } catch (error: any) {
            console.error('Erro ao iniciar quiz:', error);
            const message = error.response?.data?.message || 'Erro ao iniciar o quiz.';
            showToast(message, 'error');
        } finally {
            setStartingQuiz(null);
        }
    };

    return (
        <div className="flex flex-col min-h-full transition-colors duration-300">
            <PageTitle title="Meus Quizzes - TreinaVagaAI" />
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 px-4 lg:px-8 py-4 mb-8">
                <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Meus Quizzes
                        </h1>
                        <p className="mt-1 text-sm sm:text-base text-slate-500 dark:text-slate-400">
                            Gerencie e visualize os quizzes que você criou.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/create-quiz')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-sm shrink-0"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Criar Novo Quiz</span>
                        <span className="sm:hidden">Criar</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-4xl mx-auto">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                            <DocumentTextIcon className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            Nenhum quiz criado ainda
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">
                            Você ainda não criou nenhum quiz. Crie quizzes personalizados a partir de vagas do LinkedIn.
                        </p>
                        <button
                            onClick={() => navigate('/create-quiz')}
                            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-primary-600/20 hover:-translate-y-1"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Criar Quiz de Vaga
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {quizzes.map((quiz, index) => (
                            <div
                                key={quiz._id}
                                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all cursor-pointer"
                                onClick={() => startQuiz(quiz)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded">
                                                {quiz.categoria}
                                            </span>
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded">
                                                {quiz.nivel}
                                            </span>
                                            {index === 0 && page === 1 && (
                                                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded flex items-center gap-1">
                                                    <CheckBadgeIcon className="w-3 h-3" />
                                                    Preparado para jogar?
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                            {quiz.titulo}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                                            {quiz.descricao}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                            <span>{quiz.quantidade_questoes} questões</span>
                                            <span>•</span>
                                            <span>{quiz.totalAccess || 0} acessos</span>
                                            <span>•</span>
                                            <span>{quiz.totalAttempts || 0} tentativas</span>
                                        </div>
                                        {quiz.tags && quiz.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {quiz.tags.slice(0, 3).map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs rounded"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            startQuiz(quiz);
                                        }}
                                        disabled={startingQuiz === quiz._id}
                                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {startingQuiz === quiz._id ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                <span>Carregando...</span>
                                            </>
                                        ) : (
                                            'Jogar'
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}

                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Anterior
                                </button>
                                <span className="px-4 py-2 text-slate-600 dark:text-slate-400">
                                    Página {page} de {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Próxima
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Support Badge */}
                {/* Help/Support Badge */}
                <div className="mt-8 mb-8 flex justify-center">
                    {!showHelp ? (
                        <button
                            onClick={() => setShowHelp(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shadow-sm"
                        >
                            <QuestionMarkCircleIcon className="w-5 h-5" />
                            <span>Dúvidas sobre os Quizzes?</span>
                        </button>
                    ) : (
                        <div className="relative w-full p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 animate-fade-in-up">
                            <button
                                onClick={() => setShowHelp(false)}
                                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 w-fit h-fit">
                                <QuestionMarkCircleIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 pr-8">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                                    Como funcionam os Quizzes?
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                                    Aqui você encontra todos os quizzes gerados a partir da análise de vagas.
                                    Você pode refazê-los quantas vezes quiser para melhorar sua pontuação e fixar o conhecimento.
                                    Eles não expiram!
                                </p>
                                <a
                                    href="https://wa.me/5531997313160"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-semibold hover:underline inline-flex items-center gap-2"
                                >
                                    Precisa de ajuda ou encontrou um erro? Fale com o suporte
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyQuizzesPage;
