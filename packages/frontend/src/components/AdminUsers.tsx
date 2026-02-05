import React, { useEffect, useState, useMemo } from 'react';
import PageTitle from './PageTitle';
import { apiClient, User } from '../lib/api';
import UserDetailsModal from './UserDetailsModal';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  UserPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Stats Calculation
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === 'admin').length;
    // Clients includes both standard 'client' and 'pro' users (everyone who is not admin)
    const clients = users.filter(u => u.role !== 'admin').length;
    return { total, admins, clients };
  }, [users]);

  // Filtering and Pagination Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const getLastLoginStatus = (lastLoginAt?: string) => {
    if (!lastLoginAt) return { text: 'Nunca', color: 'text-slate-400 bg-slate-100 dark:bg-slate-800' };
    const diffInDays = Math.floor((new Date().getTime() - new Date(lastLoginAt).getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return { text: 'Hoje', color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' };
    if (diffInDays === 1) return { text: 'Ontem', color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' };
    if (diffInDays <= 7) return { text: `${diffInDays} dias atrás`, color: 'text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' };
    if (diffInDays <= 30) return { text: `${diffInDays} dias atrás`, color: 'text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400' };
    return { text: `${diffInDays} dias atrás`, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400' };
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleViewDetails = (user: User) => {
    setSelectedUserId(user.id);
    setSelectedUserName(user.name);
  };

  const handleCloseModal = () => {
    setSelectedUserId(null);
    setSelectedUserName('');
  };

  return (
    <>
      <PageTitle title="Gestão de Usuários" />
      <div className="space-y-8 animate-fade-in">
        {/* Header & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Users - "Like the Bank" (Standard/Blue) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <UserGroupIcon className="h-16 w-16 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Usuários</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.total}</p>
              <p className="text-xs text-blue-600 mt-2 font-medium">Cadastrados na plataforma</p>
            </div>
          </div>

          {/* Students/Clients - Emerald Green */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <UserGroupIcon className="h-16 w-16 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Alunos / Clientes</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{stats.clients}</p>
              <p className="text-xs text-emerald-600 mt-2 font-medium">Usuários padrão</p>
            </div>
          </div>

          {/* Admins - Purple */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-purple-300 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <UserPlusIcon className="h-16 w-16 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Administradores</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{stats.admins}</p>
              <p className="text-xs text-purple-600 mt-2 font-medium">Permissão total</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Action Bar */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Usuários</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie e monitore os membros da plataforma</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
              <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600">
                <FunnelIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mb-2"></div>
              <p className="text-slate-500 dark:text-slate-400">Carregando usuários...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6">
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <XCircleIcon className="h-5 w-5" />
                {error}
              </div>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-800/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Usuário</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Onboarding</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Último Acesso</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cadastro</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                          Nenhum usuário encontrado.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user) => {
                        const lastLogin = getLastLoginStatus(user.lastLoginAt);
                        return (
                          <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm ring-2 ring-white dark:ring-slate-900 border border-slate-200 dark:border-slate-700">
                                  {getInitials(user.name)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</div>
                                  <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'admin'
                                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800/50'
                                  : user.role === 'pro'
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/50'
                                    : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/50'
                                }`}>
                                {user.role === 'admin' ? 'Administrador' : user.role === 'pro' ? 'Pro / Premium' : 'Aluno'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.hasCompletedOnboarding ? (
                                <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm">
                                  <CheckCircleIcon className="h-5 w-5 mr-1.5" />
                                  <span className="font-medium">Completo</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-amber-500 dark:text-amber-400 text-sm">
                                  <div className="h-4 w-4 rounded-full border-2 border-current mr-2"></div>
                                  <span className="font-medium">Pendente</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${lastLogin.color}`}>
                                {lastLogin.text}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleViewDetails(user)}
                                className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Ver detalhes"
                              >
                                <EllipsisVerticalIcon className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Mostrando <span className="font-medium">{Math.min(filteredUsers.length, (currentPage - 1) * itemsPerPage + 1)}</span> a <span className="font-medium">{Math.min(filteredUsers.length, currentPage * itemsPerPage)}</span> de <span className="font-medium">{filteredUsers.length}</span> resultados
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {selectedUserId && (
          <UserDetailsModal
            userId={selectedUserId}
            userName={selectedUserName}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </>
  );
};

export default AdminUsers;
