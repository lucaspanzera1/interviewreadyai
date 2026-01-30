import { Controller, Get, Put, Body, Param, UseGuards, Post, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserDto, UpdateUserDto } from './dto';
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
  ) {}

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
    const userId = user.userId || user.sub;
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
    type: UserDto
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
  ): Promise<UserDto> {
    const userId = user.userId || user.sub;
    const updatedUser = await this.userService.updateUser(userId, updateData);
    return this.userService.toDto(updatedUser);
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
    const userId = user.userId || user.sub;
    const tokens = await this.userService.getUserTokens(userId);
    return { tokens };
  }

  /**
   * Define quantidade de tokens do usuário atual
   * @param body Dados com quantidade de tokens
   */
  @Put('me/tokens')
  @ApiOperation({
    summary: 'Definir quantidade de tokens do usuário',
    description: 'Define a quantidade de tokens do usuário atual'
  })
  @ApiResponse({
    status: 200,
    description: 'Quantidade de tokens definida com sucesso'
  })
  async setTokens(@CurrentUser() user: any, @Body() body: { tokens: number }): Promise<void> {
    const userId = user.userId || user.sub;
    await this.userService.setUserTokens(userId, body.tokens);
  }

  /**
   * Adiciona tokens ao usuário atual
   * @param body Dados com quantidade a adicionar
   */
  @Post('me/tokens/add')
  @ApiOperation({
    summary: 'Adicionar tokens ao usuário',
    description: 'Adiciona tokens ao saldo do usuário atual'
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens adicionados com sucesso'
  })
  async addTokens(@CurrentUser() user: any, @Body() body: { amount: number }): Promise<void> {
    const userId = user.userId || user.sub;
    await this.userService.addTokensToUser(userId, body.amount);
  }

  /**
   * Remove tokens do usuário atual
   * @param body Dados com quantidade a remover
   */
  @Post('me/tokens/remove')
  @ApiOperation({
    summary: 'Remover tokens do usuário',
    description: 'Remove tokens do saldo do usuário atual'
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens removidos com sucesso'
  })
  async removeTokens(@CurrentUser() user: any, @Body() body: { amount: number }): Promise<void> {
    const userId = user.userId || user.sub;
    await this.userService.removeTokensFromUser(userId, body.amount);
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