import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageTitle from './PageTitle';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CalendarIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { apiClient } from '../lib/api';
import { toast } from 'react-toastify';

interface Question {
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
}

interface QuizAttempt {
    _id: string;
    quizId: {
        _id: string;
        titulo: string;
        categoria: string;
        nivel: string;
        quantidade_questoes: number;
        questions: Question[];
    };
    selectedAnswers: number[];
    score: number;
    totalQuestions: number;
    percentage: number;
    timeSpent: number;
    completed: boolean;
    createdAt: string;
}

const UserQuizAttemptDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const { attemptId } = useParams<{ attemptId: string }>();
    const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

    useEffect(() => {
        if (attemptId) {
            loadAttemptDetails();
        }
    }, [attemptId]);

    const loadAttemptDetails = async () => {
        try {
            setLoading(true);
            const attemptData = await apiClient.getUserAttemptDetails(attemptId!);
            setAttempt(attemptData);
        } catch (error) {
            toast.error('Erro ao carregar detalhes da tentativa');
            console.error(error);
            navigate('/profile/quiz-history');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600 dark:text-green-400';
        if (percentage >= 60) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!attempt) {
        return (
            <div className="text-center py-12">
                <AcademicCapIcon className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                    Tentativa não encontrada
                </h3>
            </div>
        );
    }

    const currentQuestion = attempt.quizId.questions[selectedQuestionIndex];
    const userAnswer = attempt.selectedAnswers[selectedQuestionIndex];
    const isCorrect = userAnswer === currentQuestion.correct_answer;

    return (
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-24 sm:pb-0">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/profile/quiz-history')}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <PageTitle title={`Detalhes da Tentativa`} />
            </div>

            {/* Attempt Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4 sm:gap-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {attempt.quizId.titulo}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <span>{attempt.quizId.categoria}</span>
                            <span>•</span>
                            <span>{attempt.quizId.nivel === 'INICIANTE' ? 'Iniciante' :
                                attempt.quizId.nivel === 'MEDIO' ? 'Médio' :
                                    attempt.quizId.nivel === 'DIFÍCIL' ? 'Difícil' : 'Expert'}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {formatDate(attempt.createdAt)}
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                {formatTime(attempt.timeSpent)}
                            </div>
                        </div>
                    </div>

                    <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-end items-center sm:items-end border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 mt-2 sm:mt-0">
                        <div className={`text-3xl font-bold ${getScoreColor(attempt.percentage)}`}>
                            {attempt.percentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {attempt.score}/{attempt.totalQuestions} questões
                        </div>
                    </div>
                </div>

                {/* Question Navigation */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Questões ({selectedQuestionIndex + 1} de {attempt.quizId.questions.length})
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
                                onClick={() => setSelectedQuestionIndex(prev => Math.min(attempt.quizId.questions.length - 1, prev + 1))}
                                disabled={selectedQuestionIndex === attempt.quizId.questions.length - 1}
                                className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>

                    {/* Question Display */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 sm:p-6">
                        <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                            {currentQuestion.question}
                        </h4>

                        <div className="space-y-3 mb-6">
                            {currentQuestion.options.map((option, optionIndex) => (
                                <div
                                    key={optionIndex}
                                    className={`p-3 rounded-lg border ${optionIndex === currentQuestion.correct_answer
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                            : optionIndex === userAnswer && optionIndex !== currentQuestion.correct_answer
                                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                                : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm ${optionIndex === currentQuestion.correct_answer
                                                ? 'text-green-800 dark:text-green-200 font-semibold'
                                                : optionIndex === userAnswer && optionIndex !== currentQuestion.correct_answer
                                                    ? 'text-red-800 dark:text-red-200 font-semibold'
                                                    : 'text-slate-700 dark:text-slate-300'
                                            }`}>
                                            {String.fromCharCode(65 + optionIndex)}. {option}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {optionIndex === userAnswer && (
                                                <span className={`text-xs font-medium px-2 py-1 rounded ${isCorrect
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    }`}>
                                                    Sua resposta
                                                </span>
                                            )}
                                            {optionIndex === currentQuestion.correct_answer && (
                                                <CheckCircleSolid className="w-5 h-5 text-green-600" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Question Result */}
                        <div className={`p-4 rounded-lg ${isCorrect
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                                {isCorrect ? (
                                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircleIcon className="w-5 h-5 text-red-600" />
                                )}
                                <span className={`font-semibold ${isCorrect
                                        ? 'text-green-800 dark:text-green-200'
                                        : 'text-red-800 dark:text-red-200'
                                    }`}>
                                    {isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta'}
                                </span>
                            </div>

                            {!isCorrect && (
                                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                    <strong>Correta:</strong> {String.fromCharCode(65 + currentQuestion.correct_answer)}. {currentQuestion.options[currentQuestion.correct_answer]}
                                </div>
                            )}

                            {currentQuestion.explanation && (
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    <strong>Explicação:</strong> {currentQuestion.explanation}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserQuizAttemptDetailsPage;