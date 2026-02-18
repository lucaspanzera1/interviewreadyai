import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { socialApi, PublicUser, UserConnections } from '../lib/socialApi';
import { toast } from 'react-toastify';
import Loading from './Loading';
import PageTitle from './PageTitle';
import ActivityHeatmap from './ActivityHeatmap';
import { getNicheIcon } from '../utils/nicheIcons';
import {
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  DocumentTextIcon,
  UserPlusIcon,
  UserMinusIcon,
  UsersIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

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

const PublicProfilePage: React.FC = () => {
  const { t } = useTranslation('social');
  const { t: tProfile } = useTranslation('profile');
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [connections, setConnections] = useState<UserConnections | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionsTab, setConnectionsTab] = useState<'following' | 'followers'>('following');

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
      toast.error(t('profile.errorLoadingProfile'));
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
        toast.success(t('profile.unfollowedToast', { name: profile.name }));
      } else {
        await socialApi.followUser(profile.id);
        toast.success(t('profile.followedToast', { name: profile.name }));
      }

      setProfile({
        ...profile,
        isFollowing: !profile.isFollowing,
        followersCount: profile.isFollowing
          ? profile.followersCount - 1
          : profile.followersCount + 1
      });

      // Also update connections count if needed
      if (connections && currentUser) {
        if (profile.isFollowing) {
          // We unfollowed
          setConnections(prev => prev ? ({ ...prev, followersCount: prev.followersCount - 1 }) : null);
        } else {
          // We followed
          setConnections(prev => prev ? ({ ...prev, followersCount: prev.followersCount + 1 }) : null);
        }
      }
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error);
      toast.error(t('profile.errorUpdatingFollow'));
    }
  };



  if (loading) {
    return <Loading fullScreen text={t('profile.loadingProfile')} />;
  }

  if (!profile) {
    return null;
  }

  const activeList = connectionsTab === 'following' ? connections?.following || [] : connections?.followers || [];

  return (
    <>
      <PageTitle title={profile.name} />

      <div className="space-y-6 md:space-y-8 pb-32">
        {/* Hero Section with Header & Avatar */}
        <div className="relative mb-24 md:mb-32 group">
          <div className="relative w-full aspect-[3/1] max-h-[500px] min-h-[200px] rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10">
            {/* Header Image */}
            {profile.headerImage ? (
              <img
                src={profile.headerImage}
                alt="Header"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800"></div>

                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-indigo-500/10 dark:bg-primary-500/20 rounded-full blur-3xl transition-all duration-1000"></div>
                <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-fuchsia-500/10 dark:bg-purple-500/20 rounded-full blur-3xl transition-all duration-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 dark:from-blue-500/10 dark:to-pink-500/10"></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f112_1px,transparent_1px),linear-gradient(to_bottom,#6366f112_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent dark:from-black/60 dark:via-black/20"></div>
          </div>

          {/* Overlapping Profile Info */}
          <div className="absolute -bottom-16 md:-bottom-24 left-0 w-full px-6 md:px-10 flex flex-col md:flex-row items-center md:items-end gap-6 z-10 pointer-events-none">
            <div className="relative shrink-0 pointer-events-auto">
              <img
                src={profile.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=3B82F6&color=ffffff&size=128`}
                alt={profile.name}
                className="w-32 h-32 md:w-48 md:h-48 rounded-full border-[6px] border-white dark:border-slate-900 shadow-2xl object-cover bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex-1 pb-4 md:pb-6 text-center md:text-left pointer-events-auto flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4 w-full">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
                  {profile.name}
                </h1>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {profile.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPinIcon className="w-4 h-4" />
                      {profile.location}
                    </div>
                  )}
                  {profile.niche && (
                    <div className="flex items-center gap-1.5">
                      {getNicheIcon(profile.niche, "w-4 h-4")}
                      {t(`niches.${profile.niche}`) || profile.niche}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <UsersIcon className="w-4 h-4" />
                    <span>{profile.followersCount} {tProfile('followers')}</span>
                  </div>
                </div>
              </div>

              {!isOwnProfile && (
                <button
                  onClick={toggleFollow}
                  className={`flex items-center justify-center md:justify-start gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg active:scale-95 ${profile.isFollowing
                    ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-600/20'
                    }`}
                >
                  {profile.isFollowing ? (
                    <>
                      <UserMinusIcon className="h-5 w-5" />
                      {t('profile.unfollow')}
                    </>
                  ) : (
                    <>
                      <UserPlusIcon className="h-5 w-5" />
                      {t('profile.follow')}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

          {/* Left Column Group */}
          <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-6">

            {/* 1. PERSONAL INFO CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
              <div className="px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">{tProfile('personalInfo')}</h2>
              </div>

              <div className="p-4 md:p-6">
                <div className="space-y-6 max-w-xl">
                  {/* Bio */}
                  <div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md">
                      <DocumentTextIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">
                        {profile.bio || tProfile('notInformed')}
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md">
                      <MapPinIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                      <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">
                        {profile.location || tProfile('notInformed')}
                      </span>
                    </div>
                  </div>

                  {/* Links */}
                  <div className={`grid grid-cols-1 ${profile.niche === 'tecnologia' ? 'md:grid-cols-2' : ''} gap-4`}>
                    <div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md">
                        <LinkedInIcon className="h-5 w-5 text-[#0a66c2] dark:text-[#0a66c2] shrink-0" />
                        {profile.linkedinUrl ? (
                          <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium truncate flex-1 block">
                            {extractUsername(profile.linkedinUrl)}
                          </a>
                        ) : <span className="text-slate-500 text-sm">N/A</span>}
                      </div>
                    </div>
                    {profile.niche === 'tecnologia' && (
                      <div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md">
                          <GitHubIcon className="h-5 w-5 text-[#24292f] dark:text-white shrink-0" />
                          {profile.githubUrl ? (
                            <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium truncate flex-1 block">
                              {extractUsername(profile.githubUrl)}
                            </a>
                          ) : <span className="text-slate-500 text-sm">N/A</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PROFESSIONAL DATA CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
              <div className="px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">{tProfile('professionalData')}</h2>
              </div>
              <div className="p-4 md:p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Area/Niche */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {tProfile('areaOfExpertise')}
                      </label>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md">
                        {profile.niche ? getNicheIcon(profile.niche, "h-5 w-5 text-slate-400 dark:text-slate-500") : <BriefcaseIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />}
                        <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">
                          {t(`niches.${profile.niche}`) || profile.niche || tProfile('notInformed')}
                        </span>
                      </div>
                    </div>
                    {/* Career Time */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {profile.niche === 'tecnologia' ? tProfile('techExperience') : tProfile('professionalExperience')}
                      </label>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md">
                        <ClockIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                        <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">
                          {profile.careerTime ? t(`careerTime.${profile.careerTime}`, { defaultValue: profile.careerTime }) : tProfile('notInformed')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  {profile.niche === 'tecnologia' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {tProfile('techStack')}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {profile.techStack && profile.techStack.length > 0 ? (
                          profile.techStack.map((tech, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700"
                            >
                              {tech}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-sm italic">{tProfile('noTechSelected')}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column Group */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">

            {/* Account Details - Removed as not available in PublicUser */}


            {/* Activities & Achievements */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
              <div className="px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">{tProfile('activitiesAchievements')}</h2>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                <div className="py-4 overflow-x-auto">
                  <ActivityHeatmap
                    data={profile.activityData || []}
                    totalActivities={profile.activityData?.reduce((acc, curr) => acc + curr.count, 0) || 0}
                    startDate={new Date(2026, 1, 1)}
                    endDate={new Date(2027, 1, 1)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <DocumentTextIcon className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('profile.quizzesCompleted')}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{profile.quizStats.totalCompleted}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <ShieldCheckIcon className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">{tProfile('generalAverage')}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{profile.quizStats.averageScore}%</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <TrophyIcon className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('profile.bestScore')}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{profile.quizStats.bestScore}%</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <ClockIcon className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('profile.totalTime')}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {(profile.quizStats.totalTimeSpent / 3600).toFixed(1)}h
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Connections */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex flex-col h-full">
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-indigo-500" />
                  {t('connections.title')}
                </h2>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setConnectionsTab('following')}
                  className={`py-3 text-sm font-medium transition-all relative ${connectionsTab === 'following'
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  {t('connections.followingTab')}
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
                    {connections?.followingCount || 0}
                  </span>
                  {connectionsTab === 'following' && (
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500" />
                  )}
                </button>
                <button
                  onClick={() => setConnectionsTab('followers')}
                  className={`py-3 text-sm font-medium transition-all relative ${connectionsTab === 'followers'
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  {t('connections.followersTab')}
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
                    {connections?.followersCount || 0}
                  </span>
                  {connectionsTab === 'followers' && (
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500" />
                  )}
                </button>
              </div>

              {/* Content List */}
              <div className="flex-1 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {activeList.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                      <UsersIcon className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {connectionsTab === 'following' ? t('connections.notFollowingAnyone') : t('connections.noFollowers')}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {activeList.map((connUser) => (
                      <div key={connUser.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-3 group">
                        <div className="relative cursor-pointer" onClick={() => navigate(`/profile/${connUser.id}`)}>
                          <img
                            src={connUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(connUser.name)}&background=3B82F6&color=ffffff`}
                            alt={connUser.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-700"
                          />
                        </div>
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/profile/${connUser.id}`)}>
                          <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {connUser.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {connUser.niche
                              ? (t(`niches.${connUser.niche}`) !== `niches.${connUser.niche}` ? t(`niches.${connUser.niche}`) : (tProfile(`niche.${connUser.niche}`) !== `niche.${connUser.niche}` ? tProfile(`niche.${connUser.niche}`) : connUser.niche))
                              : t('connections.quizzesCount', { count: connUser.quizStats?.totalCompleted || 0 })}
                          </p>
                        </div>
                        <button onClick={() => navigate(`/profile/${connUser.id}`)} className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 transition-colors">
                          <ChevronRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PublicProfilePage;