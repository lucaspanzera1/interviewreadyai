import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import { apiClient, TokenPackage } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

import Loading from './Loading';
import PaymentLoadingModal from './PaymentLoadingModal';
import { useTranslation, Trans } from 'react-i18next';
import {
  TicketIcon,
  SparklesIcon,
  QuestionMarkCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const TokensPage: React.FC = () => {
  const { showToast } = useToast();
  const { user, refreshUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('tokens');

  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const [showPaymentLoading, setShowPaymentLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, [i18n.language]);

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
      const errorMessage = error?.response?.data?.message || t('errors.redeemError');
      showToast(errorMessage, 'error');
    } finally {
      setRedeeming(null);
    }
  };

  const handlePayForPackage = async (packageId: string) => {
    // Verificar se o usuário tem os dados necessários para pagamento
    if (!user?.cellphone || !user?.taxid) {
      showToast(t('errors.completePhoneCPF'), 'error');
      navigate('/profile');
      return;
    }

    try {
      setPaying(packageId);
      setShowPaymentLoading(true);

      const result = await apiClient.payForPlan(packageId);

      if (!result.checkoutUrl) {
        console.error('❌ Checkout URL está vazia!');
        showToast(t('errors.checkoutURLError'), 'error');
        setShowPaymentLoading(false);
        setPaying(null);
        return;
      }

      // Adicionar um pequeno delay para garantir que o usuário veja o loading
      await new Promise(resolve => setTimeout(resolve, 800));

      // Redirecionar para o checkout da AbacatePay
      try {
        window.location.assign(result.checkoutUrl);
      } catch (redirectError) {
        console.error('❌ Erro no redirecionamento assign():', redirectError);
        // Fallback para href
        window.location.href = result.checkoutUrl;
      }
    } catch (error: any) {
      console.error('❌ Erro completo no pagamento:', error);
      const errorMessage = error?.response?.data?.message || t('errors.paymentError');
      console.error('📝 Mensagem de erro:', errorMessage);
      showToast(errorMessage, 'error');
      setShowPaymentLoading(false);
      setPaying(null);
    }
  };

  // Admin functions


  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16 py-6 sm:py-8 pb-32 sm:pb-8">
      <PageTitle title={t('pageTitle')} />

      {/* Payment Loading Modal */}
      <PaymentLoadingModal isOpen={showPaymentLoading} />
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 px-4 lg:px-8 py-4 mb-8 transition-all duration-300">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('subtitle')}</p>
          </div>

          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-800/50">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{t('balance')}</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                {user?.tokens || 0}
              </span>
              <TicketIcon className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>
      </header>

      {/* Simplified Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
        {[
          { title: t('infoGrid.freeQuizzes'), desc: t('infoGrid.freeQuizzesDesc') },
          { title: t('infoGrid.highPerformance'), desc: t('infoGrid.highPerformanceDesc') },
          { title: t('infoGrid.dailyStreak'), desc: t('infoGrid.dailyStreakDesc') }
        ].map((item, i) => (
          <div key={i} className="bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
            <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Notice Badge */}
      <div className="px-4">
        {(!user?.cellphone || !user?.taxid) && (
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 sm:p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>

            <div className="h-12 w-12 flex-shrink-0 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center border border-amber-200 dark:border-amber-700/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <div className="relative flex-1">
              <h4 className="text-base font-bold text-amber-900 dark:text-amber-100 mb-1">
                {t('completeProfile.title')}
              </h4>
              <p className="text-sm text-amber-800 dark:text-amber-200/80 font-medium leading-relaxed mb-3">
                {t('completeProfile.description')}
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="inline-flex items-center px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
              >
                {t('completeProfile.button')}
              </button>
            </div>
          </div>
        )}

        <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>

          <div className="h-12 w-12 flex-shrink-0 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center border border-amber-200 dark:border-amber-700/50">
            <SparklesIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>

          <div className="relative">
            <h4 className="text-base font-bold text-amber-900 dark:text-amber-100 mb-1">
              {t('boostStudies')}
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200/80 font-medium leading-relaxed">
              <Trans i18nKey="boostStudiesDesc" t={t}
                components={{ strong: <strong className="text-amber-700 dark:text-amber-300" /> }}
              />
            </p>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div className="space-y-8 px-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('suggestedPackages')}</h2>

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
                {t('inDevelopment')}
              </h3>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                {t('betaMessage')}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => {
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
                        <span className="text-slate-400 font-bold text-sm">{t('tokensLabel')}</span>
                      </div>

                      {pkg.value && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            R$ {pkg.value.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">{t('perMonth')}</span>
                        </div>
                      )}

                      <ul className="space-y-2">
                        {pkg.features?.map((f, i) => (
                          <li key={i} className="text-xs text-slate-500 font-medium flex gap-2">
                            <span className="text-green-500">/</span> {f}
                          </li>
                        ))}
                        {pkg.validityDays && (
                          <li className="text-xs text-slate-500 font-medium flex gap-2">
                            <span className="text-blue-500">/</span> {t('days', { count: pkg.validityDays })}
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Action Button - Minimalist */}
                    <button
                      onClick={() => pkg.value ? handlePayForPackage(pkg.id) : handleRedeemPackage(pkg.id)}
                      disabled={(pkg.value ? paying === pkg.id : redeeming === pkg.id) || hasActivePlan}
                      className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${hasActivePlan
                        ? 'bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : (pkg.value ? paying === pkg.id : redeeming === pkg.id)
                          ? 'animate-pulse bg-slate-100 text-slate-400'
                          : pkg.value
                            ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20'
                            : isPro
                              ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-750'
                        }`}
                    >
                      {(pkg.value ? paying === pkg.id : redeeming === pkg.id) ? '...' : hasActivePlan ? t('active') : pkg.value ? t('buyNow') : t('startNow')}
                    </button>
                  </div>
                  {hasActivePlan && user?.roleExpiresAt && (
                    <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
                      {t('expiresIn', { date: new Date(user.roleExpiresAt).toLocaleDateString(i18n.language) })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Help/Support Badge */}
      <div className="mt-8 mb-8 flex justify-center px-4">
        {!showHelp ? (
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shadow-sm"
          >
            <QuestionMarkCircleIcon className="w-5 h-5" />
            <span>{t('faq.title')}</span>
          </button>
        ) : (
          <div className="relative w-full p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 animate-fade-in-up">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 w-fit h-fit">
              <QuestionMarkCircleIcon className="w-6 h-6" />
            </div>
            <div className="flex-1 pr-8">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                {t('faq.howItWorks')}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                {t('faq.explanation')}
              </p>
              <a
                href="https://wa.me/5531997313160"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-semibold hover:underline inline-flex items-center gap-2"
              >
                {t('faq.supportLink')}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Admin Section - Ultra Hidden style */}

    </div>
  );
};

export default TokensPage;