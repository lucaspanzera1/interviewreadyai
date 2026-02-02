import React, { useEffect, useState } from 'react';
import PageTitle from './PageTitle';
import { apiClient, Role } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import {
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const AdminRolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#8a2be2', // Matching primary branding
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getRoles();
      setRoles(data);
    } catch (err: any) {
      showToast('Erro ao buscar cargos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name) {
      showToast('O nome do cargo é obrigatório.', 'error');
      return;
    }
    try {
      await apiClient.createRole(formData);
      showToast('Cargo criado com sucesso!', 'success');
      setIsModalOpen(false);
      resetForm();
      fetchRoles();
    } catch (err: any) {
      showToast('Erro ao criar cargo.', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!editingRole) return;
    if (!formData.name) {
      showToast('O nome do cargo é obrigatório.', 'error');
      return;
    }
    try {
      await apiClient.updateRole(editingRole.id, formData);
      showToast('Cargo atualizado com sucesso!', 'success');
      setIsModalOpen(false);
      setEditingRole(null);
      resetForm();
      fetchRoles();
    } catch (err: any) {
      showToast('Erro ao atualizar cargo.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este cargo?')) return;
    try {
      await apiClient.deleteRole(id);
      showToast('Cargo desativado com sucesso!', 'success');
      fetchRoles();
    } catch (err: any) {
      showToast('Erro ao desativar cargo.', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#8a2be2',
    });
    setEditingRole(null);
  };

  const startEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      color: role.color,
    });
    setIsModalOpen(true);
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && roles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <PageTitle title="Gerenciar Cargos" />
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Administre os cargos e níveis de acesso disponíveis no sistema
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300">
              Total: <span className="text-primary-600 dark:text-primary-400 font-bold">{roles.length}</span> cargos
            </div>
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Novo Cargo</span>
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
        </div>

        {/* Roles Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700/50">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Cor de Identificação
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {role.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {role.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm"
                          style={{ backgroundColor: role.color }}
                        />
                        <span className="font-mono text-xs text-slate-400">{role.color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(role)}
                          className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                          title="Editar"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="Desativar"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRoles.length === 0 && (
            <div className="text-center py-20">
              <div className="mx-auto h-12 w-12 text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <MagnifyingGlassIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                Nenhum cargo encontrado
              </h3>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Tente ajustar sua busca ou crie um novo cargo.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 transform animate-slide-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingRole ? 'Editar Cargo' : 'Criar Novo Cargo'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome do Cargo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Premium, Master, Admin"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Uma breve descrição sobre este cargo"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Cor de Destaque
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 overflow-hidden"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-4 py-2.5 font-mono text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={editingRole ? handleUpdate : handleCreate}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all font-medium"
              >
                {editingRole ? 'Salvar Alterações' : 'Criar Cargo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRolesPage;