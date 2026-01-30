import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  googleId: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  picture?: string;

  @Prop({ maxlength: 20 })
  taxid?: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Prop({ default: true })
  active: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  refreshToken?: string;

  @Prop({ type: Number, default: 0 })
  tokens: number;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Índices para buscas frequentes
UserSchema.index({ googleId: 1 });
UserSchema.index({ email: 1 });
