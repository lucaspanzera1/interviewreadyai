import React, { useState, useEffect } from 'react';
import PageTitle from './PageTitle';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './BottomNav';
import { useSidebar } from '../contexts/SidebarContext';
import { apiClient } from '../lib/api';
import {
  SparklesIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  PlayIcon,
  ArrowRightOnRectangleIcon,
  BoltIcon,
  LockClosedIcon,
  TrophyIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  FireIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import OnboardingGuide from './OnboardingGuide';
import ActivityHeatmap from './ActivityHeatmap';
import { getNicheIcon } from '../utils/nicheIcons';

const HomePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();
  const [userStats, setUserStats] = useState<any>(null);
  const [suggestedQuizzes, setSuggestedQuizzes] = useState<any[]>([]);
  const [startingQuizId, setStartingQuizId] = useState<string | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Initial Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const [activityData, setActivityData] = useState<{ date: string; count: number }[]>([]);

  // Load data
  useEffect(() => {
    if (user) {
      loadUserStats();
      loadActivity();
    }
    loadSuggestedQuizzes();
  }, [user]);

  const loadActivity = async () => {
    try {
      // Fetch up to 1000 last attempts for the heatmap
      const result = await apiClient.getUserAttempts(1, 1000);
      if (result && result.attempts) {
        const counts: Record<string, number> = {};
        result.attempts.forEach((a: any) => {
          const date = new Date(a.createdAt).toISOString().split('T')[0];
          counts[date] = (counts[date] || 0) + 1;
        });

        const data = Object.entries(counts).map(([date, count]) => ({ date, count }));
        setActivityData(data);
      }
    } catch (error) {
      console.error('Error loading activity:', error);
    }
  };

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
    // Demo/Preview Stats for Guests (Locked State)
    { label: 'Questões Feitas', value: '428', icon: DocumentTextIcon, color: 'indigo', blur: true },
    { label: 'Taxa de Acerto', value: '76%', icon: CheckCircleIcon, color: 'green', blur: true },
    { label: 'Sequência', value: '12 dias', icon: FireIcon, color: 'amber', blur: true },
    { label: 'Nível', value: 'Sênior', icon: TrophyIcon, color: 'primary', blur: true },
  ] : userStats ? [
    // Real User Stats
    { label: 'Simulados', value: (userStats.totalAttempts ?? 0).toString(), icon: DocumentTextIcon, color: 'indigo', blur: false },
    { label: 'Taxa de Acerto', value: `${((userStats.averageScore ?? 0) * 10).toFixed(0)}%`, icon: CheckCircleIcon, color: 'green', blur: false },
    { label: 'Tempo Médio', value: `${Math.floor((userStats.averageTime ?? 0) / 60)}min`, icon: ClockIcon, color: 'amber', blur: false },
    { label: 'Evolução', value: `${(userStats.evolution ?? 0) >= 0 ? '+' : ''}${(userStats.evolution ?? 0).toFixed(0)}%`, icon: ArrowTrendingUpIcon, color: 'primary', blur: false },
  ] : [
    // Empty User Stats
    { label: 'Simulados', value: '0', icon: DocumentTextIcon, color: 'indigo', blur: false },
    { label: 'Taxa de Acerto', value: '0%', icon: CheckCircleIcon, color: 'green', blur: false },
    { label: 'Tempo Médio', value: '0min', icon: ClockIcon, color: 'amber', blur: false },
    { label: 'Evolução', value: '0%', icon: ArrowTrendingUpIcon, color: 'primary', blur: false },
  ];

  const quickActions = isGuest ? [
    {
      label: 'Criar Conta Grátis',
      desc: 'Comece agora e salve seu progresso',
      icon: SparklesIcon,
      action: () => navigate('/login'),
      primary: true,
      bg: 'bg-primary-600',
      text: 'text-white',
      animate: true
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
      label: 'Ver Planos Premium',
      desc: 'Desbloqueie todo o potencial',
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
      action: () => navigate('/create-quiz'),
      primary: true,
      bg: 'bg-primary-600',
      text: 'text-white'
    },
    {
      label: 'Simulação Entrevista',
      desc: 'Pratique para entrevistas',
      icon: ChatBubbleLeftRightIcon,
      action: () => navigate('/create-interview'),
      primary: false,
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Continuar',
      desc: 'Retomar último quiz',
      icon: PlayIcon,
      action: () => navigate('/my-quizzes'),
      primary: false,
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      label: 'Evolução',
      desc: 'Acompanhe seu progresso',
      icon: ArrowTrendingUpIcon,
      action: () => navigate('/desempenho'),
      primary: false,
      bg: 'bg-primary-50 dark:bg-primary-900/20',
      text: 'text-primary-600 dark:text-primary-400'
    },
    {
      label: 'Ranking',
      desc: 'Em breve',
      icon: TrophyIcon,
      action: () => { },
      primary: false,
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-400 dark:text-slate-500',
      disabled: true
    },
  ];

  const recentSimulados = userStats?.recentSimulados || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-200">
      <PageTitle title="Início - TreinaVagaAI" />
      <Sidebar />

      <main className={`min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
          <div className="px-4 lg:px-8 py-3 lg:py-4">
            <div className="flex items-center justify-between">
              <div>
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
        {/* Content */}
        <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto relative">

          {/* Guest Hero Section */}
          {isGuest && (
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-950 border border-slate-800 p-8 lg:p-12 mb-10 shadow-2xl">
              {/* Abstract Background */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-primary-500/20">
                    <SparklesIcon className="w-3 h-3" />
                    <span>Para todas as carreiras</span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
                    <span className="text-slate-900 dark:text-white">Conquiste sua vaga em </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-400">
                      qualquer área
                    </span>
                  </h1>

                  <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-xl mx-auto md:mx-0">
                    Tech, Saúde, Vendas, Direito, Engenharia... O TreinaVaga usa IA para criar simulados personalizados para <b>sua</b> realidade, qualquer que seja ela.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <button
                      onClick={() => navigate('/login')}
                      className="group relative px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-900/50 hover:shadow-primary-600/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Começar Agora
                        <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                    <button
                      onClick={() => setIsVideoModalOpen(true)}
                      className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-lg backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <PlayIcon className="w-5 h-5 text-primary-400" />
                      <span>Ver Demonstração</span>
                    </button>
                  </div>

                  <div className="mt-8 flex items-center justify-center md:justify-start gap-4 text-sm text-slate-500">
                    <div className="flex -space-x-2">
                      {[
                        { niche: 'juridico', title: 'Direito' },
                        { niche: 'saude', title: 'Saúde' },
                        { niche: 'tecnologia', title: 'Tech' },
                        { niche: 'vendas', title: 'Vendas' },
                        { niche: 'engenharia', title: 'Engenharia' },
                      ].map((item, i) => (
                        <div key={i} title={item.title} className={`w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-slate-300 shadow-sm relative z-[${10 - i}] hover:z-20 hover:scale-110 transition-all`}>
                          {getNicheIcon(item.niche, "w-5 h-5")}
                        </div>
                      ))}
                    </div>
                    <p>Junte-se a profissionais de todas as áreas</p>
                  </div>
                </div>

                {/* Visual / Card Prevention */}
                <div className="w-full md:w-5/12 hidden md:block relative">
                  <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center">
                          <TrophyIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-white font-bold">Candidato Preparado</div>
                          <div className="text-xs text-slate-500">Pronto para o desafio</div>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded font-bold">100% Pronto</div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 bg-slate-800 rounded w-3/4"></div>
                      <div className="h-2 bg-slate-800 rounded w-full"></div>
                      <div className="h-2 bg-slate-800 rounded w-5/6"></div>
                    </div>
                    <div className="mt-6 flex gap-2">
                      <div className="flex-1 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">Iniciar Simulado</div>
                    </div>

                    {/* Floating Badge */}
                    <div className="absolute -bottom-4 -right-4 bg-slate-800 border border-slate-700 p-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce delay-700">
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                      <span className="text-white font-bold text-sm">Aprovado!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guest Feature Preview */}
          {isGuest && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                O que você encontrará aqui
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Feature 1: Simulados IA */}
                <div className="group bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-600 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BoltIcon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Simulados com IA
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Gere quizzes personalizados baseados na descrição da vaga em segundos. Prepare-se para o que realmente importa.
                  </p>
                </div>

                {/* Feature 2: Interview Simulator */}
                <div className="group bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-600 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ChatBubbleLeftRightIcon className="w-7 h-7 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Simulação de Entrevista
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Pratique com uma IA que simula recrutadores reais. Receba feedback instantâneo sobre suas respostas.
                  </p>
                </div>

                {/* Feature 3: Flashcards */}
                <div className="group bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-600 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <DocumentTextIcon className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Flashcards SRS
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Memorização de longo prazo com repetição espaçada. Nunca mais esqueça conceitos importantes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {statsConfig.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 lg:p-5 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group relative overflow-hidden">
                {stat.blur && (
                  <div className="absolute inset-0 backdrop-blur-[2px] bg-white/10 dark:bg-slate-900/10 z-10 flex items-center justify-center">
                    <LockClosedIcon className="w-6 h-6 text-slate-400/80" />
                  </div>
                )}
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate pr-2">{stat.label}</p>
                  <div className={`p-1.5 lg:p-2 rounded-lg shrink-0 ${stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
                    stat.color === 'green' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                      stat.color === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                        'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    }`}>
                    <stat.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                </div>
                <p className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate" title={stat.value}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column: Quick Actions & Tips */}
            <div className="lg:col-span-1 space-y-6 min-w-0">
              {/* Quick Actions */}
              <section>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  {isGuest ? 'Comece Agora' : 'Ações Rápidas'}
                </h2>
                <div className="space-y-3">
                  {quickActions.map((action, index) => {
                    const isDisabled = (action as any).disabled;
                    return (
                      <button
                        key={index}
                        onClick={action.action}
                        disabled={isDisabled}
                        className={`w-full p-4 rounded-xl border transition-all text-left group relative overflow-hidden ${isDisabled
                          ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          : action.primary
                            ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-500'
                          } ${(action as any).animate ? 'animate-pulse' : ''}`}
                      >
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`p-2 rounded-lg shrink-0 ${action.primary ? 'bg-white/20' : action.bg} ${action.primary ? 'text-white' : action.text}`}>
                              <action.icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className={`font-bold truncate ${action.primary ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{action.label}</p>
                              <p className={`text-xs truncate ${action.primary ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{action.desc}</p>
                            </div>
                          </div>
                          {!isDisabled && (
                            <ArrowRightOnRectangleIcon className={`w-4 h-4 shrink-0 -rotate-45 transition-transform group-hover:translate-x-1 ${action.primary ? 'text-white/70' : 'text-slate-400'}`} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="p-5 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900 border border-amber-200 dark:border-amber-800 rounded-2xl relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-amber-400/20 rounded-full blur-xl"></div>
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400 shrink-0">
                    <SparklesIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-400 uppercase tracking-widest mb-2">
                      {isGuest ? 'Dica de Carreira' : 'Dica Pro'}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {isGuest
                        ? 'Recrutadores gastam em média 6 segundos por currículo. Seus resultados nos simulados geram um portfólio verificável que chama a atenção.'
                        : 'Revise seus erros nos simulados anteriores. Usuários que revisam erros têm 40% mais chances de aprovação.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center/Right: Feed & Content */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8 min-w-0">
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
                    <div className="col-span-1 sm:col-span-2 text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
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
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 group">

                    {/* Fake Background Content (Blurred) */}
                    <div className="p-6 opacity-30 blur-[2px] filter grayscale-[30%] select-none pointer-events-none transition-all duration-500 group-hover:blur-[3px] group-hover:scale-[1.02]">
                      {/* Mock Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="space-y-2">
                          <div className="h-5 w-32 bg-slate-300 dark:bg-slate-700 rounded-md"></div>
                          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                        </div>
                        <div className="h-8 w-24 bg-primary-100 dark:bg-primary-900/30 rounded-full"></div>
                      </div>

                      {/* Mock Stats Row */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-full mb-2"></div>
                          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-2"></div>
                          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                        </div>
                      </div>

                      {/* Mock Chart Area */}
                      <div className="h-32 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-end justify-between gap-2">
                        {[40, 70, 45, 90, 60, 80, 50].map(h => (
                          <div key={h} className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-sm" style={{ height: `${h}%` }}></div>
                        ))}
                      </div>
                    </div>

                    {/* Lock Overlay */}
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-white/40 dark:bg-slate-950/50 backdrop-blur-[1px]">
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-center max-w-sm w-full transform transition-all duration-300 hover:scale-105">
                        <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mx-auto mb-3">
                          <LockClosedIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                          Painel de Evolução
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                          Acesse gráficos detalhados, histórico de erros e receba insights para acelerar sua aprovação.
                        </p>
                        <button
                          onClick={() => navigate('/login')}
                          className="w-full py-3 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl transition-all shadow-lg text-sm"
                        >
                          Criar Conta Grátis
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-4 overflow-hidden w-full max-w-full">
                      <ActivityHeatmap
                        data={activityData}
                        totalActivities={activityData.reduce((acc, curr) => acc + curr.count, 0)}
                        startDate={new Date(2026, 1, 1)}
                        endDate={new Date(2027, 1, 1)}
                      />
                    </div>
                    {recentSimulados.length > 0 && (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        {recentSimulados.slice(0, 3).map((simulado: any, i: number) => (
                          <div
                            key={simulado.id}
                            onClick={() => navigate(`/profile/quiz-history/${simulado.id}`)}
                            className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${i !== recentSimulados.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                          >
                            <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                              <div className="w-10 h-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs">
                                {(simulado.score ?? 0).toFixed(0)}%
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{simulado.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {new Date(simulado.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {simulado.questionsCount} questões
                                </p>
                              </div>
                            </div>
                            <ArrowRightOnRectangleIcon className="w-4 h-4 text-slate-300 -rotate-45 shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>
          </div>

          {/* Activity Heatmap Section */}

        </div>
      </main>

      {/* Onboarding Guide & Help Button */}
      <OnboardingGuide
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <button
        onClick={() => setIsOnboardingOpen(true)}
        className="fixed bottom-24 lg:bottom-6 right-6 z-40 p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-full shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group"
        aria-label="Ajuda e Tutorial"
      >
        <QuestionMarkCircleIcon className="w-6 h-6" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap">
          Ajuda
        </span>
      </button>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="TreinaVaga Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setIsVideoModalOpen(false)}></div>
        </div>
      )}
    </div>
  );
}; // End of HomePage Component

export default HomePage;
