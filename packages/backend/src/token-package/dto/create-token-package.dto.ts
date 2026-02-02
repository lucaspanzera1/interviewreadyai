import { IsString, IsOptional, IsNumber, IsMongoId, IsArray, Min } from 'class-validator';

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
}