import React, { useState, useEffect } from 'react';
import PageTitle from './PageTitle';
import { PlusCircleIcon, DocumentTextIcon, SparklesIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
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
        </div>
    );
};

export default MyQuizzesPage;
