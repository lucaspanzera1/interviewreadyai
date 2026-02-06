import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { CardDifficulty } from '../schemas/flashcard-study.schema';

export class StudyCardDto {
  @IsNumber()
  @Min(0)
  cardIndex: number;

  @IsEnum(CardDifficulty)
  difficulty: CardDifficulty;

  @IsOptional()
  @IsNumber()
  @Min(1)
  studyTime?: number; // Tempo em segundos gastos neste card
}

export class StudySessionDto {
  cards: StudyCardDto[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  totalSessionTime?: number; // Tempo total da sessão em segundos
}