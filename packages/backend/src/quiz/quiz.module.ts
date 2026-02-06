import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { QuizController } from './quiz.controller';
import { QuizAdminController } from './quiz-admin.controller';
import { QuizService } from './quiz.service';
import { Quiz, QuizSchema, QuizAttempt, QuizAttemptSchema } from './schemas';
import { UserModule } from '../user/user.module';
import { FlashcardModule } from '../flashcard/flashcard.module';

@Module({
  imports: [
    HttpModule,
    UserModule,
    forwardRef(() => FlashcardModule),
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
    ]),
  ],
  controllers: [QuizController, QuizAdminController],
  providers: [QuizService],
  exports: [QuizService, MongooseModule],
})
export class QuizModule {}