import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import {
    AcademicCapIcon,
    ClockIcon,
    PlayCircleIcon,
    BoltIcon,
    FunnelIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Mock data for free quizzes
const FREE_QUIZZES = [
    {
        id: 'free-1',
        title: 'Lógica de Programação Básica',
        description: 'Teste seus conhecimentos em algoritmos, variáveis e estruturas de controle.',
        questions: 10,
        time: '15 min',
        difficulty: 'Iniciante',
        rating: 4.8,
        reviews: 124,
        tags: ['Lógica', 'Algoritmos'],
        category: 'Fundamentos',
        completions: 1205
    },
    {
        id: 'free-2',
        title: 'Fundamentos do React',
        description: 'Conceitos essenciais de React: Components, Props, State e Hooks básicos.',
        questions: 15,
        time: '20 min',
        difficulty: 'Intermediário',
        rating: 4.9,
        reviews: 89,
        tags: ['Frontend', 'React'],
        category: 'Frontend',
        completions: 850
    },
    {
        id: 'free-3',
        title: 'SQL para Iniciantes',
        description: 'Aprenda e pratique comandos básicos de SQL: SELECT, WHERE, JOIN e mais.',
        questions: 12,
        time: '15 min',
        difficulty: 'Iniciante',
        rating: 4.7,
        reviews: 56,
        tags: ['Backend', 'Dados'],
        category: 'Backend',
        completions: 640
    },
    {
        id: 'free-4',
        title: 'JavaScript Moderno (ES6+)',
        description: 'Domine as features modernas do JS: Arrow Functions, Destructuring, Spread e mais.',
        questions: 20,
        time: '25 min',
        difficulty: 'Intermediário',
        rating: 4.8,
        reviews: 210,
        tags: ['Frontend', 'JavaScript'],
        category: 'Frontend',
        completions: 1500
    },
    {
        id: 'free-5',
        title: 'Git & GitHub Essencial',
        description: 'Comandos básicos de Git e fluxo de trabalho com GitHub para iniciantes.',
        questions: 10,
        time: '12 min',
        difficulty: 'Iniciante',
        rating: 4.9,
        reviews: 340,
        tags: ['DevOps', 'Ferramentas'],
        category: 'DevOps',
        completions: 2100
    },
    {
        id: 'free-6',
        title: 'Estruturas de Dados: Arrays e Listas',
        description: 'Entenda como funcionam arrays, listas ligadas e operações básicas.',
        questions: 15,
        time: '20 min',
        difficulty: 'Avançado',
        rating: 4.6,
        reviews: 45,
        tags: ['CS', 'Algoritmos'],
        category: 'Fundamentos',
        completions: 320
    }
];

const CATEGORIES = ['Todas', 'Fundamentos', 'Frontend', 'Backend', 'DevOps'];
const DIFFICULTIES = ['Todas', 'Iniciante', 'Intermediário', 'Avançado'];

const FreeQuizzesPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [selectedDifficulty, setSelectedDifficulty] = useState('Todas');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredQuizzes = FREE_QUIZZES.filter(quiz => {
        const matchesCategory = selectedCategory === 'Todas' || quiz.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === 'Todas' || quiz.difficulty === selectedDifficulty;
        const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesDifficulty && matchesSearch;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <PageTitle title="Quizzes Gratuitos" />
                <div className="hidden md:block text-right">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Pratique sem gastar tokens. <br />
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Ganhe 1 token ao completar 3 quizzes.</span>
                    </p>
                </div>
            </div>

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-900 dark:to-indigo-900 text-white shadow-lg">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl"></div>

                <div className="relative p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-violet-100 text-sm font-semibold uppercase tracking-wider">
                            <BoltIcon className="w-4 h-4 text-yellow-300" />
                            <span>Destaque da Semana</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white">Desafio Front-End Master</h2>
                        <p className="text-violet-100 max-w-xl text-sm md:text-base leading-relaxed">
                            Teste seus conhecimentos em HTML, CSS, JS e React neste desafio completo.
                            Complete com mais de 90% de acerto e ganhe uma insígnia exclusiva.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/simulados/novo?template=challenge-fe')}
                        className="shrink-0 px-6 py-3 bg-white text-violet-700 rounded-xl font-bold shadow-xl shadow-violet-900/20 hover:bg-violet-50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <PlayCircleIcon className="w-5 h-5" />
                        Aceitar Desafio
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">

                {/* Search */}
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar quiz..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-700 pr-4 mr-2">
                        <FunnelIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Filtros:</span>
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-primary-500 focus:border-primary-500"
                    >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>

                    <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-primary-500 focus:border-primary-500"
                    >
                        {DIFFICULTIES.map(diff => <option key={diff} value={diff}>{diff}</option>)}
                    </select>
                </div>
            </div>

            {/* Grid of Quizzes */}
            {filteredQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredQuizzes.map((quiz) => (
                        <div
                            key={quiz.id}
                            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-500 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
                            onClick={() => navigate(`/simulados/novo?template=${quiz.id}`)}
                        >
                            {/* Card Header */}
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${quiz.category === 'Frontend' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' :
                                            quiz.category === 'Backend' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800' :
                                                quiz.category === 'DevOps' ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800' :
                                                    'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                        }`}>
                                        {quiz.category}
                                    </span>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <StarIconSolid className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{quiz.rating}</span>
                                        <span className="text-[10px] text-slate-400">({quiz.reviews})</span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {quiz.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                                    {quiz.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {quiz.tags.map(tag => (
                                        <span key={tag} className="text-[10px] font-medium px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md border border-slate-100 dark:border-slate-700">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    <div className="flex items-center gap-1.5" title="Tempo estimado">
                                        <ClockIcon className="w-4 h-4" />
                                        {quiz.time}
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Questões">
                                        <AcademicCapIcon className="w-4 h-4" />
                                        {quiz.questions}
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Dificuldade">
                                        <span className={`w-2 h-2 rounded-full ${quiz.difficulty === 'Iniciante' ? 'bg-green-500' :
                                                quiz.difficulty === 'Intermediário' ? 'bg-amber-500' : 'bg-red-500'
                                            }`}></span>
                                        {quiz.difficulty}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                    Começar
                                    <PlayCircleIcon className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AcademicCapIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nenhum quiz encontrado</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Tente ajustar os filtros ou sua busca.</p>
                    <button
                        onClick={() => { setSearchQuery(''); setSelectedCategory('Todas'); setSelectedDifficulty('Todas'); }}
                        className="mt-4 text-primary-600 font-medium text-sm hover:underline"
                    >
                        Limpar filtros
                    </button>
                </div>
            )}
        </div>
    );
};

export default FreeQuizzesPage;
