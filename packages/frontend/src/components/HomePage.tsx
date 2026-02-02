import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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
  BoltIcon,
  LockClosedIcon,
  UserGroupIcon,
  TrophyIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import OnboardingGuide from './OnboardingGuide';

const HomePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();
  const [userStats, setUserStats] = useState<any>(null);
  const [suggestedQuizzes, setSuggestedQuizzes] = useState<any[]>([]);
  const [startingQuizId, setStartingQuizId] = useState<string | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Initial Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Load data
  useEffect(() => {
    if (user) {
      loadUserStats();
    }
    loadSuggestedQuizzes();
  }, [user]);

  const loadUserStats = async () => {
    try {
      const stats = await apiClient.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadSuggestedQuizzes = async () => {
    try {
      // Guests get public quizzes too
      const response = await apiClient.getPublicQuizzes(1, 4);
      setSuggestedQuizzes(response.quizzes);
    } catch (error) {
      console.error('Erro ao carregar quizzes sugeridos:', error);
    }
  };

  const startSuggestedQuiz = async (quizId: string) => {
    setStartingQuizId(quizId);
    try {
      // For guests, we might need a different flow or just allow access if API permits
      // Assuming API handles guests or we catch 401
      if (!user) {
        navigate('/login');
        return;
      }

      if (user) {
        await apiClient.recordQuizAccess(quizId);
      }

      const fullQuiz = await apiClient.getQuizForPlaying(quizId);

      if (!fullQuiz || !fullQuiz.questions || fullQuiz.questions.length === 0) {
        toast.error('Quiz indísponivel no momento');
        return;
      }

      localStorage.setItem('generatedQuiz', JSON.stringify({
        questions: fullQuiz.questions,
        quizId: fullQuiz._id
      }));
      localStorage.setItem('currentQuizId', fullQuiz._id);

      navigate('/quiz/generated');
    } catch (error) {
      toast.error('Erro ao iniciar quiz');
      console.error(error);
    } finally {
      setStartingQuizId(null);
    }
  };

  // Configuration for Guest vs User
  const isGuest = !user;

  const statsConfig = isGuest ? [
    // Demo/Preview Stats for Guests
    { label: 'Estatísticas', value: 'Preview', icon: DocumentTextIcon, color: 'indigo', blur: true },
    { label: 'Taxa de Acerto', value: '85%', icon: CheckCircleIcon, color: 'green', blur: true },
    { label: 'Tempo Médio', value: '12min', icon: ClockIcon, color: 'amber', blur: true },
    { label: 'Evolução', value: '+15%', icon: ArrowTrendingUpIcon, color: 'purple', blur: true },
  ] : userStats ? [
    // Real User Stats
    { label: 'Simulados', value: (userStats.totalAttempts ?? 0).toString(), icon: DocumentTextIcon, color: 'indigo', blur: false },
    { label: 'Taxa de Acerto', value: `${((userStats.averageScore ?? 0)).toFixed(0)}%`, icon: CheckCircleIcon, color: 'green', blur: false },
    { label: 'Tempo Médio', value: `${Math.floor((userStats.averageTime ?? 0) / 60)}min`, icon: ClockIcon, color: 'amber', blur: false },
    { label: 'Evolução', value: `${(userStats.evolution ?? 0) >= 0 ? '+' : ''}${(userStats.evolution ?? 0).toFixed(0)}%`, icon: ArrowTrendingUpIcon, color: 'purple', blur: false },
  ] : [
    // Empty User Stats
    { label: 'Simulados', value: '0', icon: DocumentTextIcon, color: 'indigo', blur: false },
    { label: 'Taxa de Acerto', value: '0%', icon: CheckCircleIcon, color: 'green', blur: false },
    { label: 'Tempo Médio', value: '0min', icon: ClockIcon, color: 'amber', blur: false },
    { label: 'Evolução', value: '0%', icon: ArrowTrendingUpIcon, color: 'purple', blur: false },
  ];

  const quickActions = isGuest ? [
    {
      label: 'Criar Conta Grátis',
      desc: 'Salve seu progresso e evolua',
      icon: SparklesIcon,
      action: () => navigate('/login'),
      primary: true,
      bg: 'bg-primary-600',
      text: 'text-white'
    },
    {
      label: 'Quiz Gratuito',
      desc: 'Teste seus conhecimentos',
      icon: PlayIcon,
      action: () => navigate('/free-quizzes'),
      primary: false,
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      label: 'Ver Planos',
      desc: 'Desbloqueie todo potencial',
      icon: TrophyIcon,
      action: () => navigate('/pricing'),
      primary: false,
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-600 dark:text-amber-400'
    },
  ] : [
    {
      label: 'Novo Simulado',
      desc: 'Gerar quiz personalizado',
      icon: PlusIcon,
      action: () => navigate('/simulados/novo'),
      primary: true,
      bg: 'bg-primary-600',
      text: 'text-white'
    },
    {
      label: 'Continuar',
      desc: 'Retomar último quiz',
      icon: PlayIcon,
      action: () => navigate('/simulados/continuar'),
      primary: false,
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      label: 'Ranking',
      desc: 'Compare seu desempenho',
      icon: UserGroupIcon,
      action: () => navigate('/ranking'),
      primary: false,
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-600 dark:text-amber-400'
    },
  ];

  const recentSimulados = userStats?.recentSimulados || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-200">
      <Sidebar />

      <main className={`min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
          <div className="px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="ml-12 lg:ml-0">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {isGuest ? (
                    <span>Olá, <span className="text-primary-600 dark:text-primary-400">Visitante</span></span>
                  ) : (
                    <span>Olá, <span className="text-primary-600 dark:text-primary-400">{user?.name?.split(' ')[0]}</span></span>
                  )}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isGuest ? 'Experimente um pouco do que oferecemos.' : 'Vamos evoluir sua carreira hoje?'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!isGuest && (
                  <div className="hidden sm:flex items-center px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium border border-amber-200 dark:border-amber-800">
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    <span>{user.tokens} Tokens</span>
                  </div>
                )}
                {isGuest && (
                  <button
                    onClick={() => navigate('/login')}
                    className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:opacity-80 transition-opacity"
                  >
                    Efetuar Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto relative">

          {/* Guest Banner */}
          {isGuest && (
            <div className="bg-gradient-to-r from-primary-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">Modo Visualização</h2>
                  <p className="text-primary-100 max-w-xl">
                    Você está vendo uma prévia da plataforma. Acesso aos quizzes gratuitos está liberado!
                    Crie sua conta para acompanhar seu progresso e métricas detalhadas.
                  </p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-5 py-2.5 bg-white text-primary-900 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg"
                  >
                    Criar Conta Grátis
                  </button>
                </div>
              </div>
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl"></div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsConfig.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group relative overflow-hidden">
                {stat.blur && (
                  <div className="absolute inset-0 backdrop-blur-[2px] bg-white/10 dark:bg-slate-900/10 z-10 flex items-center justify-center">
                    <LockClosedIcon className="w-6 h-6 text-slate-400/80" />
                  </div>
                )}
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
                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Quick Actions & Tips */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions */}
              <section>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  {isGuest ? 'Comece Agora' : 'Ações Rápidas'}
                </h2>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`w-full p-4 rounded-xl border transition-all text-left group relative overflow-hidden ${action.primary
                        ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-500'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-500'
                        }`}
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${action.primary ? 'bg-white/20' : action.bg} ${action.primary ? 'text-white' : action.text}`}>
                            <action.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={`font-bold ${action.primary ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{action.label}</p>
                            <p className={`text-xs ${action.primary ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{action.desc}</p>
                          </div>
                        </div>
                        <ArrowRightOnRectangleIcon className={`w-4 h-4 -rotate-45 transition-transform group-hover:translate-x-1 ${action.primary ? 'text-white/70' : 'text-slate-400'}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Tip Card */}
              <div className="p-5 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-900 border border-indigo-100 dark:border-slate-800 rounded-2xl">
                <div className="flex items-start gap-3">
                  <SparklesIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide mb-1">Dica Pro</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {isGuest
                        ? 'Cadastre-se para acessar simulados completos e receber feedback detalhado de IA.'
                        : 'Revise seus erros nos simulados anteriores. Usuários que revisam erros têm 40% mais chances de aprovação.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center/Right: Feed & Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Suggested Quizzes */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {isGuest ? 'Experimente (Gratuito)' : 'Recomendados para Você'}
                  </h2>
                  <button onClick={() => navigate('/free-quizzes')} className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">Ver todos</button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {suggestedQuizzes.map((quiz) => (
                    <div
                      key={quiz._id}
                      onClick={() => !startingQuizId && startSuggestedQuiz(quiz._id)}
                      className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-all hover:shadow-md relative ${startingQuizId === quiz._id ? 'opacity-70 pointer-events-none' : ''}`}
                    >
                      {startingQuizId === quiz._id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-xl z-20">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          <BoltIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {quiz.categoria}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{quiz.titulo}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" /> {quiz.nivel}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><DocumentTextIcon className="w-3 h-3" /> {quiz.quantidade_questoes} questões</span>
                      </div>
                    </div>
                  ))}
                  {suggestedQuizzes.length === 0 && (
                    <div className="col-span-2 text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-slate-500 text-sm">Carregando sugestões...</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Recent Grid */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Atividades Recentes</h2>
                  {!isGuest && (
                    <button onClick={() => navigate('/profile/quiz-history')} className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">Histórico completo</button>
                  )}
                </div>

                {isGuest ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
                    <ChartBarIcon className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-900 dark:text-white font-semibold mb-1">Seu histórico aparecerá aqui</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                      Acompanhe seu desempenho detalhado em cada quiz realizado ao criar uma conta.
                    </p>
                    <button
                      onClick={() => navigate('/login')}
                      className="text-primary-600 dark:text-primary-400 font-bold text-sm hover:underline"
                    >
                      Começar agora
                    </button>
                  </div>
                ) : recentSimulados.length > 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {recentSimulados.slice(0, 3).map((simulado: any, i: number) => (
                      <div
                        key={simulado.id}
                        onClick={() => navigate(`/profile/quiz-history/${simulado.id}`)}
                        className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${i !== recentSimulados.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs">
                            {(simulado.score ?? 0).toFixed(0)}%
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{simulado.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(simulado.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {simulado.questionsCount} questões
                            </p>
                          </div>
                        </div>
                        <ArrowRightOnRectangleIcon className="w-4 h-4 text-slate-300 -rotate-45" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-sm text-slate-500">Nenhuma atividade recente.</p>
                    <button onClick={() => navigate('/simulados/novo')} className="text-xs text-primary-600 font-semibold mt-1">Começar agora</button>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Onboarding Guide & Help Button */}
      <OnboardingGuide
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <button
        onClick={() => setIsOnboardingOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-full shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group"
        aria-label="Ajuda e Tutorial"
      >
        <QuestionMarkCircleIcon className="w-6 h-6" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap">
          Ajuda
        </span>
      </button>
    </div>
  );
};

export default HomePage;
