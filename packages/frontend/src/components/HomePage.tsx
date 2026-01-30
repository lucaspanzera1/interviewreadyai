import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './BottomNav';
import { useSidebar } from '../contexts/SidebarContext';
import { apiClient } from '../lib/api';
import {
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  PlayIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();
  const [userStats, setUserStats] = useState<any>(null);

  // Real data for logged in users
  const stats = userStats ? [
    { label: 'Simulados Realizados', value: userStats.totalAttempts.toString(), icon: DocumentTextIcon, color: 'indigo' },
    { label: 'Taxa de Acerto', value: `${userStats.averageScore.toFixed(0)}%`, icon: CheckCircleIcon, color: 'green' },
    { label: 'Tempo Médio', value: `${Math.floor(userStats.averageTime / 60)}min`, icon: ClockIcon, color: 'amber' },
    { label: 'Evolução', value: `${userStats.evolution >= 0 ? '+' : ''}${userStats.evolution.toFixed(0)}%`, icon: ArrowTrendingUpIcon, color: 'purple' },
  ] : [
    { label: 'Simulados Realizados', value: '0', icon: DocumentTextIcon, color: 'indigo' },
    { label: 'Taxa de Acerto', value: '0%', icon: CheckCircleIcon, color: 'green' },
    { label: 'Tempo Médio', value: '0min', icon: ClockIcon, color: 'amber' },
    { label: 'Evolução', value: '0%', icon: ArrowTrendingUpIcon, color: 'purple' },
  ];

  const recentSimulados = userStats?.recentSimulados || [];

  const quickActions = [
    { label: 'Novo Simulado', icon: PlusIcon, action: () => navigate('/simulados/novo'), primary: true },
    { label: 'Continuar Último', icon: PlayIcon, action: () => navigate('/simulados/continuar') },
  ];

  // Load user stats when logged in
  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const stats = await apiClient.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Don't show toast error for stats loading, just use default values
    }
  };

  const freeQuizzes = [
    {
      id: 'free-1',
      title: 'Lógica de Programação',
      questions: 10,
      time: '15 min',
      difficulty: 'Iniciante',
      tags: ['Lógica', 'Algoritmos']
    },
    {
      id: 'free-2',
      title: 'Fundamentos do React',
      questions: 15,
      time: '20 min',
      difficulty: 'Intermediário',
      tags: ['Frontend', 'React']
    },
    {
      id: 'free-3',
      title: 'SQL para Iniciantes',
      questions: 12,
      time: '15 min',
      difficulty: 'Iniciante',
      tags: ['Backend', 'Dados']
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-200">
      <Sidebar />

      {/* Main Content */}
      <main className={`min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 transition-colors duration-200">
          <div className="px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="ml-10 lg:ml-0">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight heading-gradient">Dashboard</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Bem-vindo de volta, <span className="text-primary-600 dark:text-primary-400 font-medium">{user?.name?.split(' ')[0] || 'Usuário'}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/simulados/novo')}
                  className="hidden sm:flex items-center justify-center px-4 py-2 bg-primary-600 text-white text-sm font-semibold hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-500/30 transition-all rounded-xl shadow-sm active:scale-95"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Novo Simulado
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 lg:p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
                  <div className={`p-2 rounded-lg ${stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
                    stat.color === 'green' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                      stat.color === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                        'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    }`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight text-balance group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Ações Rápidas</h2>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-semibold transition-all ${action.primary
                        ? 'bg-primary-600 border-transparent text-white hover:bg-primary-500 shadow-md shadow-primary-500/20'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary-500 dark:hover:border-primary-500 hover:text-primary-700 dark:hover:text-primary-400'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <action.icon className="w-5 h-5 opacity-80" />
                        <span>{action.label}</span>
                      </div>
                      {action.primary && <ArrowRightOnRectangleIcon className="w-4 h-4 opacity-70 -rotate-45" />}
                    </button>
                  ))}
                </div>

                {/* Tip Card */}
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-md">
                  <div className="flex items-start gap-3">
                    <SparklesIcon className="w-4 h-4 text-slate-600 dark:text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wide">Dica do dia</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        Pratique pelo menos 1 simulado por dia para melhorar suas chances em entrevistas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Simulados & Free Quizzes */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Simulados */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">Simulados Recentes</h2>
                  <button
                    onClick={() => navigate('/profile/quiz-history')}
                    className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Ver todos
                  </button>
                </div>

                <div className="space-y-3">
                  {recentSimulados.map((simulado: any) => (
                    <div
                      key={simulado.id}
                      className="group flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 rounded-md transition-all cursor-pointer hover:shadow-sm"
                      onClick={() => navigate(`/profile/quiz-history/${simulado.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center rounded-md text-slate-500 dark:text-slate-400">
                          <DocumentTextIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{simulado.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {new Date(simulado.date).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="block text-xs text-slate-400 dark:text-slate-500 uppercase">Score</span>
                          <span className={`text-sm font-mono font-medium ${simulado.score >= 80 ? 'text-emerald-700 dark:text-emerald-400' :
                            simulado.score >= 60 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'
                            }`}>
                            {simulado.score.toFixed(0)}%
                          </span>
                        </div>
                        <ArrowRightOnRectangleIcon className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors -rotate-45" />
                      </div>
                    </div>
                  ))}
                </div>

                {recentSimulados.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                    <DocumentTextIcon className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum simulado realizado ainda</p>
                    <button
                      onClick={() => navigate('/free-quizzes')}
                      className="mt-4 text-slate-900 dark:text-white border-b border-slate-900 dark:border-white text-xs font-semibold hover:opacity-70 pb-0.5 transition-opacity"
                    >
                      Começar com quizzes gratuitos
                    </button>
                  </div>
                )}
              </div>

              {/* Free Quizzes Section */}
              <div className="bg-gradient-to-br from-primary-900 to-primary-700 dark:from-primary-950 dark:to-primary-800 rounded-2xl p-6 text-white shadow-lg shadow-primary-900/20 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 p-8 opacity-20">
                  <AcademicCapIcon className="w-32 h-32 -mr-10 -mt-10 transform rotate-12" />
                </div>

                <div className="relative z-10">
                  <div
                    className="flex items-center gap-2 mb-6 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => navigate('/free-quizzes')}
                  >
                    <SparklesIcon className="w-5 h-5 text-yellow-300" />
                    <h2 className="text-base font-bold text-white">Sugestões para Você (Grátis)</h2>
                    <ArrowRightOnRectangleIcon className="w-4 h-4 text-white/70 -rotate-45" />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    {freeQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer group hover:-translate-y-1"
                        onClick={() => navigate(`/simulados/novo?template=${quiz.id}`)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                            <BoltIcon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 border border-emerald-400/50">
                            Grátis
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1" title={quiz.title}>{quiz.title}</h3>

                        <div className="flex items-center gap-3 text-xs text-white/70 mb-4">
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            <span>{quiz.time}</span>
                          </div>
                          <span>•</span>
                          <span>{quiz.questions} questões</span>
                        </div>

                        <button className="w-full py-2 text-xs font-bold bg-white text-primary-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 group-hover:shadow-lg">
                          <span>Praticar</span>
                          <ArrowRightOnRectangleIcon className="w-3 h-3 -rotate-45" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart Placeholder */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Evolução do Desempenho</h2>
              <select className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 rounded-md text-slate-600 dark:text-slate-300 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors">
                <option>Últimos 7 dias</option>
                <option>Últimos 30 dias</option>
                <option>Últimos 90 dias</option>
              </select>
            </div>

            <div className="h-64 bg-slate-50 dark:bg-slate-950/50 rounded-md border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(45deg,transparent_25%,#000_25%,#000_50%,transparent_50%,transparent_75%,#000_75%,#000_100%)] dark:bg-[linear-gradient(45deg,transparent_25%,#fff_25%,#fff_50%,transparent_50%,transparent_75%,#fff_75%,#fff_100%)] bg-[length:10px_10px]"></div>
              <div className="text-center relative z-10">
                <ChartBarIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Gráfico de evolução</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Complete mais simulados para visualizar dados</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
