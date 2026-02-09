import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InterviewDocument = Interview & Document;

export enum InterviewType {
  TECHNICAL = 'TECHNICAL',
  BEHAVIORAL = 'BEHAVIORAL',
  MIXED = 'MIXED'
}

export class InterviewQuestionSchema {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  question: string;

  @Prop({ 
    required: true,
    enum: ['technical', 'behavioral', 'situational', 'company_specific']
  })
  type: string;

  @Prop({ required: true })
  category: string;

  @Prop({ 
    required: true,
    enum: ['easy', 'medium', 'hard']
  })
  difficulty: string;

  @Prop()
  tips?: string;

  @Prop({ type: [String], default: [] })
  keywords: string[];
}

@Schema({ timestamps: true })
export class Interview {
  @Prop({ required: true })
  jobTitle: string;

  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  linkedinUrl: string;

  @Prop({ type: [Object], required: true })
  questions: InterviewQuestionSchema[];

  @Prop({ required: true })
  numberOfQuestions: number;

  @Prop({ required: true })
  estimatedDuration: number; // em minutos

  @Prop({ type: [String], default: [] })
  preparationTips: string[];

  @Prop({ type: [String], default: [] })
  jobRequirements: string[];

  @Prop()
  companyInfo?: string;

  @Prop()
  experienceLevel?: string;

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
  averageDifficulty: number; // rating médio de dificuldade

  @Prop({ default: true })
  isActive: boolean;

  // Dados brutos da vaga (para futuras análises)
  @Prop({ type: Object })
  rawJobData?: any;

  @Prop({ type: String, enum: InterviewType, default: InterviewType.MIXED })
  interviewType: InterviewType;
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);