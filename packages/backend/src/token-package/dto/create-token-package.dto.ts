import { IsString, IsOptional, IsNumber, IsMongoId, IsArray, Min, IsBoolean } from 'class-validator';

export class CreateTokenPackageDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(1)
  tokenAmount: number;

  @IsMongoId()
  role: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  validityDays?: number; // Número de dias de validade (opcional, null = vitalício)

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number; // Valor do plano em reais

  @IsOptional()
  @IsBoolean()
  active?: boolean; // Se o plano está ativo
}