import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FlashcardDocument = Flashcard & Document;

export enum FlashcardLevel {
  FACIL = 'FACIL',
  MEDIO = 'MEDIO',
  DIFICIL = 'DIFICIL',
}

export class FlashcardItem {
  @Prop({ required: true })
  question: string; // Pergunta (frente do flashcard)

  @Prop({ required: true })
  answer: string; // Resposta (verso do flashcard)

  @Prop()
  explanation?: string; // Explicação adicional opcional

  @Prop()
  tags?: string[]; // Tags específicas do card
}

@Schema({ timestamps: true })
export class Flashcard {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  categoria: string;

  @Prop({ required: true })
  descricao: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true })
  quantidade_cards: number;

  @Prop({ type: String, enum: FlashcardLevel, required: true })
  nivel: FlashcardLevel;

  @Prop({ type: [Object], required: true })
  cards: FlashcardItem[];

  @Prop({ type: String })
  vaga_titulo?: string; // Título da vaga (se baseado em job)

  @Prop({ type: String })
  vaga_empresa?: string; // Empresa da vaga (se baseado em job)

  @Prop({ type: String })
  vaga_localizacao?: string; // Localização da vaga (se baseado em job)

  @Prop({ type: String })
  vaga_url?: string; // URL da vaga original (se baseado em job)

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ default: false })
  isFree: boolean; // Apenas admins podem criar flashcards gratuitos

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const FlashcardSchema = SchemaFactory.createForClass(Flashcard);

// Índices para otimização
FlashcardSchema.index({ createdBy: 1 });
FlashcardSchema.index({ categoria: 1 });
FlashcardSchema.index({ nivel: 1 });
FlashcardSchema.index({ isPublic: 1, isActive: 1 });
FlashcardSchema.index({ tags: 1 });

// Transform toJSON para incluir id e excluir _id e __v
FlashcardSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    (ret as any).id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});