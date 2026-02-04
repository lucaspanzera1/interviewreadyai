import React, { useEffect, useState } from 'react';
import PageTitle from './PageTitle';
import { apiClient, User } from '../lib/api';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient['client'].get<User[]>('/users');
        setUsers(response.data);
      } catch (err: any) {
        setError('Erro ao buscar usuários.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLastLoginStatus = (lastLoginAt?: string) => {
    if (!lastLoginAt) return { text: 'Nunca', color: 'text-slate-400' };

    const now = new Date();
    const lastLogin = new Date(lastLoginAt);
    const diffInDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return { text: 'Hoje', color: 'text-emerald-600 dark:text-emerald-400' };
    if (diffInDays === 1) return { text: 'Ontem', color: 'text-emerald-600 dark:text-emerald-400' };
    if (diffInDays <= 7) return { text: `${diffInDays} dias atrás`, color: 'text-blue-600 dark:text-blue-400' };
    if (diffInDays <= 30) return { text: `${diffInDays} dias atrás`, color: 'text-amber-600 dark:text-amber-400' };
    return { text: `${diffInDays} dias atrás`, color: 'text-red-600 dark:text-red-400' };
  };

  return (
    <>
      <PageTitle title="Usuários - TreinaVagaAI" />
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 table-header-group">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Usuários</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gerencie os usuários cadastrados na plataforma
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin border-2 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-300 rounded-full"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Função</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Onboarding</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Último Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Criado em</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((user) => {
                    const lastLoginStatus = getLastLoginStatus(user.lastLoginAt);
                    return (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${user.role === 'admin'
                            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800'
                            : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800'
                            }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.hasCompletedOnboarding ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Completo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              Pendente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className={`text-xs font-medium ${lastLoginStatus.color}`}>
                              {lastLoginStatus.text}
                            </span>
                            {user.lastLoginAt && (
                              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                                {formatDate(user.lastLoginAt)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono-num">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default AdminUsers;
