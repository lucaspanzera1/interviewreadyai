import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InterviewAttemptDocument = InterviewAttempt & Document;

export class InterviewAnswer {
  @Prop({ required: true })
  questionId: number;

  @Prop({ required: false }) // Agora opcional pois pode ter vídeo
  answer?: string;

  @Prop()
  timeSpent?: number; // tempo em segundos para responder esta pergunta
}

// Feedback com timestamp para análise de vídeo
export class VideoFeedbackMoment {
  @Prop({ required: true })
  timestamp: number; // tempo em segundos do vídeo

  @Prop({ required: true, enum: ['positive', 'improvement', 'neutral', 'warning'] })
  type: string;

  @Prop({ required: true, enum: ['verbal', 'non-verbal', 'content', 'technical'] })
  category: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, enum: ['low', 'medium', 'high'] })
  severity: string;

  @Prop()
  suggestion?: string;
}

export class VideoAnalysisResult {
  @Prop({ required: true, min: 0, max: 100 })
  overall_score: number;

  @Prop({ required: true })
  duration: number; // duração total em segundos

  @Prop({ type: [VideoFeedbackMoment], default: [] })
  moments: VideoFeedbackMoment[];

  @Prop({
    type: {
      strengths: [String],
      improvements: [String],
      keyPoints: [String]
    }
  })
  summary: {
    strengths: string[];
    improvements: string[];
    keyPoints: string[];
  };

  @Prop({
    type: {
      speech_clarity: Number,
      confidence_level: Number,
      engagement: Number,
      technical_accuracy: Number
    }
  })
  metrics: {
    speech_clarity: number;
    confidence_level: number;
    engagement: number;
    technical_accuracy: number;
  };
}

@Schema({ timestamps: true })
export class InterviewAttempt {
  @Prop({ type: Types.ObjectId, ref: 'Interview', required: true })
  interviewId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [Object], required: false }) // Opcional agora
  userAnswers?: InterviewAnswer[];

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

  // Campos para vídeo
  @Prop({ default: false })
  hasVideo: boolean;

  @Prop()
  videoPath?: string; // caminho do arquivo de vídeo principal (primeiro)

  @Prop({ type: [String], default: [] })
  videoPaths?: string[]; // caminhos de todos os vídeos (um por pergunta)

  @Prop()
  videoAnalysis?: VideoAnalysisResult; // resultado da análise do vídeo

  @Prop({ default: 'pending' })
  analysisStatus: string; // 'pending', 'processing', 'completed', 'failed'

  // Dados para análise de performance
  @Prop({ type: Number, default: 0 })
  preparednessScore: number; // pontuação calculada com base nas palavras-chave

  @Prop({ type: [String], default: [] })
  strengths: string[]; // pontos fortes identificados

  @Prop({ type: [String], default: [] })
  improvements: string[]; // pontos de melhoria
}

export const InterviewAttemptSchema = SchemaFactory.createForClass(InterviewAttempt);