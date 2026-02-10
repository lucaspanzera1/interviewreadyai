import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSocialService } from './user-social.service';
import { UserExpirationService } from './user-expiration.service';
import { MigrationService } from './migration.service';
import { User, UserSchema } from './schemas/user.schema';
import { UserFollow, UserFollowSchema } from './schemas/user-follow.schema';
import { QuizAttempt, QuizAttemptSchema } from '../quiz/schemas/quiz-attempt.schema';
import { EmailModule } from '../common/email.module';

/**
 * Módulo de usuários
 * Gerencia perfis de usuário, CRUD e relacionamentos
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserFollow.name, schema: UserFollowSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
    ]),
    EmailModule,
    HttpModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserSocialService, UserExpirationService, MigrationService],
  exports: [UserService, UserSocialService, MongooseModule, MigrationService],
})
export class UserModule {}