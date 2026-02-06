import { IsString, IsUrl, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { FlashcardLevel } from '../schemas/flashcard.schema';

export class GenerateJobFlashcardDto {
  @IsString()
  @IsUrl()
  linkedinUrl: string;

  @IsEnum(FlashcardLevel)
  nivel: FlashcardLevel;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(30) // Limite arbitrário para quantidade de cards
  quantidade_cards?: number = 10; // Valor padrão
}