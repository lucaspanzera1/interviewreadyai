
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client'
}

export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  cellphone?: string | null;
  taxid?: string | null;
  tokens?: number;
  // Campos de perfil
  hasCompletedOnboarding?: boolean;
  careerTime?: string;
  techArea?: string;
  techStack?: string[];
  bio?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RefreshTokenResponse {
  access_token: string;
}

export interface UserProfile {
  hasCompletedOnboarding: boolean;
  careerTime?: string;
  techArea?: string;
  techStack?: string[];
  bio?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface CompleteOnboardingData {
  careerTime?: string;
  techArea?: string;
  techStack?: string[];
  bio?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  hasCompletedOnboarding: boolean;
}

export enum QuizLevel {
  INICIANTE = 'INICIANTE',
  MEDIO = 'MEDIO',
  DIFICIL = 'DIFÍCIL',
  EXPERT = 'EXPERT',
}

export interface GenerateQuizDto {
  categoria: string;
  titulo: string;
  descricao: string;
  tags: string[];
  quantidade_questoes: number;
  nivel: QuizLevel;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface GeneratedQuiz {
  questions: QuizQuestion[];
  quizId?: string;
}

class ApiClient {

  private client: AxiosInstance;
  // promise cache to dedupe concurrent user profile requests
  private userProfilePromise: Promise<User> | null = null;
  // short-lived cache for user profile to avoid sequential refetch storms (ms)
  private _cachedUser: User | null = null;
  private _cachedUserAt: number | null = null;
  private _userCacheTtlMs = 5000; // 5 seconds

  constructor() {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

    this.client = axios.create({
      baseURL,
      timeout,
      withCredentials: true, // Garante envio de cookies se backend exigir
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              // dedupe simultaneous refresh attempts
              if (!this._refreshPromise) {
                this._refreshPromise = this.refreshToken(refreshToken).then((res) => {
                  localStorage.setItem('access_token', res.access_token);
                  return res.access_token;
                }).finally(() => {
                  this._refreshPromise = null;
                });
              }

              const newAccessToken = await this._refreshPromise;

              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
    );
  }

  // holds the in-flight refresh token promise
  private _refreshPromise: Promise<string> | null = null;

  // Auth methods
  async handleAuthCallback(code: string): Promise<LoginResponse> {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const response = await axios.get(`${baseURL}/auth/google/callback?code=${code}`);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const response = await axios.post(`${baseURL}/auth/refresh`, {
      refreshToken: refreshToken,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  // User methods
  async getUserProfile(): Promise<User> {
    const now = Date.now();
    // Serve from short cache if still fresh
    if (this._cachedUser && this._cachedUserAt && now - this._cachedUserAt < this._userCacheTtlMs) {
      return Promise.resolve(this._cachedUser);
    }

    // If there's already an in-flight request for the user profile, return it
    if (this.userProfilePromise) {
      return this.userProfilePromise;
    }

    this.userProfilePromise = this.client.get('/users/profile').then(async (response) => {
      const user = response.data as User;

      // Fetch user tokens separately since they might not be in the profile
      try {
        const tokenRes = await this.client.get('/users/me/tokens');
        user.tokens = tokenRes.data.tokens;
      } catch (error) {
        console.warn('Failed to fetch tokens for user profile:', error);
      }

      // Fetch user profile data
      try {
        const profileRes = await this.client.get('/users/me/profile');
        Object.assign(user, profileRes.data);
      } catch (error) {
        console.warn('Failed to fetch profile data for user:', error);
      }

      this._cachedUser = user;
      this._cachedUserAt = Date.now();
      return user;
    }).finally(() => {
      // clear the cached promise after completion so future calls can refetch if needed
      this.userProfilePromise = null;
    });

    return this.userProfilePromise;
  }


  async updateUserProfile(userData: Partial<User>): Promise<{ data: User; message?: string }> {
    const response = await this.client.put('/users/profile', userData);
    return response.data.message ? { data: response.data.data, message: response.data.message } : { data: response.data };
  }



  // Token management
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Token methods
  async getUserTokenBalance(): Promise<number> {
    const res = await this.client.get('/users/me/tokens');
    return res.data.tokens || 0;
  }

  async setUserTokenBalance(tokens: number): Promise<void> {
    await this.client.put('/users/me/tokens', { tokens });
  }

  async addTokensToUser(amount: number): Promise<{ message: string }> {
    const res = await this.client.post('/users/me/tokens/add', { amount });
    return res.data;
  }

  async removeTokensFromUser(amount: number): Promise<{ message: string }> {
    const res = await this.client.post('/users/me/tokens/remove', { amount });
    return res.data;
  }

  // Address methods
  async getAddresses(): Promise<any[]> {
    const res = await this.client.get('/users/addresses');
    return res.data;
  }

  async addAddress(address: any): Promise<any> {
    const res = await this.client.post('/users/addresses', address);
    return res.data;
  }

  async updateAddress(id: string, address: any): Promise<any> {
    const res = await this.client.put(`/users/addresses/${id}`, address);
    return res.data;
  }

  async deleteAddress(id: string): Promise<void> {
    await this.client.delete(`/users/addresses/${id}`);
  }

  // Profile methods
  async getUserProfileData(): Promise<UserProfile> {
    const res = await this.client.get('/users/me/profile');
    return res.data;
  }

  async updateUserProfileData(profileData: Partial<UserProfile>): Promise<{ data: UserProfile; message?: string }> {
    const res = await this.client.put('/users/me/profile', profileData);
    return res.data.message ? { data: res.data.data, message: res.data.message } : { data: res.data };
  }

  async completeOnboarding(profileData: CompleteOnboardingData): Promise<{ data: UserProfile; message?: string }> {
    const res = await this.client.post('/users/me/onboarding', profileData);
    return res.data.message ? { data: res.data.data, message: res.data.message } : { data: res.data };
  }

  async getOnboardingStatus(): Promise<{ hasCompletedOnboarding: boolean }> {
    const res = await this.client.get('/users/me/onboarding/status');
    return res.data;
  }

  // Quiz methods
  async generateQuiz(dto: GenerateQuizDto): Promise<GeneratedQuiz> {
    const res = await this.client.post('/quiz/generate', dto);
    return res.data;
  }

  // Admin Quiz methods
  async getAllQuizzes(page: number = 1, limit: number = 10) {
    const res = await this.client.get('/admin/quiz', {
      params: { page, limit },
    });
    return res.data;
  }

  async getQuizById(id: string) {
    const res = await this.client.get(`/admin/quiz/${id}`);
    return res.data;
  }

  async getQuizStats(id: string) {
    const res = await this.client.get(`/admin/quiz/${id}/stats`);
    return res.data;
  }

  async updateQuizStatus(id: string, isActive: boolean) {
    const res = await this.client.patch(`/admin/quiz/${id}/status`, null, {
      params: { active: isActive },
    });
    return res.data;
  }

  async deleteQuiz(id: string) {
    const res = await this.client.delete(`/admin/quiz/${id}`);
    return res.data;
  }

  // Public quiz methods
  async getPublicQuizzes(page: number = 1, limit: number = 12, category?: string, level?: string, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (category && category !== 'Todas') params.append('category', category);
    if (level && level !== 'Todas') params.append('level', level);
    if (search && search.trim()) params.append('search', search.trim());

    const res = await this.client.get(`/quiz/public?${params.toString()}`);
    return res.data;
  }

  async getPublicQuizById(id: string) {
    const res = await this.client.get(`/quiz/public/${id}`);
    return res.data;
  }

  async recordQuizAccess(quizId: string) {
    const res = await this.client.post(`/quiz/${quizId}/access`);
    return res.data;
  }

  async recordQuizAttempt(quizId: string, selectedAnswers: number[], score: number, totalQuestions: number, timeSpent?: number) {
    const res = await this.client.post(`/quiz/${quizId}/attempt`, {
      selectedAnswers,
      score,
      totalQuestions,
      timeSpent,
    });
    return res.data;
  }

  async getUserAttempts(page: number = 1, limit: number = 10) {
    const res = await this.client.get('/quiz/my-attempts', {
      params: { page, limit },
    });
    return res.data;
  }
}

export const apiClient = new ApiClient();