import React, { useState, useEffect } from 'react';
import { apiClient, TokenPackage } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

import Loading from './Loading';
import {
  TicketIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const TokensPage: React.FC = () => {
  const { showToast } = useToast();
  const { user, refreshUser, isLoading } = useAuth();


  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoadingPackages(true);
      const data = await apiClient.getAvailableTokenPackages();
      setPackages(data);
    } catch (error) {
      console.error('Erro ao buscar pacotes:', error);
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleRedeemPackage = async (packageId: string) => {
    try {
      setRedeeming(packageId);
      const result = await apiClient.redeemTokenPackage(packageId);
      showToast(result.message, 'success');
      await refreshUser();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erro ao resgatar pacote';
      showToast(errorMessage, 'error');
    } finally {
      setRedeeming(null);
    }
  };

  // Admin functions


  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16 py-6 sm:py-8 pb-32 sm:pb-8">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 px-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Créditos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-sm sm:text-base">Gerencie seu saldo e desbloqueie recursos.</p>
        </div>

        <div className="w-full md:w-auto flex flex-row items-center justify-between md:justify-end gap-6 pb-2 pt-6 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 md:border-none">
          <div className="text-left md:text-right">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Saldo Atual</span>
            <div className="flex items-center md:justify-end gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                {user?.tokens || 0}
              </span>
              <TicketIcon className="w-5 h-5 text-amber-500" />
            </div>
          </div>

        </div>
      </div>

      {/* Simplified Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
        {[
          { title: "Simulados Gratuitos", desc: "Liberados diariamente" },
          { title: "Alta Performance", desc: "Bônus por desempenho" },
          { title: "Sequência Diária", desc: "Retorne e ganhe mais" }
        ].map((item, i) => (
          <div key={i} className="bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
            <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Notice Badge */}
      <div className="px-4">
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>

          <div className="h-12 w-12 flex-shrink-0 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center border border-amber-200 dark:border-amber-700/50">
            <SparklesIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>

          <div className="relative">
            <h4 className="text-base font-bold text-amber-900 dark:text-amber-100 mb-1">
              Turbine seus estudos
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200/80 font-medium leading-relaxed">
              Você pode comprar tokens direto nesta página ou ganhar <strong className="text-amber-700 dark:text-amber-300">gratuitamente</strong> ao completar 5 quizzes.
            </p>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div className="space-y-8 px-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pacotes Sugeridos</h2>

        {loadingPackages ? (
          <div className="flex justify-center py-12"><Loading /></div>
        ) : packages.length === 0 ? (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 mb-6 flex items-start gap-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200">
                Em Desenvolvimento
              </h3>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                Estamos na versão beta, essa feature vai ser liberada no lançamento da 1.0.0.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => {
              const isRedeeming = redeeming === pkg.id;
              const hasActivePlan = !!(user?.role === pkg.role.name && user?.roleExpiresAt && new Date(user.roleExpiresAt) > new Date());
              const isPro = pkg.role.name.toLowerCase().includes('pro');

              return (
                <div key={pkg.id} className="flex flex-col group">
                  <div className={`flex-1 bg-white dark:bg-slate-900 rounded-[2rem] border-2 transition-all duration-300 flex flex-col p-6 sm:p-8 ${isPro ? 'border-primary-500 shadow-xl shadow-primary-500/5' : 'border-slate-100 dark:border-slate-800'
                    }`}>
                    {/* Minimalist Header */}
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{pkg.name}</h3>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                          {pkg.role.name}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                        <TicketIcon className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>

                    {/* Features - Minimalist style */}
                    <div className="flex-1 space-y-4 mb-10">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                          {pkg.tokenAmount}
                        </span>
                        <span className="text-slate-400 font-bold text-sm">Tokens</span>
                      </div>

                      <ul className="space-y-2">
                        {pkg.features?.map((f, i) => (
                          <li key={i} className="text-xs text-slate-500 font-medium flex gap-2">
                            <span className="text-green-500">/</span> {f}
                          </li>
                        ))}
                        {pkg.validityDays && (
                          <li className="text-xs text-slate-500 font-medium flex gap-2">
                            <span className="text-blue-500">/</span> {pkg.validityDays} dias
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Action Button - Minimalist */}
                    <button
                      onClick={() => handleRedeemPackage(pkg.id)}
                      disabled={isRedeeming || hasActivePlan}
                      className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${hasActivePlan
                        ? 'bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : isRedeeming
                          ? 'animate-pulse bg-slate-100 text-slate-400'
                          : isPro
                            ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-750'
                        }`}
                    >
                      {isRedeeming ? '...' : hasActivePlan ? 'Ativo' : 'Começar Agora'}
                    </button>
                  </div>
                  {hasActivePlan && user?.roleExpiresAt && (
                    <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
                      Expira em {new Date(user.roleExpiresAt).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin Section - Ultra Hidden style */}

    </div>
  );
};

export default TokensPage;