import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    DocumentTextIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    ArrowLeftOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    SunIcon,
    MoonIcon,
    TicketIcon,
    PlusCircleIcon,
    AcademicCapIcon,
    ShieldCheckIcon,
    ClockIcon,
    RectangleStackIcon,
    ChatBubbleLeftRightIcon,
    LockClosedIcon,
    FireIcon,
    ComputerDesktopIcon,
    UserIcon,
    QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

import {
    HomeIcon as HomeIconSolid,
    DocumentTextIcon as DocumentTextIconSolid,
    ChartBarIcon as ChartBarIconSolid,
    TicketIcon as TicketIconSolid,
    AcademicCapIcon as AcademicCapIconSolid,
    ShieldCheckIcon as ShieldCheckIconSolid,
    ClockIcon as ClockIconSolid,
    RectangleStackIcon as RectangleStackIconSolid,
    ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
    PlusCircleIcon as PlusCircleIconSolid,
} from '@heroicons/react/24/solid';
import { Users as UsersIconLucide, FileQuestion, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { useTheme } from '../contexts/ThemeContext';
import SearchModal from './SearchModal';
import { useSearchModal } from '../hooks/useSearchModal';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { isCollapsed, toggleCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
    const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const { isSearchOpen, closeSearch } = useSearchModal();
    const { t, i18n } = useTranslation();

    // Theme Long Press Logic
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const [pressProgress, setPressProgress] = useState(0);
    const animationRef = useRef<number | null>(null);

    const logoSrc = theme.includes('orange') ? '/logo-orange.png' : '/logo.png';

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setIsMobileOpen(false);
            }
        };

        if (isMobileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileOpen, setIsMobileOpen]);

    const isPro = user?.role === 'pro';

    const mainNavItems = [
        { name: t('nav.home'), nameKey: 'nav.home', path: '/', icon: HomeIcon, activeIcon: HomeIconSolid },
        { name: t('nav.quizzes'), nameKey: 'nav.quizzes', path: '/my-quizzes', icon: DocumentTextIcon, activeIcon: DocumentTextIconSolid },
        { name: t('nav.simulations'), nameKey: 'nav.simulations', path: '/my-interviews', icon: ChatBubbleLeftRightIcon, activeIcon: ChatBubbleLeftRightIconSolid, badge: 'PRO', locked: !isPro && user?.role !== 'admin' },
        { name: t('nav.flashcards'), nameKey: 'nav.flashcards', path: '/my-flashcards', icon: RectangleStackIcon, activeIcon: RectangleStackIconSolid, badge: 'PRO', locked: !isPro && user?.role !== 'admin' },
        { name: t('nav.explore'), nameKey: 'nav.explore', path: '/free-quizzes', icon: AcademicCapIcon, activeIcon: AcademicCapIconSolid },

        { name: t('nav.community'), nameKey: 'nav.community', path: '/search', icon: UsersIconLucide, activeIcon: UsersIconLucide },
        { name: t('nav.evolution'), nameKey: 'nav.evolution', path: '/desempenho', icon: ChartBarIcon, activeIcon: ChartBarIconSolid },
        { name: t('nav.history'), nameKey: 'nav.history', path: '/profile/reward-history', icon: ClockIcon, activeIcon: ClockIconSolid },
        { name: t('nav.tokens'), nameKey: 'nav.tokens', path: '/tokens', icon: TicketIcon, activeIcon: TicketIconSolid },
    ];

    const adminNavItems = [
        { name: t('admin.users'), path: '/users', icon: UsersIconLucide, activeIcon: UsersIconLucide },
        { name: t('admin.quizzes'), path: '/admin/quizzes', icon: FileQuestion, activeIcon: FileQuestion },
        { name: t('admin.roles'), path: '/roles', icon: ShieldCheckIcon, activeIcon: ShieldCheckIconSolid },
        { name: t('admin.tokenPackages'), path: '/token-packages', icon: Gift, activeIcon: Gift },
    ];

    const [subItems, setSubItems] = useState<Record<string, { label: string, icon: React.ElementType, path?: string } | null>>({});
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = (name: string) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredItem(name);
        }, 2000);
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setHoveredItem(null);
    };

    const hoverActions: Record<string, { label: string, icon: React.ElementType, path: string }> = {
        [t('nav.quizzes')]: { label: t('nav.newQuiz'), icon: PlusCircleIcon, path: '/create-quiz' },
        [t('nav.simulations')]: { label: t('nav.newSimulation'), icon: PlusCircleIcon, path: '/create-interview' },
        [t('nav.flashcards')]: { label: t('nav.newFlashcard'), icon: PlusCircleIcon, path: '/create-flashcard' },
    };

    useEffect(() => {
        const updateSubItems = async () => {
            const newSubItems: Record<string, { label: string, icon: React.ElementType, path?: string } | null> = {};

            // 1. Profile Context
            const profileMatch = location.pathname.match(/^\/profile\/([^/]+)$/);
            if (profileMatch) {
                const userId = profileMatch[1];
                // Ignore specific non-user routes
                if (userId !== 'reward-history' && userId !== 'quiz-history') {
                    try {
                        const { socialApi } = await import('../lib/socialApi');
                        const profile = await socialApi.getPublicProfile(userId);
                        newSubItems[t('nav.community')] = { label: profile.name, icon: UserIcon, path: `/profile/${userId}` };
                    } catch (error) {
                        console.error('Error fetching viewed user:', error);
                    }
                }
            }

            // 2. Creation Contexts
            if (location.pathname === '/create-quiz') {
                newSubItems[t('nav.quizzes')] = { label: t('nav.newQuiz'), icon: PlusCircleIcon, path: '/create-quiz' };
            }
            if (location.pathname === '/create-interview') {
                newSubItems[t('nav.simulations')] = { label: t('nav.newSimulation'), icon: PlusCircleIcon, path: '/create-interview' };
            }
            if (location.pathname === '/create-flashcard') {
                newSubItems[t('nav.flashcards')] = { label: t('nav.newFlashcard'), icon: PlusCircleIcon, path: '/create-flashcard' };
            }

            setSubItems(newSubItems);
        };

        updateSubItems();
    }, [location.pathname]);

    const handleNavClick = (path: string, action?: () => void) => {
        if (action) {
            action();
        } else {
            navigate(path);
        }
        setIsMobileOpen(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';

        if (path === '/desempenho') {
            return location.pathname.startsWith(path) || location.pathname.startsWith('/profile/quiz-history');
        }
        if (path === '/profile/reward-history') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center py-6 border-b border-subtle dark:border-slate-800 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}>
                <img src={logoSrc} alt="TreinaVaga" className="h-12 w-12 object-contain shrink-0" />
                <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                    <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight pl-3 block">
                        {i18n.language === 'en' ? 'InterviewReady' : 'TreinaVaga'}<span className="text-primary-600 dark:text-primary-400">AI</span>
                    </span>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {mainNavItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = active ? item.activeIcon : item.icon;
                    // potentialSubItem: The data to display (if any exists for this item)
                    const potentialSubItem = subItems[item.name] || hoverActions[item.name];
                    // isActiveSubItem: Whether it should be fully visible
                    const isActiveSubItem = !!subItems[item.name] || (hoveredItem === item.name);

                    return (
                        <div
                            key={item.name}
                            className="w-full relative"
                            onMouseEnter={() => handleMouseEnter(item.name)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                onClick={() => {
                                    if (item.locked) {
                                        navigate('/tokens');
                                    } else {
                                        handleNavClick(item.path);
                                    }
                                }}
                                className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 border-l-4 ${active
                                    ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 font-semibold border-primary-600'
                                    : item.locked
                                        ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed border-transparent'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border-transparent'
                                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                                title={isCollapsed ? item.name : undefined}
                                disabled={item.locked}
                            >
                                <div className="relative">
                                    <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? 'text-primary-600 dark:text-primary-400' : item.locked ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                                    {item.locked && (
                                        <LockClosedIcon className="w-3 h-3 absolute -top-1 -right-1 text-slate-400 dark:text-slate-500" />
                                    )}
                                </div>
                                <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'} w-full`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm pl-3">{item.name}</span>
                                        {/* @ts-ignore */}
                                        {item.badge && (
                                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded shadow-sm font-bold bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400 border border-primary-200 dark:border-primary-700/50 uppercase tracking-wide">
                                                {/* @ts-ignore */}
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>

                            {/* Sub-item via Context or Hover */}
                            {potentialSubItem && !isCollapsed && (
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isActiveSubItem ? 'max-h-14 mt-2 opacity-100' : 'max-h-0 mt-0 opacity-0'}`}
                                >
                                    <div
                                        onClick={(e) => {
                                            if (potentialSubItem.path) {
                                                e.stopPropagation();
                                                handleNavClick(potentialSubItem.path);
                                            }
                                        }}
                                        className={`ml-9 pl-3 border-l-2 cursor-pointer hover:opacity-80 transition-transform duration-300 ease-in-out ${isActiveSubItem ? 'translate-y-0' : '-translate-y-2'} ${theme.includes('orange')
                                            ? 'border-orange-300 dark:border-orange-500'
                                            : 'border-purple-300 dark:border-purple-500'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 py-1">
                                            {(() => {
                                                const SubIcon = potentialSubItem.icon;
                                                return SubIcon && (
                                                    <SubIcon className={`w-3.5 h-3.5 ${theme.includes('orange')
                                                        ? 'text-orange-600 dark:text-orange-400'
                                                        : 'text-purple-600 dark:text-purple-400'
                                                        }`} />
                                                );
                                            })()}
                                            <span className={`text-xs font-semibold truncate max-w-[140px] ${theme.includes('orange')
                                                ? 'text-orange-600 dark:text-orange-400'
                                                : 'text-purple-600 dark:text-purple-400'
                                                }`}>
                                                {potentialSubItem.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Admin Section */}
                {user?.role === 'admin' && (
                    <>
                        <div className={`pt-4 pb-2 ${isCollapsed ? 'px-0' : 'px-3'}`}>
                            {!isCollapsed && (
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Admin
                                </span>
                            )}
                            {isCollapsed && <div className="border-t border-slate-200"></div>}
                        </div>
                        {adminNavItems.map((item) => {
                            const active = isActive(item.path);
                            const Icon = active ? item.activeIcon : item.icon;

                            return (
                                <button
                                    key={item.name}
                                    onClick={() => handleNavClick(item.path)}
                                    className={`w-full flex items-center px-3 py-2 rounded-md transition-all duration-200 ${active
                                        ? 'bg-slate-100 text-slate-900 font-medium'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        } ${isCollapsed ? 'justify-center' : ''}`}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-slate-900' : 'text-slate-400'}`} />
                                    <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                                        <span className="text-sm pl-3 block">{item.name}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </>
                )}
            </nav>

            {/* User Section */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-3 space-y-1">
                {/* Token Display - Atraente */}
                {/* Token Display - Minimalista */}
                {user && (
                    <div className={`mb-2 ${isCollapsed ? 'flex justify-center' : ''}`}>
                        <div
                            className={`group flex items-center ${isCollapsed ? 'justify-center w-10 h-10' : 'w-full px-3 py-2'} bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer`}
                            onClick={() => handleNavClick('/tokens')}
                            title={t('user.tokensAvailable', { count: user.tokens || 0 })}
                        >
                            <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
                                {isCollapsed ? (
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{user.tokens || 0}</span>
                                ) : (
                                    <TicketIcon className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                                )}
                                <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors pl-2.5">
                                        {user.tokens || 0} Tokens
                                    </span>
                                </div>
                            </div>
                            <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ml-auto ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[24px] opacity-100'}`}>
                                <PlusCircleIcon className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                            </div>
                        </div>
                    </div>
                )}
                {/* Theme Toggle */}
                {/* Theme Toggle - Long Press for Menu */}
                <div className="relative">
                    <button
                        onMouseDown={() => {
                            const start = Date.now();
                            const animate = () => {
                                const now = Date.now();
                                const elapsed = now - start;
                                const progress = Math.min((elapsed / 800) * 100, 100);

                                setPressProgress(progress);

                                if (progress < 100) {
                                    animationRef.current = requestAnimationFrame(animate);
                                } else {
                                    setShowThemeMenu(true);
                                    setPressProgress(0);
                                }
                            };
                            animationRef.current = requestAnimationFrame(animate);
                        }}
                        onMouseUp={() => {
                            if (animationRef.current) {
                                cancelAnimationFrame(animationRef.current);
                                animationRef.current = null;
                            }
                            if (pressProgress < 100 && !showThemeMenu) {
                                toggleTheme();
                            }
                            setPressProgress(0);
                        }}
                        onMouseLeave={() => {
                            if (animationRef.current) {
                                cancelAnimationFrame(animationRef.current);
                                animationRef.current = null;
                            }
                            setPressProgress(0);
                        }}
                        onTouchStart={() => {
                            const start = Date.now();
                            const animate = () => {
                                const now = Date.now();
                                const elapsed = now - start;
                                const progress = Math.min((elapsed / 800) * 100, 100);

                                setPressProgress(progress);

                                if (progress < 100) {
                                    animationRef.current = requestAnimationFrame(animate);
                                } else {
                                    setShowThemeMenu(true);
                                    setPressProgress(0);
                                }
                            };
                            animationRef.current = requestAnimationFrame(animate);
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault(); // Prevent ghost click
                            if (animationRef.current) {
                                cancelAnimationFrame(animationRef.current);
                                animationRef.current = null;
                            }
                            if (pressProgress < 100 && !showThemeMenu) {
                                toggleTheme();
                            }
                            setPressProgress(0);
                        }}
                        className={`relative w-full flex items-center px-3 py-2 rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? (resolvedTheme === 'dark' ? t('theme.lightMode') : t('theme.darkMode')) : undefined}
                    >
                        {/* Progress Background */}
                        <div
                            className="absolute left-0 top-0 bottom-0 bg-primary-100 dark:bg-primary-900/20 transition-all duration-75 ease-linear pointer-events-none"
                            style={{ width: `${pressProgress}%`, opacity: pressProgress > 0 ? 1 : 0 }}
                        />

                        <div className="relative z-10 flex items-center">
                            {resolvedTheme === 'dark' ? (
                                <SunIcon className="w-4 h-4 flex-shrink-0" />
                            ) : (
                                <MoonIcon className="w-4 h-4 flex-shrink-0" />
                            )}
                            <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                                <span className="text-sm font-medium pl-3 block">{resolvedTheme === 'dark' ? t('theme.lightMode') : t('theme.darkMode')}</span>
                            </div>
                        </div>
                    </button>

                    {/* Popup Menu */}
                    {showThemeMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowThemeMenu(false)}
                            />
                            <div className={`absolute bottom-full ${isCollapsed ? 'left-1/2 -translate-x-1/2 mb-2' : 'left-0 mb-2 w-full'} z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200 min-w-[200px]`}>
                                <div className="text-xs font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider mb-1">
                                    {t('theme.specialThemes')}
                                </div>
                                <button
                                    onClick={() => { setTheme('light-orange'); setShowThemeMenu(false); }}
                                    className={`w-full flex items-center px-3 py-2 rounded-lg mb-1 transition-colors ${theme === 'light-orange' ? 'bg-orange-50 text-orange-700' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                                >
                                    <SunIcon className="w-4 h-4 mr-3 text-orange-500" />
                                    <span className="text-sm font-medium">{t('theme.orangeLight')}</span>
                                </button>
                                <button
                                    onClick={() => { setTheme('dark-orange'); setShowThemeMenu(false); }}
                                    className={`w-full flex items-center px-3 py-2 rounded-lg mb-1 transition-colors ${theme === 'dark-orange' ? 'bg-orange-900/20 text-orange-500' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                                >
                                    <FireIcon className="w-4 h-4 mr-3 text-orange-500" />
                                    <span className="text-sm font-medium">{t('theme.orangeDark')}</span>
                                </button>
                                <button
                                    onClick={() => { setTheme('system'); setShowThemeMenu(false); }}
                                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${theme === 'system' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                                >
                                    <ComputerDesktopIcon className="w-4 h-4 mr-3" />
                                    <span className="text-sm font-medium">{t('theme.system')}</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Language Switcher */}
                <div className="relative w-full group/lang">
                    <LanguageSwitcher
                        variant="inline"
                        className={isCollapsed ? 'justify-center' : ''}
                        isCollapsed={isCollapsed}
                    />
                    {!isCollapsed && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 group/tooltip z-10">
                            <QuestionMarkCircleIcon className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-help" />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-[85%] w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none text-center">
                                {t('nav.languageDisclaimer')}
                                <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Configurações - só para usuários logados */}
                {user && (
                    <button
                        onClick={() => handleNavClick('/settings')}
                        className={`w-full flex items-center px-3 py-2 rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? t('user.settings') : undefined}
                    >
                        <Cog6ToothIcon className="w-4 h-4 flex-shrink-0" />
                        <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                            <span className="text-sm font-medium pl-3 block">{t('user.settings')}</span>
                        </div>
                    </button>
                )}

                {/* Sair - só para usuários logados */}
                {user && (
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center px-3 py-2 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? t('user.logout') : undefined}
                    >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 flex-shrink-0" />
                        <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                            <span className="text-sm font-medium pl-3 block">{t('user.logout')}</span>
                        </div>
                    </button>
                )}

                {/* User Info - Clicável para ir ao perfil */}
                {!isCollapsed && user && (
                    <button
                        onClick={() => handleNavClick('/profile')}
                        className={`w-full flex items-center gap-3 px-2 py-2 mt-2 border border-slate-200 dark:border-slate-700 rounded-md hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer text-left overflow-hidden animate-fade-in`}
                    >
                        {user.picture ? (
                            <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover bg-slate-100 flex-shrink-0" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 flex-shrink-0">
                                <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
                                    {user.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        </div>
                    </button>
                )}

                {/* Collapsed User Avatar - Clicável para ir ao perfil */}
                {isCollapsed && user && (
                    <button
                        onClick={() => handleNavClick('/profile')}
                        className="flex justify-center pt-2 w-full hover:opacity-80 transition-opacity cursor-pointer"
                        title={t('nav.profile')}
                    >
                        {user.picture ? (
                            <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover bg-slate-100" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                <span className="text-slate-600 font-semibold text-xs">
                                    {user.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </button>
                )}

                {/* Botão de Login - quando não há usuário logado */}
                {!user && !isCollapsed && (
                    <button
                        onClick={() => handleNavClick('/login')}
                        className="w-full flex items-center px-3 py-2 mt-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <ArrowLeftOnRectangleIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium pl-3 animate-fade-in">{t('user.login')}</span>
                    </button>
                )}

                {/* Botão de Login colapsado */}
                {!user && isCollapsed && (
                    <button
                        onClick={() => handleNavClick('/login')}
                        className="flex justify-center pt-2 w-full"
                        title={t('user.login')}
                    >
                        <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center hover:bg-slate-800 transition-colors">
                            <ArrowLeftOnRectangleIcon className="w-4 h-4 text-white" />
                        </div>
                    </button>
                )}
            </div>
        </div>
    );

    const bottomNavItems = [
        { name: t('nav.home'), path: '/', icon: HomeIcon, activeIcon: HomeIconSolid },
        { name: t('nav.quizzes'), path: '/my-quizzes', icon: DocumentTextIcon, activeIcon: DocumentTextIconSolid },
        { name: t('nav.newQuiz'), path: '/create-quiz', icon: PlusCircleIcon, activeIcon: PlusCircleIconSolid, badge: null, locked: false },
        { name: t('nav.menu'), path: '#menu', icon: Bars3Icon, activeIcon: Bars3Icon, action: () => setIsMobileOpen(true) },
    ];

    const NavItem = ({ item }: { item: typeof bottomNavItems[0] }) => {
        const active = isActive(item.path);
        const Icon = active ? item.activeIcon : item.icon;

        return (
            <button
                onClick={(e) => {
                    if (item.locked) {
                        e.preventDefault();
                        navigate('/tokens');
                    } else if (item.action) {
                        e.preventDefault();
                        item.action();
                    } else {
                        handleNavClick(item.path);
                    }
                }}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active
                    ? 'text-primary-600 dark:text-primary-400'
                    : item.locked
                        ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                disabled={item.locked}
            >
                <div className="relative">
                    <Icon className={`w-6 h-6 transition-transform duration-200 ${active ? 'scale-110' : item.locked ? 'opacity-50' : ''}`} />
                    {item.locked && (
                        <LockClosedIcon className="w-3 h-3 absolute -top-1 -right-1 text-slate-400 dark:text-slate-500" />
                    )}
                    {/* @ts-ignore */}
                    {item.badge && (
                        <span className="absolute -top-1.5 -right-3 text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-400 px-1 rounded-sm leading-none border border-amber-200 dark:border-amber-700/50">
                            {/* @ts-ignore */}
                            {item.badge}
                        </span>
                    )}
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
            </button>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity duration-300 ease-in-out ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsMobileOpen(false)}
                aria-hidden="true"
            />

            {/* Mobile Sidebar (Drawer) */}
            <aside
                ref={sidebarRef}
                className={`lg:hidden fixed left-0 top-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-lg text-slate-900 dark:text-white">{t('nav.menu')}</span>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="h-[calc(100%-65px)] overflow-y-auto">
                    <SidebarContent />
                </div>
            </aside>

            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-30 ${isCollapsed ? 'w-16' : 'w-64'}`}>
                <SidebarContent />

                {/* Collapse Toggle */}
                <button
                    onClick={toggleCollapsed}
                    className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav
                className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <div className="grid grid-cols-4 h-16 w-full relative">
                    {/* Item 1: Início */}
                    <div className="col-span-1">
                        <NavItem item={bottomNavItems[0]} />
                    </div>

                    {/* Item 2: Explorar */}
                    <div className="col-span-1">
                        <NavItem item={bottomNavItems[1]} />
                    </div>

                    {/* Item 3: Meus Quizzes */}
                    <div className="col-span-1">
                        <NavItem item={bottomNavItems[2]} />
                    </div>

                    {/* Item 4: Menu */}
                    <div className="col-span-1">
                        <NavItem item={bottomNavItems[3]} />
                    </div>
                </div>
            </nav>

            {/* Search Modal */}
            <SearchModal
                isOpen={isSearchOpen}
                onClose={closeSearch}
            />
        </>
    );
};

export default Sidebar;
