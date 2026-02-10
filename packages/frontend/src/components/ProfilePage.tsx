import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { apiClient } from '../lib/api';
import {
  UserCircleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  IdentificationIcon,
  CalendarIcon,
  ShieldCheckIcon,
  TicketIcon,
  BriefcaseIcon,
  MapPinIcon,
  DocumentTextIcon,
  CpuChipIcon,
  AcademicCapIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  GiftIcon,
  TrophyIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import ActivityHeatmap from './ActivityHeatmap';
import SocialConnectionsComponent from './SocialConnectionsComponent';
import { maskCPF, maskPhone, unmask } from '../utils/masks';

const LinkedInIcon = (props: React.ComponentProps<'svg'>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GitHubIcon = (props: React.ComponentProps<'svg'>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const extractUsername = (url?: string) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const pathname = urlObj.pathname.replace(/\/$/, ''); // Remove trailing slash
    const parts = pathname.split('/');
    return parts[parts.length - 1] || url;
  } catch {
    return url;
  }
};

const TECH_STACK_OPTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
  'Python', 'Java', 'C#', '.NET', 'PHP', 'Ruby', 'Go', 'Rust',
  'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes',
  'AWS', 'Azure', 'GCP', 'Git', 'Linux', 'Figma', 'Adobe XD'
];

interface FormData {
  name: string;
  careerTime: string;
  niche: string;
  techStack: string[];
  bio: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  cellphone: string;
  taxid: string;
}

interface Reward {
  type: string;
  amount: number;
  reason: string;
  createdAt: string;
}

/**
 * Página de perfil do usuário
 */
const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Estados de edição separados para cada seção
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [isEditingHeader, setIsEditingHeader] = useState(false);

  // Estados de loading separados para cada seção
  const [isLoadingPersonal, setIsLoadingPersonal] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isLoadingProfessional, setIsLoadingProfessional] = useState(false);
  const [isLoadingHeader, setIsLoadingHeader] = useState(false);

  // Estados para header
  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
  const [headerImagePreview, setHeaderImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    careerTime: user?.careerTime || '',
    niche: user?.niche || '',
    techStack: user?.techStack || [],
    bio: user?.bio || '',
    location: user?.location || '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || '',
    cellphone: maskPhone(user?.cellphone || ''),
    taxid: maskCPF(user?.taxid || ''),
  });

  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    totalFreeQuizzesCompleted: 0
  });

  const [activityData, setActivityData] = useState<{ date: string; count: number }[]>([]);
  const [recentRewards, setRecentRewards] = useState<Reward[]>([]);


  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiClient.getGeneralStats();
        if (data) {
          setStats({
            totalAttempts: data.totalAttempts || 0,
            averageScore: data.averageScore || 0,
            totalFreeQuizzesCompleted: data.totalFreeQuizzesCompleted || 0
          });
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    };

    const loadActivity = async () => {
      try {
        // Fetch combined activity for the heatmap
        const result = await apiClient.getCombinedActivity(1000);
        if (result && result.length > 0) {
          const data = result.map((a: any) => ({ date: a.date, count: a.totalActivities }));
          setActivityData(data);
        }
      } catch (error) {
        console.error('Error loading activity:', error);
      }
    };

    const loadRewards = async () => {
      try {
        const data = await apiClient.getRewardHistory();
        if (data) {
          setRecentRewards(data);
        }
      } catch (error) {
        console.error('Erro ao carregar recompensas:', error);
      }
    };

    if (user) {
      loadStats();
      loadActivity();
      loadRewards();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;

    if (name === 'cellphone') {
      value = maskPhone(value);
    } else if (name === 'taxid') {
      value = maskCPF(value);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTechStackToggle = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter((t) => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  // Função para verificar se houve alterações em campos específicos
  const hasChanges = (fields: (keyof FormData)[]) => {
    return fields.some(field => {
      const currentValue = formData[field];
      const userValue = user?.[field];

      if (Array.isArray(currentValue) && Array.isArray(userValue)) {
        return JSON.stringify(currentValue.sort()) !== JSON.stringify(userValue.sort());
      }
      return currentValue !== userValue;
    });
  };

  // Funções de salvar para cada seção
  const handleSavePersonal = async () => {
    const fields: (keyof FormData)[] = ['name', 'bio', 'location', 'linkedinUrl', 'githubUrl'];
    if (!hasChanges(fields)) {
      setIsEditingPersonal(false);
      return;
    }

    setIsLoadingPersonal(true);
    try {
      const dataToUpdate = {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
      };
      await updateProfile(dataToUpdate);
      setIsEditingPersonal(false);
    } catch {
      showToast('Erro ao atualizar informações pessoais', 'error');
    } finally {
      setIsLoadingPersonal(false);
    }
  };

  const handleSavePayment = async () => {
    const fields: (keyof FormData)[] = ['cellphone', 'taxid'];
    if (!hasChanges(fields)) {
      setIsEditingPayment(false);
      return;
    }

    setIsLoadingPayment(true);
    try {
      const dataToUpdate = {
        cellphone: unmask(formData.cellphone),
        taxid: unmask(formData.taxid),
      };
      await updateProfile(dataToUpdate);
      setIsEditingPayment(false);
    } catch {
      showToast('Erro ao atualizar dados de pagamento', 'error');
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const handleSaveProfessional = async () => {
    const fields: (keyof FormData)[] = ['careerTime', 'niche', 'techStack'];
    if (!hasChanges(fields)) {
      setIsEditingProfessional(false);
      return;
    }

    setIsLoadingProfessional(true);
    try {
      const dataToUpdate = {
        careerTime: formData.careerTime,
        niche: formData.niche,
        techStack: formData.techStack.filter(s => s),
      };
      await updateProfile(dataToUpdate);
      setIsEditingProfessional(false);
    } catch {
      showToast('Erro ao atualizar perfil profissional', 'error');
    } finally {
      setIsLoadingProfessional(false);
    }
  };

  const handleSaveHeader = async () => {
    if (!headerImageFile) {
      setIsEditingHeader(false);
      return;
    }

    setIsLoadingHeader(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('headerImage', headerImageFile);
      await updateProfile(formDataToSend);
      setIsEditingHeader(false);
      setHeaderImageFile(null);
      setHeaderImagePreview(null);
    } catch {
      showToast('Erro ao atualizar imagem do header', 'error');
    } finally {
      setIsLoadingHeader(false);
    }
  };

  const handleCancelHeader = () => {
    setIsEditingHeader(false);
    setHeaderImageFile(null);
    setHeaderImagePreview(null);
  };

  const handleHeaderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Por favor, selecione um arquivo de imagem válido', 'error');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => setHeaderImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setHeaderImageFile(file);
    }
  };

  // Funções de cancelar para cada seção
  const handleCancelPersonal = () => {
    setFormData(prev => ({
      ...prev,
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      linkedinUrl: user?.linkedinUrl || '',
      githubUrl: user?.githubUrl || '',
    }));
    setIsEditingPersonal(false);
  };

  const handleCancelPayment = () => {
    setFormData(prev => ({
      ...prev,
      cellphone: maskPhone(user?.cellphone || ''),
      taxid: maskCPF(user?.taxid || ''),
    }));
    setIsEditingPayment(false);
  };

  const handleCancelProfessional = () => {
    setFormData(prev => ({
      ...prev,
      careerTime: user?.careerTime || '',
      niche: user?.niche || '',
      techStack: user?.techStack || [],
    }));
    setIsEditingProfessional(false);
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

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '';
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
    // Remove /api from the start of the path if it exists
    const cleanPath = imagePath.replace(/^\/api/, '');
    return `${baseUrl}${cleanPath}`;
  };

  const careerTimeOptions = [
    { value: '0-1', label: '0-1 ano' },
    { value: '1-3', label: '1-3 anos' },
    { value: '3-5', label: '3-5 anos' },
    { value: '5-10', label: '5-10 anos' },
    { value: '10+', label: '10+ anos' },
  ];

  const nicheOptions = [
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'educacao', label: 'Educação' },
    { value: 'recursos_humanos', label: 'Recursos Humanos' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'saude', label: 'Saúde' },
    { value: 'vendas', label: 'Vendas' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'outro', label: 'Outro' },
  ];

  return (
    <>
      <PageTitle title="Perfil - TreinaVagaAI" />

      <div className="space-y-8 pb-32">
        {/* Hero Section with Header & Avatar */}
        <div className="relative mb-24 md:mb-32 group">
          <div className="relative w-full aspect-[3/1] max-h-[500px] min-h-[200px] rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10">
            {/* Header Image */}
            {(headerImagePreview || user?.headerImage) ? (
              <img
                src={headerImagePreview || getImageUrl(user?.headerImage)}
                alt="Header"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-primary-600"></div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

            {/* Header Edit Controls */}
            <div className="absolute top-4 right-4 z-20 flex flex-col items-end">
              {!isEditingHeader ? (
                <button
                  onClick={() => setIsEditingHeader(true)}
                  className="flex items-center text-sm font-medium text-white bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full transition-all border border-white/10"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Editar Capa
                </button>
              ) : (
                <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-xs font-medium text-white shadow-lg">
                    Recomendado: 1500x500px
                  </div>
                  <div className="flex gap-2 p-1.5 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
                    <label className="cursor-pointer flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeaderFileChange}
                        className="hidden"
                      />
                      Escolher
                    </label>
                    <button
                      onClick={handleSaveHeader}
                      className="flex items-center justify-center w-10 h-10 text-white bg-green-600 hover:bg-green-500 rounded-lg transition-colors shadow-lg shadow-green-600/20"
                      disabled={isLoadingHeader}
                      title="Salvar"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleCancelHeader}
                      className="flex items-center justify-center w-10 h-10 text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                      disabled={isLoadingHeader}
                      title="Cancelar"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Overlapping Profile Info */}
          <div className="absolute -bottom-16 md:-bottom-24 left-0 w-full px-6 md:px-10 flex flex-col md:flex-row items-end gap-6 z-10 pointer-events-none">
            <div className="relative shrink-0 pointer-events-auto group/avatar">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-32 h-32 md:w-48 md:h-48 rounded-full border-[6px] border-white dark:border-slate-900 shadow-2xl object-cover bg-white dark:bg-slate-900 group-hover/avatar:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-[6px] border-white dark:border-slate-900 shadow-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover/avatar:scale-105 transition-transform duration-300">
                  <UserCircleIcon className="w-20 h-20" />
                </div>
              )}
            </div>

            <div className="flex-1 pb-4 md:pb-6 text-center md:text-left pointer-events-auto">
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
                {user?.name}
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <span className="text-primary-600 dark:text-primary-400">@{user?.email?.split('@')[0]}</span>
                </div>
                {user?.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPinIcon className="w-4 h-4" />
                    {user.location}
                  </div>
                )}
                {user?.niche && (
                  <div className="flex items-center gap-1.5">
                    <BriefcaseIcon className="w-4 h-4" />
                    {nicheOptions.find(opt => opt.value === user.niche)?.label || user.niche}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Column Group */}
          <div className="lg:col-span-2 space-y-6 sticky top-6">

            {/* 1. PERSONAL INFO CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Informações Pessoais</h2>
                {!isEditingPersonal ? (
                  <button
                    onClick={() => setIsEditingPersonal(true)}
                    className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 mr-1.5 opacity-70" />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelPersonal}
                      className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-all"
                      disabled={isLoadingPersonal}
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Cancelar
                    </button>
                    <button
                      onClick={handleSavePersonal}
                      className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-all shadow-md shadow-primary-600/20 active:scale-95"
                      disabled={isLoadingPersonal}
                    >
                      <CheckIcon className="h-4 w-4 mr-1.5" />
                      {isLoadingPersonal ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md">
                    <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">{user?.email}</span>
                  </div>
                </div>

                <div className="space-y-6 max-w-xl">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nome Completo
                    </label>
                    {isEditingPersonal ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary-500 dark:text-white"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md">
                        <IdentificationIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                        <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">{user?.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Biografia
                    </label>
                    {isEditingPersonal ? (
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={3}
                        className="block w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary-500 dark:text-white resize-none"
                      />
                    ) : (
                      <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md">
                        <DocumentTextIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">
                          {user?.bio || 'Não informado'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Localização
                    </label>
                    {isEditingPersonal ? (
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary-500 dark:text-white"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md">
                        <MapPinIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                        <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">
                          {user?.location || 'Não informado'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        LinkedIn
                      </label>
                      {isEditingPersonal ? (
                        <input
                          type="url"
                          name="linkedinUrl"
                          value={formData.linkedinUrl}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary-500 dark:text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md">
                          <LinkedInIcon className="h-5 w-5 text-[#0a66c2] dark:text-[#0a66c2]" />
                          {user?.linkedinUrl ? (
                            <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium">
                              {extractUsername(user.linkedinUrl)}
                            </a>
                          ) : <span className="text-slate-500 text-sm">N/A</span>}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        GitHub
                      </label>
                      {isEditingPersonal ? (
                        <input
                          type="url"
                          name="githubUrl"
                          value={formData.githubUrl}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary-500 dark:text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md">
                          <GitHubIcon className="h-5 w-5 text-[#24292f] dark:text-white" />
                          {user?.githubUrl ? (
                            <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium">
                              {extractUsername(user.githubUrl)}
                            </a>
                          ) : <span className="text-slate-500 text-sm">N/A</span>}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* 1.5. PAYMENT DATA CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Dados de Pagamento</h2>
                {!isEditingPayment ? (
                  <button
                    onClick={() => {
                      setIsEditingPayment(true);
                      // Se o taxid estiver mascarado, limpar o campo para facilitar a redigitação
                      if (formData.taxid && formData.taxid.includes('*')) {
                        setFormData(prev => ({ ...prev, taxid: '' }));
                      }
                    }}
                    className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 mr-1.5 opacity-70" />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelPayment}
                      className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-all"
                      disabled={isLoadingPayment}
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Cancelar
                    </button>
                    <button
                      onClick={handleSavePayment}
                      className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-all shadow-md shadow-primary-600/20 active:scale-95"
                      disabled={isLoadingPayment}
                    >
                      <CheckIcon className="h-4 w-4 mr-1.5" />
                      {isLoadingPayment ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="max-w-md space-y-6">
                  {/* Cellphone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Telefone <span className="text-red-500">*</span>
                    </label>
                    {isEditingPayment ? (
                      <input
                        type="tel"
                        name="cellphone"
                        value={formData.cellphone}
                        onChange={handleInputChange}
                        placeholder="(11) 99999-9999"
                        className="block w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary-500 dark:text-white"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md">
                        <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded text-green-600 dark:text-green-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">
                          {user?.cellphone ? maskPhone(user.cellphone) : 'Não informado'}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Necessário para pagamentos via PIX
                    </p>
                  </div>

                  {/* Tax ID (CPF) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      CPF <span className="text-red-500">*</span>
                    </label>
                    {isEditingPayment ? (
                      <input
                        type="text"
                        name="taxid"
                        value={formData.taxid}
                        onChange={handleInputChange}
                        placeholder="000.000.000-00"
                        className="block w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary-500 dark:text-white"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md">
                        <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                        </div>
                        <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">
                          {user?.taxid ? maskCPF(user.taxid) : 'Não informado'}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Necessário para pagamentos via PIX
                    </p>
                  </div>

                  {/* Payment Status */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                        <ShieldCheckIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                          {user?.cellphone && user?.taxid ? 'Pronto para pagamentos' : 'Complete seus dados'}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          {user?.cellphone && user?.taxid
                            ? 'Você pode adquirir planos pagos via PIX'
                            : 'Adicione telefone e CPF para desbloquear pagamentos'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PROFESSIONAL PROFILE CARD (NEW SECTION) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Perfil Profissional</h2>
                {!isEditingProfessional ? (
                  <button
                    onClick={() => setIsEditingProfessional(true)}
                    className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 mr-1.5 opacity-70" />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelProfessional}
                      className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-all"
                      disabled={isLoadingProfessional}
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveProfessional}
                      className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-all shadow-md shadow-primary-600/20 active:scale-95"
                      disabled={isLoadingProfessional}
                    >
                      <CheckIcon className="h-4 w-4 mr-1.5" />
                      {isLoadingProfessional ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Tech Area */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nicho
                    </label>
                    {isEditingProfessional ? (
                      <select
                        name="niche"
                        value={formData.niche}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary-500 dark:text-white"
                      >
                        <option value="">Selecione...</option>
                        {nicheOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    ) : (
                      <div className="text-base font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <AcademicCapIcon className="w-5 h-5 text-primary-500" />
                        {nicheOptions.find(opt => opt.value === user?.niche)?.label || 'Não informado'}
                      </div>
                    )}
                  </div>

                  {/* Career Time */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Experiência
                    </label>
                    {isEditingProfessional ? (
                      <select
                        name="careerTime"
                        value={formData.careerTime}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary-500 dark:text-white"
                      >
                        <option value="">Selecione...</option>
                        {careerTimeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    ) : (
                      <div className="text-base font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <BriefcaseIcon className="w-5 h-5 text-primary-500" />
                        {careerTimeOptions.find(opt => opt.value === user?.careerTime)?.label || 'Não informado'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <CpuChipIcon className="w-4 h-4" />
                    Stack e Tecnologias
                  </label>
                  {isEditingProfessional ? (
                    <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-xl">
                      {TECH_STACK_OPTIONS.map((tech) => {
                        const isSelected = formData.techStack.includes(tech);
                        return (
                          <button
                            key={tech}
                            onClick={() => handleTechStackToggle(tech)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                              ${isSelected
                                ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                          >
                            {tech}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user?.techStack && user.techStack.length > 0 ? (
                        user.techStack.map((tech, i) => (
                          <span key={i} className="px-3 py-1 bg-primary-600 text-white shadow-sm shadow-primary-500/30 rounded-full text-xs font-medium">
                            {tech}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 text-sm">Nenhuma tecnologia listada</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column Group (Account Details, etc) */}
          <div className="lg:col-span-1 space-y-6 sticky top-6">
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
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Plano</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${user?.role === 'admin'
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800 text-primary-700 dark:text-primary-300'
                    : user?.role === 'client'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                    }`}>
                    {user?.role === 'admin' ? 'Administrador' : user?.role === 'client' ? 'Gratuito' : user?.role || 'Usuário'}
                  </span>
                </div>

                {user?.roleExpiresAt && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Plano expira em</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatDate(user.roleExpiresAt)}
                    </span>
                  </div>
                )}
              </div>

              <div className="px-6 pb-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                      <TicketIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tokens</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {user?.tokens || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity & Achievements Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Atividades & Conquistas</h2>
              </div>
              <div className="p-6 space-y-4">
                <button
                  onClick={() => navigate('/profile/quiz-history')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                      <ChartBarIcon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900 dark:text-white">Histórico de Quizzes</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Veja seu progresso e pontuações</p>
                    </div>
                  </div>
                  <ArrowRightOnRectangleIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                </button>

                <div className="py-4">
                  <ActivityHeatmap
                    data={activityData}
                    totalActivities={activityData.reduce((acc, curr) => acc + curr.count, 0)}
                    startDate={new Date(2026, 1, 1)}
                    endDate={new Date(2027, 1, 1)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <AcademicCapIcon className="h-6 w-6 text-primary-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Quizzes Feitos</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalAttempts}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <ShieldCheckIcon className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Média Geral</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{(stats.averageScore * 10).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Rewards Section */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <TicketIcon className="h-4 w-4 text-amber-500" />
                    Recompensas
                  </h3>

                  {/* Progress to next reward */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Quizzes gratuitos feitos</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {stats.totalFreeQuizzesCompleted}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(stats.totalFreeQuizzesCompleted % 5) * 20}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Próximo token em {5 - (stats.totalFreeQuizzesCompleted % 5)} quizzes</span>
                      <span>{stats.totalFreeQuizzesCompleted % 5}/5</span>
                    </div>
                  </div>

                  {/* Reward History */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-medium text-slate-700 dark:text-slate-300">Histórico de Recompensas</h4>
                      <button
                        onClick={() => navigate('/profile/reward-history')}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Ver completo
                      </button>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {recentRewards.length > 0 ? (
                        recentRewards.slice(0, 3).map((reward, index) => {
                          const isPackage = reward.type === 'package';
                          const isRole = reward.type === 'plan' || reward.type === 'role';

                          return (
                            <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-lg">
                              <div className="flex items-center gap-2">
                                {reward.type === 'token' ? (
                                  <TicketIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                ) : reward.type === 'badge' ? (
                                  <TrophyIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                                ) : isPackage ? (
                                  <ShoppingBagIcon className="h-4 w-4 text-rose-500" />
                                ) : isRole ? (
                                  <ShieldCheckIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                                ) : (
                                  <GiftIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                                )}
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                  {reward.type === 'token' ? `${reward.amount > 0 ? '+' : ''}${reward.amount} Tokens` :
                                    reward.type === 'badge' ? 'Nova Conquista' :
                                      isPackage ? (reward.reason.includes(':') ? reward.reason.split(':')[1] : 'Pacote') :
                                        isRole ? 'Plano Ativado' : 'Recompensa'}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(reward.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                          Nenhuma recompensa recebida ainda
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SOCIAL CONNECTIONS */}
            <SocialConnectionsComponent />

            {/* Logout Button */}
            {/* ... previous code ... */}
            {/* Account Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/settings')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg transition-all text-sm font-medium shadow-sm"
              >
                <Cog6ToothIcon className="h-4 w-4" />
                Configurações
              </button>

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


      </div>
    </>
  );
};

export default ProfilePage;