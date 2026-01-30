import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  return (

    <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="h-9 w-9 bg-primary-600 dark:bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM11.375 8.25a.75.75 0 0 1 1.5 0v1.5H14.25a.75.75 0 0 1 0 1.5H12.875v1.5a.75.75 0 0 1-1.5 0v-1.5H10.5a.75.75 0 0 1 0-1.5h.875v-1.5ZM9.75 12a.75.75 0 0 0-1.5 0 .75.75 0 0 0 1.5 0Zm6 0a.75.75 0 0 0-1.5 0 .75.75 0 0 0 1.5 0Z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">
                TreinaVaga<span className="text-primary-600 dark:text-primary-400">AI</span>
              </h1>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-400 dark:hover:text-primary-400 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle Theme"
            >
              {resolvedTheme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="p-2 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-400 dark:hover:text-primary-400 dark:hover:bg-slate-800 transition-all duration-200 relative group"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-5 w-5" aria-hidden="true" />
              {/* Notification badge */}
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <div>
                <Menu.Button className="flex items-center gap-3 p-1 pl-3 pr-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200">
                  <span className="sr-only">Open user menu</span>
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">
                      {user?.name}
                    </p>
                  </div>
                  {user?.picture ? (
                    <img
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm"
                      src={user.picture}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 ring-2 ring-white dark:ring-slate-800">
                      <UserCircleIcon className="h-6 w-6" />
                    </div>
                  )}
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95 translate-y-2"
                enterTo="transform opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100 translate-y-0"
                leaveTo="transform opacity-0 scale-95 translate-y-2"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-2xl shadow-xl py-1 bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 focus:outline-none border border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
                  <div className="px-4 py-3 md:hidden">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleProfile}
                          className={`${active ? 'bg-primary-50 text-primary-700 dark:bg-slate-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'
                            } flex items-center w-full px-4 py-2.5 text-sm rounded-xl transition-colors`}
                        >
                          <UserCircleIcon className={`h-4 w-4 mr-3 ${active ? 'text-primary-500' : 'text-slate-400'}`} />
                          Meu Perfil
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${active ? 'bg-primary-50 text-primary-700 dark:bg-slate-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'
                            } flex items-center w-full px-4 py-2.5 text-sm rounded-xl transition-colors`}
                        >
                          <Cog6ToothIcon className={`h-4 w-4 mr-3 ${active ? 'text-primary-500' : 'text-slate-400'}`} />
                          Configurações
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="p-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${active ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'text-red-600 dark:text-red-400'
                            } flex items-center w-full px-4 py-2.5 text-sm rounded-xl transition-colors`}
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                          Sair
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;