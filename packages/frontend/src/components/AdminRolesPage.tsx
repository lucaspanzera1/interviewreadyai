import React, { useEffect, useState } from 'react';
import PageTitle from './PageTitle';
import { apiClient, Role } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import Loading from './Loading';

const AdminRolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getRoles();
      setRoles(data);
    } catch (err: any) {
      setError('Erro ao buscar roles.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await apiClient.createRole(formData);
      showToast('Cargo criado com sucesso!', 'success');
      setShowCreateForm(false);
      resetForm();
      fetchRoles();
    } catch (err: any) {
      showToast('Erro ao criar cargo.', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!editingRole) return;
    try {
      await apiClient.updateRole(editingRole.id, formData);
      showToast('Cargo atualizado com sucesso!', 'success');
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
      color: '#3B82F6',
    });
  };

  const startEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      color: role.color,
    });
  };

  const cancelEdit = () => {
    setEditingRole(null);
    setShowCreateForm(false);
    resetForm();
  };

  return (
    <>
      <PageTitle title="Cargos - TreinaVagaAI" />
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Cargos</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Gerencie os cargos disponíveis no sistema
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Novo Cargo
            </button>
          </div>
        </div>

        {(showCreateForm || editingRole) && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingRole ? 'Editar Cargo' : 'Criar Novo Cargo'}
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cor</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 border border-slate-300 dark:border-slate-600 rounded"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={editingRole ? handleUpdate : handleCreate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  {editingRole ? 'Atualizar' : 'Criar'}
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
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{role.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{role.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: role.color }}
                          />
                          <span className="font-mono text-xs">{role.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => startEdit(role)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
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

export default AdminRolesPage;