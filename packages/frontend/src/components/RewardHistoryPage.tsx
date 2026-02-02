import React, { useState, useEffect } from 'react';
import PageTitle from './PageTitle';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { apiClient } from '../lib/api';
import {
  TicketIcon,
  TrophyIcon,
  GiftIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface Reward {
  type: string;
  amount: number;
  reason: string;
  createdAt: string;
}

const RewardHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0
  });

  useEffect(() => {
    const loadRewardHistory = async () => {
      try {
        const data = await apiClient.getRewardHistory();
        setRewards(data || []);
      } catch (error) {
        console.error('Erro ao carregar histórico de recompensas:', error);
        showToast('Erro ao carregar histórico de recompensas', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    const loadStats = async () => {
      try {
        const data = await apiClient.getUserStats();
        if (data) {
          setStats({
            totalAttempts: data.totalAttempts || 0,
            averageScore: data.averageScore || 0
          });
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    };

    if (user) {
      loadRewardHistory();
      loadStats();
    }
  }, [user, showToast]);

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'token':
        return <TicketIcon className="w-5 h-5 text-amber-500" />;
      case 'badge':
        return <TrophyIcon className="w-5 h-5 text-purple-500" />;
      case 'plan':
      case 'role':
        return <ShieldCheckIcon className="w-5 h-5 text-primary-500" />;
      case 'package':
        return <ShoppingBagIcon className="w-5 h-5 text-rose-500" />;
      default:
        return <GiftIcon className="w-5 h-5 text-green-500" />;
    }
  };

  const getRewardTitle = (reward: Reward) => {
    if (reward.type === 'package' && reward.reason.includes(':')) {
      return reward.reason.split(':')[1];
    }

    switch (reward.type) {
      case 'token':
        return `+${reward.amount} Token${reward.amount > 1 ? 's' : ''}`;
      case 'badge':
        return `Nova Conquista`;
      case 'plan':
      case 'role':
        return `Plano Ativado`;
      case 'package':
        return `Pacote Adquirido`;
      default:
        return `Recompensa`;
    }
  };

  const getRewardDescription = (reward: Reward) => {
    if (reward.type === 'package') {
      return `Upgrade de conta + ${reward.amount} tokens`;
    }

    switch (reward.reason) {
      case 'quiz_completion':
        return 'Completou quizzes gratuitos';
      case 'referral':
        return 'Indicação de amigo';
      case 'achievement':
        return 'Conquista desbloqueada';
      case 'package_redemption':
        return 'Resgate de pacote promocional';
      default:
        return reward.reason;
    }
  };



  if (isLoading) {
    return (
      <>
        <PageTitle title="Histórico de Recompensas - TreinaVagaAI" />
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-16 py-6 sm:py-8 pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 border border-slate-100 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 text-slate-400" />
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Minha Jornada</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Recompensas</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-sm sm:text-base">Seu progresso e conquistas acumuladas.</p>
        </div>

        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-8 pt-6 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 md:border-none">
          <div className="text-left md:text-right">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ganhos Totais</span>
            <div className="flex items-center md:justify-end gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                {rewards.filter(r => r.type === 'token').reduce((sum, r) => sum + r.amount, 0)}
              </span>
              <TicketIcon className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div className="text-right">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Conquistas</span>
            <div className="flex items-center justify-end gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                {rewards.length}
              </span>
              <TrophyIcon className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-4">
        <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Meta Semanal</h3>
              <p className="text-xs text-slate-500 font-medium">Continue completando simulados para desbloquear mais bônus.</p>
            </div>

            <div className="flex-1 max-w-md space-y-3">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>{stats.totalAttempts % 5}/5 para o próximo bônus</span>
                <span className="text-primary-500">{(stats.totalAttempts % 5) * 20}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(stats.totalAttempts % 5) * 20}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-8 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Linha do Tempo</h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rewards.length} Eventos</span>
        </div>

        <div className="space-y-4">
          {rewards.length > 0 ? (
            rewards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((reward, index) => (
              <div
                key={index}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 gap-4 sm:gap-6"
              >
                <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                  <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 transition-transform group-hover:scale-105 group-hover:-rotate-3">
                    {getRewardIcon(reward.type)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize leading-none mb-2">
                      {getRewardTitle(reward).toLowerCase()}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium lowercase first-letter:uppercase leading-relaxed">
                      {getRewardDescription(reward).toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="flex sm:block items-center justify-between w-full sm:w-auto text-right pl-[4rem] sm:pl-0">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(reward.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </span>
                  <span className="block text-[10px] text-slate-300 dark:text-slate-600 font-medium uppercase mt-0 sm:mt-1">
                    {new Date(reward.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-dashed border-slate-200 dark:border-slate-700">
                <GiftIcon className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sem registros ainda</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Seus ganhos aparecerão aqui assim que completar simulados.</p>
              </div>
              <button
                onClick={() => navigate('/free-quizzes')}
                className="inline-flex h-10 items-center px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xs font-bold hover:scale-105 transition-all mt-4"
              >
                COMEÇAR AGORA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardHistoryPage;