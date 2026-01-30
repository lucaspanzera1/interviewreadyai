import React, { useState } from 'react';
import { apiClient } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import PageTitle from './PageTitle';
import Loading from './Loading';
import {
  TicketIcon,
  SparklesIcon,
  AcademicCapIcon,
  StarIcon,
  ClockIcon,
  BanknotesIcon,
  PlusIcon,
  MinusIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const TokensPage: React.FC = () => {
  const { showToast } = useToast();
  const { user, refreshUser, isLoading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [newBalance, setNewBalance] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Admin functions
  const handleEditBalance = () => {
    setNewBalance(user?.tokens?.toString() || '0');
    setEditing(true);
  };

  const handleSaveBalance = async () => {
    const amount = parseInt(newBalance);
    if (isNaN(amount) || amount < 0) {
      showToast('Valor inválido', 'error');
      return;
    }

    try {
      setIsUpdating(true);
      await apiClient.setUserTokenBalance(amount);
      await refreshUser();
      setEditing(false);
      showToast('Saldo de tokens atualizado com sucesso', 'success');
    } catch (error) {
      showToast('Erro ao atualizar saldo de tokens', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateTokens = async (amount: number, type: 'add' | 'remove') => {
    try {
      setIsUpdating(true);
      if (type === 'add') {
        await apiClient.addTokensToUser(amount);
        showToast(`${amount} tokens adicionados`, 'success');
      } else {
        await apiClient.removeTokensFromUser(amount);
        showToast(`${amount} tokens removidos`, 'success');
      }
      await refreshUser();
    } catch (error) {
      showToast(`Erro ao ${type === 'add' ? 'adicionar' : 'remover'} tokens`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageTitle title="Meus Tokens" />

      {/* Hero Section - Token Balance */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl"></div>

        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold">Saldo Disponível</h2>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="p-3 bg-amber-500/20 rounded-2xl backdrop-blur-sm border border-amber-500/30">
                <TicketIcon className="w-10 h-10 text-amber-400" />
              </div>
              <div>
                <span className="block text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg">
                  {user?.tokens || 0}
                </span>
                <span className="text-sm text-slate-400 font-medium uppercase tracking-widest">Tokens</span>
              </div>
            </div>
            <p className="text-slate-300 max-w-md">
              Use seus tokens para acessar simulados premium, gerar flashcards com IA e desbloquear recursos exclusivos.
            </p>
          </div>

          <div className="shrink-0">
            <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold shadow-lg hover:bg-slate-100 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-amber-500" />
              Resgatar Recompensa
            </button>
          </div>
        </div>
      </div>

      {/* How to Earn Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
            <AcademicCapIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Quizzes Gratuitos</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            A TreinaVaga libera simulados gratuitos diariamente. Aproveite para treinar sem gastar seus tokens.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mb-4">
            <StarIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Desempenho & Avaliação</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Ganhe tokens extras ao completar quizzes com alto desempenho e contribuir avaliando as questões.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-4">
            <ClockIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Limite Diário</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Existe um limite diário de quizzes gratuitos que geram recompensas. Volte todo dia para maximizar seus ganhos!
          </p>
        </div>
      </div>

      {/* Buy Tokens (Coming Soon) */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Loja de Tokens</h2>
          <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider rounded-full">
            Em Breve
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <BanknotesIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Pacotes de Tokens</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mt-2 mb-6">
            Estamos finalizando os melhores pacotes para você impulsionar seus estudos. Em breve você poderá adquirir tokens diretamente por aqui.
          </p>
          <button disabled className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-lg font-medium cursor-not-allowed">
            Aguarde Novidades
          </button>
        </div>
      </div>

      {/* Admin / Dev Tools */}
      {user?.role === 'admin' && (
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-100 dark:border-red-900/30">
            <h3 className="text-sm font-bold text-red-800 dark:text-red-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <PencilSquareIcon className="w-4 h-4" />
              Área do Desenvolvedor (Admin)
            </h3>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Edit Absolute */}
              <div className="flex-1 w-full">
                {!editing ? (
                  <button
                    onClick={handleEditBalance}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    Editar saldo manualmente
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      className="w-32 px-3 py-1.5 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                      autoFocus
                    />
                    <button onClick={handleSaveBalance} disabled={isUpdating} className="p-1.5 text-green-600 hover:bg-green-50 rounded-md">
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditing(false)} disabled={isUpdating} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Add/Remove Actions */}
              <div className="flex gap-3">
                <button onClick={() => handleUpdateTokens(10, 'add')} disabled={isUpdating} className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200">
                  <PlusIcon className="w-3 h-3" /> 10
                </button>
                <button onClick={() => handleUpdateTokens(50, 'add')} disabled={isUpdating} className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200">
                  <PlusIcon className="w-3 h-3" /> 50
                </button>
                <div className="w-px h-6 bg-red-200 dark:bg-red-800/50 mx-2"></div>
                <button onClick={() => handleUpdateTokens(10, 'remove')} disabled={isUpdating} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200">
                  <MinusIcon className="w-3 h-3" /> 10
                </button>
                <button onClick={() => handleUpdateTokens(50, 'remove')} disabled={isUpdating} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200">
                  <MinusIcon className="w-3 h-3" /> 50
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokensPage;