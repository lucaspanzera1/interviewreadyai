import React, { useEffect, useState } from 'react';
import PageTitle from './PageTitle';
import { apiClient, TokenPackage, Role } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import Loading from './Loading';

const AdminTokenPackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
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
    setError(null);
    try {
      const data = await apiClient.getTokenPackages();
      setPackages(data);
    } catch (err: any) {
      setError('Erro ao buscar pacotes de tokens.');
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
    try {
      await apiClient.createTokenPackage(formData);
      showToast('Pacote criado com sucesso!', 'success');
      setShowCreateForm(false);
      resetForm();
      fetchPackages();
    } catch (err: any) {
      showToast('Erro ao criar pacote.', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!editingPackage) return;
    try {
      await apiClient.updateTokenPackage(editingPackage.id, formData);
      showToast('Pacote atualizado com sucesso!', 'success');
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
  };

  const cancelEdit = () => {
    setEditingPackage(null);
    setShowCreateForm(false);
    resetForm();
  };

  return (
    <>
      <PageTitle title="Pacotes de Tokens - TreinaVagaAI" />
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Pacotes de Tokens</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Gerencie os pacotes de tokens disponíveis para resgate
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Novo Pacote
            </button>
          </div>
        </div>

        {(showCreateForm || editingPackage) && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingPackage ? 'Editar Pacote' : 'Criar Novo Pacote'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Quantidade de Tokens</label>
                <input
                  type="number"
                  value={formData.tokenAmount}
                  onChange={(e) => setFormData({ ...formData, tokenAmount: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cargo</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Selecione um cargo</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Features (uma por linha)</label>
                <textarea
                  value={formData.features.join('\n')}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value.split('\n').filter(f => f.trim()) })}
                  className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  rows={4}
                  placeholder="Acesso ilimitado a quizzes&#10;Suporte prioritário&#10;Relatórios avançados"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={editingPackage ? handleUpdate : handleCreate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  {editingPackage ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && <Loading />}

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
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Descrição</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tokens</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cargo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Features</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{pkg.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{pkg.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{pkg.tokenAmount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
                          style={{ backgroundColor: pkg.role.color + '20', color: pkg.role.color, borderColor: pkg.role.color + '40' }}
                        >
                          {pkg.role.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {pkg.features && pkg.features.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {pkg.features.slice(0, 2).map((feature, index) => (
                              <li key={index} className="text-xs">{feature}</li>
                            ))}
                            {pkg.features.length > 2 && (
                              <li className="text-xs text-slate-400">+{pkg.features.length - 2} mais...</li>
                            )}
                          </ul>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => startEdit(pkg)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Desativar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminTokenPackagesPage;