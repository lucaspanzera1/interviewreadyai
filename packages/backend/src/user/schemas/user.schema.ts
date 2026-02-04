import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true })
  googleId?: string;

  @Prop({ unique: true })
  githubId?: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  picture?: string;

  @Prop({ maxlength: 20 })
  taxid?: string;

  @Prop()
  cellphone?: string;

  @Prop()
  abacatepayCustomerId?: string; // ID do cliente na AbacatePay

  @Prop({ type: String, enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Prop()
  roleExpiresAt?: Date; // Data de expiração da role atual (null = vitalício)

  @Prop({ default: true })
  active: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  refreshToken?: string;

  @Prop({ type: Number, default: 0 })
  tokens: number;

  // Campos de perfil/onboarding
  @Prop({ default: false })
  hasCompletedOnboarding: boolean;

  @Prop()
  careerTime?: string; // '0-1', '1-3', '3-5', '5-10', '10+'

  @Prop()
  techArea?: string; // 'frontend', 'backend', 'fullstack', 'mobile', 'devops', 'data', 'other'

  @Prop({ type: [String] })
  techStack?: string[];

  @Prop()
  bio?: string;

  @Prop()
  location?: string;

  @Prop()
  linkedinUrl?: string;

  @Prop()
  githubUrl?: string;

  // Limite diário de quizzes gratuitos
  @Prop({ type: Number, default: 0 })
  dailyFreeQuizzesUsed: number;

  @Prop()
  lastFreeQuizReset?: Date;

  // Sistema de recompensas por quizzes gratuitos
  @Prop({ type: Number, default: 0 })
  totalFreeQuizzesCompleted: number;

  @Prop({ type: Number, default: 0 })
  lastTokenRewardMilestone: number; // Último milestone (5, 10, 15, etc.) onde ganhou token

  @Prop()
  lastTokenRewardAt?: Date; // Quando ganhou o último token

  // Histórico completo de recompensas
  @Prop({ type: [{
    type: { type: String, required: true }, // 'token', 'badge', etc.
    amount: { type: Number, required: true },
    reason: { type: String, required: true }, // 'quiz_completion', 'referral', etc.
    createdAt: { type: Date, default: Date.now }
  }], default: [] })
  rewardHistory: {
    type: string;
    amount: number;
    reason: string;
    createdAt: Date;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Transform toJSON to include id and exclude _id and __v
UserSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    (ret as any).id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

// Índices para buscas frequentes
// Removidos pois unique já cria os índices automaticamente
