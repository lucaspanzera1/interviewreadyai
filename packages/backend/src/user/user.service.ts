import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { ModuleRef } from '@nestjs/core';
import { firstValueFrom } from 'rxjs';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { UpdateUserDto, UserDto } from './dto';
import { NotFoundException, DatabaseException } from '../common/exceptions';
import { EmailService } from '../common/services/email.service';

/**
 * Service de usuários
 * Gerencia lógica de negócio relacionada a usuários, perfis e relacionamentos
 */
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly httpService: HttpService,
    private readonly moduleRef: ModuleRef,
  ) { }

  /**
   * Busca ou cria um usuário baseado nos dados do OAuth (Google ou GitHub)
   * @param userData Dados do usuário do OAuth
   * @returns Usuário encontrado ou criado
   */
  async findOrCreateUser(userData: {
    googleId?: string;
    githubId?: string;
    email: string;
    name: string;
    picture?: string;
    bio?: string;
    location?: string;
    githubUrl?: string;
    linkedinUrl?: string;
  }): Promise<UserDocument> {
    // Busca lista de admins do .env
    const adminEmailsRaw = this.configService.get<string>('ADMIN_EMAILS') || '';
    const adminEmails = adminEmailsRaw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

    try {
      // Tenta encontrar usuário pelo provider ID
      let user: UserDocument | null = null;
      if (userData.googleId) {
        user = await this.userModel.findOne({ googleId: userData.googleId });
      } else if (userData.githubId) {
        user = await this.userModel.findOne({ githubId: userData.githubId });
      }

      if (!user) {
        // Se não encontrar, tenta pelo email
        user = await this.userModel.findOne({ email: userData.email.toLowerCase() });

        if (user) {
          // Se encontrar pelo email, atualiza o provider ID
          if (userData.googleId) {
            user.googleId = userData.googleId;
          } else if (userData.githubId) {
            user.githubId = userData.githubId;
          }
          user.lastLoginAt = new Date();

          // Normalize role for old users
          if (user.role) {
            if (user.role.toLowerCase() === 'admin') {
              user.role = UserRole.ADMIN;
            }
            // else keep the role as is
          } else {
            user.role = UserRole.CLIENT;
          }

          return await user.save();
        }

        // Se não encontrar, cria novo usuário
        const role = adminEmails.includes(userData.email.toLowerCase())
          ? UserRole.ADMIN
          : UserRole.CLIENT;

        user = new this.userModel({
          googleId: userData.googleId,
          githubId: userData.githubId,
          email: userData.email.toLowerCase(),
          name: userData.name,
          picture: userData.picture,
          bio: userData.bio,
          location: userData.location,
          githubUrl: userData.githubUrl,
          linkedinUrl: userData.linkedinUrl,
          lastLoginAt: new Date(),
          role,
        });
        user = await user.save();

        // Envia email de boas-vindas de forma assíncrona
        this.emailService.sendWelcomeEmail(user.email, user.name).catch(error => {
          console.error('Erro ao enviar email de boas-vindas:', error);
        });

        return user;
      }

      // Se encontrar pelo provider ID, atualiza último login
      user.lastLoginAt = new Date();

      // Check if role has expired (não resetar se for admin)
      if (user.roleExpiresAt && user.roleExpiresAt <= new Date() && user.role !== UserRole.ADMIN) {
        user.role = UserRole.CLIENT;
        user.roleExpiresAt = undefined;
      }

      // Normalize role for old users
      if (user.role) {
        if (user.role.toLowerCase() === 'admin') {
          user.role = UserRole.ADMIN;
        }
        // else keep the role as is
      } else {
        user.role = UserRole.CLIENT;
      }

      // Atualiza role apenas se for admin no .env (não sobrescrever roles de pacotes)
      if (adminEmails.includes(user.email.toLowerCase())) {
        user.role = UserRole.ADMIN;
      }

      return await user.save();
    } catch (error) {
      console.error('Error in findOrCreateUser:', error);
      throw new DatabaseException('Erro ao buscar ou criar usuário', 'USER_OPERATION_FAILED');
    }
  }

  /**
   * Atualiza o último login do usuário
   * @param id ID do usuário
   * @returns Usuário atualizado
   */
  async updateLastLogin(id: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { lastLoginAt: new Date() },
      { new: true }
    );

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`, 'USER_NOT_FOUND');
    }

    return user;
  }

  /**
   * Busca usuário por ID
   * @param id ID do usuário
   * @returns Usuário encontrado
   * @throws NotFoundException se usuário não for encontrado
   */
  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`, 'USER_NOT_FOUND');
    }

    return user;
  }

  /**
   * Lista todos os usuários do sistema
   * @returns Array com todos os usuários
   */
  async findAll(): Promise<UserDocument[]> {
    return await this.userModel.find().sort({ createdAt: -1 });
  }

  /**
   * Busca usuário por email
   * @param email Email do usuário
   * @returns Usuário encontrado ou null
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email: email.toLowerCase() });
  }

  /**
   * Busca usuário por Google ID
   * @param googleId ID do Google
   * @returns Usuário encontrado ou null
   */
  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ googleId });
  }

  /**
   * Busca usuário por AbacatePay Customer ID
   * @param abacatepayCustomerId ID do cliente na AbacatePay
   * @returns Usuário encontrado ou null
   */
  async findByAbacatePayCustomerId(abacatepayCustomerId: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ abacatepayCustomerId });
  }

  /**
   * Atualiza dados do usuário
   * @param id ID do usuário
   * @param updateData Dados para atualização
   * @returns Usuário atualizado
   * @throws NotFoundException se usuário não for encontrado
   */
  async updateUser(id: string, updateData: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`, 'USER_NOT_FOUND');
    }

    return user;
  }

  /**
   * Mascara o taxid exibindo apenas os últimos 3 dígitos
   * @param taxid CPF/CNPJ completo
   * @returns taxid mascarado ou undefined
   */
  private maskTaxid(taxid?: string): string | undefined {
    if (!taxid) return undefined;
    const cleaned = taxid.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (cleaned.length < 3) return '***';
    const lastThree = cleaned.slice(-3);
    const masked = '*'.repeat(cleaned.length - 3) + lastThree;
    return masked;
  }

  /**
   * Converte documento User para DTO
   * @param user Documento User
   * @returns UserDto
   */
  toDto(user: UserDocument): UserDto {
    return {
      id: (user._id as any).toString(),
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      roleExpiresAt: user.roleExpiresAt,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
    };
  }


  /**
   * Obtém detalhes completos de um usuário para administradores
   * @param userId ID do usuário
   * @returns Detalhes completos incluindo perfil, tokens, e estatísticas
   */
  async getUserDetailsForAdmin(userId: string): Promise<any> {
    const user = await this.findById(userId);
    
    // Buscar estatísticas de tokens
    const tokenStats = await this.getTokenStats(userId);
    
    // Buscar histórico de recompensas
    const rewardHistory = await this.getRewardHistory(userId);
    
    // Buscar flashcard service se disponível
    let flashcardStats = null;
    try {
      const flashcardService = this.moduleRef.get('FlashcardService', { strict: false });
      if (flashcardService) {
        flashcardStats = await flashcardService.getUserStats(userId);
      }
    } catch (error) {
      console.log('FlashcardService não encontrado para estatísticas');
    }
    
    // Retornar dados completos
    return {
      user: this.toDto(user),
      profile: {
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        careerTime: user.careerTime,
        techArea: user.techArea,
        techStack: user.techStack,
        bio: user.bio,
        location: user.location,
        linkedinUrl: user.linkedinUrl,
        githubUrl: user.githubUrl,
        cellphone: user.cellphone,
        taxid: this.maskTaxid(user.taxid),
      },
      tokens: {
        currentBalance: user.tokens || 0,
        totalEarned: tokenStats.totalEarned,
        totalSpent: tokenStats.totalSpent,
        history: tokenStats.history,
      },
      quizStats: {
        totalFreeQuizzesCompleted: user.totalFreeQuizzesCompleted || 0,
        lastTokenRewardMilestone: user.lastTokenRewardMilestone || 0,
        lastTokenRewardAt: user.lastTokenRewardAt,
        dailyFreeQuizzesUsed: user.dailyFreeQuizzesUsed || 0,
        lastFreeQuizReset: user.lastFreeQuizReset,
      },
      flashcardStats,
      rewardHistory,
    };
  }

  /**
   * Retorna status do módulo de usuários
   * @returns Objeto com status do módulo
   */
  getStatus(): object {
    return {
      module: 'UserModule',
      status: 'active',
      database: 'MongoDB',
      description: 'Módulo de gerenciamento de usuários',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Busca quantidade de tokens do usuário
   * @param userId ID do usuário
   * @returns Quantidade de tokens do usuário
   */
  async getUserTokens(userId: string): Promise<number> {
    const user = await this.findById(userId);
    return user.tokens || 0;
  }

  /**
   * Define quantidade de tokens do usuário
   * @param userId ID do usuário
   * @param amount Quantidade de tokens
   */
  async setUserTokens(userId: string, amount: number): Promise<void> {
    const user = await this.findById(userId);
    user.tokens = Math.max(0, amount); // Garante que não seja negativo
    await user.save();
  }

  /**
   * Adiciona tokens ao usuário
   * @param userId ID do usuário
   * @param amount Quantidade a adicionar
   * @param reason Motivo da adição (ex: 'package_purchase', 'admin_grant')
   */
  async addTokensToUser(userId: string, amount: number, reason: string = 'token_added'): Promise<void> {
    const user = await this.findById(userId);
    user.tokens = Math.max(0, (user.tokens || 0) + amount);
    
    // Registrar no histórico apenas se não for quiz_completion (já é registrado em outro lugar)
    if (reason !== 'quiz_completion') {
      user.rewardHistory.push({
        type: 'token',
        amount: amount,
        reason: reason,
        createdAt: new Date()
      });
    }
    
    await user.save();
  }

  /**
   * Remove tokens do usuário
   * @param userId ID do usuário
   * @param amount Quantidade a remover
   * @param reason Motivo da remoção (ex: 'quiz_play', 'quiz_generation')
   */
  async removeTokensFromUser(userId: string, amount: number, reason: string = 'token_spent'): Promise<void> {
    const user = await this.findById(userId);
    user.tokens = Math.max(0, (user.tokens || 0) - amount);
    
    // Registrar no histórico de recompensas com valor negativo
    user.rewardHistory.push({
      type: 'token',
      amount: -amount, // Negativo para indicar gasto
      reason: reason,
      createdAt: new Date()
    });
    
    await user.save();
  }

  /**
   * Atualiza o perfil do usuário
   * @param userId ID do usuário
   * @param profileData Dados do perfil
   */
  async updateProfile(userId: string, profileData: any): Promise<UserDocument> {
    const user = await this.findById(userId);

    // Verificar se deve criar cliente na AbacatePay
    const shouldCreateAbacatePayCustomer =
      !user.abacatepayCustomerId &&
      profileData.cellphone &&
      profileData.taxid &&
      (profileData.name || user.name) &&
      user.email;

    if (shouldCreateAbacatePayCustomer) {
      try {
        const customerId = await this.createAbacatePayCustomer({
          name: profileData.name || user.name,
          email: user.email,
          cellphone: profileData.cellphone,
          taxid: profileData.taxid,
        });
        if (customerId) {
          profileData.abacatepayCustomerId = customerId;
        }
      } catch (error) {
        console.error('Erro ao criar cliente na AbacatePay:', error.response?.data || error.message);
        // Não falha a atualização do perfil por erro na AbacatePay
      }
    }

    // Se qualquer informação de perfil foi adicionada, marca onboarding como completo
    const hasProfileData = Object.keys(profileData).some(key => 
      key !== 'abacatepayCustomerId' && profileData[key] !== undefined && profileData[key] !== null
    );
    
    if (hasProfileData && !user.hasCompletedOnboarding) {
      profileData.hasCompletedOnboarding = true;
    }

    Object.assign(user, profileData);
    return await user.save();
  }

  /**
   * Completa o onboarding do usuário
   * @param userId ID do usuário
   * @param profileData Dados do perfil
   */
  async completeOnboarding(userId: string, profileData: any): Promise<UserDocument> {
    const user = await this.findById(userId);
    Object.assign(user, { ...profileData, hasCompletedOnboarding: true });
    return await user.save();
  }

  /**
   * Verifica se o usuário completou o onboarding
   * @param userId ID do usuário
   */
  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    return user.hasCompletedOnboarding || false;
  }

  /**
   * Verifica se o usuário pode fazer um quiz gratuito hoje
   * @param userId ID do usuário
   * @returns true se pode, false se atingiu o limite
   */
  async canDoFreeQuiz(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    this.resetDailyLimitIfNeeded(user);
    return user.dailyFreeQuizzesUsed < 3;
  }

  /**
   * Incrementa o contador de quizzes gratuitos feitos hoje e total
   * @param userId ID do usuário
   * @returns objeto com informação se ganhou token
   */
  async incrementFreeQuizCount(userId: string): Promise<{ tokenReward: boolean }> {
    const user = await this.findById(userId);
    this.resetDailyLimitIfNeeded(user);

    user.dailyFreeQuizzesUsed += 1;
    user.totalFreeQuizzesCompleted += 1;

    // Verificar se ganhou recompensa (a cada 5 quizzes)
    const newMilestone = Math.floor(user.totalFreeQuizzesCompleted / 5);
    const lastMilestone = Math.floor(user.lastTokenRewardMilestone / 5);

    let tokenReward = false;
    if (newMilestone > lastMilestone) {
      // Ganhou token!
      user.tokens = (user.tokens || 0) + 1;
      user.lastTokenRewardMilestone = user.totalFreeQuizzesCompleted;
      user.lastTokenRewardAt = new Date();

      // Adicionar ao histórico de recompensas
      user.rewardHistory.push({
        type: 'token',
        amount: 1,
        reason: 'quiz_completion',
        createdAt: new Date()
      });

      tokenReward = true;
    }

    await user.save();
    return { tokenReward };
  }

  /**
   * Obtém o status do limite diário
   * @param userId ID do usuário
   * @returns objeto com used, remaining e resetTime
   */
  async getDailyFreeQuizStatus(userId: string): Promise<{ used: number; remaining: number; resetTime: Date }> {
    const user = await this.findById(userId);
    this.resetDailyLimitIfNeeded(user);
    const used = user.dailyFreeQuizzesUsed;
    const remaining = Math.max(0, 3 - used);

    // Calcula quando o limite reseta (amanhã à meia-noite)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return { used, remaining, resetTime: tomorrow };
  }

  /**
   * Verifica se o usuário ganhou uma recompensa recentemente
   * @param userId ID do usuário
   * @returns objeto com informação sobre recompensa recente
   */
  async checkRecentTokenReward(userId: string): Promise<{ hasRecentReward: boolean; rewardTime?: Date }> {
    const user = await this.findById(userId);

    if (!user.lastTokenRewardAt) {
      return { hasRecentReward: false };
    }

    // Considera "recente" se foi nos últimos 5 minutos
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const hasRecentReward = user.lastTokenRewardAt > fiveMinutesAgo;

    return {
      hasRecentReward,
      rewardTime: hasRecentReward ? user.lastTokenRewardAt : undefined
    };
  }

  /**
   * Obtém o histórico completo de recompensas do usuário
   * @param userId ID do usuário
   * @returns array de recompensas ordenadas por data (mais recente primeiro)
   */
  async getRewardHistory(userId: string) {
    const user = await this.findById(userId);
    return user.rewardHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  /**
   * Obtém estatísticas detalhadas de tokens
   * @param userId ID do usuário
   * @returns estatísticas de tokens (saldo atual, total ganho, total gasto, histórico)
   */
  async getTokenStats(userId: string) {
    const user = await this.findById(userId);
    
    // Filtrar apenas transações de tokens
    const tokenHistory = user.rewardHistory
      .filter(r => r.type === 'token')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Calcular totais
    const totalEarned = tokenHistory
      .filter(r => r.amount > 0)
      .reduce((sum, r) => sum + r.amount, 0);
    
    const totalSpent = Math.abs(tokenHistory
      .filter(r => r.amount < 0)
      .reduce((sum, r) => sum + r.amount, 0));
    
    return {
      currentBalance: user.tokens || 0,
      totalEarned,
      totalSpent,
      history: tokenHistory,
    };
  }

  /**
   * Obter estatísticas gerais combinadas (quizzes + flashcards)
   */
  async getGeneralStats(userId: string) {
    // Buscar quiz service
    let quizStats = null;
    try {
      const quizService = this.moduleRef.get('QuizService', { strict: false });
      if (quizService) {
        quizStats = await quizService.getUserStats(userId);
      }
    } catch (error) {
      console.log('QuizService não encontrado para estatísticas');
      quizStats = {
        totalAttempts: 0,
        averageScore: 0,
        totalFreeQuizzesCompleted: 0,
      };
    }

    // Buscar flashcard service
    let flashcardStats = null;
    try {
      const flashcardService = this.moduleRef.get('FlashcardService', { strict: false });
      if (flashcardService) {
        flashcardStats = await flashcardService.getUserStats(userId);
      }
    } catch (error) {
      console.log('FlashcardService não encontrado para estatísticas');
    }

    // Buscar interview service
    let interviewStats = null;
    try {
      const interviewService = this.moduleRef.get('InterviewService', { strict: false });
      if (interviewService) {
        interviewStats = await interviewService.getUserStats(userId);
      }
    } catch (error) {
      console.log('InterviewService não encontrado para estatísticas');
      interviewStats = {
        totalAttempts: 0,
        totalInterviewsGenerated: 0,
        avgDifficulty: 0,
        avgDuration: 0,
      };
    }

    // Obter dados do usuário para estatísticas de tokens
    const tokenStats = await this.getTokenStats(userId);

    // Calcular estatísticas combinadas
    const totalLearningActivities = (quizStats?.totalAttempts || 0) + (flashcardStats?.totalSessions || 0) + (interviewStats?.totalAttempts || 0);
    const totalTokensSpent = tokenStats.totalSpent;
    
    // Calcular engajamento geral (baseado em atividades e consistência)
    const overallEngagement = this.calculateOverallEngagement(
      quizStats, 
      flashcardStats,
      interviewStats,
      totalLearningActivities,
      totalTokensSpent
    );

    return {
      totalAttempts: totalLearningActivities,
      quizAttempts: quizStats?.totalAttempts || 0,
      flashcardSessions: flashcardStats?.totalSessions || 0,
      interviewAttempts: interviewStats?.totalAttempts || 0,
      averageScore: quizStats?.averageScore || 0,
      totalFreeQuizzesCompleted: quizStats?.totalFreeQuizzesCompleted || 0,
      quizStats,
      flashcardStats,
      interviewStats,
      combinedStats: {
        totalLearningActivities,
        totalTokensSpent,
        overallEngagement,
      }
    };
  }

  /**
   * Calcular score de engajamento geral do usuário
   */
  private calculateOverallEngagement(quizStats: any, flashcardStats: any, interviewStats: any, totalActivities: number, tokensSpent: number): number {
    let engagementScore = 0;
    
    // Pontos por atividade (máximo 40 pontos)
    engagementScore += Math.min(totalActivities * 2, 40);
    
    // Pontos por performance em quizzes (máximo 20 pontos)
    if (quizStats && quizStats.averageScore > 0) {
      engagementScore += Math.min(quizStats.averageScore / 5, 20);
    }
    
    // Pontos por tempo de estudo em flashcards (máximo 20 pontos)
    if (flashcardStats && flashcardStats.totalStudyTime > 0) {
      engagementScore += Math.min(flashcardStats.totalStudyTime / 10, 20); // 10 minutos = 1 ponto
    }

    // Pontos por entrevistas realizadas (máximo 10 pontos)
    if (interviewStats && interviewStats.totalAttempts > 0) {
      engagementScore += Math.min(interviewStats.totalAttempts, 10);
    }
    
    // Pontos por uso de tokens (máximo 10 pontos)
    engagementScore += Math.min(tokensSpent, 10);
    
    // Pontos por criação de conteúdo (máximo 10 pontos)
    if (flashcardStats && flashcardStats.totalFlashcardsCreated > 0) {
      engagementScore += Math.min(flashcardStats.totalFlashcardsCreated, 10);
    }
    
    return Math.round(Math.min(engagementScore, 100));
  }

  /**
   * Obter atividade combinada do usuário (quizzes + flashcards + interviews)
   */
  async getCombinedActivity(userId: string, days: number = 365) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Buscar atividade de flashcards
    let flashcardActivity = [];
    try {
      const flashcardService = this.moduleRef.get('FlashcardService', { strict: false });
      if (flashcardService) {
        flashcardActivity = await flashcardService.getUserActivityStats(userId, days);
      }
    } catch (error) {
      console.log('FlashcardService não encontrado para atividade');
    }

    // Buscar atividade de quizzes
    let quizActivity = [];
    try {
      const quizService = this.moduleRef.get('QuizService', { strict: false });
      if (quizService) {
        // Assumindo que há um método getUserActivityStats no QuizService
        quizActivity = await quizService.getUserActivityStats(userId, days);
      }
    } catch (error) {
      console.log('QuizService não encontrado para atividade');
    }

    // Buscar atividade de interviews
    let interviewActivity = [];
    try {
      const interviewService = this.moduleRef.get('InterviewService', { strict: false });
      if (interviewService) {
        // Assumindo que há um método getUserActivityStats no InterviewService
        interviewActivity = await interviewService.getUserActivityStats(userId, days);
      }
    } catch (error) {
      console.log('InterviewService não encontrado para atividade');
    }

    // Mapear todas as atividades para formato combinado
    const activityMap = new Map<string, {
      quizAttempts: number;
      flashcardSessions: number;
      interviewAttempts: number;
      totalActivities: number;
      engagement: number;
    }>();

    // Adicionar dados de flashcards
    flashcardActivity.forEach(activity => {
      const existing = activityMap.get(activity.date) || {
        quizAttempts: 0,
        flashcardSessions: 0,
        interviewAttempts: 0,
        totalActivities: 0,
        engagement: 0
      };
      existing.flashcardSessions = activity.sessions;
      existing.totalActivities += activity.sessions;
      existing.engagement = Math.max(existing.engagement, Math.min(activity.sessions + Math.round(activity.intensity), 5));
      activityMap.set(activity.date, existing);
    });

    // Adicionar dados de quizzes
    quizActivity.forEach(activity => {
      const existing = activityMap.get(activity.date) || {
        quizAttempts: 0,
        flashcardSessions: 0,
        interviewAttempts: 0,
        totalActivities: 0,
        engagement: 0
      };
      existing.quizAttempts = activity.attempts;
      existing.totalActivities += activity.attempts;
      existing.engagement = Math.max(existing.engagement, Math.min(activity.attempts * 2, 5));
      activityMap.set(activity.date, existing);
    });

    // Adicionar dados de interviews
    interviewActivity.forEach(activity => {
      const existing = activityMap.get(activity.date) || {
        quizAttempts: 0,
        flashcardSessions: 0,
        interviewAttempts: 0,
        totalActivities: 0,
        engagement: 0
      };
      existing.interviewAttempts = activity.attempts;
      existing.totalActivities += activity.attempts;
      existing.engagement = Math.max(existing.engagement, Math.min(activity.attempts * 2, 5));
      activityMap.set(activity.date, existing);
    });

    // Converter para array ordenado
    const combinedActivity = Array.from(activityMap.entries()).map(([date, data]) => ({
      date,
      ...data
    }));

    return combinedActivity.sort((a, b) => a.date.localeCompare(b.date));
  }
  /**
   * Reseta o limite diário se necessário (se passou um dia)
   * @param user Usuário
   */
  resetDailyLimitIfNeeded(user: UserDocument): void {
    const now = new Date();
    const lastReset = user.lastFreeQuizReset;

    if (!lastReset || now.toDateString() !== lastReset.toDateString()) {
      user.dailyFreeQuizzesUsed = 0;
      user.lastFreeQuizReset = now;
    }
  }

  /**
   * Cria um cliente na AbacatePay
   * @param customerData Dados do cliente
   * @returns ID do cliente criado
   */
  async createAbacatePayCustomer(customerData: {
    name: string;
    email: string;
    cellphone: string;
    taxid: string;
  }): Promise<string | null> {
    const abacatepayToken = this.configService.get<string>('ABACATEPAY_TOKEN');
    if (!abacatepayToken) {
      console.error('❌ ABACATEPAY_TOKEN não configurado');
      return null;
    }

    const payload = {
      name: customerData.name,
      email: customerData.email,
      cellphone: customerData.cellphone,
      taxId: customerData.taxid,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post('https://api.abacatepay.com/v1/customer/create', payload, {
          headers: {
            'Authorization': `Bearer ${abacatepayToken}`,
            'Content-Type': 'application/json',
          },
        })
      );
      return response.data.data?.id || response.data.id;
    } catch (error) {
      console.error('Erro ao criar cliente na AbacatePay:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      // Por enquanto, não falha a atualização do perfil
      // throw error;
      return null; // Retorna null para indicar falha
    }
  }
}