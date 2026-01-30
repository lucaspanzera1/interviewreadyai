import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageTitle from './PageTitle';
import {
    ArrowLeftIcon,
    UserIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { apiClient } from '../lib/api';
import { toast } from 'react-toastify';

interface Question {
    question: string;
    options: string[];
    correct_answer: number;
}

interface QuizAttempt {
    _id: string;
    userId: {
        name: string;
        email: string;
    };
    selectedAnswers: number[];
    score: number;
    totalQuestions: number;
    percentage: number;
    timeSpent: number;
    completed: boolean;
    createdAt: string;
}

interface QuizStats {
    quiz: {
        _id: string;
        titulo: string;
        categoria: string;
        descricao: string;
        tags: string[];
        nivel: string;
        quantidade_questoes: number;
        questions: Question[];
        totalAccess: number;
        totalAttempts: number;
        totalCompletions: number;
        averageScore: number;
        isActive: boolean;
        createdAt: string;
    };
    attempts: QuizAttempt[];
    totalAttempts: number;
    completedAttempts: number;
    averageScore: number;
}

const AdminQuizDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [stats, setStats] = useState<QuizStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

    useEffect(() => {
        if (id) {
            loadQuizStats();
        }
    }, [id]);

    const loadQuizStats = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getQuizStats(id!);
            setStats(data);
        } catch (error) {
            toast.error('Erro ao carregar detalhes do quiz');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                    Detalhes não encontrados
                </h3>
            </div>
        );
    }

    const currentQuestion = stats.quiz.questions[selectedQuestionIndex];
    const questionAttempts = stats.attempts.filter(attempt =>
        attempt.selectedAnswers && attempt.selectedAnswers.length > selectedQuestionIndex
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/quizzes')}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <PageTitle title={`Detalhes: ${stats.quiz.titulo}`} />
                <button
                    onClick={() => navigate(`/admin/quizzes/${id}/stats`)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                    <ChartBarIcon className="w-4 h-4" />
                    Ver Estatísticas
                </button>
            </div>

            {/* Question Navigation */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Questões ({selectedQuestionIndex + 1} de {stats.quiz.questions.length})
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={selectedQuestionIndex === 0}
                            className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setSelectedQuestionIndex(prev => Math.min(stats.quiz.questions.length - 1, prev + 1))}
                            disabled={selectedQuestionIndex === stats.quiz.questions.length - 1}
                            className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                        >
                            Próxima
                        </button>
                    </div>
                </div>

                {/* Question Display */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mb-6">
                    <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                        {currentQuestion.question}
                    </h4>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, optionIndex) => (
                            <div
                                key={optionIndex}
                                className={`p-3 rounded-lg border ${
                                    optionIndex === currentQuestion.correct_answer
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm ${
                                        optionIndex === currentQuestion.correct_answer
                                            ? 'text-green-800 dark:text-green-200 font-semibold'
                                            : 'text-slate-700 dark:text-slate-300'
                                    }`}>
                                        {String.fromCharCode(65 + optionIndex)}. {option}
                                    </span>
                                    {optionIndex === currentQuestion.correct_answer && (
                                        <CheckCircleSolid className="w-5 h-5 text-green-600" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Responses */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Respostas dos Usuários ({questionAttempts.length})
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Usuário
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Resposta
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Data
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                                {questionAttempts.map((attempt) => {
                                    const userAnswer = attempt.selectedAnswers[selectedQuestionIndex];
                                    const isCorrect = userAnswer === currentQuestion.correct_answer;

                                    return (
                                        <tr key={attempt._id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {attempt.userId.name}
                                                </div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                                    {attempt.userId.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-medium ${
                                                        isCorrect
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                        {String.fromCharCode(65 + userAnswer)}. {currentQuestion.options[userAnswer]}
                                                    </span>
                                                    {isCorrect ? (
                                                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <XCircleIcon className="w-4 h-4 text-red-600" />
                                                    )}
                                                </div>
                                                {!isCorrect && (
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        Correta: {String.fromCharCode(65 + currentQuestion.correct_answer)}. {currentQuestion.options[currentQuestion.correct_answer]}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {isCorrect ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                                                        Correta
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                        <XCircleIcon className="w-3 h-3 mr-1" />
                                                        Incorreta
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(attempt.createdAt).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {questionAttempts.length === 0 && (
                        <div className="text-center py-12">
                            <UserIcon className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                                Nenhuma resposta para esta questão
                            </h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Os usuários que responderam aparecerão aqui.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminQuizDetailsPage;