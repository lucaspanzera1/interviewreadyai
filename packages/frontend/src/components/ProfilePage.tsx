import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  IdentificationIcon,
  CalendarIcon,
  ShieldCheckIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';

/**
 * Página de perfil do usuário
 */
const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile(formData);
      showToast('Perfil atualizado com sucesso!', 'success');
      setIsEditing(false);
    } catch {
      showToast('Erro ao atualizar perfil', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      showToast('Erro ao sair', 'error');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <>
      <PageTitle title="Perfil - TreinaVagaAI" />

      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Informações Pessoais</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 mr-1.5 opacity-70" />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-all"
                      disabled={isLoading}
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-all shadow-md shadow-primary-600/20 active:scale-95"
                      disabled={isLoading}
                    >
                      <CheckIcon className="h-4 w-4 mr-1.5" />
                      {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center mb-8">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="h-20 w-20 rounded-full object-cover border border-slate-200 dark:border-slate-700 p-1"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500">
                      <UserCircleIcon className="h-12 w-12" />
                    </div>
                  )}
                  <div className="ml-5">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-6 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nome Completo
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                        placeholder="Digite seu nome completo"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md">
                        <IdentificationIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                        <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">{user?.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md">
                      <EnvelopeIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                      <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">{user?.email}</span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                      O email não pode ser alterado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Detalhes da Conta</h2>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Membro desde</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatDate(user?.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Tipo de conta</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${user?.role === 'admin'
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                    : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    }`}>
                    {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                    <TicketIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tokens Disponíveis</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Saldo atual</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {user?.tokens || 0}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-300 dark:hover:border-red-800 rounded-lg transition-all text-sm font-medium shadow-sm"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;