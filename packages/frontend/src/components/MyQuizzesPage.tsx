import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const MyQuizzesPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Header */}
            <div className="px-8 py-8 border-b border-subtle dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Meus Quizzes
                        </h1>
                        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                            Gerencie e visualize os quizzes que você criou.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/create-quiz')}
                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        Criar Novo Quiz
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Empty State */}
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                            <DocumentTextIcon className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            Nenhum quiz criado ainda
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">
                            Você ainda não criou nenhum quiz. Crie quizzes personalizados a partir de vagas ou tópicos específicos baseados em IA.
                        </p>
                        <button
                            onClick={() => navigate('/create-quiz')}
                            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-primary-500/30"
                        >
                            <PlusCircleIcon className="w-5 h-5" />
                            Começar Agora
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyQuizzesPage;
