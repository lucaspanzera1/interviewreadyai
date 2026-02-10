import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  Github,
  Linkedin,
  Users,
  UserPlus,
  UserMinus,
  Clock,
  Target
} from 'lucide-react';
import { socialApi, PublicUser, UserConnections } from '../lib/socialApi';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Loading from './Loading';
import ActivityHeatmap from './ActivityHeatmap';

const CAREER_TIME_LABELS: Record<string, string> = {
  '0-1': 'Menos de 1 ano',
  '1-3': '1-3 anos',
  '3-5': '3-5 anos',
  '5-10': '5-10 anos',
  '10+': 'Mais de 10 anos'
};

const NICHE_LABELS: Record<string, string> = {
  'tecnologia': 'Tecnologia',
  'educacao': 'Educação',
  'recursos_humanos': 'Recursos Humanos',
  'financeiro': 'Financeiro',
  'saude': 'Saúde',
  'vendas': 'Vendas',
  'marketing': 'Marketing',
  'outro': 'Outro'
};

const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [connections, setConnections] = useState<UserConnections | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'followers' | 'following'>('profile');

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileData, connectionsData] = await Promise.all([
        socialApi.getPublicProfile(userId!),
        socialApi.getUserConnections(userId!)
      ]);

      setProfile(profileData);
      setConnections(connectionsData);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar perfil');
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!profile) return;

    try {
      if (profile.isFollowing) {
        await socialApi.unfollowUser(profile.id);
        toast.success(`Deixou de seguir ${profile.name}`);
      } else {
        await socialApi.followUser(profile.id);
        toast.success(`Agora você segue ${profile.name}`);
      }

      // Atualizar profile local
      setProfile({
        ...profile,
        isFollowing: !profile.isFollowing,
        followersCount: profile.isFollowing
          ? profile.followersCount - 1
          : profile.followersCount + 1
      });
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error);
      toast.error('Erro ao atualizar seguimento');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return <Loading fullScreen text="Carregando perfil..." />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserMinus className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Perfil não encontrado</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Não conseguimos encontrar o perfil que você está procurando.</p>
          <button
            onClick={() => navigate('/search')}
            className="btn btn-primary w-full"
          >
            Voltar para busca
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="card relative overflow-hidden bg-white dark:bg-slate-800 border-0 ring-1 ring-slate-200 dark:ring-slate-700">
        <div className="relative w-full aspect-[3/1] max-h-[500px] min-h-[200px]">
          {profile.headerImage ? (
            <img
              src={profile.headerImage}
              alt="Header"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-primary-600"></div>
          )}
          {/* Overlay para melhorar legibilidade do texto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>
        <div className="px-6 pb-6">
          <div className="relative flex flex-col md:flex-row items-end -mt-20 md:-mt-24 mb-6 gap-6">
            <div className="relative shrink-0">
              <img
                src={profile.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=3B82F6&color=ffffff&size=128`}
                alt={profile.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white dark:border-slate-800 shadow-xl object-cover bg-white dark:bg-slate-900"
              />
              {profile.isFollowing && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 p-1.5 rounded-full border-4 border-white dark:border-slate-800 shadow-sm" title="Seguindo">
                  <UserPlus size={20} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left mb-2 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {profile.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-600 dark:text-slate-400">
                {profile.niche && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase size={16} className="text-primary-500" />
                    <span>{NICHE_LABELS[profile.niche] || profile.niche}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.careerTime && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-slate-400" />
                    <span>{CAREER_TIME_LABELS[profile.careerTime] || profile.careerTime}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto mb-2">
              {!isOwnProfile && (
                <button
                  onClick={toggleFollow}
                  className={`flex-1 md:flex-none btn ${profile.isFollowing
                    ? 'btn-outline border-slate-200 hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:border-slate-700 dark:hover:bg-red-900/20'
                    : 'btn-primary'
                    } gap-2 whitespace-nowrap`}
                >
                  {profile.isFollowing ? (
                    <>
                      <UserMinus size={18} />
                      Deixar de seguir
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

          <div className="flex flex-col md:flex-row gap-6 border-t border-slate-100 dark:border-slate-700 pt-6">
            <div className="flex-1 space-y-4">
              {profile.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Sobre</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )}

              {profile.techStack && profile.techStack.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.techStack.map((tech, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg border border-slate-100 dark:border-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:w-72 flex-shrink-0 flex flex-col gap-4">
              <div className="flex gap-2">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn btn-outline btn-sm gap-2 justify-center"
                  >
                    <Github size={16} />
                    GitHub
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn btn-outline btn-sm gap-2 justify-center"
                  >
                    <Linkedin size={16} />
                    LinkedIn
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700/50">
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {connections?.followersCount || 0}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Seguidores</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700/50">
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {connections?.followingCount || 0}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Seguindo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 flex items-center justify-between hover:scale-[1.02] transition-transform">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Quizzes Completos</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{profile.quizStats.totalCompleted}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
              <Briefcase size={24} />
            </div>
          </div>
          <div className="card p-4 flex items-center justify-between hover:scale-[1.02] transition-transform">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Média Geral</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{profile.quizStats.averageScore}%</p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-yellow-600 dark:text-yellow-400">
              <Target size={24} />
            </div>
          </div>
          <div className="card p-4 flex items-center justify-between hover:scale-[1.02] transition-transform">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Melhor Score</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{profile.quizStats.bestScore}%</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
              <Target size={24} />
            </div>
          </div>
          <div className="card p-4 flex items-center justify-between hover:scale-[1.02] transition-transform">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tempo Total</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">{formatTime(profile.quizStats.totalTimeSpent)}</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {/* Tabs & Content */}
          <div className="card overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-700 px-6">
              <nav className="flex gap-6">
                {[
                  { id: 'profile', label: 'Visão Geral' },
                  { id: 'followers', label: 'Seguidores' },
                  { id: 'following', label: 'Seguindo' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 text-sm font-medium border-b-2 transition-colors relative ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-t-full" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6 min-h-[300px]">
              {activeTab === 'profile' && (
                <div className="py-6">
                  {profile.activityData && profile.activityData.length > 0 ? (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white px-4">Atividade Recente</h3>
                      <div className="px-4 pb-4">
                        <ActivityHeatmap
                          data={profile.activityData}
                          totalActivities={profile.activityData.reduce((acc, curr) => acc + curr.count, 0)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Target size={32} className="text-slate-300" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white">Atividade Recente</h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">
                        Este usuário ainda não tem atividades registradas.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'followers' && (
                <UserList
                  users={connections?.followers || []}
                  emptyMessage="Nenhum seguidor ainda"
                />
              )}

              {activeTab === 'following' && (
                <UserList
                  users={connections?.following || []}
                  emptyMessage="Não está seguindo ninguém"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para listar usuários
const UserList: React.FC<{
  users: PublicUser[];
  emptyMessage: string;
}> = ({ users, emptyMessage }) => {
  const navigate = useNavigate();

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users size={32} className="text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
          onClick={() => navigate(`/profile/${user.id}`)}
        >
          <img
            src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3B82F6&color=ffffff`}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover group-hover:ring-2 group-hover:ring-primary-500 transition-all"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
              {user.name}
            </h3>
            {user.bio && (
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                {user.bio}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
            <Users size={12} />
            {user.followersCount}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PublicProfilePage;