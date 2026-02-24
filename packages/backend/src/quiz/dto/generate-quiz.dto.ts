import { IsString, IsNumber, IsArray, IsEnum, Min, Max, IsOptional, IsBoolean } from 'class-validator';

export enum QuizLevel {
  INICIANTE = 'INICIANTE',
  MEDIO = 'MEDIO',
  DIFICIL = 'DIFÍCIL',
  EXPERT = 'EXPERT',
}

export class GenerateQuizDto {
  @IsString()
  categoria: string;

  @IsString()
  titulo: string;

  @IsString()
  descricao: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsNumber()
  @Min(1)
  @Max(20) // arbitrary max
  quantidade_questoes: number;

  @IsEnum(QuizLevel)
  nivel: QuizLevel;

  @IsOptional()
  @IsString()
  contexto?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;
}