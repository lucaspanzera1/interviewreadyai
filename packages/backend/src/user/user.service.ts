import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { UpdateUserDto, UserDto } from './dto';
import { NotFoundException, DatabaseException } from '../common/exceptions';

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
  ) {}

  /**
   * Busca ou cria um usuário baseado nos dados do Google OAuth
   * @param userData Dados do usuário do Google
   * @returns Usuário encontrado ou criado
   */
  async findOrCreateUser(userData: {
    googleId: string;
    email: string;
    name: string;
    picture?: string;
  }): Promise<UserDocument> {
    // Busca lista de admins do .env
    const adminEmailsRaw = this.configService.get<string>('ADMIN_EMAILS') || '';
    const adminEmails = adminEmailsRaw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    
    try {
      // Tenta encontrar usuário pelo Google ID
      let user = await this.userModel.findOne({ googleId: userData.googleId });

      if (!user) {
        // Se não encontrar, tenta pelo email
        user = await this.userModel.findOne({ email: userData.email.toLowerCase() });

        if (user) {
          // Se encontrar pelo email, atualiza o Google ID
          user.googleId = userData.googleId;
          user.lastLoginAt = new Date();
          return await user.save();
        }

        // Se não encontrar, cria novo usuário
        const role = adminEmails.includes(userData.email.toLowerCase()) 
          ? UserRole.ADMIN 
          : UserRole.CLIENT;

        user = new this.userModel({
          googleId: userData.googleId,
          email: userData.email.toLowerCase(),
          name: userData.name,
          picture: userData.picture,
          lastLoginAt: new Date(),
          role,
        });
        return await user.save();
      }

      // Se encontrar pelo Google ID, atualiza último login
      user.lastLoginAt = new Date();
      
      // Atualiza role se mudou no .env
      const newRole = adminEmails.includes(user.email.toLowerCase()) 
        ? UserRole.ADMIN 
        : UserRole.CLIENT;
      if (user.role !== newRole) {
        user.role = newRole;
      }
      
      return await user.save();
    } catch (error) {
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
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
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
   */
  async addTokensToUser(userId: string, amount: number): Promise<void> {
    const user = await this.findById(userId);
    user.tokens = Math.max(0, (user.tokens || 0) + amount);
    await user.save();
  }

  /**
   * Remove tokens do usuário
   * @param userId ID do usuário
   * @param amount Quantidade a remover
   */
  async removeTokensFromUser(userId: string, amount: number): Promise<void> {
    const user = await this.findById(userId);
    user.tokens = Math.max(0, (user.tokens || 0) - amount);
    await user.save();
  }
}