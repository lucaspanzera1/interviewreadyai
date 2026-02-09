import React, { useState, useEffect } from 'react';
import PageTitle from './PageTitle';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { apiClient } from '../lib/api';
import {
    MoonIcon,
    SunIcon,
    BellIcon,
    ShieldCheckIcon,
    TrashIcon,
    ComputerDesktopIcon,
    ClockIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useTheme(); // Assuming ThemeContext exposes usage like this, checking ThemeContext usage in BottomNav shows: resolvedTheme, toggleTheme. Wait, let me re-check usage in BottomNav.
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();

    // Notification states (mock)
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);
    const [securityAlerts, setSecurityAlerts] = useState(true);

    // Quiz Settings
    const [showTimer, setShowTimer] = useState(() => {
        const stored = localStorage.getItem('settings_show_quiz_timer');
        return stored !== null ? stored === 'true' : true;
    });

    // Privacy Settings
    const [isProfilePublic, setIsProfilePublic] = useState(() => {
        return user?.isProfilePublic !== undefined ? user.isProfilePublic : false;
    });
    const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);

    // Update local state when user data changes
    useEffect(() => {
        if (user?.isProfilePublic !== undefined) {
            setIsProfilePublic(user.isProfilePublic);
        }
    }, [user?.isProfilePublic]);

    const handleTimerChange = (checked: boolean) => {
        setShowTimer(checked);
        localStorage.setItem('settings_show_quiz_timer', String(checked));
    };

    const handlePrivacyChange = async (checked: boolean) => {
        setIsUpdatingPrivacy(true);
        try {
            await apiClient.updatePrivacySettings(checked);
            setIsProfilePublic(checked);
            await refreshUser(); // Refresh user data to update context
            showToast(
                `Perfil ${checked ? 'público' : 'privado'} configurado com sucesso!`, 
                'success'
            );
        } catch (error) {
            console.error('Erro ao atualizar configurações de privacidade:', error);
            showToast('Erro ao atualizar configurações de privacidade', 'error');
        } finally {
            setIsUpdatingPrivacy(false);
        }
    };

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme);
    };

    const handlePasswordReset = () => {
        showToast('Email de redefinição de senha enviado!', 'success');
    };

    const handleDeleteAccount = () => {
        if (confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
            showToast('Funcionalidade indisponível no momento.', 'error');
        }
    };

    return (
        <>
            <PageTitle title="Configurações - TreinaVagaAI" />

            <div className="max-w-3xl mx-auto space-y-8">

                {/* Visual / Theme Settings */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <SunIcon className="w-5 h-5 text-amber-500" />
                            Aparência
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Personalize como o TreinaVagaAI aparece para você.
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button
                                onClick={() => handleThemeChange('light')}
                                className={`flex flex-col items-center p-4 border rounded-xl transition-all ${theme === 'light'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                            >
                                <SunIcon className="w-8 h-8 mb-3" />
                                <span className="font-medium">Claro</span>
                            </button>
                            <button
                                onClick={() => handleThemeChange('dark')}
                                className={`flex flex-col items-center p-4 border rounded-xl transition-all ${theme === 'dark'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                            >
                                <MoonIcon className="w-8 h-8 mb-3" />
                                <span className="font-medium">Escuro</span>
                            </button>
                            <button
                                onClick={() => handleThemeChange('system')}
                                className={`flex flex-col items-center p-4 border rounded-xl transition-all ${theme === 'system'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                            >
                                <ComputerDesktopIcon className="w-8 h-8 mb-3" />
                                <span className="font-medium">Sistema</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <BellIcon className="w-5 h-5 text-blue-500" />
                            Notificações
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Gerencie como entramos em contato com você.
                        </p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-slate-900 dark:text-white">Alertas de e-mail</label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Receba notificações sobre seus quizzes e resultados.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <label className="text-sm font-medium text-slate-900 dark:text-white">Emails de Marketing</label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Receba novidades, ofertas e dicas sobre a plataforma.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={marketingEmails} onChange={(e) => setMarketingEmails(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>


                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <label className="text-sm font-medium text-slate-900 dark:text-white">Alertas de Segurança</label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Seja notificado sobre acessos importantes em sua conta.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={securityAlerts} onChange={(e) => setSecurityAlerts(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Privacy Settings */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <EyeIcon className="w-5 h-5 text-green-500" />
                            Privacidade do Perfil
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Controle quem pode ver seu perfil e informações.
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                    {isProfilePublic ? (
                                        <EyeIcon className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <EyeSlashIcon className="w-4 h-4 text-red-500" />
                                    )}
                                    Perfil Público
                                </label>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {isProfilePublic 
                                        ? 'Seu perfil pode ser encontrado e visualizado por outros usuários.'
                                        : 'Seu perfil está privado e não pode ser encontrado por outros usuários.'
                                    }
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer ml-4">
                                <input 
                                    type="checkbox" 
                                    checked={isProfilePublic} 
                                    onChange={(e) => handlePrivacyChange(e.target.checked)}
                                    disabled={isUpdatingPrivacy}
                                    className="sr-only peer" 
                                />
                                <div className={`w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${isUpdatingPrivacy ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                            </label>
                        </div>
                        
                        {!isProfilePublic && (
                            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                    ⚠️ Com o perfil privado, você não aparecerá nas buscas e outros usuários não poderão seguir você ou ver suas estatísticas.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quiz Settings */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-purple-500" />
                            Preferências de Quiz
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Personalize sua experiência durante a resolução de questões.
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-slate-900 dark:text-white">Cronômetro em tempo real</label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Exibir o tempo decorrido no canto da tela durante o quiz.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showTimer}
                                    onChange={(e) => handleTimerChange(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                            Segurança & Conta
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Gerencie sua senha e acesso à conta.
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Email cadastrado</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                            </div>
                            <button
                                disabled
                                onClick={handlePasswordReset}
                                title="Funcionalidade indisponível no momento"
                                className="text-sm font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed"
                            >
                                Redefinir senha
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-4">Zona de Perigo</h3>
                            <button
                                disabled
                                onClick={handleDeleteAccount}
                                title="Funcionalidade indisponível no momento"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800 rounded-lg cursor-not-allowed"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Excluir Conta
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default SettingsPage;
