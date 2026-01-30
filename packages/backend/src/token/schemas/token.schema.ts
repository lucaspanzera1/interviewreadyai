import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenDocument = Token & Document;

@Schema({ timestamps: true })
export class Token {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  active: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);

// Índices
TokenSchema.index({ name: 1 });