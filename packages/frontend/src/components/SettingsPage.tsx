import React, { useState } from 'react';
import PageTitle from './PageTitle';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
    MoonIcon,
    SunIcon,
    BellIcon,
    ShieldCheckIcon,
    TrashIcon,
    ComputerDesktopIcon
} from '@heroicons/react/24/outline';

const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useTheme(); // Assuming ThemeContext exposes usage like this, checking ThemeContext usage in BottomNav shows: resolvedTheme, toggleTheme. Wait, let me re-check usage in BottomNav.
    const { user } = useAuth();
    const { showToast } = useToast();

    // Notification states (mock)
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);
    const [securityAlerts, setSecurityAlerts] = useState(true);

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
