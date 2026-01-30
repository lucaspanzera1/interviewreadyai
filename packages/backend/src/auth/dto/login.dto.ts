import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para resposta de login bem-sucedido
 */
export class LoginDto {
  @ApiProperty({
    description: 'Token de acesso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token de refresh para renovar o access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Dados básicos do usuário',
    type: 'object',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      name: 'John Doe',
      picture: 'https://example.com/photo.jpg',
      active: true,
      role: 'client'
    }
  })
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    active: boolean;
    role: string;
  };
}

/**
 * DTO para resposta de token
 */
export class TokenResponseDto {
  @ApiProperty({
    description: 'Novo token de acesso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Tempo de expiração do token em segundos',
    example: 900,
  })
  expiresIn: number;
}