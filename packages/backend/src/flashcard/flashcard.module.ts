import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { FlashcardController } from './flashcard.controller';
import { FlashcardService } from './flashcard.service';
import { Flashcard, FlashcardSchema } from './schemas/flashcard.schema';
import { FlashcardStudy, FlashcardStudySchema } from './schemas/flashcard-study.schema';
import { UserModule } from '../user/user.module';
import { QuizModule } from '../quiz/quiz.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Flashcard.name, schema: FlashcardSchema },
      { name: FlashcardStudy.name, schema: FlashcardStudySchema },
    ]),
    HttpModule,
    ConfigModule,
    UserModule,
    forwardRef(() => QuizModule),
  ],
  controllers: [FlashcardController],
  providers: [FlashcardService],
  exports: [FlashcardService],
})
export class FlashcardModule {}