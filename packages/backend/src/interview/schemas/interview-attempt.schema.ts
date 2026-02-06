import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InterviewAttemptDocument = InterviewAttempt & Document;

export class InterviewAnswer {
  @Prop({ required: true })
  questionId: number;

  @Prop({ required: true })
  answer: string;

  @Prop()
  timeSpent?: number; // tempo em segundos para responder esta pergunta
}

@Schema({ timestamps: true })
export class InterviewAttempt {
  @Prop({ type: Types.ObjectId, ref: 'Interview', required: true })
  interviewId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [Object], required: true })
  userAnswers: InterviewAnswer[];

  @Prop({ required: true })
  actualDuration: number; // tempo total em minutos

  @Prop({ required: true, min: 1, max: 5 })
  difficultyRating: number; // de 1 (muito fácil) a 5 (muito difícil)

  @Prop()
  feedback?: string; // feedback opcional do usuário

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop()
  completedAt?: Date;

  // Dados para análise de performance
  @Prop({ type: Number, default: 0 })
  preparednessScore: number; // pontuação calculada com base nas palavras-chave

  @Prop({ type: [String], default: [] })
  strengths: string[]; // pontos fortes identificados

  @Prop({ type: [String], default: [] })
  improvements: string[]; // pontos de melhoria
}

export const InterviewAttemptSchema = SchemaFactory.createForClass(InterviewAttempt);