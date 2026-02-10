import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class MigrationService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async migrateTechAreaToNiche() {
    console.log('Iniciando migração: techArea -> niche');

    const usersWithTechArea = await this.userModel.find({
      techArea: { $exists: true },
      niche: { $exists: false }
    });

    console.log(`Encontrados ${usersWithTechArea.length} usuários para migrar`);

    for (const user of usersWithTechArea) {
      await this.userModel.updateOne(
        { _id: user._id },
        {
          $set: { niche: (user as any).techArea },
          $unset: { techArea: 1 }
        }
      );
    }

    console.log('Migração concluída');
  }
}