import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, UserMinus, ChevronRight } from 'lucide-react';
import { socialApi, UserConnections, PublicUser } from '../lib/socialApi';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Loading from './Loading';

const SocialConnectionsComponent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [connections, setConnections] = useState<UserConnections | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following');

  useEffect(() => {
    if (user?.id) {
      loadConnections();
    }
  }, [user?.id]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const connectionsData = await socialApi.getUserConnections(user!.id);
      setConnections(connectionsData);
    } catch (error) {
      console.error('Erro ao carregar conexões:', error);
      toast.error('Erro ao carregar conexões');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await socialApi.unfollowUser(userId);
      toast.success('Parou de seguir usuário');

      // Atualizar conexões localmente
      if (connections) {
        setConnections({
          ...connections,
          following: connections.following.filter(u => u.id !== userId),
          followingCount: connections.followingCount - 1
        });
      }
    } catch (error) {
      console.error('Erro ao deixar de seguir:', error);
      toast.error('Erro ao deixar de seguir');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-6 flex flex-col items-center justify-center min-h-[200px]">
        <Loading size="md" />
        <span className="text-sm text-slate-500 mt-2">Carregando conexões...</span>
      </div>
    );
  }

  if (!connections) {
    return null;
  }

  const activeList = activeTab === 'following' ? connections.following : connections.followers;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-500" />
          Conexões
        </h2>
        <button
          onClick={() => navigate('/search')}
          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          <Search size={14} />
          Buscar
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('following')}
          className={`py-3 text-sm font-medium transition-all relative ${activeTab === 'following'
            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
        >
          Seguindo
          <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
            {connections.followingCount}
          </span>
          {activeTab === 'following' && (
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('followers')}
          className={`py-3 text-sm font-medium transition-all relative ${activeTab === 'followers'
            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
        >
          Seguidores
          <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
            {connections.followersCount}
          </span>
          {activeTab === 'followers' && (
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500" />
          )}
        </button>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {activeList.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
              <Users size={20} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {activeTab === 'following'
                ? "Você não segue ninguém ainda."
                : "Você ainda não tem seguidores."}
            </p>
            {activeTab === 'following' && (
              <button
                onClick={() => navigate('/search')}
                className="btn btn-sm btn-outline text-xs px-3"
              >
                Encontrar pessoas
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {activeList.map((user) => (
              <ConnectionItem
                key={user.id}
                user={user}
                isFollowingTab={activeTab === 'following'}
                onUnfollow={handleUnfollow}
                onClick={() => navigate(`/profile/${user.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {activeList.length > 5 && (
        <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={() => navigate('/search')}
            className="w-full py-1.5 text-xs font-medium text-center text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-1"
          >
            Ver todos
            <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

interface ConnectionItemProps {
  user: PublicUser;
  isFollowingTab: boolean;
  onUnfollow: (id: string) => void;
  onClick: () => void;
}

const ConnectionItem: React.FC<ConnectionItemProps> = ({ user, isFollowingTab, onUnfollow, onClick }) => {
  return (
    <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-3 group">
      <div
        className="relative cursor-pointer"
        onClick={onClick}
      >
        <img
          src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3B82F6&color=ffffff`}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-700"
        />
        {user.isFollowing && !isFollowingTab && (
          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-0.5 rounded-full border-2 border-white dark:border-slate-900" title="Você segue">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
        <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {user.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {user.techArea ? user.techArea : `${user.quizStats.totalCompleted} quizzes`}
        </p>
      </div>

      {isFollowingTab && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUnfollow(user.id);
          }}
          className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Deixar de seguir"
        >
          <UserMinus size={16} />
        </button>
      )}

      {!isFollowingTab && (
        <button
          onClick={onClick}
          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
};

export default SocialConnectionsComponent;