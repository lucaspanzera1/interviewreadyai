import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TokenPackage, TokenPackageDocument } from './schemas/token-package.schema';
import { User } from '../user/schemas/user.schema';
import { EmailService } from '../common/services/email.service';

@Injectable()
export class TokenPackageService {
  constructor(
    @InjectModel(TokenPackage.name)
    private tokenPackageModel: Model<TokenPackageDocument>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly emailService: EmailService,
  ) {}

  async create(createTokenPackageDto: any): Promise<TokenPackage> {
    const data = {
      ...createTokenPackageDto,
      role: new Types.ObjectId(createTokenPackageDto.role),
    };
    const createdPackage = new this.tokenPackageModel(data);
    return createdPackage.save();
  }

  async findAll(): Promise<TokenPackage[]> {
    return this.tokenPackageModel.find({ active: true }).populate('role').exec();
  }

  async findOne(id: string): Promise<TokenPackage> {
    return this.tokenPackageModel.findById(id).populate('role').exec();
  }

  async findByExternalId(externalId: string): Promise<TokenPackage> {
    return this.tokenPackageModel.findOne({ externalId }).populate('role').exec();
  }

  async update(id: string, updateTokenPackageDto: any): Promise<TokenPackage> {
    const data = { ...updateTokenPackageDto };
    if (data.role) {
      data.role = new Types.ObjectId(data.role);
    }
    return this.tokenPackageModel.findByIdAndUpdate(id, data, { new: true }).populate('role').exec();
  }

  async remove(id: string): Promise<TokenPackage> {
    return this.tokenPackageModel.findByIdAndUpdate(id, { active: false }, { new: true }).exec();
  }

  async redeem(id: string, user: any): Promise<{ message: string }> {
    const tokenPackage = await this.findOne(id);
    if (!tokenPackage || !tokenPackage.active) {
      throw new NotFoundException('Pacote não encontrado ou inativo');
    }

    const userId = user.id || user._id;
    const currentUser = await this.userModel.findById(userId);
    
    if (!currentUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const newRole = (tokenPackage.role as any).name;

    // Lógica de validação baseada no tipo do pacote
    if (tokenPackage.packageType === 'subscription') {
      // Para assinaturas, verificar se já tem o plano ativo
      if (currentUser.role === newRole && currentUser.roleExpiresAt) {
        const now = new Date();
        if (currentUser.roleExpiresAt > now) {
          throw new BadRequestException(
            `Você já possui o plano ${newRole}. Válido até ${currentUser.roleExpiresAt.toLocaleDateString('pt-BR')}.`
          );
        }
      }
    }
    // Para 'token_boost' e 'test', sempre permitir (não verificar role existente)

    // Adicionar tokens e atualizar role conforme o tipo
    const newTokenBalance = (currentUser.tokens || 0) + tokenPackage.tokenAmount;
    
    const updateData: any = {
      tokens: newTokenBalance,
      $push: {
        rewardHistory: {
          type: 'package',
          amount: tokenPackage.tokenAmount,
          reason: `package_redemption:${tokenPackage.name}`,
          createdAt: new Date(),
        }
      }
    };

    // Atualizar role apenas para pacotes do tipo 'subscription'
    let roleExpiresAt: Date | undefined = undefined;
    if (tokenPackage.packageType === 'subscription') {
      // Calcular data de expiração se o pacote tiver validade definida
      if (tokenPackage.validityDays && tokenPackage.validityDays > 0) {
        roleExpiresAt = new Date();
        roleExpiresAt.setDate(roleExpiresAt.getDate() + tokenPackage.validityDays);
      }
      
      updateData.role = newRole;
      
      // Adicionar roleExpiresAt apenas se definido
      if (roleExpiresAt) {
        updateData.roleExpiresAt = roleExpiresAt;
      } else {
        // Remover roleExpiresAt se o plano for vitalício
        updateData.$unset = { roleExpiresAt: '' };
      }
    }
    // Para 'token_boost' e 'test', não alterar a role atual
    
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    let message = `Pacote resgatado com sucesso! Você recebeu ${tokenPackage.tokenAmount} tokens.`;
    
    if (tokenPackage.packageType === 'subscription') {
      message += ` Cargo atualizado para ${newRole}.`;
      if (roleExpiresAt) {
        message += ` Válido até ${roleExpiresAt.toLocaleDateString('pt-BR')}.`;
      }
    }

    // Enviar email notificando o resgate do plano
    await this.emailService.sendPlanRedeemedEmail(
      currentUser.email,
      currentUser.name || currentUser.email,
      tokenPackage.name,
      tokenPackage.description || `Pacote ${tokenPackage.name}`,
      tokenPackage.tokenAmount,
      newTokenBalance,
      tokenPackage.packageType === 'subscription' ? newRole : undefined,
      roleExpiresAt ? roleExpiresAt.toLocaleDateString('pt-BR') : undefined
    );

    return { message };
  }
}