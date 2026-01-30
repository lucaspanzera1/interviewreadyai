import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuizAttemptDocument = QuizAttempt & Document;

@Schema({ timestamps: true })
export class QuizAttempt {
  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quizId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [Number], required: true })
  selectedAnswers: number[];

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  totalQuestions: number;

  @Prop({ required: true })
  percentage: number;

  @Prop({ type: Number, default: 0 })
  timeSpent: number; // em segundos

  @Prop({ default: false })
  completed: boolean;

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;
}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);