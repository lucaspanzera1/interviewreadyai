import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token, TokenDocument } from './schemas/token.schema';

/**
 * Service de tokens
 * Gerencia tokens disponíveis
 */
@Injectable()
export class TokenService implements OnModuleInit {
  constructor(
    @InjectModel(Token.name)
    private readonly tokenModel: Model<TokenDocument>,
  ) {}

  async onModuleInit() {
    await this.seedTokens();
  }

  /**
   * Busca todos os tokens ativos
   */
  async findAllActive(): Promise<TokenDocument[]> {
    return this.tokenModel.find({ active: true }).exec();
  }

  /**
   * Busca token por ID
   */
  async findById(id: string): Promise<TokenDocument | null> {
    return this.tokenModel.findById(id).exec();
  }

  /**
   * Cria tokens iniciais se não existirem
   */
  async seedTokens(): Promise<void> {
    const existingTokens = await this.tokenModel.countDocuments().exec();
    if (existingTokens === 0) {
      const tokens = [
        { name: 'Token A', description: 'Descrição do Token A' },
        { name: 'Token B', description: 'Descrição do Token B' },
        { name: 'Token C', description: 'Descrição do Token C' },
      ];
      await this.tokenModel.insertMany(tokens);
    }
  }
}