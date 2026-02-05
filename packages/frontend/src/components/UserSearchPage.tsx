import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Github, Linkedin, UserPlus, UserMinus, Filter, X } from 'lucide-react';
import { socialApi, PublicUser, SearchUsersParams } from '../lib/socialApi';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Loading from './Loading';

const TECH_AREAS = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Fullstack' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'devops', label: 'DevOps' },
  { value: 'data', label: 'Data Science' },
  { value: 'other', label: 'Outro' }
];

const UserSearchPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchUsersParams>({
    page: 1,
    limit: 12
  });
  const [totalResults, setTotalResults] = useState(0);
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    email: '',
    techArea: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Buscar usuários
  const searchUsers = async (params: SearchUsersParams) => {
    setLoading(true);
    try {
      const response = await socialApi.searchUsers(params);
      setUsers(response.users);
      setTotalResults(response.total);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  };

  // Carregar usuários iniciais
  useEffect(() => {
    searchUsers(searchParams);
  }, [searchParams]);

  // Aplicar filtros
  const handleSearch = () => {
    const params = {
      ...searchParams,
      ...searchFilters,
      page: 1
    };
    setSearchParams(params);
  };

  // Limpar filtros
  const clearFilters = () => {
    setSearchFilters({ name: '', email: '', techArea: '' });
    setSearchParams({ page: 1, limit: 12 });
  };

  // Seguir/deixar de seguir usuário
  const toggleFollow = async (user: PublicUser) => {
    try {
      if (user.isFollowing) {
        await socialApi.unfollowUser(user.id);
        toast.success(`Deixou de seguir ${user.name}`);
      } else {
        await socialApi.followUser(user.id);
        toast.success(`Agora você segue ${user.name}`);
      }

      // Atualizar lista local
      setUsers(users.map(u =>
        u.id === user.id
          ? {
            ...u,
            isFollowing: !u.isFollowing,
            followersCount: u.isFollowing
              ? u.followersCount - 1
              : u.followersCount + 1
          }
          : u
      ));
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error);
      toast.error('Erro ao atualizar seguimento');
    }
  };

  // Ir para próxima página
  const nextPage = () => {
    if (searchParams.page! * searchParams.limit! < totalResults) {
      setSearchParams({ ...searchParams, page: searchParams.page! + 1 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Ir para página anterior
  const prevPage = () => {
    if (searchParams.page! > 1) {
      setSearchParams({ ...searchParams, page: searchParams.page! - 1 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Explorar Comunidade
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Conecte-se com outros desenvolvedores e expanda sua rede
            </p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} md:hidden`}
          >
            <Filter size={18} className="mr-2" />
            Filtros
          </button>
        </div>

        {/* Filtros de busca */}
        <div className={`card overflow-hidden transition-all duration-300 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-4">
                <label className="label">Nome</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por nome..."
                    className="input pl-10"
                    value={searchFilters.name}
                    onChange={(e) => setSearchFilters({ ...searchFilters, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="md:col-span-4">
                <label className="label">Área Tech</label>
                <select
                  className="input appearance-none"
                  value={searchFilters.techArea}
                  onChange={(e) => setSearchFilters({ ...searchFilters, techArea: e.target.value })}
                >
                  <option value="">Todas as áreas</option>
                  {TECH_AREAS.map((area) => (
                    <option key={area.value} value={area.value}>
                      {area.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4 flex gap-3">
                <button
                  onClick={handleSearch}
                  className="btn btn-primary flex-1"
                >
                  <Search size={18} className="mr-2" />
                  Buscar
                </button>
                <button
                  onClick={clearFilters}
                  className="btn btn-ghost"
                  title="Limpar filtros"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {loading ? (
          <div className="py-12">
            <Loading size="lg" text="Buscando usuários..." />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Encontrados <span className="text-slate-900 dark:text-white font-bold">{totalResults}</span> usuários
              </div>
            </div>

            {users.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="bg-slate-50 dark:bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={40} className="text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum usuário encontrado</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Tente ajustar os filtros de busca para encontrar mais pessoas.
                </p>
                <button onClick={clearFilters} className="btn btn-secondary">
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

            {/* Paginação */}
            {totalResults > searchParams.limit! && (
              <div className="flex justify-center items-center gap-4 py-4">
                <button
                  onClick={prevPage}
                  disabled={searchParams.page === 1}
                  className="btn btn-outline disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Página {searchParams.page} de {Math.ceil(totalResults / searchParams.limit!)}
                </span>
                <button
                  onClick={nextPage}
                  disabled={searchParams.page! * searchParams.limit! >= totalResults}
                  className="btn btn-outline disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Componente para card do usuário
const UserCard: React.FC<{
  user: PublicUser;
  currentUserId?: string;
  onToggleFollow: (user: PublicUser) => void;
}> = ({ user, currentUserId, onToggleFollow }) => {
  const isOwnProfile = currentUserId === user.id;
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/profile/${user.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="card group hover:scale-[1.02] transition-transform duration-300 flex flex-col h-full cursor-pointer"
    >
      <div className="card-body flex flex-col h-full">
        {/* Header do Card */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <img
              src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3B82F6&color=ffffff`}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:shadow-md transition-shadow"
            />
            {user.isFollowing && (
              <span className="absolute -bottom-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-slate-800">
                SEGUINDO
              </span>
            )}
          </div>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {user.githubUrl && (
              <a
                href={user.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Github size={18} />
              </a>
            )}
            {user.linkedinUrl && (
              <a
                href={user.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                <Linkedin size={18} />
              </a>
            )}
          </div>
        </div>

        {/* Info do Usuário */}
        <div className="mb-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate" title={user.name}>
            {user.name}
          </h3>
          <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            {user.techArea && (
              <span className="flex items-center gap-1">
                <Briefcase size={12} />
                <span className="capitalize">{user.techArea}</span>
              </span>
            )}
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                <span className="truncate max-w-[100px]">{user.location}</span>
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 line-clamp-2 min-h-[40px]">
          {user.bio || "Sem descrição disponível."}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-6 mt-auto">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-slate-900 dark:text-white">{user.quizStats.totalCompleted}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Quizzes</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center">
            <div className={`text-lg font-bold ${user.quizStats.averageScore >= 70 ? 'text-green-600' :
              user.quizStats.averageScore >= 50 ? 'text-yellow-600' : 'text-slate-900 dark:text-white'
              }`}>
              {user.quizStats.averageScore}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Média</div>
          </div>
        </div>

        {/* Botão de Ação */}
        {!isOwnProfile && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFollow(user);
            }}
            className={`w-full btn ${user.isFollowing
              ? 'btn-outline border-slate-200 hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:border-slate-700 dark:hover:bg-red-900/20'
              : 'btn-primary'
              } gap-2`}
          >
            {user.isFollowing ? (
              <>
                <UserMinus size={18} />
                Deixar de Seguir
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Seguir
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserSearchPage;