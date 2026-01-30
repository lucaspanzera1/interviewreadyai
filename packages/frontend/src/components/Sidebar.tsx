import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  XMarkIcon,
  UserCircleIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { Users as UsersIcon, FileQuestion } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

const navigation = [
  { name: 'Perfil', href: '/profile', icon: UserCircleIcon },
  { name: 'Tokens', href: '/tokens', icon: KeyIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex flex-col flex-grow bg-white border-r border-slate-200 pt-5 pb-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center flex-shrink-0 px-4">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM11.375 8.25a.75.75 0 0 1 1.5 0v1.5H14.25a.75.75 0 0 1 0 1.5H12.875v1.5a.75.75 0 0 1-1.5 0v-1.5H10.5a.75.75 0 0 1 0-1.5h.875v-1.5ZM9.75 12a.75.75 0 0 0-1.5 0 .75.75 0 0 0 1.5 0Zm6 0a.75.75 0 0 0-1.5 0 .75.75 0 0 0 1.5 0Z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="ml-3 text-lg font-semibold text-slate-900">
            TreinaVagaAI
          </h2>
        </div>

        {/* Close button for mobile */}
        {onClose && (
          <button
            type="button"
            className="ml-auto lg:hidden -mr-2 h-10 w-10 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex-grow flex flex-col">
        <nav className="flex-1 px-2 space-y-1">
          {/* Primary navigation */}
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive
                    ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
                onClick={onClose}
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'
                        }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 my-6"></div>

          {/* Admin navigation */}
          {isAdmin && (
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Administração
              </h3>
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive
                    ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
                onClick={onClose}
              >
                {({ isActive }) => (
                  <>
                    <UsersIcon
                      className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'
                        }`}
                      aria-hidden="true"
                    />
                    Usuários
                  </>
                )}
              </NavLink>
              <NavLink
                to="/admin/quizzes"
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive
                    ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
                onClick={onClose}
              >
                {({ isActive }) => (
                  <>
                    <FileQuestion
                      className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'
                        }`}
                      aria-hidden="true"
                    />
                    Quizzes
                  </>
                )}
              </NavLink>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-slate-200">
          <div className="text-xs text-slate-400 text-center">
            <p>TreinaVagaAI v1.0</p>
            <p className="mt-1">© 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;