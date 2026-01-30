import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import { CheckCircleIcon, XCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { QuizQuestion } from '../lib/api';

const GeneratedQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<{ questions: QuizQuestion[] } | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const storedQuiz = localStorage.getItem('generatedQuiz');
    if (storedQuiz) {
      setQuiz(JSON.parse(storedQuiz));
      setSelectedAnswers(new Array(JSON.parse(storedQuiz).questions.length).fill(-1));
    } else {
      navigate('/free-quizzes');
    }
  }, [navigate]);

  if (!quiz) {
    return <div>Loading...</div>;
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
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
  };

  if (showResults) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/free-quizzes')}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <PageTitle title="Resultado do Quiz" />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {percentage}%
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Você acertou {score} de {quiz.questions.length} questões
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {percentage >= 80 ? 'Excelente trabalho!' : percentage >= 60 ? 'Bom trabalho!' : 'Continue praticando!'}
            </p>
          </div>

          <div className="space-y-6">
            {quiz.questions.map((question, index) => (
              <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  {selectedAnswers[index] === question.correct_answer ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                      Questão {index + 1}: {question.question}
                    </h3>
                    <div className="space-y-1">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-2 rounded text-sm ${
                            optionIndex === question.correct_answer
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-medium'
                              : optionIndex === selectedAnswers[index]
                              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded text-sm text-slate-700 dark:text-slate-300">
                      <strong>Explicação:</strong> {question.explanation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={restartQuiz}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
            >
              Refazer Quiz
            </button>
            <button
              onClick={() => navigate('/free-quizzes')}
              className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Voltar aos Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/free-quizzes')}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <PageTitle title={`Quiz Gerado - Questão ${currentQuestion + 1} de ${quiz.questions.length}`} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            {question.question}
          </h2>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          <div className="flex gap-2">
            {quiz.questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentQuestion
                    ? 'bg-primary-600'
                    : selectedAnswers[index] !== -1
                    ? 'bg-green-500'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextQuestion}
            disabled={selectedAnswers[currentQuestion] === -1}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === quiz.questions.length - 1 ? 'Finalizar' : 'Próxima'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedQuizPage;