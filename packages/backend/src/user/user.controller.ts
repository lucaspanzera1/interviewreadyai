import { Controller, Get, Put, Body, Param, UseGuards, Post, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserSocialService } from './user-social.service';
import { UserDto, UpdateUserDto, ProfileDto, CompleteOnboardingDto } from './dto';
import { 
  SearchUsersDto, 
  FollowUserDto, 
  UnfollowUserDto, 
  PublicUserDto, 
  UserConnectionsDto 
} from './dto/social.dto';
import { CurrentUser, Public, Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './schemas/user.schema';
import {
  UnauthorizedErrorDto,
  NotFoundErrorDto,
  ValidationErrorDto,
  ForbiddenErrorDto
} from '../common/dto';

/**
 * Controller de usuários
 * Gerencia endpoints de perfil, atualização e informações do usuário
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userSocialService: UserSocialService,
  ) { }

  /**
   * Helper para extrair o ID do usuário do objeto retornado pelo JWT strategy
   */
  private getUserId(user: any): string {
    return user._id?.toString() || user.id || user.userId || user.sub;
  }

  /**
   * Helper para mascarar taxid exibindo apenas os últimos 3 dígitos
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
   * Lista todos os usuários do sistema (admin only)
   * @returns Array com todos os usuários
   */
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Retorna uma lista com todos os usuários do sistema (apenas admins)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    type: [UserDto]
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou expirado',
    type: UnauthorizedErrorDto
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - requer role admin',
    type: ForbiddenErrorDto
  })
  async findAll(): Promise<UserDto[]> {
    const users = await this.userService.findAll();
    return users.map(user => this.userService.toDto(user));
  }

  /**
   * Retorna perfil do usuário autenticado
   * @param user Usuário atual da requisição
   * @returns Dados do perfil do usuário
   */
  @Get('profile')
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil retornado com sucesso',
    type: UserDto
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou expirado',
    type: UnauthorizedErrorDto
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    type: NotFoundErrorDto
  })
  async getProfile(@CurrentUser() user: any): Promise<UserDto> {
    const userId = this.getUserId(user);
    const userEntity = await this.userService.findById(userId);
    return this.userService.toDto(userEntity);
  }

  /**
   * Atualiza perfil do usuário autenticado
   * @param user Usuário atual da requisição
   * @param updateData Dados para atualização
   * @returns Perfil atualizado
   */
  @Put('profile')
  @ApiOperation({ summary: 'Atualizar perfil do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/UserDto' },
        message: { type: 'string', example: 'Perfil atualizado com sucesso!' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
    type: ValidationErrorDto
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou expirado',
    type: UnauthorizedErrorDto
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    type: NotFoundErrorDto
  })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateData: UpdateUserDto,
  ): Promise<{ success: boolean; data: UserDto; message: string }> {
    const userId = this.getUserId(user);
    const updatedUser = await this.userService.updateUser(userId, updateData);
    return { success: true, data: this.userService.toDto(updatedUser), message: "Perfil atualizado com sucesso!" };
  }

  /**
   * Atualizar configurações de privacidade do usuário
   * @param user Usuário atual da requisição
   * @param body Dados de privacidade
   * @returns Status da atualização
   */
  @Put('privacy-settings')
  @ApiOperation({ summary: 'Atualizar configurações de privacidade' })
  @ApiResponse({
    status: 200,
    description: 'Configurações atualizadas com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Configurações de privacidade atualizadas com sucesso!' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou expirado',
    type: UnauthorizedErrorDto
  })
  async updatePrivacySettings(
    @CurrentUser() user: any,
    @Body() body: { isProfilePublic: boolean },
  ): Promise<{ success: boolean; message: string }> {
    const userId = this.getUserId(user);
    await this.userService.updateUser(userId, { isProfilePublic: body.isProfilePublic });
    return { 
      success: true, 
      message: `Perfil ${body.isProfilePublic ? 'público' : 'privado'} configurado com sucesso!` 
    };
  }


  /**
   * Busca quantidade de tokens do usuário atual
   * @returns Quantidade de tokens do usuário
   */
  @Get('me/tokens')
  @ApiOperation({
    summary: 'Buscar quantidade de tokens do usuário',
    description: 'Retorna a quantidade de tokens do usuário atual'
  })
  @ApiResponse({
    status: 200,
    description: 'Quantidade de tokens retornada com sucesso'
  })
  async getMyTokens(@CurrentUser() user: any): Promise<{ tokens: number }> {
    const userId = this.getUserId(user);
    const tokens = await this.userService.getUserTokens(userId);
    return { tokens };
  }



  /**
   * Busca status do limite diário de quizzes gratuitos
   * @returns Status do limite diário
   */
  @Get('me/free-quiz-limit')
  @ApiOperation({
    summary: 'Buscar status do limite diário de quizzes gratuitos',
    description: 'Retorna quantos quizzes gratuitos o usuário já fez hoje e quantos ainda pode fazer, além da data de reset'
  })
  @ApiResponse({
    status: 200,
    description: 'Status do limite retornado com sucesso',
    schema: {
      type: 'object',
      properties: {
        used: { type: 'number', example: 1 },
        remaining: { type: 'number', example: 2 },
        resetTime: { type: 'string', format: 'date-time', example: '2026-02-02T00:00:00.000Z' }
      }
    }
  })
  async getMyFreeQuizLimit(@CurrentUser() user: any): Promise<{ used: number; remaining: number; resetTime: Date }> {
    const userId = this.getUserId(user);
    return this.userService.getDailyFreeQuizStatus(userId);
  }

  /**
   * Verifica se o usuário ganhou uma recompensa recentemente
   * @returns Status da recompensa recente
   */
  @Get('me/recent-reward')
  @ApiOperation({
    summary: 'Verificar recompensa recente',
    description: 'Verifica se o usuário ganhou um token recentemente por completar quizzes gratuitos'
  })
  @ApiResponse({
    status: 200,
    description: 'Status da recompensa retornado com sucesso',
    schema: {
      type: 'object',
      properties: {
        hasRecentReward: { type: 'boolean', example: true },
        rewardTime: { type: 'string', format: 'date-time', example: '2026-02-01T12:00:00.000Z' }
      }
    }
  })
  async checkRecentReward(@CurrentUser() user: any): Promise<{ hasRecentReward: boolean; rewardTime?: Date }> {
    const userId = this.getUserId(user);
    return this.userService.checkRecentTokenReward(userId);
  }

  /**
   * Obtém o histórico completo de recompensas do usuário
   * @returns Histórico de recompensas ordenado por data (mais recente primeiro)
   */
  @Get('me/reward-history')
  @ApiOperation({
    summary: 'Histórico de recompensas',
    description: 'Retorna o histórico completo de recompensas recebidas pelo usuário'
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de recompensas retornado com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', example: 'token' },
          amount: { type: 'number', example: 1 },
          reason: { type: 'string', example: 'quiz_completion' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-02-01T12:00:00.000Z' }
        }
      }
    }
  })
  async getRewardHistory(@CurrentUser() user: any) {
    const userId = this.getUserId(user);
    return this.userService.getRewardHistory(userId);
  }

  /**
   * Obter estatísticas de tokens
   * @returns Estatísticas detalhadas de tokens
   */
  @Get('me/token-stats')
  @ApiOperation({
    summary: 'Obter estatísticas de tokens',
    description: 'Retorna estatísticas detalhadas sobre ganhos e gastos de tokens do usuário'
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de tokens retornadas com sucesso',
    schema: {
      type: 'object',
      properties: {
        currentBalance: { type: 'number', example: 5 },
        totalEarned: { type: 'number', example: 10 },
        totalSpent: { type: 'number', example: 5 },
        history: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'token' },
              amount: { type: 'number', example: -1 },
              reason: { type: 'string', example: 'quiz_generation' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  async getTokenStats(@CurrentUser() user: any) {
    const userId = this.getUserId(user);
    return this.userService.getTokenStats(userId);
  }

  /**
   * Obter estatísticas gerais do usuário (quizzes + flashcards)
   */
  @Get('me/general-stats')
  @ApiOperation({
    summary: 'Obter estatísticas gerais',
    description: 'Retorna estatísticas combinadas de quizzes e flashcards do usuário'
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas gerais retornadas com sucesso',
    schema: {
      type: 'object',
      properties: {
        quizStats: {
          type: 'object',
          properties: {
            totalAttempts: { type: 'number' },
            averageScore: { type: 'number' },
            totalFreeQuizzesCompleted: { type: 'number' }
          }
        },
        flashcardStats: {
          type: 'object',
          properties: {
            totalFlashcardsCreated: { type: 'number' },
            totalStudySessions: { type: 'number' },
            totalReviews: { type: 'number' },
            totalStudyTime: { type: 'number' },
            averageCardsPerSession: { type: 'number' }
          },
          nullable: true
        },
        combineStats: {
          type: 'object',
          properties: {
            totalLearningActivities: { type: 'number' },
            totalTokensSpent: { type: 'number' },
            overallEngagement: { type: 'number' }
          }
        }
      }
    }
  })
  async getGeneralStats(@CurrentUser() user: any) {
    const userId = this.getUserId(user);
    return this.userService.getGeneralStats(userId);
  }

  /**
   * Obter atividade combinada do usuário (para heatmap)
   */
  @Get('me/activity')
  @ApiOperation({
    summary: 'Obter atividade combinada',
    description: 'Retorna dados de atividade diária combinando quizzes e flashcards para heatmap'
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: 'number',
    description: 'Número de dias para buscar (padrão: 365)',
    example: 90
  })
  @ApiResponse({
    status: 200,
    description: 'Dados de atividade combinada retornados com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string', format: 'date', example: '2024-01-15' },
          quizAttempts: { type: 'number', example: 2 },
          flashcardSessions: { type: 'number', example: 3 },
          totalActivities: { type: 'number', example: 5 },
          engagement: { type: 'number', example: 4 }
        }
      }
    }
  })
  async getCombinedActivity(
    @CurrentUser() user: any,
    @Query('days') days: string = '365'
  ) {
    const userId = this.getUserId(user);
    return this.userService.getCombinedActivity(userId, parseInt(days));
  }





  /**
   * Busca perfil do usuário atual
   * @returns Perfil do usuário
   */
  @Get('me/profile')
  @ApiOperation({
    summary: 'Buscar perfil do usuário',
    description: 'Retorna os dados de perfil do usuário atual'
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil retornado com sucesso'
  })
  async getMyProfile(@CurrentUser() user: any): Promise<any> {
    const userId = this.getUserId(user);
    const userDoc = await this.userService.findById(userId);
    return {
      hasCompletedOnboarding: userDoc.hasCompletedOnboarding,
      careerTime: userDoc.careerTime,
      techArea: userDoc.techArea,
      techStack: userDoc.techStack,
      bio: userDoc.bio,
      location: userDoc.location,
      linkedinUrl: userDoc.linkedinUrl,
      githubUrl: userDoc.githubUrl,
      cellphone: userDoc.cellphone,
      taxid: this.maskTaxid(userDoc.taxid),
    };
  }

  /**
   * Atualiza perfil do usuário atual
   * @param profileData Dados do perfil
   */
  @Put('me/profile')
  @ApiOperation({
    summary: 'Atualizar perfil do usuário',
    description: 'Atualiza os dados de perfil do usuário atual'
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'object' },
        message: { type: 'string', example: 'Perfil atualizado com sucesso!' }
      }
    }
  })
  async updateMyProfile(@CurrentUser() user: any, @Body() profileData: ProfileDto): Promise<{ success: boolean; data: any; message: string }> {
    const userId = this.getUserId(user);
    const updatedUser = await this.userService.updateProfile(userId, profileData);
    return {
      success: true,
      data: {
        hasCompletedOnboarding: updatedUser.hasCompletedOnboarding,
        careerTime: updatedUser.careerTime,
        techArea: updatedUser.techArea,
        techStack: updatedUser.techStack,
        bio: updatedUser.bio,
        location: updatedUser.location,
        linkedinUrl: updatedUser.linkedinUrl,
        githubUrl: updatedUser.githubUrl,
      },
      message: "Perfil atualizado com sucesso!"
    };
  }

  /**
   * Completa o onboarding do usuário
   * @param profileData Dados do perfil para completar onboarding
   */
  @Post('me/onboarding')
  @ApiOperation({
    summary: 'Completar onboarding',
    description: 'Completa o processo de onboarding do usuário'
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding completado com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'object' },
        message: { type: 'string', example: 'Onboarding completado com sucesso!' }
      }
    }
  })
  async completeOnboarding(@CurrentUser() user: any, @Body() profileData: CompleteOnboardingDto): Promise<{ success: boolean; data: any; message: string }> {
    const userId = this.getUserId(user);
    const updatedUser = await this.userService.completeOnboarding(userId, profileData);
    return {
      success: true, data: {
        hasCompletedOnboarding: updatedUser.hasCompletedOnboarding,
        careerTime: updatedUser.careerTime,
        techArea: updatedUser.techArea,
        techStack: updatedUser.techStack,
        bio: updatedUser.bio,
        location: updatedUser.location,
        linkedinUrl: updatedUser.linkedinUrl,
        githubUrl: updatedUser.githubUrl,
      },
      message: "Onboarding completado com sucesso!"
    };
  }

  /**
   * Verifica se o usuário completou o onboarding
   */
  @Get('me/onboarding/status')
  @ApiOperation({
    summary: 'Status do onboarding',
    description: 'Verifica se o usuário completou o onboarding'
  })
  @ApiResponse({
    status: 200,
    description: 'Status retornado com sucesso'
  })
  async getOnboardingStatus(@CurrentUser() user: any): Promise<{ hasCompletedOnboarding: boolean }> {
    const userId = this.getUserId(user);
    const hasCompleted = await this.userService.hasCompletedOnboarding(userId);
    return { hasCompletedOnboarding: hasCompleted };
  }

  /**
   * Obtém detalhes completos de um usuário específico (admin only)
   * Inclui perfil profissional, tokens, e quizzes criados
   * @param id ID do usuário
   * @returns Detalhes completos do usuário
   */
  @Get(':id/details')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Obter detalhes completos de um usuário',
    description: 'Retorna perfil profissional, tokens, estatísticas e quizzes criados pelo usuário (apenas admins)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do usuário retornados com sucesso'
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou expirado',
    type: UnauthorizedErrorDto
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - requer role admin',
    type: ForbiddenErrorDto
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    type: NotFoundErrorDto
  })
  async getUserDetails(@Param('id') id: string): Promise<any> {
    return this.userService.getUserDetailsForAdmin(id);
  }

  /**
   * Adiciona tokens manualmente à conta de um usuário (admin only)
   * @param id ID do usuário
   * @param body Dados da operação (amount e reason)
   * @returns Confirmação da operação
   */
  @Post(':id/add-tokens')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Adicionar tokens manualmente a um usuário',
    description: 'Permite que administradores adicionem tokens à conta de um usuário (apenas admins)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens adicionados com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Tokens adicionados com sucesso' },
        newBalance: { type: 'number', example: 15 }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
    type: ValidationErrorDto
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou expirado',
    type: UnauthorizedErrorDto
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - requer role admin',
    type: ForbiddenErrorDto
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    type: NotFoundErrorDto
  })
  async addTokensToUser(
    @Param('id') id: string,
    @Body() body: { amount: number; reason?: string }
  ): Promise<{ success: boolean; message: string; newBalance: number }> {
    const { amount, reason = 'admin_grant' } = body;

    if (!amount || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    await this.userService.addTokensToUser(id, amount, reason);
    const newBalance = await this.userService.getUserTokens(id);

    return {
      success: true,
      message: `${amount} ${amount === 1 ? 'token adicionado' : 'tokens adicionados'} com sucesso`,
      newBalance
    };
  }

  /**
   * Buscar usuários por filtros
   * @returns Lista paginada de usuários encontrados
   */
  @Get('search')
  @ApiOperation({ summary: 'Buscar usuários' })
  @ApiResponse({
    status: 200,
    description: 'Usuários encontrados',
    type: [PublicUserDto]
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
    type: UnauthorizedErrorDto
  })
  async searchUsers(
    @Query() searchDto: SearchUsersDto,
    @CurrentUser() currentUser: any
  ): Promise<{
    users: PublicUserDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const currentUserId = this.getUserId(currentUser);
    return this.userSocialService.searchUsers(searchDto, currentUserId);
  }

  /**
   * Obter perfil público de um usuário
   * @param id ID do usuário
   * @returns Perfil público do usuário
   */
  @Get('profile/:id')
  @ApiOperation({ summary: 'Obter perfil público de usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Perfil público obtido',
    type: PublicUserDto
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
    type: UnauthorizedErrorDto
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    type: NotFoundErrorDto
  })
  async getPublicProfile(
    @Param('id') id: string,
    @CurrentUser() currentUser: any
  ): Promise<PublicUserDto> {
    const currentUserId = this.getUserId(currentUser);
    return this.userSocialService.getPublicProfile(id, currentUserId);
  }

  /**
   * Seguir um usuário
   * @param followUserDto Dados do usuário a ser seguido
   * @returns Sucesso da operação
   */
  @Post('follow')
  @ApiOperation({ summary: 'Seguir usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário seguido com sucesso'
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação',
    type: ValidationErrorDto
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
    type: UnauthorizedErrorDto
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    type: NotFoundErrorDto
  })
  async followUser(
    @Body() followUserDto: FollowUserDto,
    @CurrentUser() currentUser: any
  ): Promise<{ success: boolean; message: string }> {
    const followerId = this.getUserId(currentUser);
    await this.userSocialService.followUser(followerId, followUserDto.userId);
    return { success: true, message: 'Usuário seguido com sucesso' };
  }

  /**
   * Deixar de seguir um usuário
   * @param unfollowUserDto Dados do usuário a deixar de seguir
   * @returns Sucesso da operação
   */
  @Post('unfollow')
  @ApiOperation({ summary: 'Deixar de seguir usuário' })
  @ApiResponse({
    status: 201,
    description: 'Parou de seguir o usuário'
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação',
    type: ValidationErrorDto
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
    type: UnauthorizedErrorDto
  })
  @ApiResponse({
    status: 404,
    description: 'Relacionamento não encontrado',
    type: NotFoundErrorDto
  })
  async unfollowUser(
    @Body() unfollowUserDto: UnfollowUserDto,
    @CurrentUser() currentUser: any
  ): Promise<{ success: boolean; message: string }> {
    const followerId = this.getUserId(currentUser);
    await this.userSocialService.unfollowUser(followerId, unfollowUserDto.userId);
    return { success: true, message: 'Parou de seguir o usuário' };
  }

  /**
   * Obter conexões de um usuário (seguidores e seguindo)
   * @param id ID do usuário
   * @returns Conexões do usuário
   */
  @Get('connections/:id')
  @ApiOperation({ summary: 'Obter conexões de usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Conexões obtidas',
    type: UserConnectionsDto
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
    type: UnauthorizedErrorDto
  })
  async getUserConnections(
    @Param('id') id: string,
    @CurrentUser() currentUser: any
  ): Promise<UserConnectionsDto> {
    const currentUserId = this.getUserId(currentUser);
    return this.userSocialService.getUserConnections(id, currentUserId);
  }

  /**
   * Endpoint temporário para testar o módulo de usuários
   * @returns Status do módulo de usuários
   */
  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Status do módulo de usuários' })
  @ApiResponse({
    status: 200,
    description: 'Status retornado com sucesso'
  })
  getStatus(): object {
    return this.userService.getStatus();
  }
}