import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './BottomNav';
import { useSidebar } from '../contexts/SidebarContext';

interface AppLayoutProps {
  children?: React.ReactNode;
}

/**
 * Layout principal da aplicação
 * Inclui sidebar vertical para navegação com responsividade ao estado colapsado
 */
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />

      {/* Conteúdo principal - margem dinâmica baseada no estado do sidebar */}
      <main className={`min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-4 lg:p-8">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;