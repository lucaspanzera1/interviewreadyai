import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import { CheckCircleIcon, XCircleIcon, ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { QuizQuestion, apiClient } from '../lib/api';

const GeneratedQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<{ questions: (QuizQuestion & { originalIndex?: number })[] } | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [quizId, setQuizId] = useState<string>('');


  useEffect(() => {
    const storedQuiz = localStorage.getItem('generatedQuiz');
    const storedQuizId = localStorage.getItem('currentQuizId');

    if (storedQuiz) {
      const parsedData = JSON.parse(storedQuiz);

      // Add original index and shuffle
      const questionsWithIndex = parsedData.questions.map((q: QuizQuestion, index: number) => ({
        ...q,
        originalIndex: index
      }));

      // Fisher-Yates shuffle
      for (let i = questionsWithIndex.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questionsWithIndex[i], questionsWithIndex[j]] = [questionsWithIndex[j], questionsWithIndex[i]];
      }

      const shuffledQuiz = { ...parsedData, questions: questionsWithIndex };

      setQuiz(shuffledQuiz);
      setSelectedAnswers(new Array(shuffledQuiz.questions.length).fill(-1));
      setStartTime(Date.now());

      if (storedQuizId) {
        setQuizId(storedQuizId);
        apiClient.recordQuizAccess(storedQuizId).catch(console.error);
      }
    } else {
      navigate('/free-quizzes');
    }
  }, [navigate]);

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleAnswerSelect = (answerIndex: number) => {
    // Answer update allowed
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);

    // Immediate feedback
    // const isCorrect = answerIndex === quiz.questions[currentQuestion].correct_answer;
    // setAnswerState(isCorrect ? 'correct' : 'incorrect');

    // Auto advance after small delay? No, user might want to review options.
  };

  const nextQuestion = async () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      let correct = 0;
      quiz.questions.forEach((question, index) => {
        if (selectedAnswers[index] === question.correct_answer) {
          correct++;
        }
      });
      setScore(correct);

      if (quizId) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);

        // Remap answers to original order for backend
        const answersForBackend = new Array(quiz.questions.length);
        quiz.questions.forEach((q, i) => {
          // Use originalIndex if available, otherwise fallback to current index (should not happen if shuffled)
          const correctIndex = q.originalIndex !== undefined ? q.originalIndex : i;
          answersForBackend[correctIndex] = selectedAnswers[i];
        });

        try {
          await apiClient.recordQuizAttempt(
            quizId,
            answersForBackend,
            correct,
            quiz.questions.length,
            timeSpent
          );
        } catch (error) {
          console.error('Failed to record quiz attempt:', error);
        }
      }

      setShowResults(true);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
    setShowResults(false);
    setScore(0);
    setStartTime(Date.now());
  };

  if (showResults) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 animate-fade-in">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/free-quizzes')}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <PageTitle title="Resultado do Quiz" />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-lifted border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden">
            {/* Background flare */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-primary-50/50 dark:from-primary-900/10 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center p-1 rounded-full bg-gradient-to-r from-primary-100 to-indigo-100 dark:from-primary-900/30 dark:to-indigo-900/30 mb-8">
                <div className={`
                                    w-32 h-32 rounded-full flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm
                                    ${percentage >= 80 ? 'text-green-600 dark:text-green-400' :
                    percentage >= 60 ? 'text-primary-600 dark:text-primary-400' :
                      'text-slate-600 dark:text-slate-400'}
                                `}>
                  <span className="text-4xl font-black tracking-tight">{percentage}%</span>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                {percentage >= 80 ? 'Excelente Performance!' :
                  percentage >= 60 ? 'Bom Trabalho!' :
                    'Continue Praticando!'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto">
                Você acertou <strong className="text-slate-900 dark:text-white">{score}</strong> de <strong className="text-slate-900 dark:text-white">{quiz.questions.length}</strong> questões.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                <button
                  onClick={restartQuiz}
                  className="flex-1 px-8 py-4 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2 hover:scale-105"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  Refazer Quiz
                </button>
                <button
                  onClick={() => navigate('/free-quizzes')}
                  className="flex-1 px-8 py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 hover:scale-105 shadow-lg shadow-primary-600/20"
                >
                  Novo Quiz
                  <ArrowLeftIcon className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white px-2">Revisão das Questões</h3>
            {quiz.questions.map((question, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-start gap-4">
                  <div className={`
                                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1
                                        ${selectedAnswers[index] === question.correct_answer
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}
                                    `}>
                    {selectedAnswers[index] === question.correct_answer ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <XCircleIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-lg">
                      {question.question}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg text-sm border flex items-center justify-between ${optionIndex === question.correct_answer
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 font-medium'
                            : optionIndex === selectedAnswers[index]
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                              : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                            }`}
                        >
                          <span>{option}</span>
                          {optionIndex === question.correct_answer && <CheckCircleIcon className="w-4 h-4" />}
                        </div>
                      ))}
                    </div>
                    {question.explanation && (
                      <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-sm text-indigo-800 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50">
                        <strong className="block mb-1 font-semibold">Explicação:</strong>
                        {question.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 flex flex-col items-center justify-center">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary-100/50 dark:bg-primary-900/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-blue-100/50 dark:bg-blue-900/10 blur-3xl rounded-full" />
      </div>

      <div className="w-full max-w-3xl relative z-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/free-quizzes')}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:scale-105"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            Questão {currentQuestion + 1} de {quiz.questions.length}
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-lifted border border-slate-100 dark:border-slate-700 animate-slide-up">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">
            {question.question}
          </h2>

          <div className="space-y-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`
                                    w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 group relative overflow-hidden
                                    ${selectedAnswers[currentQuestion] === index
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }
                                `}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`
                                        w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                                        ${selectedAnswers[currentQuestion] === index
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 text-slate-400 group-hover:border-primary-400 group-hover:text-primary-400'}
                                    `}>
                    <span className="text-sm font-bold">{String.fromCharCode(65 + index)}</span>
                  </div>
                  <span className={`text-lg font-medium ${selectedAnswers[currentQuestion] === index
                    ? 'text-primary-900 dark:text-primary-100'
                    : 'text-slate-700 dark:text-slate-300'
                    }`}>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="px-6 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors disabled:opacity-0"
            >
              Anterior
            </button>

            <button
              onClick={nextQuestion}
              disabled={selectedAnswers[currentQuestion] === -1}
              className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 font-bold flex items-center gap-2 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
            >
              {currentQuestion === quiz.questions.length - 1 ? 'Finalizar' : 'Próxima'}
              <ArrowLeftIcon className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedQuizPage;