import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { Interview, InterviewSchema } from './schemas/interview.schema';
import { InterviewAttempt, InterviewAttemptSchema } from './schemas/interview-attempt.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Interview.name, schema: InterviewSchema },
      { name: InterviewAttempt.name, schema: InterviewAttemptSchema }, 
    ]),
    HttpModule,
    forwardRef(() => UserModule),
    ConfigModule,
  ],
  controllers: [InterviewController],
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewModule {}