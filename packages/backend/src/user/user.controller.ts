import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
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