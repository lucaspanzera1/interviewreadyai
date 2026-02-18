import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
// role type removed; keep DTO simple

/**
 * DTO para retorno de dados do usuário
 */
export class UserDto {
  @ApiProperty({ description: 'ID único do usuário' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Email do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Nome completo do usuário' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'URL da foto do perfil', required: false })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiProperty({ description: 'URL da imagem do header do perfil', required: false })
  @IsOptional()
  @IsString()
  headerImage?: string;

  @ApiProperty({ description: 'Role do usuário no sistema', required: false })
  role?: string;

  @ApiProperty({ description: 'Data de expiração da role/plano', required: false })
  @IsOptional()
  @IsDateString()
  roleExpiresAt?: Date;

  @ApiProperty({ description: 'Indica se o perfil do usuário está ativo', required: true })
  active: boolean;

  @ApiProperty({ description: 'Data de criação da conta' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @IsDateString()
  updatedAt: Date;

  @ApiProperty({ description: 'Data do último login', required: false })
  @IsOptional()
  @IsDateString()
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Indica se o usuário completou o onboarding', required: false })
  @IsOptional()
  hasCompletedOnboarding?: boolean;

  @ApiProperty({ description: 'Indica se o perfil do usuário é público', required: false })
  @IsOptional()
  isProfilePublic?: boolean;

  @ApiProperty({ description: 'Preferred language', enum: ['pt-BR', 'en'], required: false })
  @IsOptional()
  preferredLanguage?: string;

}