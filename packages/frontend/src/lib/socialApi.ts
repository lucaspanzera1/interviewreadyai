import { apiClient } from './api';

// Types
export interface QuizStats {
  totalCompleted: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
}

export interface PublicUser {
  id: string;
  name: string;
  picture?: string;
  headerImage?: string;
  bio?: string;
  location?: string;
  careerTime?: string;
  niche?: string;
  techStack?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  quizStats: QuizStats;
  activityData: Array<{
    date: string;
    count: number;
  }>;
}

export interface UserConnections {
  followers: PublicUser[];
  following: PublicUser[];
  followersCount: number;
  followingCount: number;
}

export interface SearchUsersParams {
  email?: string;
  name?: string;
  niche?: string;
  page?: number;
  limit?: number;
}

export interface SearchUsersResponse {
  users: PublicUser[];
  total: number;
  page: number;
  limit: number;
}

// API calls
export const socialApi = {
  // Buscar usuários
  searchUsers: async (params: SearchUsersParams): Promise<SearchUsersResponse> => {
    return await apiClient.searchUsers(params);
  },

  // Obter perfil público
  getPublicProfile: async (userId: string): Promise<PublicUser> => {
    return await apiClient.getPublicProfile(userId);
  },

  // Seguir usuário
  followUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    return await apiClient.followUser(userId);
  },

  // Deixar de seguir
  unfollowUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    return await apiClient.unfollowUser(userId);
  },

  // Obter conexões
  getUserConnections: async (userId: string): Promise<UserConnections> => {
    return await apiClient.getUserConnections(userId);
  }
};