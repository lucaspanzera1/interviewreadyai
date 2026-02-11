import { IsString, IsUrl, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class GenerateInterviewDto {
  @IsString()
  @IsUrl()
  jobUrl: string;

  @IsOptional()
  @IsNumber()
  @Min(3)
  @Max(15)
  numberOfQuestions?: number = 8; // Default de 8 perguntas

  @IsOptional()
  @IsString()
  experienceLevel?: string; // Nível de experiência do candidato
}