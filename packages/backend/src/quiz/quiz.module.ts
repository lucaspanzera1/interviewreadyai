import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { QuizController } from './quiz.controller';
import { QuizAdminController } from './quiz-admin.controller';
import { QuizService } from './quiz.service';
import { Quiz, QuizSchema, QuizAttempt, QuizAttemptSchema } from './schemas';

@Module({
  imports: [
    HttpModule,
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