import React, { useRef, useEffect } from 'react';
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
} from '@heroicons/react/24/solid';
import { Users as UsersIconLucide, FileQuestion, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { useTheme } from '../contexts/ThemeContext';
import SearchModal from './SearchModal';
import { useSearchModal } from '../hooks/useSearchModal';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { isCollapsed, toggleCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
    const { resolvedTheme, toggleTheme } = useTheme();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const { isSearchOpen, closeSearch } = useSearchModal();

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

    const mainNavItems = [
        { name: 'Início', path: '/', icon: HomeIcon, activeIcon: HomeIconSolid },
        { name: 'Quizzes', path: '/my-quizzes', icon: DocumentTextIcon, activeIcon: DocumentTextIconSolid },
        { name: 'Simulações', path: '/my-interviews', icon: ChatBubbleLeftRightIcon, activeIcon: ChatBubbleLeftRightIconSolid, badge: 'BETA' },
        { name: 'Flashcards', path: '/my-flashcards', icon: RectangleStackIcon, activeIcon: RectangleStackIconSolid, badge: 'BETA' },
        { name: 'Explorar', path: '/free-quizzes', icon: AcademicCapIcon, activeIcon: AcademicCapIconSolid },

        { name: 'Comunidade', path: '/search', icon: UsersIconLucide, activeIcon: UsersIconLucide },
        { name: 'Evolução', path: '/desempenho', icon: ChartBarIcon, activeIcon: ChartBarIconSolid },
        { name: 'Histórico', path: '/profile/reward-history', icon: ClockIcon, activeIcon: ClockIconSolid },
        { name: 'Tokens', path: '/tokens', icon: TicketIcon, activeIcon: TicketIconSolid },
    ];

    const adminNavItems = [
        { name: 'Usuários', path: '/users', icon: UsersIconLucide, activeIcon: UsersIconLucide },
        { name: 'Quizzes', path: '/admin/quizzes', icon: FileQuestion, activeIcon: FileQuestion },
        { name: 'Cargos', path: '/roles', icon: ShieldCheckIcon, activeIcon: ShieldCheckIconSolid },
        { name: 'Pacotes de Tokens', path: '/token-packages', icon: Gift, activeIcon: Gift },
    ];

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
                <img src="/logo.png" alt="TreinaVaga" className="h-12 w-12 object-contain shrink-0" />
                <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                    <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight pl-3 block">
                        TreinaVaga<span className="text-primary-600 dark:text-primary-400">AI</span>
                    </span>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {mainNavItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = active ? item.activeIcon : item.icon;

                    return (
                        <button
                            key={item.name}
                            onClick={() => handleNavClick(item.path)}
                            className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 border-l-4 ${active
                                ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 font-semibold border-primary-600'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border-transparent'
                                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                            title={isCollapsed ? item.name : undefined}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                            <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'} w-full`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm pl-3">{item.name}</span>
                                    {/* @ts-ignore */}
                                    {item.badge && (
                                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded shadow-sm font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 uppercase tracking-wide">
                                            {/* @ts-ignore */}
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
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
                            title={`${user.tokens || 0} Tokens Disponíveis`}
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
                <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? (resolvedTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro') : undefined}
                >
                    {resolvedTheme === 'dark' ? (
                        <SunIcon className="w-4 h-4 flex-shrink-0" />
                    ) : (
                        <MoonIcon className="w-4 h-4 flex-shrink-0" />
                    )}
                    <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                        <span className="text-sm font-medium pl-3 block">{resolvedTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                    </div>
                </button>

                {/* Configurações - só para usuários logados */}
                {user && (
                    <button
                        onClick={() => handleNavClick('/settings')}
                        className={`w-full flex items-center px-3 py-2 rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? 'Configurações' : undefined}
                    >
                        <Cog6ToothIcon className="w-4 h-4 flex-shrink-0" />
                        <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                            <span className="text-sm font-medium pl-3 block">Configurações</span>
                        </div>
                    </button>
                )}

                {/* Sair - só para usuários logados */}
                {user && (
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center px-3 py-2 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? 'Sair' : undefined}
                    >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 flex-shrink-0" />
                        <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                            <span className="text-sm font-medium pl-3 block">Sair</span>
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
                        title="Perfil"
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
                        <span className="text-sm font-medium pl-3 animate-fade-in">Entrar</span>
                    </button>
                )}

                {/* Botão de Login colapsado */}
                {!user && isCollapsed && (
                    <button
                        onClick={() => handleNavClick('/login')}
                        className="flex justify-center pt-2 w-full"
                        title="Entrar"
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
        { name: 'Início', path: '/', icon: HomeIcon, activeIcon: HomeIconSolid },
        { name: 'Quizzes', path: '/my-quizzes', icon: DocumentTextIcon, activeIcon: DocumentTextIconSolid },
        { name: 'Entrevista', path: '/create-interview', icon: ChatBubbleLeftRightIcon, activeIcon: ChatBubbleLeftRightIconSolid, badge: 'NOVO' },
        { name: 'Menu', path: '#menu', icon: Bars3Icon, activeIcon: Bars3Icon, action: () => setIsMobileOpen(true) },
    ];

    const NavItem = ({ item }: { item: typeof bottomNavItems[0] }) => {
        const active = isActive(item.path);
        const Icon = active ? item.activeIcon : item.icon;

        return (
            <button
                onClick={(e) => {
                    if (item.action) {
                        e.preventDefault();
                        item.action();
                    } else {
                        handleNavClick(item.path);
                    }
                }}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
            >
                <div className="relative">
                    <Icon className={`w-6 h-6 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
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
                    <span className="font-bold text-lg text-slate-900 dark:text-white">Menu</span>
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
