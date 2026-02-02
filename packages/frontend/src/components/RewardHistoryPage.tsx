import React, { useState, useEffect } from 'react';
import PageTitle from './PageTitle';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { apiClient } from '../lib/api';
import {
  TicketIcon,
  CalendarIcon,
  TrophyIcon,
  GiftIcon,
  ArrowLeftIcon
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

    if (user) {
      loadRewardHistory();
    }
  }, [user, showToast]);

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'token':
        return <TicketIcon className="w-5 h-5 text-amber-500" />;
      case 'badge':
        return <TrophyIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <GiftIcon className="w-5 h-5 text-green-500" />;
    }
  };

  const getRewardTitle = (reward: Reward) => {
    switch (reward.type) {
      case 'token':
        return `+${reward.amount} Token${reward.amount > 1 ? 's' : ''}`;
      case 'badge':
        return `Nova Conquista`;
      default:
        return `Recompensa`;
    }
  };

  const getRewardDescription = (reason: string) => {
    switch (reason) {
      case 'quiz_completion':
        return 'Completou quizzes gratuitos';
      case 'referral':
        return 'Indicação de amigo';
      case 'achievement':
        return 'Conquista desbloqueada';
      default:
        return reason;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
    <>
      <PageTitle title="Histórico de Recompensas - TreinaVagaAI" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Voltar ao Perfil
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Histórico de Recompensas</h1>
            <p className="text-slate-600 dark:text-slate-400">Veja todas as recompensas que você ganhou</p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg mx-auto mb-3">
                <TicketIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{user?.tokens || 0}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tokens Atuais</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mx-auto mb-3">
                <TrophyIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{rewards.length}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Recompensas Totais</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto mb-3">
                <GiftIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {rewards.filter(r => r.type === 'token').reduce((sum, r) => sum + r.amount, 0)}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tokens Ganhos</p>
            </div>
          </div>
        </div>

        {/* Rewards List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Histórico Detalhado</h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {rewards.length > 0 ? (
              rewards.map((reward, index) => (
                <div key={index} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getRewardIcon(reward.type)}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {getRewardTitle(reward)}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {getRewardDescription(reward.reason)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <CalendarIcon className="w-4 h-4" />
                      {formatDate(reward.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <GiftIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Nenhuma recompensa ainda
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Complete quizzes gratuitos para começar a ganhar recompensas!
                </p>
                <button
                  onClick={() => navigate('/free-quizzes')}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
                >
                  Explorar Quizzes Gratuitos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RewardHistoryPage;