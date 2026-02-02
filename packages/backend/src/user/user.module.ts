import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserExpirationService } from './user-expiration.service';
import { User, UserSchema } from './schemas/user.schema';
/**
 * Módulo de usuários
 * Gerencia perfis de usuário, CRUD e relacionamentos
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserExpirationService],
  exports: [UserService, MongooseModule],
})
export class UserModule {}