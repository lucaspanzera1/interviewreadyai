import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuizDocument = Quiz & Document;

export enum QuizLevel {
  INICIANTE = 'INICIANTE',
  MEDIO = 'MEDIO',
  DIFICIL = 'DIFÍCIL',
  EXPERT = 'EXPERT',
}

export class QuizQuestion {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true, type: [String] })
  options: string[];

  @Prop({ required: true })
  correct_answer: number;

  @Prop({ required: true })
  explanation: string;
}

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ required: true })
  categoria: string;

  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  descricao: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true })
  quantidade_questoes: number;

  @Prop({ type: String, enum: QuizLevel, required: true })
  nivel: QuizLevel;

  @Prop({ type: [Object], required: true })
  questions: QuizQuestion[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  // Estatísticas
  @Prop({ type: Number, default: 0 })
  totalAccess: number;

  @Prop({ type: Number, default: 0 })
  totalAttempts: number;

  @Prop({ type: Number, default: 0 })
  totalCompletions: number;

  @Prop({ type: Number, default: 0 })
  averageScore: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  isFree: boolean;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);