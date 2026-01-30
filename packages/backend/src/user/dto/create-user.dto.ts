import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

/**
 * DTO para criação de usuário
 */
export class CreateUserDto {
  @ApiProperty({ description: 'ID do Google OAuth' })
  @IsString()
  googleId: string;

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
}