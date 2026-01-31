import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
    ArrowLeftIcon,
    UserIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChartBarIcon,
    ChevronLeftIcon,
    ChevronRightIcon
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
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
                    <ChartBarIcon className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Detalhes não encontrados
                </h3>
                <button
                    onClick={() => navigate('/admin/quizzes')}
                    className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    Voltar para Quizzes
                </button>
            </div>
        );
    }

    const currentQuestion = stats.quiz.questions[selectedQuestionIndex];
    const questionAttempts = stats.attempts.filter(attempt =>
        attempt.selectedAnswers && attempt.selectedAnswers.length > selectedQuestionIndex
    );

    // Calculate generic stats for this question
    const correctCount = questionAttempts.filter(a => a.selectedAnswers[selectedQuestionIndex] === currentQuestion.correct_answer).length;
    const incorrectCount = questionAttempts.length - correctCount;
    const questionSuccessRate = questionAttempts.length > 0 ? (correctCount / questionAttempts.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/quizzes')}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm border border-slate-200 dark:border-slate-700 transition-all"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Detalhes do Quiz</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{stats.quiz.titulo}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/admin/quizzes/${id}/stats`)}
                        className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                        <ChartBarIcon className="w-4 h-4" />
                        Ver Estatísticas Gerais
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Question Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Navigation Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft border border-slate-100 dark:border-slate-700 flex items-center justify-between sticky top-4 z-20">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Questão {selectedQuestionIndex + 1} <span className="text-slate-400 font-normal text-sm">de {stats.quiz.questions.length}</span>
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelectedQuestionIndex(prev => Math.max(0, prev - 1))}
                                    disabled={selectedQuestionIndex === 0}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeftIcon className="w-5 h-5" />
                                </button>
                                <div className="flex gap-1">
                                    {stats.quiz.questions.map((_, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedQuestionIndex(idx)}
                                            className={`
                                                w-2 h-2 rounded-full cursor-pointer transition-all
                                                ${idx === selectedQuestionIndex
                                                    ? 'bg-primary-600 w-4'
                                                    : 'bg-slate-300 dark:bg-slate-600 hover:bg-primary-400'}
                                            `}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={() => setSelectedQuestionIndex(prev => Math.min(stats.quiz.questions.length - 1, prev + 1))}
                                    disabled={selectedQuestionIndex === stats.quiz.questions.length - 1}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Question Display */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lifted border border-slate-100 dark:border-slate-700">
                            {/* Stats Mini-bar for this question */}
                            <div className="flex gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Taxa de Acerto</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${questionSuccessRate}%` }} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{questionSuccessRate.toFixed(0)}%</span>
                                    </div>
                                </div>
                                <div className="flex gap-4 text-sm">
                                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        {correctCount}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                                        <XCircleIcon className="w-4 h-4" />
                                        {incorrectCount}
                                    </div>
                                </div>
                            </div>

                            <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-snug">
                                {currentQuestion.question}
                            </h4>

                            <div className="space-y-3">
                                {currentQuestion.options.map((option, optionIndex) => (
                                    <div
                                        key={optionIndex}
                                        className={`
                                            p-4 rounded-xl border-2 transition-all flex items-center justify-between group
                                            ${optionIndex === currentQuestion.correct_answer
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-500/50 text-green-900 dark:text-green-100 shadow-sm'
                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                                ${optionIndex === currentQuestion.correct_answer
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                                }
                                            `}>
                                                {String.fromCharCode(65 + optionIndex)}
                                            </div>
                                            <span className="font-medium">{option}</span>
                                        </div>
                                        {optionIndex === currentQuestion.correct_answer && (
                                            <CheckCircleSolid className="w-6 h-6 text-green-500" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: User Responses */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-[600px]">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-900 dark:text-white">
                                Respostas ({questionAttempts.length})
                            </h3>
                        </div>

                        <div className="overflow-y-auto flex-1 p-0 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                            {questionAttempts.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {questionAttempts.map((attempt) => {
                                        const userAnswer = attempt.selectedAnswers[selectedQuestionIndex];
                                        const isCorrect = userAnswer === currentQuestion.correct_answer;

                                        return (
                                            <div key={attempt._id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <div className="flex items-start gap-3">
                                                    <div className={`
                                                        mt-1 w-2 h-2 rounded-full flex-shrink-0
                                                        ${isCorrect ? 'bg-green-500' : 'bg-red-500'}
                                                    `} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                            {attempt.userId.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                                            {new Date(attempt.createdAt).toLocaleDateString()}
                                                        </p>

                                                        <div className="flex items-center gap-2">
                                                            <span className={`
                                                                text-xs font-semibold px-2 py-1 rounded-md border
                                                                ${isCorrect
                                                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                                                                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                                                                }
                                                            `}>
                                                                Opção {String.fromCharCode(65 + userAnswer)}
                                                            </span>
                                                            {!isCorrect && (
                                                                <span className="text-xs text-slate-400">
                                                                    (Correto: {String.fromCharCode(65 + currentQuestion.correct_answer)})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400">
                                    <UserIcon className="w-12 h-12 mb-3 opacity-20" />
                                    <p>Nenhuma resposta registrada para esta questão ainda.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminQuizDetailsPage;