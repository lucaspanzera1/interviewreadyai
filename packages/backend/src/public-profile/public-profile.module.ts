import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicProfileController } from './public-profile.controller';
import { PublicProfileService } from './public-profile.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { QuizAttempt, QuizAttemptSchema } from '../quiz/schemas/quiz-attempt.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
    ]),
    UserModule,
  ],
  controllers: [PublicProfileController],
  providers: [PublicProfileService],
})
export class PublicProfileModule {}
