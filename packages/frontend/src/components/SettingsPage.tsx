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
    EyeSlashIcon,
    FireIcon,
    LanguageIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();
    const { t, i18n } = useTranslation('settings');

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
        return user?.isProfilePublic !== undefined ? user.isProfilePublic : true;
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
                t('privacyUpdatedSuccess', { visibility: checked ? t('public') : t('private') }),
                'success'
            );
        } catch (error) {
            console.error('Erro ao atualizar configurações de privacidade:', error);
            showToast(t('privacyUpdateError'), 'error');
        } finally {
            setIsUpdatingPrivacy(false);
        }
    };

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system' | 'dark-orange' | 'light-orange') => {
        setTheme(newTheme);
    };

    const handlePasswordReset = () => {
        showToast(t('passwordResetSent'), 'success');
    };

    const handleDeleteAccount = () => {
        if (confirm(t('deleteAccountConfirm'))) {
            showToast(t('featureUnavailable'), 'error');
        }
    };

    return (
        <>
            <PageTitle title={t('pageTitle')} />

            <div className="max-w-3xl mx-auto space-y-8">

                {/* Visual / Theme Settings */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <SunIcon className="w-5 h-5 text-amber-500" />
                            {t('appearance')}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {t('appearanceDesc')}
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            {[
                                {
                                    id: 'light',
                                    label: t('themeLight'),
                                    icon: SunIcon,
                                    activeBorder: 'border-primary-500',
                                    activeRing: 'ring-primary-500/20',
                                    activeText: 'text-primary-700 dark:text-primary-400 shadow-sm',
                                    preview: (
                                        <div className="w-full h-full bg-slate-50 flex flex-col gap-2 p-3">
                                            <div className="h-2 w-2/3 bg-slate-200 rounded-full" />
                                            <div className="h-2 w-full bg-slate-200 rounded-full opacity-60" />
                                            <div className="flex-1 bg-white rounded-md border border-slate-200 shadow-sm" />
                                        </div>
                                    )
                                },
                                {
                                    id: 'dark',
                                    label: t('themeDark'),
                                    icon: MoonIcon,
                                    activeBorder: 'border-primary-500',
                                    activeRing: 'ring-primary-500/20',
                                    activeText: 'text-primary-700 dark:text-primary-400',
                                    preview: (
                                        <div className="w-full h-full bg-slate-900 flex flex-col gap-2 p-3">
                                            <div className="h-2 w-2/3 bg-slate-700 rounded-full" />
                                            <div className="h-2 w-full bg-slate-700 rounded-full opacity-60" />
                                            <div className="flex-1 bg-slate-800 rounded-md border border-slate-700 shadow-sm" />
                                        </div>
                                    )
                                },
                                {
                                    id: 'dark-orange',
                                    label: t('themeDarkOrange'),
                                    icon: FireIcon,
                                    activeBorder: 'border-orange-500',
                                    activeRing: 'ring-orange-500/20',
                                    activeText: 'text-orange-600 dark:text-orange-400',
                                    preview: (
                                        <div className="w-full h-full bg-slate-950 flex flex-col gap-2 p-3">
                                            <div className="h-2 w-2/3 bg-orange-900 rounded-full" />
                                            <div className="h-2 w-full bg-orange-900/50 rounded-full" />
                                            <div className="flex-1 bg-slate-900 rounded-md border border-orange-900/30 shadow-sm relative overflow-hidden">
                                                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500" />
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    id: 'light-orange',
                                    label: t('themeLightOrange'),
                                    icon: SunIcon,
                                    activeBorder: 'border-orange-500',
                                    activeRing: 'ring-orange-500/20',
                                    activeText: 'text-orange-600 dark:text-orange-500',
                                    preview: (
                                        <div className="w-full h-full bg-orange-50 flex flex-col gap-2 p-3">
                                            <div className="h-2 w-2/3 bg-orange-200 rounded-full" />
                                            <div className="h-2 w-full bg-orange-200/60 rounded-full" />
                                            <div className="flex-1 bg-white rounded-md border border-orange-100 shadow-sm relative overflow-hidden">
                                                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400" />
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    id: 'system',
                                    label: t('themeSystem'),
                                    icon: ComputerDesktopIcon,
                                    activeBorder: 'border-slate-500',
                                    activeRing: 'ring-slate-500/20',
                                    activeText: 'text-slate-700 dark:text-slate-300',
                                    preview: (
                                        <div className="w-full h-full relative flex rounded-md overflow-hidden">
                                            <div className="w-1/2 h-full bg-slate-50 border-r border-slate-200" />
                                            <div className="w-1/2 h-full bg-slate-900" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-1.5 shadow-sm border border-slate-200 dark:border-slate-700">
                                                    <ComputerDesktopIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleThemeChange(option.id as any)}
                                    className={`
                                        group relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all duration-200 ease-in-out
                                        ${theme === option.id
                                            ? `${option.activeBorder} ${option.activeRing} ring-4 scale-[1.02] shadow-md`
                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:-translate-y-0.5'
                                        }
                                    `}
                                >
                                    <div className="h-24 w-full bg-slate-100 dark:bg-slate-900/50 relative border-b border-inherit">
                                        {option.preview}
                                        {theme === option.id && (
                                            <div className="absolute top-2 right-2 animate-in fade-in zoom-in duration-200">
                                                <div className={`rounded-full p-0.5 shadow-sm ${option.id.includes('orange') ? 'bg-orange-500 text-white' : 'bg-primary-500 text-white'
                                                    }`}>
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <div className="flex items-center gap-2">
                                            <option.icon className={`w-4 h-4 transition-colors ${theme === option.id
                                                ? option.id.includes('orange') ? 'text-orange-500' : 'text-primary-500'
                                                : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                                                }`} />
                                            <span className={`text-sm font-medium transition-colors ${theme === option.id ? option.activeText : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                                                }`}>
                                                {option.label}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Language Settings */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <LanguageIcon className="w-5 h-5 text-indigo-500" />
                            {t('language')}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {t('languageDesc')}
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { code: 'pt-BR', label: 'Português', region: 'Brasil', flag: '🇧🇷' },
                                { code: 'en', label: 'English', region: 'United States', flag: '🇺🇸' },
                            ].map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={async () => {
                                        if (i18n.language !== lang.code) {
                                            await i18n.changeLanguage(lang.code);
                                            if (user) {
                                                try {
                                                    await apiClient.updateLanguage(lang.code);
                                                } catch (e) {
                                                    console.error('Failed to persist language:', e);
                                                }
                                            }
                                        }
                                    }}
                                    className={`
                                        group relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300
                                        ${i18n.language === lang.code
                                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-sm ring-1 ring-indigo-500/20'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <span className="text-4xl drop-shadow-sm filter grayscale-0 transition-transform group-hover:scale-110 duration-300 block">
                                                {lang.flag}
                                            </span>
                                            {i18n.language === lang.code && (
                                                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-900 animate-bounce" />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <p className={`font-semibold transition-colors ${i18n.language === lang.code ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {lang.label}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                {lang.region}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`
                                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                                        ${i18n.language === lang.code
                                            ? 'border-indigo-500 bg-indigo-500 text-white scale-100'
                                            : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-300 dark:group-hover:border-indigo-700'
                                        }
                                    `}>
                                        {i18n.language === lang.code && (
                                            <svg className="w-3.5 h-3.5 animate-in zoom-in duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <BellIcon className="w-5 h-5 text-blue-500" />
                            {t('notifications')}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {t('notificationsDesc')}
                        </p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-slate-900 dark:text-white">{t('emailAlerts')}</label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('emailAlertsDesc')}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <label className="text-sm font-medium text-slate-900 dark:text-white">{t('marketingEmails')}</label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('marketingEmailsDesc')}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={marketingEmails} onChange={(e) => setMarketingEmails(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>


                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <label className="text-sm font-medium text-slate-900 dark:text-white">{t('securityAlerts')}</label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('securityAlertsDesc')}</p>
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
                            {t('profilePrivacy')}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {t('profilePrivacyDesc')}
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
                                    {t('publicProfile')}
                                </label>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {isProfilePublic
                                        ? t('profilePublicDesc')
                                        : t('profilePrivateDesc')
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
                                    {t('privateProfileWarning')}
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
                            {t('quizPreferences')}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {t('quizPreferencesDesc')}
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-slate-900 dark:text-white">{t('realtimeTimer')}</label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('realtimeTimerDesc')}</p>
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
                            {t('securityAccount')}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {t('securityAccountDesc')}
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{t('registeredEmail')}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                            </div>
                            <button
                                disabled
                                onClick={handlePasswordReset}
                                title={t('featureUnavailable')}
                                className="text-sm font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed"
                            >
                                {t('resetPassword')}
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-4">{t('dangerZone')}</h3>
                            <button
                                disabled
                                onClick={handleDeleteAccount}
                                title={t('featureUnavailable')}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800 rounded-lg cursor-not-allowed"
                            >
                                <TrashIcon className="w-4 h-4" />
                                {t('deleteAccount')}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default SettingsPage;
