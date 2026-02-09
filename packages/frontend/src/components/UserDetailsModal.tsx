import React, { useEffect, useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { apiClient, UserDetails, UserRole } from '../lib/api';
import {
  XMarkIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  MapPinIcon,
  CodeBracketIcon,
  PlusIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface UserDetailsModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ userId, userName, onClose }) => {
  const { showToast } = useToast();
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'tokens' | 'quizzes' | 'flashcards' | 'interviews'>('profile');
  const [showAddTokensModal, setShowAddTokensModal] = useState(false);
  const [addTokensAmount, setAddTokensAmount] = useState('');
  const [addTokensReason, setAddTokensReason] = useState('');
  const [addTokensLoading, setAddTokensLoading] = useState(false);
  const [editingRole, setEditingRole] = useState(false);
  const [newRole, setNewRole] = useState<string>('client');
  const [updateRoleLoading, setUpdateRoleLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const [userDetails, userQuizzes, userFlashcards, userInterviews] = await Promise.all([
          apiClient.getUserDetails(userId),
          apiClient.getUserQuizzesByAdmin(userId),
          apiClient.getUserFlashcardsByAdmin(userId),
          apiClient.getUserInterviewsByAdmin(userId)
        ]);
        setDetails(userDetails);
        setQuizzes(userQuizzes.data || []);
        setFlashcards(userFlashcards.flashcards || []);
        setInterviews(userInterviews.interviews || []);
      } catch (err: any) {
        setError('Erro ao buscar detalhes do usuário.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [userId]);

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

  const getTechAreaLabel = (area?: string) => {
    const labels: Record<string, string> = {
      frontend: 'Frontend',
      backend: 'Backend',
      fullstack: 'Full Stack',
      mobile: 'Mobile',
      devops: 'DevOps',
      data: 'Dados/IA',
      other: 'Outro'
    };
    return area ? labels[area] || area : '-';
  };

  const getCareerTimeLabel = (time?: string) => {
    const labels: Record<string, string> = {
      '0-1': 'Menos de 1 ano',
      '1-3': '1-3 anos',
      '3-5': '3-5 anos',
      '5-10': '5-10 anos',
      '10+': 'Mais de 10 anos'
    };
    return time ? labels[time] || time : '-';
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      quiz_completion: 'Conclusão de Quiz',
      quiz_generation: 'Geração de Quiz',
      quiz_play: 'Jogar Quiz',
      token_added: 'Adição Manual',
      package_purchase: 'Compra de Pacote',
    };
    return labels[reason] || reason;
  };

  const handleAddTokens = async () => {
    const amount = parseInt(addTokensAmount);
    if (!amount || amount <= 0) {
      showToast('Por favor, insira uma quantidade válida de tokens.', 'error');
      return;
    }

    setAddTokensLoading(true);
    try {
      const result = await apiClient.addTokensToUser(userId, amount, addTokensReason || 'admin_grant');
      // Refresh details to show updated balance
      const updatedDetails = await apiClient.getUserDetails(userId);
      setDetails(updatedDetails);
      setShowAddTokensModal(false);
      setAddTokensAmount('');
      setAddTokensReason('');
      showToast(result.message || 'Tokens adicionados com sucesso!', 'success');
    } catch (err: any) {
      showToast('Erro ao adicionar tokens: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setAddTokensLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!newRole) return;
    setUpdateRoleLoading(true);
    try {
      await apiClient.updateUserByAdmin(userId, { role: newRole as UserRole });
      // Update local state
      if (details) {
        setDetails({ ...details, user: { ...details.user, role: newRole as UserRole } });
      }
      setEditingRole(false);
      showToast('Cargo atualizado com sucesso!', 'success');
    } catch (err: any) {
      showToast('Erro ao atualizar cargo: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setUpdateRoleLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'pro': return 'Pro / Premium';
      case 'client': return 'Aluno';
      default: return role;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCircleIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              {userName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-8">ID: {userId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'profile'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
            >
              <UserCircleIcon className="h-4 w-4" />
              Perfil
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'tokens'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
            >
              <CurrencyDollarIcon className="h-4 w-4" />
              Tokens & Saldo
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'quizzes'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
            >
              <AcademicCapIcon className="h-4 w-4" />
              Quizzes Criados <span className="ml-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs">{quizzes.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'flashcards'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
            >
              <DocumentTextIcon className="h-4 w-4" />
              Flashcards <span className="ml-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs">{flashcards.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('interviews')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'interviews'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              Entrevistas <span className="ml-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs">{interviews.length}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30 dark:bg-slate-900/50">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin border-3 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full mb-4"></div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Carregando informações...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
              <span className="p-1 bg-red-100 dark:bg-red-900/30 rounded-full">
                <XMarkIcon className="h-4 w-4" />
              </span>
              {error}
            </div>
          )}

          {!loading && !error && details && (
            <div className="animate-fade-in">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Basic Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <BriefcaseIcon className="h-4 w-4" /> Profissional
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs text-slate-400 block mb-1">Tempo de Carreira</span>
                          <span className="text-slate-900 dark:text-white font-medium">{getCareerTimeLabel(details.profile.careerTime)}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block mb-1">Área Técnica</span>
                          <span className="text-slate-900 dark:text-white font-medium">{getTechAreaLabel(details.profile.techArea)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4" /> Pessoal & Contato
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs text-slate-400 block mb-1">Localização</span>
                          <span className="text-slate-900 dark:text-white font-medium">{details.profile.location || 'Não informado'}</span>
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <span className="text-xs text-slate-400 block mb-1">Celular</span>
                            <span className="text-slate-900 dark:text-white font-mono text-sm">{details.profile.cellphone || '-'}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 block mb-1">CPF/CNPJ</span>
                            <span className="text-slate-900 dark:text-white font-mono text-sm">{details.profile.taxid || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  {details.profile.techStack && details.profile.techStack.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CodeBracketIcon className="h-4 w-4" /> Stack Técnico
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {details.profile.techStack.map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-600"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {details.profile.bio && (
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Sobre</h3>
                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {details.profile.bio}
                      </p>
                    </div>
                  )}

                  {/* Admin Section */}
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <UserCircleIcon className="h-4 w-4" /> Administração
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs text-slate-400 block mb-2">Cargo Atual</span>
                        <div className="flex items-center gap-3">
                          {editingRole ? (
                            <>
                              <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value as UserRole)}
                                className="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                disabled={updateRoleLoading}
                              >
                                <option value="client">Aluno</option>
                                <option value="pro">Pro / Premium</option>
                                <option value="admin">Administrador</option>
                              </select>
                              <button
                                onClick={handleUpdateRole}
                                disabled={updateRoleLoading || !newRole}
                                className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                              >
                                {updateRoleLoading ? 'Salvando...' : 'Salvar'}
                              </button>
                              <button
                                onClick={() => setEditingRole(false)}
                                className="px-3 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${details.user.role === 'admin'
                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800/50'
                                : details.user.role === 'pro'
                                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/50'
                                  : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/50'
                                }`}>
                                {getRoleLabel(details.user.role)}
                              </span>
                              <button
                                onClick={() => {
                                  setNewRole(details.user.role as UserRole);
                                  setEditingRole(true);
                                }}
                                className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Editar cargo"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-4">
                    {details.profile.linkedinUrl && (
                      <a href={details.profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#0077b5]/10 text-[#0077b5] rounded-lg hover:bg-[#0077b5]/20 transition-colors">
                        <span className="font-medium text-sm">LinkedIn</span>
                      </a>
                    )}
                    {details.profile.githubUrl && (
                      <a href={details.profile.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                        <span className="font-medium text-sm">GitHub</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Tokens Tab */}
              {activeTab === 'tokens' && (
                <div className="space-y-6">
                  {/* Add Tokens Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowAddTokensModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Adicionar Tokens
                    </button>
                  </div>

                  {/* Token Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CurrencyDollarIcon className="h-16 w-16 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Saldo Atual</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{details.tokens.currentBalance}</p>
                      <p className="text-xs text-blue-600 mt-2 font-medium">Tokens disponíveis</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden hover:border-emerald-300 transition-colors">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Ganho</p>
                      <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">+{details.tokens.totalEarned}</p>
                      <p className="text-xs text-emerald-600 mt-2 font-medium">Accumulado</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden hover:border-red-300 transition-colors">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Gasto</p>
                      <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">-{details.tokens.totalSpent}</p>
                      <p className="text-xs text-red-600 mt-2 font-medium">Consumido</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Usage Stats */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Estatísticas de Uso</h3>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-700/50 pb-3 last:border-0 last:pb-0">
                          <span className="text-slate-600 dark:text-slate-400 text-sm">Quizzes Gratuitos Completos</span>
                          <span className="font-bold text-slate-900 dark:text-white">{details.quizStats.totalFreeQuizzesCompleted}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-700/50 pb-3 last:border-0 last:pb-0">
                          <span className="text-slate-600 dark:text-slate-400 text-sm">Cota Diária (Gratuito)</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-primary-500" style={{ width: `${(details.quizStats.dailyFreeQuizzesUsed / 3) * 100}%` }}></div>
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white text-sm">{details.quizStats.dailyFreeQuizzesUsed}/3</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400 text-sm">Última Recompensa</span>
                          <span className="font-medium text-slate-900 dark:text-white text-sm">
                            {details.quizStats.lastTokenRewardAt ? formatDate(details.quizStats.lastTokenRewardAt) : 'Nunca'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* History */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Últimas Movimentações</h3>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto p-0">
                        {details.tokens.history.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 text-sm">Nenhuma movimentação registrada.</div>
                        ) : (
                          <table className="w-full text-sm text-left">
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                              {details.tokens.history.map((entry, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/10">
                                  <td className="px-6 py-3">
                                    <p className="font-medium text-slate-900 dark:text-white">{getReasonLabel(entry.reason)}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatDate(entry.createdAt)}</p>
                                  </td>
                                  <td className={`px-6 py-3 text-right font-bold ${entry.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {entry.amount > 0 ? '+' : ''}{entry.amount}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quizzes Tab */}
              {activeTab === 'quizzes' && (
                <div className="grid grid-cols-1 gap-4">
                  {quizzes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      <AcademicCapIcon className="h-12 w-12 mb-3 opacity-50" />
                      <p>Este usuário ainda não criou nenhum quiz.</p>
                    </div>
                  ) : (
                    quizzes.map((quiz) => (
                      <div
                        key={quiz._id}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-shadow group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {quiz.titulo}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{quiz.descricao}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${quiz.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-700'
                            }`}>
                            {quiz.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                          <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{quiz.categoria}</span>
                          </span>
                          <span>{quiz.nivel}</span>
                          <span>•</span>
                          <span>{quiz.quantidade_questoes} questões</span>
                          <span>•</span>
                          <span className={`font-medium ${quiz.isFree ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {quiz.isFree ? 'Gratuito' : 'Premium'}
                          </span>
                        </div>

                        <div className="mt-4 flex gap-2">
                          {quiz.tags && quiz.tags.map((tag: string, idx: number) => (
                            <span key={idx} className="text-xs px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700 text-slate-500">#{tag}</span>
                          ))}
                        </div>

                        <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2">
                            <span className="block text-xs uppercase text-slate-400 font-bold">Acessos</span>
                            <span className="block font-semibold text-slate-800 dark:text-slate-200">{quiz.totalAccess || 0}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2">
                            <span className="block text-xs uppercase text-slate-400 font-bold">Tentativas</span>
                            <span className="block font-semibold text-slate-800 dark:text-slate-200">{quiz.totalAttempts || 0}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2">
                            <span className="block text-xs uppercase text-slate-400 font-bold">Conclusões</span>
                            <span className="block font-semibold text-slate-800 dark:text-slate-200">{quiz.totalCompletions || 0}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2">
                            <span className="block text-xs uppercase text-slate-400 font-bold">Média</span>
                            <span className="block font-semibold text-slate-800 dark:text-slate-200">{quiz.averageScore ? quiz.averageScore.toFixed(0) : 0}%</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Flashcards Tab */}
              {activeTab === 'flashcards' && (
                <div className="grid grid-cols-1 gap-4">
                  {flashcards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      <DocumentTextIcon className="h-12 w-12 mb-3 opacity-50" />
                      <p>Este usuário ainda não criou nenhum flashcard.</p>
                    </div>
                  ) : (
                    flashcards.map((flashcard) => (
                      <div
                        key={flashcard._id}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-shadow group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {flashcard.titulo}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{flashcard.descricao}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${flashcard.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-700'
                            }`}>
                            {flashcard.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                          <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{flashcard.categoria}</span>
                          </span>
                          <span>{flashcard.nivel}</span>
                          <span>•</span>
                          <span>{flashcard.quantidade_cards} cards</span>
                          <span>•</span>
                          <span className={`font-medium ${flashcard.isFree ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {flashcard.isFree ? 'Gratuito' : 'Premium'}
                          </span>
                        </div>

                        <div className="mt-4 flex gap-2">
                          {flashcard.tags && flashcard.tags.map((tag: string, idx: number) => (
                            <span key={idx} className="text-xs px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700 text-slate-500">#{tag}</span>
                          ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2">
                            <span className="block text-xs uppercase text-slate-400 font-bold">Sessões</span>
                            <span className="block font-semibold text-slate-800 dark:text-slate-200">{flashcard.totalSessions || 0}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2">
                            <span className="block text-xs uppercase text-slate-400 font-bold">Cards Estudados</span>
                            <span className="block font-semibold text-slate-800 dark:text-slate-200">{flashcard.totalCardsStudied || 0}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2">
                            <span className="block text-xs uppercase text-slate-400 font-bold">Tempo Médio</span>
                            <span className="block font-semibold text-slate-800 dark:text-slate-200">{flashcard.averageSessionTime ? Math.round(flashcard.averageSessionTime / 60) : 0}min</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Interviews Tab */}
              {activeTab === 'interviews' && (
                <div className="grid grid-cols-1 gap-4">
                  {interviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      <ChatBubbleLeftRightIcon className="h-12 w-12 mb-3 opacity-50" />
                      <p>Este usuário ainda não criou nenhuma entrevista.</p>
                    </div>
                  ) : (
                    interviews.map((interview) => (
                      <div
                        key={interview._id}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-shadow group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {interview.jobTitle}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{interview.companyName}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${interview.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-700'
                            }`}>
                            {interview.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                          <span>{interview.interviewType}</span>
                          <span>•</span>
                          <span>{interview.estimatedDuration} min</span>
                          <span>•</span>
                          <span>{interview.totalAttempts || 0} tentativas</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Tokens Modal */}
        {showAddTokensModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowAddTokensModal(false)}>
            <div
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in border border-slate-200 dark:border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  Adicionar Tokens
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Adicionar tokens manualmente à conta de {userName}</p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Quantidade de Tokens
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={addTokensAmount}
                    onChange={(e) => setAddTokensAmount(e.target.value)}
                    placeholder="Ex: 10"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Motivo (opcional)
                  </label>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      'Bônus de Boas-vindas',
                      'Reembolso de Token',
                      'Premiação de Concurso',
                      'Ajuste Administrativo',
                      'Teste Interno',
                      'Cortesia'
                    ].map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setAddTokensReason(reason)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all font-medium ${addTokensReason === reason
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800 ring-1 ring-primary-500/20'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={addTokensReason}
                      onChange={(e) => setAddTokensReason(e.target.value)}
                      placeholder="Ou digite um motivo personalizado..."
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddTokensModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddTokens}
                  disabled={addTokensLoading || !addTokensAmount}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {addTokensLoading && <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>}
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default UserDetailsModal;
