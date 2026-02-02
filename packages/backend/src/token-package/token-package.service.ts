import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TokenPackage, TokenPackageDocument } from './schemas/token-package.schema';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class TokenPackageService {
  constructor(
    @InjectModel(TokenPackage.name)
    private tokenPackageModel: Model<TokenPackageDocument>,
    @InjectModel(User.name)
    private userModel: Model<User>,
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

    if (user.tokens < tokenPackage.tokenAmount) {
      throw new BadRequestException('Tokens insuficientes');
    }

    // Deduzir tokens e atualizar role
    user.tokens -= tokenPackage.tokenAmount;
    user.role = (tokenPackage.role as any).name; // Assuming role is populated
    await this.userModel.findByIdAndUpdate(user._id, {
      tokens: user.tokens,
      role: user.role,
    });

    return { message: 'Pacote resgatado com sucesso!' };
  }
}