import React, { useEffect, useState } from 'react';
import PageTitle from './PageTitle';
import { apiClient, TokenPackage, Role } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import {
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const AdminTokenPackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TokenPackage | null>(null);
  const { showToast } = useToast();

  const [roles, setRoles] = useState<Role[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tokenAmount: 0,
    role: '',
    features: [] as string[],
  });

  useEffect(() => {
    fetchPackages();
    fetchRoles();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getTokenPackages();
      setPackages(data);
    } catch (err: any) {
      showToast('Erro ao buscar pacotes de tokens.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await apiClient.getRoles();
      setRoles(data);
    } catch (err: any) {
      console.error('Erro ao buscar roles:', err);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.role || formData.tokenAmount <= 0) {
      showToast('Preencha os campos obrigatórios corretamente.', 'error');
      return;
    }
    try {
      await apiClient.createTokenPackage(formData);
      showToast('Pacote criado com sucesso!', 'success');
      setIsModalOpen(false);
      resetForm();
      fetchPackages();
    } catch (err: any) {
      showToast('Erro ao criar pacote.', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!editingPackage) return;
    if (!formData.name || !formData.role || formData.tokenAmount <= 0) {
      showToast('Preencha os campos obrigatórios corretamente.', 'error');
      return;
    }
    try {
      await apiClient.updateTokenPackage(editingPackage.id, formData);
      showToast('Pacote atualizado com sucesso!', 'success');
      setIsModalOpen(false);
      setEditingPackage(null);
      resetForm();
      fetchPackages();
    } catch (err: any) {
      showToast('Erro ao atualizar pacote.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este pacote?')) return;
    try {
      await apiClient.deleteTokenPackage(id);
      showToast('Pacote desativado com sucesso!', 'success');
      fetchPackages();
    } catch (err: any) {
      showToast('Erro ao desativar pacote.', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      tokenAmount: 0,
      role: '',
      features: [],
    });
    setEditingPackage(null);
  };

  const startEdit = (pkg: TokenPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      tokenAmount: pkg.tokenAmount,
      role: pkg.role.id,
      features: pkg.features || [],
    });
    setIsModalOpen(true);
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pkg.description && pkg.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && packages.length === 0) {
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
            <PageTitle title="Pacotes de Tokens" />
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Gerencie os pacotes de tokens e benefícios associados
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300">
              Total: <span className="text-primary-600 dark:text-primary-400 font-bold">{packages.length}</span> pacotes
            </div>
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Novo Pacote</span>
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

        {/* Packages Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700/50">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Pacote
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Tokens
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Cargo Atribuído
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Benefícios
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4 min-w-[200px]">
                      <div className="flex flex-col">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {pkg.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {pkg.description || 'Sem descrição'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                          {pkg.tokenAmount}
                        </span>
                        <span className="text-xs text-slate-400">tokens</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                          backgroundColor: pkg.role.color + '15',
                          color: pkg.role.color,
                          borderColor: pkg.role.color + '40'
                        }}
                      >
                        {pkg.role.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[300px]">
                        {pkg.features && pkg.features.length > 0 ? (
                          <>
                            {pkg.features.slice(0, 2).map((feature, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300"
                              >
                                {feature}
                              </span>
                            ))}
                            {pkg.features.length > 2 && (
                              <span className="text-[10px] text-slate-400 ml-1">
                                +{pkg.features.length - 2}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(pkg)}
                          className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                          title="Editar"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
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

          {filteredPackages.length === 0 && (
            <div className="text-center py-20">
              <div className="mx-auto h-12 w-12 text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <MagnifyingGlassIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                Nenhum pacote encontrado
              </h3>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Tente ajustar sua busca ou crie um novo pacote.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 transform animate-slide-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingPackage ? 'Editar Pacote' : 'Criar Novo Pacote'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome do Pacote *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Start, Professional, Enterprise"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="Uma breve descrição sobre este pacote"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Quantidade de Tokens *
                </label>
                <input
                  type="number"
                  value={formData.tokenAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, tokenAmount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Cargo Associado *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione um cargo</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Benefícios (um por linha)
                </label>
                <textarea
                  value={formData.features.join('\n')}
                  onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value.split('\n').filter(f => f.trim()) }))}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 font-sans"
                  rows={4}
                  placeholder="Ex:&#10;Acesso ilimitado&#10;Suporte 24/7&#10;Relatórios detalhados"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Dica: Pressione Enter para adicionar cada benefício em uma nova linha.
                </p>
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
                onClick={editingPackage ? handleUpdate : handleCreate}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all font-medium"
              >
                {editingPackage ? 'Salvar Alterações' : 'Criar Pacote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTokenPackagesPage;