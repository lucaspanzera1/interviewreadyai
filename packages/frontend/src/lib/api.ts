
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
  PRO = 'pro'
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  color: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPackage {
  id: string;
  name: string;
  description?: string;
  tokenAmount: number;
  role: Role;
  features: string[];
  active: boolean;
  validityDays?: number;
  value?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTokenPackage {
  name: string;
  description?: string;
  tokenAmount: number;
  role: string;
  features: string[];
  validityDays?: number;
  value?: number;
}

export interface UpdateTokenPackage {
  name?: string;
  description?: string;
  tokenAmount?: number;
  role?: string;
  features?: string[];
  active?: boolean;
  validityDays?: number;
}

export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
  roleExpiresAt?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  cellphone?: string | null;
  taxid?: string | null;
  abacatepayCustomerId?: string | null;
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
  // Configurações de privacidade
  isProfilePublic?: boolean;
  // Reward system fields
  totalFreeQuizzesCompleted?: number;
  lastTokenRewardAt?: string;
}

export interface UserDetails {
  user: User;
  profile: {
    hasCompletedOnboarding?: boolean;
    careerTime?: string;
    techArea?: string;
    techStack?: string[];
    bio?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    cellphone?: string | null;
    taxid?: string | null;
  };
  tokens: {
    currentBalance: number;
    totalEarned: number;
    totalSpent: number;
    history: Array<{
      type: string;
      amount: number;
      reason: string;
      createdAt: string;
    }>;
  };
  quizStats: {
    totalFreeQuizzesCompleted: number;
    lastTokenRewardMilestone: number;
    lastTokenRewardAt?: string;
    dailyFreeQuizzesUsed: number;
    lastFreeQuizReset?: string;
  };
  interviewStats?: {
    totalInterviewsGenerated: number;
    totalAttempts: number;
    averageDifficultyRating: number;
    averageDuration: number;
    tokensSpentOnInterviews: number;
  };
  rewardHistory: Array<{
    type: string;
    amount: number;
    reason: string;
    createdAt: string;
  }>;
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
  cellphone?: string | null;
  taxid?: string | null;
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
  contexto?: string;
}

export interface GenerateJobQuizDto {
  linkedinUrl: string;
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

// Flashcard interfaces
export enum FlashcardLevel {
  FACIL = 'FACIL',
  MEDIO = 'MEDIO',
  DIFICIL = 'DIFICIL',
}

export interface GenerateJobFlashcardDto {
  linkedinUrl: string;
  nivel: FlashcardLevel;
  quantidade_cards?: number;
}

export interface FlashcardItem {
  question: string;
  answer: string;
  explanation?: string;
  tags?: string[];
}

export interface GeneratedFlashcard {
  titulo: string;
  categoria: string;
  descricao: string;
  tags: string[];
  quantidade_cards: number;
  nivel: FlashcardLevel;
  cards: FlashcardItem[];
  flashcardId?: string;
  vaga_titulo?: string;
  vaga_empresa?: string;
  vaga_localizacao?: string;
  vaga_url?: string;
}

export interface StudySessionDto {
  cards: Array<{
    cardIndex: number;
    difficulty: 'EASY' | 'NORMAL' | 'HARD';
    studyTime?: number;
  }>;
  totalSessionTime?: number;
}

// Interview interfaces
export interface GenerateInterviewDto {
  linkedinUrl: string;
  numberOfQuestions?: number;
  experienceLevel?: string;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  type: 'technical' | 'behavioral' | 'situational' | 'company_specific';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tips?: string;
  keywords?: string[];
}

export interface GeneratedInterview {
  interviewId?: string;
  jobTitle: string;
  companyName: string;
  questions: InterviewQuestion[];
  estimatedDuration: number;
  preparationTips: string[];
  jobRequirements: string[];
  companyInfo?: string;
}

export interface InterviewAttemptDto {
  userAnswers: string[];
  actualDuration: number;
  difficultyRating: number;
  feedback?: string;
}

export interface Interview {
  _id: string;
  jobTitle: string;
  companyName: string;
  linkedinUrl: string;
  questions: InterviewQuestion[];
  numberOfQuestions: number;
  estimatedDuration: number;
  preparationTips: string[];
  jobRequirements: string[];
  companyInfo?: string;
  experienceLevel?: string;
  interviewType: string;
  totalAccess: number;
  totalAttempts: number;
  totalCompletions: number;
  averageDifficulty: number;
  createdAt: string;
  isActive: boolean;
}

export interface InterviewAttempt {
  _id: string;
  interviewId: string;
  userId: string;
  userAnswers: Array<{
    questionId: number;
    answer: string;
  }>;
  actualDuration: number;
  difficultyRating: number;
  feedback?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
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
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
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

        // Handle 403 Forbidden errors
        if (error.response?.status === 403) {

          // Don't redirect, just let the component handle the error
        }

        return Promise.reject(error);
      }
    );
  }

  // holds the in-flight refresh token promise
  private _refreshPromise: Promise<string> | null = null;

  // Auth methods
  async handleAuthCallback(code: string): Promise<LoginResponse> {
    const response = await this.client.get(`/auth/google/callback?code=${code}`);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await this.client.post('/auth/refresh', {
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

      }

      // Fetch user profile data
      try {
        const profileRes = await this.client.get('/users/me/profile');
        Object.assign(user, profileRes.data);
      } catch (error) {

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

  clearUserProfileCache(): void {
    this._cachedUser = null;
    this._cachedUserAt = null;
    this.userProfilePromise = null;
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

  async generateJobQuiz(dto: GenerateJobQuizDto): Promise<GeneratedQuiz> {
    const res = await this.client.post('/quiz/generate-job', dto);
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

  async getPublicFilters() {
    const res = await this.client.get('/quiz/public/filters');
    return res.data;
  }

  async getPublicQuizById(id: string) {
    const res = await this.client.get(`/quiz/public/${id}`);
    return res.data;
  }

  async getQuizForPlaying(id: string) {
    const res = await this.client.get(`/quiz/${id}/play`);
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

  async getUserQuizzes(page: number = 1, limit: number = 10) {
    const res = await this.client.get('/quiz/my-quizzes', {
      params: { page, limit },
    });
    return res.data;
  }

  async getUserAttemptDetails(attemptId: string) {
    const res = await this.client.get(`/quiz/my-attempts/${attemptId}`);
    return res.data;
  }

  async getUserStats() {
    const res = await this.client.get('/quiz/my-stats');
    return res.data;
  }

  async getFreeQuizLimit() {
    const res = await this.client.get('/users/me/free-quiz-limit');
    return res.data;
  }

  // Interview methods
  async generateInterview(dto: GenerateInterviewDto): Promise<GeneratedInterview> {
    const res = await this.client.post('/interview/generate', dto);
    return res.data;
  }

  async getUserInterviews(page: number = 1, limit: number = 10) {
    const res = await this.client.get('/interview/my-interviews', {
      params: { page, limit },
    });
    return res.data;
  }

  async getInterviewById(id: string) {
    const res = await this.client.get(`/interview/${id}`);
    return res.data;
  }

  async getInterviewForPlaying(id: string) {
    const res = await this.client.get(`/interview/${id}/play`);
    return res.data;
  }

  async recordInterviewAttempt(id: string, attemptDto: InterviewAttemptDto) {
    const res = await this.client.post(`/interview/${id}/attempt`, attemptDto);
    return res.data;
  }

  async recordInterviewAccess(id: string) {
    const res = await this.client.post(`/interview/${id}/access`);
    return res.data;
  }

  async completeInterview(id: string) {
    const res = await this.client.patch(`/interview/${id}/complete`);
    return res.data;
  }

  async getUserInterviewAttempts(page: number = 1, limit: number = 10) {
    const res = await this.client.get('/interview/my-attempts', {
      params: { page, limit },
    });
    return res.data;
  }

  async getUserInterviewAttemptDetails(attemptId: string) {
    const res = await this.client.get(`/interview/my-attempts/${attemptId}`);
    return res.data;
  }

  async getUserInterviewStats() {
    const res = await this.client.get('/interview/my-stats');
    return res.data;
  }

  // Flashcard methods
  async generateJobFlashcard(dto: GenerateJobFlashcardDto): Promise<GeneratedFlashcard> {
    const res = await this.client.post('/flashcard/generate-job', dto);
    return res.data;
  }

  async getUserFlashcards(page: number = 1, limit: number = 10, categoria?: string, nivel?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (categoria) params.append('categoria', categoria);
    if (nivel) params.append('nivel', nivel);

    const res = await this.client.get(`/flashcard/my-flashcards?${params.toString()}`);
    return res.data;
  }

  async getPublicFlashcards(page: number = 1, limit: number = 10, categoria?: string, nivel?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (categoria) params.append('categoria', categoria);
    if (nivel) params.append('nivel', nivel);

    const res = await this.client.get(`/flashcard/public?${params.toString()}`);
    return res.data;
  }

  async getFlashcardForStudy(id: string) {
    const res = await this.client.get(`/flashcard/${id}`);
    return res.data;
  }

  async recordStudySession(flashcardId: string, studySession: StudySessionDto) {
    const res = await this.client.post(`/flashcard/${flashcardId}/study`, studySession);
    return res.data;
  }

  async getStudyProgress(flashcardId: string) {
    const res = await this.client.get(`/flashcard/${flashcardId}/progress`);
    return res.data;
  }

  async getUserStudyStats() {
    const res = await this.client.get('/flashcard/user/study-stats');
    return res.data;
  }

  async getCardsForReview() {
    const res = await this.client.get('/flashcard/user/due-for-review');
    return res.data;
  }

  async toggleFlashcardPublic(flashcardId: string) {
    const res = await this.client.patch(`/flashcard/${flashcardId}/toggle-public`);
    return res.data;
  }

  async deleteFlashcard(flashcardId: string) {
    const res = await this.client.delete(`/flashcard/${flashcardId}`);
    return res.data;
  }

  // Admin Flashcard methods
  async getAllFlashcards(page: number = 1, limit: number = 20) {
    const res = await this.client.get('/flashcard/admin/all', {
      params: { page, limit },
    });
    return res.data;
  }

  async toggleFlashcardActive(flashcardId: string) {
    const res = await this.client.patch(`/flashcard/admin/${flashcardId}/toggle-active`);
    return res.data;
  }

  async checkRecentReward() {
    const res = await this.client.get('/users/me/recent-reward');
    return res.data;
  }

  async getRewardHistory() {
    const res = await this.client.get('/users/me/reward-history');
    return res.data;
  }

  // Role methods
  async getRoles(): Promise<Role[]> {
    const res = await this.client.get('/roles');
    return res.data;
  }

  async createRole(data: Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<Role> {
    const res = await this.client.post('/roles', data);
    return res.data;
  }

  async updateRole(id: string, data: Partial<Role>): Promise<Role> {
    const res = await this.client.patch(`/roles/${id}`, data);
    return res.data;
  }

  async deleteRole(id: string): Promise<Role> {
    const res = await this.client.delete(`/roles/${id}`);
    return res.data;
  }

  // Token Package methods
  async getTokenPackages(): Promise<TokenPackage[]> {
    const res = await this.client.get('/token-packages');
    return res.data;
  }

  async getAvailableTokenPackages(): Promise<TokenPackage[]> {
    const res = await this.client.get('/token-packages/available');
    return res.data;
  }

  async createTokenPackage(data: CreateTokenPackage): Promise<TokenPackage> {
    const res = await this.client.post('/token-packages', data);
    return res.data;
  }

  async updateTokenPackage(id: string, data: UpdateTokenPackage): Promise<TokenPackage> {
    const res = await this.client.patch(`/token-packages/${id}`, data);
    return res.data;
  }

  async deleteTokenPackage(id: string): Promise<TokenPackage> {
    const res = await this.client.delete(`/token-packages/${id}`);
    return res.data;
  }

  async redeemTokenPackage(id: string): Promise<{ message: string }> {
    const res = await this.client.post(`/token-packages/${id}/redeem`);
    return res.data;
  }

  // Plan payment methods
  async payForPlan(planId: string): Promise<{ checkoutUrl: string; billingId: string }> {
    const res = await this.client.post(`/plans/${planId}/pay`);
    return res.data;
  }

  // Token stats
  async getTokenStats(): Promise<{
    currentBalance: number;
    totalEarned: number;
    totalSpent: number;
    history: Array<{
      type: string;
      amount: number;
      reason: string;
      createdAt: string;
    }>;
  }> {
    const res = await this.client.get('/users/me/token-stats');
    return res.data;
  }

  // Admin user methods
  async getUserDetails(userId: string): Promise<UserDetails> {
    const res = await this.client.get(`/users/${userId}/details`);
    return res.data;
  }

  async getUserQuizzesByAdmin(userId: string, page: number = 1, limit: number = 100) {
    const res = await this.client.get(`/admin/quiz/user/${userId}`, {
      params: { page, limit },
    });
    return res.data;
  }

  async addTokensToUser(userId: string, amount: number, reason?: string): Promise<{ success: boolean; message: string; newBalance: number }> {
    const res = await this.client.post(`/users/${userId}/add-tokens`, {
      amount,
      reason: reason || 'admin_grant'
    });
    return res.data;
  }

  // Social API methods
  async searchUsers(params: any): Promise<any> {
    const res = await this.client.get('/users/search', { params });
    return res.data;
  }

  async getPublicProfile(userId: string): Promise<any> {
    const res = await this.client.get(`/users/profile/${userId}`);
    return res.data;
  }

  async followUser(userId: string): Promise<{ success: boolean; message: string }> {
    const res = await this.client.post('/users/follow', { userId });
    return res.data;
  }

  async unfollowUser(userId: string): Promise<{ success: boolean; message: string }> {
    const res = await this.client.post('/users/unfollow', { userId });
    return res.data;
  }

  async getUserConnections(userId: string): Promise<any> {
    const res = await this.client.get(`/users/connections/${userId}`);
    return res.data;
  }

  async updatePrivacySettings(isProfilePublic: boolean): Promise<{ success: boolean; message: string }> {
    const res = await this.client.put('/users/privacy-settings', { isProfilePublic });
    return res.data;
  }
}

export const apiClient = new ApiClient();