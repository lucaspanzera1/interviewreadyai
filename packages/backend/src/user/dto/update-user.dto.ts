import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

/**
 * DTO para atualização de usuário
 */
export class UpdateUserDto {
  @ApiProperty({ description: 'Nome completo do usuário', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'URL da foto do perfil', required: false })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiProperty({ description: 'ID do cliente na AbacatePay', required: false })
  @IsOptional()
  @IsString()
  abacatepayCustomerId?: string;

  @ApiProperty({ description: 'Se o perfil do usuário é público', required: false })
  @IsOptional()
  @IsBoolean()
  isProfilePublic?: boolean;

  @ApiProperty({ description: 'Cargo do usuário', enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ description: 'Preferred language', enum: ['pt-BR', 'en'], required: false })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;
}