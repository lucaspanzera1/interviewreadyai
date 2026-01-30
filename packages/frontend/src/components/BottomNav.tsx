import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    UsersIcon,
    SparklesIcon,
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
    PlusCircleIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    DocumentTextIcon as DocumentTextIconSolid,
    ChartBarIcon as ChartBarIconSolid,
    TicketIcon as TicketIconSolid
} from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { isCollapsed, toggleCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
    const { resolvedTheme, toggleTheme } = useTheme();
    const sidebarRef = useRef<HTMLDivElement>(null);

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
        { name: 'Dashboard', path: '/', icon: HomeIcon, activeIcon: HomeIconSolid },
        { name: 'Simulados', path: '/simulados', icon: DocumentTextIcon, activeIcon: DocumentTextIconSolid },
        { name: 'Desempenho', path: '/desempenho', icon: ChartBarIcon, activeIcon: ChartBarIconSolid },
        { name: 'Tokens', path: '/tokens', icon: TicketIcon, activeIcon: TicketIconSolid },
    ];

    const adminNavItems = [
        { name: 'Usuários', path: '/users', icon: UsersIcon, activeIcon: UsersIcon },
    ];

    const handleNavClick = (path: string) => {
        navigate(path);
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
        return location.pathname.startsWith(path);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-6 border-b border-subtle dark:border-slate-800 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20">
                    <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                {!isCollapsed && (
                    <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">
                        TreinaVaga<span className="text-primary-600 dark:text-primary-400">AI</span>
                    </span>
                )}
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
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 border-l-4 ${active
                                ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 font-semibold border-primary-600'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border-transparent'
                                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                            title={isCollapsed ? item.name : undefined}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                            {!isCollapsed && (
                                <span className="text-sm">{item.name}</span>
                            )}
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
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${active
                                        ? 'bg-slate-100 text-slate-900 font-medium'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        } ${isCollapsed ? 'justify-center' : ''}`}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-slate-900' : 'text-slate-400'}`} />
                                    {!isCollapsed && (
                                        <span className="text-sm">{item.name}</span>
                                    )}
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
                            className={`group flex items-center ${isCollapsed ? 'justify-center w-10 h-10' : 'justify-between w-full px-3 py-2'} bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-amber-400 dark:hover:border-amber-500 transition-colors cursor-pointer`}
                            onClick={() => handleNavClick('/tokens')}
                            title={`${user.tokens || 0} Tokens Disponíveis`}
                        >
                            <div className="flex items-center gap-2.5">
                                <TicketIcon className={`w-4 h-4 ${isCollapsed ? 'text-amber-500' : 'text-slate-400 group-hover:text-amber-500'} transition-colors`} />
                                {!isCollapsed && (
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                        {user.tokens || 0} Tokens
                                    </span>
                                )}
                            </div>
                            {!isCollapsed && (
                                <PlusCircleIcon className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                            )}
                        </div>
                    </div>
                )}
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? (resolvedTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro') : undefined}
                >
                    {resolvedTheme === 'dark' ? (
                        <SunIcon className="w-4 h-4 flex-shrink-0" />
                    ) : (
                        <MoonIcon className="w-4 h-4 flex-shrink-0" />
                    )}
                    {!isCollapsed && <span className="text-sm font-medium">{resolvedTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
                </button>

                {/* Configurações - só para usuários logados */}
                {user && (
                    <button
                        onClick={() => handleNavClick('/settings')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? 'Configurações' : undefined}
                    >
                        <Cog6ToothIcon className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && <span className="text-sm font-medium">Configurações</span>}
                    </button>
                )}

                {/* Sair - só para usuários logados */}
                {user && (
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? 'Sair' : undefined}
                    >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
                    </button>
                )}

                {/* User Info - Clicável para ir ao perfil */}
                {!isCollapsed && user && (
                    <button
                        onClick={() => handleNavClick('/profile')}
                        className="w-full flex items-center gap-3 px-2 py-2 mt-2 border border-slate-200 dark:border-slate-700 rounded-md hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer text-left"
                    >
                        {user.picture ? (
                            <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover bg-slate-100" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
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
                        className="w-full flex items-center gap-3 px-3 py-2 mt-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <ArrowLeftOnRectangleIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">Entrar</span>
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

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700"
            >
                <Bars3Icon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-slate-900/50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                ref={sidebarRef}
                className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 z-30 ${isCollapsed ? 'w-16' : 'w-64'}`}>
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
        </>
    );
};

export default Sidebar;
