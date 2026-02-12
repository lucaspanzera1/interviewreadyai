import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Github, Linkedin, UserPlus, UserMinus, Filter, X, Sparkles, User, Loader2 } from 'lucide-react';
import { socialApi, PublicUser, SearchUsersParams } from '../lib/socialApi';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { getNicheIcon } from '../utils/nicheIcons';

const NICHOS = [
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'educacao', label: 'Educação' },
  { value: 'recursos_humanos', label: 'Recursos Humanos' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'saude', label: 'Saúde' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'outro', label: 'Outro' }
];

// Hook de Debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const UserSearchPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados de Filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0
  });

  const [showFilters, setShowFilters] = useState(false);
  const isFirstRender = useRef(true);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Buscar usuários
  const searchUsers = async (page = 1, term = '', niche = '', append = false) => {
    setLoading(true);
    if (!append) {
      setUsers([]);
    }
    try {
      const params: SearchUsersParams = {
        page,
        limit: pagination.limit,
        name: term,
        niche: niche
      };

      const response = await socialApi.searchUsers(params);

      if (append) {
        setUsers(prev => [...prev, ...response.users]);
      } else {
        setUsers(response.users);
      }

      setPagination(prev => ({ ...prev, total: response.total, page }));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Não foi possível carregar os estudantes.');
    } finally {
      setLoading(false);
    }
  };

  // Efeito para busca automática quando filtros mudam
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Reset para página 1 quando filtros mudam
    searchUsers(1, debouncedSearchTerm, selectedNiche);
  }, [debouncedSearchTerm, selectedNiche]);

  // Carga inicial
  useEffect(() => {
    searchUsers(1);
  }, []);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading && users.length < pagination.total) {
          searchUsers(pagination.page + 1, debouncedSearchTerm, selectedNiche, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loading, pagination, debouncedSearchTerm, selectedNiche, users.length]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedNiche('');
  };

  const toggleFollow = async (user: PublicUser) => {
    // Otimistic UI Update
    const originalUsers = [...users];
    const updatedUsers = users.map(u =>
      u.id === user.id
        ? {
          ...u,
          isFollowing: !u.isFollowing,
          followersCount: u.isFollowing ? u.followersCount - 1 : u.followersCount + 1
        }
        : u
    );
    setUsers(updatedUsers);

    try {
      if (user.isFollowing) {
        await socialApi.unfollowUser(user.id);
        toast.info(`Você deixou de seguir ${user.name.split(' ')[0]}`);
      } else {
        await socialApi.followUser(user.id);
        toast.success(`Você agora segue ${user.name.split(' ')[0]}`);
      }
    } catch (error) {
      // Revert on error
      setUsers(originalUsers);
      toast.error('Erro ao atualizar. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Hero Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Sparkles className="text-yellow-500" size={24} />
                Explorar Comunidade
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">
                Conecte-se com {pagination.total > 0 ? pagination.total : 'outros'} estudantes incríveis
              </p>
            </div>

            {/* Search Bar Desktop */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por nome..."
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white rounded-xl py-2.5 pl-10 pr-4 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl border transition-colors ${showFilters || selectedNiche
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                title="Filtros"
              >
                <Filter size={20} />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters || selectedNiche ? 'max-h-20 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setSelectedNiche('')}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${selectedNiche === ''
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}
              >
                Todos
              </button>
              {NICHOS.map((niche) => (
                <button
                  key={niche.value}
                  onClick={() => setSelectedNiche(selectedNiche === niche.value ? '' : niche.value)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-2 ${selectedNiche === niche.value
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                >
                  {getNicheIcon(niche.value, "w-4 h-4")}
                  {niche.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Loading State */}
        {loading && users.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <User size={48} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Nenhum estudante encontrado
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
                  Não encontramos ninguém com os critérios atuais. Tente buscar por outro nome ou limpar os filtros.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    currentUserId={currentUser?.id}
                    onToggleFollow={toggleFollow}
                  />
                ))}
              </div>
            )}

            {/* Infinite Scroll Loader */}
            {(loading && users.length > 0) && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            )}

            {/* Sentinel element for infinite scroll */}
            <div ref={loadMoreRef} className="h-4 w-full" />
          </>
        )}
      </div>
    </div>
  );
};

// Skeleton Loader
const UserCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
    </div>
    <div className="space-y-2 mb-6">
      <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
    </div>
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
      <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
    </div>
    <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
  </div>
);

// Improved User Card
const UserCard: React.FC<{
  user: PublicUser;
  currentUserId?: string;
  onToggleFollow: (user: PublicUser) => void;
}> = ({ user, currentUserId, onToggleFollow }) => {
  const isOwnProfile = currentUserId === user.id;
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/profile/${user.id}`)}
      className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden"
    >
      {/* Decorative Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none dark:from-indigo-900/10" />

      <div className="relative flex items-start justify-between mb-4 z-10">
        <div className="relative">
          <img
            src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=ffffff&bold=true`}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-4 ring-white dark:ring-slate-800 group-hover:scale-105 transition-transform duration-300"
          />
          {user.isFollowing && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" title="Você segue este estudante">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          )}
        </div>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          {user.githubUrl && (
            <a
              href={user.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-700 transition-all"
              title="GitHub"
            >
              <Github size={18} />
            </a>
          )}
          {user.linkedinUrl && (
            <a
              href={user.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              title="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
          )}
        </div>
      </div>

      <div className="z-10 mb-4">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {user.name}
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {user.niche ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50 text-xs font-medium text-slate-600 dark:text-slate-300">
              {getNicheIcon(user.niche, "w-3 h-3 text-slate-500")}
              <span className="capitalize">{user.niche.replace('_', ' ')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-400">
              <Briefcase size={10} />
              <span>Sem nicho</span>
            </span>
          )}
          {user.location && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400">
              <MapPin size={10} />
              <span className="truncate max-w-[80px]">{user.location}</span>
            </span>
          )}
        </div>
      </div>

      <div className="z-10 flex-grow mb-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[40px] leading-relaxed">
          {user.bio || <span className="italic opacity-50">Sem descrição disponível para este perfil.</span>}
        </p>
      </div>

      <div className="z-10 mt-auto space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-2.5 text-center border border-slate-100 dark:border-slate-700">
            <div className="text-lg font-bold text-slate-900 dark:text-white leading-none mb-1">
              {user.quizStats.totalCompleted}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Quizzes
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-2.5 text-center border border-slate-100 dark:border-slate-700">
            <div className={`text-lg font-bold leading-none mb-1 ${user.quizStats.averageScore >= 80 ? 'text-green-500' :
              user.quizStats.averageScore >= 50 ? 'text-orange-500' :
                'text-slate-900 dark:text-white'
              }`}>
              {user.quizStats.averageScore}%
            </div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Média
            </div>
          </div>
        </div>

        {!isOwnProfile && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFollow(user);
            }}
            className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ${user.isFollowing
              ? 'bg-transparent border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-[0.98]'
              }`}
          >
            {user.isFollowing ? (
              <>
                <UserMinus size={16} />
                <span>Deixar de Seguir</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Seguir</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserSearchPage;