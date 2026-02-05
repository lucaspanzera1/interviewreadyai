import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageTitle from './PageTitle';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';
import {
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    ArrowRightIcon,
    TicketIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

const OrderConfirmationPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, refreshUser } = useAuth();
    const [isRefreshing, setIsRefreshing] = useState(true);
    const [isPolling, setIsPolling] = useState(false);
    const [hasDetectedChange, setHasDetectedChange] = useState(false);
    const pollingIntervalRef = useRef<number | null>(null);
    const pollingTimeoutRef = useRef<number | null>(null);
    const initialTokensRef = useRef<number | undefined>(undefined);
    const initialRoleRef = useRef<string | undefined>(undefined);

    // Parâmetros da URL que podem vir do AbacatePay
    const status = searchParams.get('status') || 'pending';
    const billingId = searchParams.get('billingId');

    // Limpar intervalos ao desmontar
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
            if (pollingTimeoutRef.current) {
                clearTimeout(pollingTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Atualizar os dados do usuário após retornar do pagamento
        const refresh = async () => {
            try {
                await refreshUser();
            } catch (error) {
                console.error('Erro ao atualizar dados do usuário:', error);
            } finally {
                setIsRefreshing(false);
            }
        };

        refresh();
    }, [refreshUser]);

    // Salvar valores iniciais após o primeiro refresh
    useEffect(() => {
        if (!isRefreshing && initialTokensRef.current === undefined) {
            initialTokensRef.current = user?.tokens || 0;
            initialRoleRef.current = user?.role || 'client';
        }
    }, [isRefreshing, user?.tokens, user?.role]);

    // Iniciar polling para aguardar atualização do webhook
    useEffect(() => {
        // Verificar se os dados já foram atualizados
        const dataAlreadyUpdated =
            (user?.tokens && user.tokens > 0 && user.tokens !== initialTokensRef.current) ||
            (user?.role && user.role !== 'client' && user.role !== initialRoleRef.current);

        // Fazer polling se:
        // 1. Não está em refresh inicial
        // 2. Dados ainda não foram atualizados
        // 3. Mudança ainda não foi detectada
        const shouldPoll = !isRefreshing && !dataAlreadyUpdated && !hasDetectedChange;

        if (shouldPoll) {
            setIsPolling(true);

            // Polling a cada 3 segundos
            pollingIntervalRef.current = setInterval(async () => {
                try {
                    await refreshUser();

                    // Verificar se houve mudança nos tokens ou role
                    const tokensChanged = user?.tokens !== initialTokensRef.current;
                    const roleChanged = user?.role !== initialRoleRef.current;

                    // Considerar atualizado se tokens > 0 OU role mudou
                    const hasUpdate =
                        (user?.tokens && user.tokens > 0 && tokensChanged) ||
                        (user?.role && user.role !== 'client' && roleChanged);

                    if (hasUpdate) {
                        setHasDetectedChange(true);
                        setIsPolling(false);

                        // Parar polling
                        if (pollingIntervalRef.current) {
                            clearInterval(pollingIntervalRef.current);
                        }
                        if (pollingTimeoutRef.current) {
                            clearTimeout(pollingTimeoutRef.current);
                        }
                    }
                } catch (error) {
                    console.error('Erro ao fazer polling:', error);
                }
            }, 3000);

            // Timeout de 2 minutos para parar o polling automaticamente
            pollingTimeoutRef.current = setTimeout(() => {
                setIsPolling(false);
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                }
            }, 120000); // 2 minutos
        } else if (dataAlreadyUpdated) {
            // No action needed, data is already updated
        }

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
            if (pollingTimeoutRef.current) {
                clearTimeout(pollingTimeoutRef.current);
            }
        };
    }, [isRefreshing, hasDetectedChange, refreshUser, user?.tokens, user?.role]);

    const getStatusConfig = () => {
        // Verificar se os dados foram realmente atualizados (pagamento confirmado)
        const isConfirmed =
            (user?.tokens && user.tokens > 0 && user.tokens !== initialTokensRef.current) ||
            (user?.role && user.role !== 'client' && user.role !== initialRoleRef.current) ||
            hasDetectedChange;

        // Se foi confirmado, mostrar verde independente do status da URL
        if (isConfirmed) {
            return {
                icon: CheckCircleIcon,
                iconColor: 'text-green-500',
                bgColor: 'bg-green-50 dark:bg-green-900/20',
                borderColor: 'border-green-200 dark:border-green-800',
                title: 'Pagamento Confirmado! 🎉',
                description: 'Seu plano foi ativado com sucesso. Aproveite todos os benefícios!',
            };
        }

        // Status específicos da URL (apenas se não foi confirmado ainda)
        switch (status.toLowerCase()) {
            case 'cancelled':
            case 'failed':
                return {
                    icon: XCircleIcon,
                    iconColor: 'text-red-500',
                    bgColor: 'bg-red-50 dark:bg-red-900/20',
                    borderColor: 'border-red-200 dark:border-red-800',
                    title: 'Pagamento Não Concluído',
                    description: 'O pagamento não foi concluído. Você pode tentar novamente quando quiser.',
                };
            default:
                // Padrão: Azul (aguardando confirmação)
                return {
                    icon: ClockIcon,
                    iconColor: 'text-blue-500',
                    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                    borderColor: 'border-blue-200 dark:border-blue-800',
                    title: 'Aguardando Confirmação',
                    description: 'Estamos processando seu pagamento. Aguarde alguns instantes...',
                };
        }
    };

    if (isRefreshing) {
        return <Loading />;
    }

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
            <PageTitle title="Confirmação do Pedido - TreinaVagaAI" />

            <div className="max-w-2xl mx-auto">
                {/* Status Card */}
                <div
                    className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2 rounded-3xl p-8 mb-8 text-center transition-all duration-700 ${hasDetectedChange ? 'animate-[wiggle_0.5s_ease-in-out]' : ''
                        }`}
                    style={{
                        animation: hasDetectedChange ? 'statusChange 0.8s ease-in-out' : 'none'
                    }}
                >
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className={`w-24 h-24 rounded-full ${statusConfig.bgColor} flex items-center justify-center border-4 ${statusConfig.borderColor} transition-all duration-500 ${hasDetectedChange ? 'scale-110' : 'scale-100'
                                }`}>
                                <StatusIcon className={`w-12 h-12 ${statusConfig.iconColor} transition-all duration-500`} />
                            </div>
                            <div className={`absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 transition-all duration-500 ${hasDetectedChange ? 'scale-125 animate-bounce' : ''
                                }`}>
                                <span className="text-xl">{hasDetectedChange ? '🎉' : '✨'}</span>
                            </div>

                            {/* Confetti effect when confirmed */}
                            {hasDetectedChange && (
                                <>
                                    <div className="absolute top-0 left-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                                    <div className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="absolute bottom-0 left-0 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                                </>
                            )}
                        </div>
                    </div>

                    <h1 className={`text-3xl font-bold text-slate-900 dark:text-white mb-3 transition-all duration-500 ${hasDetectedChange ? 'scale-105' : 'scale-100'
                        }`}>
                        {statusConfig.title}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        {statusConfig.description}
                    </p>

                    {billingId && (
                        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                ID do Pedido: <span className="font-mono font-bold">{billingId}</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* CSS Animation */}
                <style>{`
                    @keyframes statusChange {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                        100% { transform: scale(1); }
                    }
                `}</style>

                {/* Polling Indicator */}
                {isPolling && !hasDetectedChange && (
                    <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
                        <div className="relative">
                            <ArrowPathIcon className="w-6 h-6 text-blue-500 animate-spin" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                                Verificando atualizações...
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                Aguardando confirmação do pagamento. Isso pode levar alguns segundos.
                            </p>
                        </div>
                    </div>
                )}

                {/* Success Animation when change detected */}
                {hasDetectedChange && (
                    <div className="mb-8 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-center gap-4 animate-bounce">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircleIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-green-900 dark:text-green-100">
                                Atualização detectada! ✨
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                Seus dados foram atualizados com sucesso.
                            </p>
                        </div>
                    </div>
                )}

                {/* User Info Card */}
                {user && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-8 mb-8">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                            Resumo da Conta
                        </h2>

                        <div className="space-y-4">
                            {/* Tokens Balance */}
                            <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center">
                                        <TicketIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Saldo de Créditos
                                        </p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {user.tokens || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Active Plan */}
                            {user.role && user.roleExpiresAt && new Date(user.roleExpiresAt) > new Date() && (
                                <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-200 dark:border-primary-800">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Plano Ativo
                                        </p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                                            {user.role}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Válido até
                                        </p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            {new Date(user.roleExpiresAt).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/free-quizzes')}
                        className="w-full py-4 px-6 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary-500/20"
                    >
                        Começar a Praticar
                        <ArrowRightIcon className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => navigate('/tokens')}
                        className="w-full py-4 px-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                        Ver Planos e Créditos
                    </button>

                    <button
                        onClick={() => navigate('/profile')}
                        className="w-full py-4 px-6 bg-transparent text-slate-600 dark:text-slate-400 font-medium rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        Ir para Perfil
                    </button>
                </div>

                {/* Help Text */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Precisa de ajuda? Entre em contato com nosso suporte.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
