import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FlashcardStudyDocument = FlashcardStudy & Document;

export enum CardDifficulty {
  EASY = 'EASY', // Fácil - será mostrado menos frequentemente
  NORMAL = 'NORMAL', // Normal - cadência padrão
  HARD = 'HARD', // Difícil - será mostrado mais frequentemente
}

export class CardProgress {
  @Prop({ required: true })
  cardIndex: number; // Índice do card no array de flashcards

  @Prop({ type: String, enum: CardDifficulty, default: CardDifficulty.NORMAL })
  difficulty: CardDifficulty; // Como o usuário classifica a dificuldade

  @Prop({ type: Number, default: 0 })
  timesStudied: number; // Quantas vezes o card foi estudado

  @Prop({ type: Date })
  lastStudiedAt?: Date; // Última vez que foi estudado

  @Prop({ type: Date })
  nextReviewAt?: Date; // Próxima data de revisão (sistema de repetição espaçada)

  @Prop({ type: Number, default: 1 })
  interval: number; // Intervalo em dias para próxima revisão
}

@Schema({ timestamps: true })
export class FlashcardStudy {
  @Prop({ type: Types.ObjectId, ref: 'Flashcard', required: true })
  flashcardId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  cardProgress: CardProgress[]; // Progresso individual de cada card

  @Prop({ type: Number, default: 0 })
  totalStudyTime: number; // Tempo total de estudo em minutos

  @Prop({ type: Number, default: 0 })
  totalReviews: number; // Total de revisões realizadas

  @Prop({ type: Date })
  lastStudySession?: Date; // Última sessão de estudo

  @Prop({ type: Number, default: 0 })
  streak: number; // Sequência de dias estudando

  createdAt: Date;
  updatedAt: Date;
}

export const FlashcardStudySchema = SchemaFactory.createForClass(FlashcardStudy);

// Índices para otimização
FlashcardStudySchema.index({ flashcardId: 1, userId: 1 }, { unique: true });
FlashcardStudySchema.index({ userId: 1 });
FlashcardStudySchema.index({ 'cardProgress.nextReviewAt': 1 });

// Transform toJSON para incluir id e excluir _id e __v
FlashcardStudySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    (ret as any).id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});