import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User, UserRole, UserDocument } from './schemas/user.schema';

/**
 * Serviço responsável por verificar e atualizar roles expiradas
 */
@Injectable()
export class UserExpirationService {
  private readonly logger = new Logger(UserExpirationService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  /**
   * Verifica e reverte roles expiradas para CLIENT
   * Executa a cada hora
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkExpiredRoles() {
    try {
      const now = new Date();
      
      // Buscar usuários com role expirada
      const expiredUsers = await this.userModel.find({
        roleExpiresAt: { $lte: now },
        role: { $ne: UserRole.CLIENT }
      });

      if (expiredUsers.length === 0) {
        return;
      }

      this.logger.log(`Found ${expiredUsers.length} users with expired roles`);

      // Atualizar usuários para role CLIENT e limpar data de expiração
      const result = await this.userModel.updateMany(
        {
          roleExpiresAt: { $lte: now },
          role: { $ne: UserRole.CLIENT }
        },
        {
          $set: { role: UserRole.CLIENT },
          $unset: { roleExpiresAt: '' }
        }
      );

      this.logger.log(`Updated ${result.modifiedCount} users to CLIENT role due to expiration`);
    } catch (error) {
      this.logger.error('Error checking expired roles:', error);
    }
  }

  /**
   * Verifica se um usuário específico tem role expirada
   */
  async checkUserRoleExpiration(userId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    
    if (!user || !user.roleExpiresAt) {
      return false;
    }

    const now = new Date();
    if (user.roleExpiresAt <= now && user.role !== UserRole.CLIENT) {
      // Expirou, reverter para CLIENT
      await this.userModel.findByIdAndUpdate(userId, {
        role: UserRole.CLIENT,
        $unset: { roleExpiresAt: '' }
      });
      
      this.logger.log(`User ${userId} role expired, reverted to CLIENT`);
      return true;
    }

    return false;
  }

  /**
   * Retorna quantos dias faltam para a role expirar
   */
  async getDaysUntilExpiration(userId: string): Promise<number | null> {
    const user = await this.userModel.findById(userId);
    
    if (!user || !user.roleExpiresAt) {
      return null; // Vitalício
    }

    const now = new Date();
    const diffTime = user.roleExpiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
}
