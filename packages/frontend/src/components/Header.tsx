import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
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

    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-slate-900 rounded-md flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM11.375 8.25a.75.75 0 0 1 1.5 0v1.5H14.25a.75.75 0 0 1 0 1.5H12.875v1.5a.75.75 0 0 1-1.5 0v-1.5H10.5a.75.75 0 0 1 0-1.5h.875v-1.5ZM9.75 12a.75.75 0 0 0-1.5 0 .75.75 0 0 0 1.5 0Zm6 0a.75.75 0 0 0-1.5 0 .75.75 0 0 0 1.5 0Z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                TreinaVagaAI
              </h1>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button
              type="button"
              className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 relative group"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-5 w-5" aria-hidden="true" />
              {/* Notification badge */}
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <div>
                <Menu.Button className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-200">
                  <span className="sr-only">Open user menu</span>
                  <div className="hidden md:block text-right mr-1">
                    <p className="text-sm font-medium text-slate-900 leading-none">
                      {user?.name}
                    </p>
                  </div>
                  {user?.picture ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                      src={user.picture}
                      alt={user.name}
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8 text-slate-400" />
                  )}
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-1 bg-white ring-1 ring-slate-200 focus:outline-none border border-slate-100 divide-y divide-slate-100">
                  <div className="px-4 py-3 md:hidden">
                    <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleProfile}
                          className={`${active ? 'bg-slate-50' : ''
                            } flex items-center w-full px-4 py-2 text-sm text-slate-700`}
                        >
                          <UserCircleIcon className="h-4 w-4 mr-3 text-slate-400" />
                          Meu Perfil
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${active ? 'bg-slate-50' : ''
                            } flex items-center w-full px-4 py-2 text-sm text-slate-700`}
                        >
                          <Cog6ToothIcon className="h-4 w-4 mr-3 text-slate-400" />
                          Configurações
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${active ? 'bg-slate-50' : ''
                            } flex items-center w-full px-4 py-2 text-sm text-red-600`}
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